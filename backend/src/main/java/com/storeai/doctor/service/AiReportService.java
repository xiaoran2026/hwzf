package com.storeai.doctor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeai.doctor.dto.AnalysisResultDTO;
import com.storeai.doctor.dto.ReportDTO;
import com.storeai.doctor.entity.AnalysisData;
import com.storeai.doctor.entity.AnalysisReport;
import com.storeai.doctor.entity.AnalysisTask;
import com.storeai.doctor.repository.AnalysisDataRepository;
import com.storeai.doctor.repository.AnalysisReportRepository;
import com.storeai.doctor.repository.AnalysisTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AI Report generation service with dual mode:
 * 1. Primary: Call DeepSeek API for AI-enhanced report
 * 2. Fallback: Use DataDrivenReportGenerator for pure data-driven report
 *
 * The data-driven generator ensures the pipeline never fails
 * and all content is derived from actual analysis_data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiReportService {

    private final AnalysisDataRepository analysisDataRepository;
    private final AnalysisReportRepository analysisReportRepository;
    private final AnalysisTaskRepository analysisTaskRepository;
    private final DeepSeekService deepSeekService;
    private final AnalysisPromptTemplate promptTemplate;
    private final DataDrivenReportGenerator dataDrivenGenerator;
    private final ObjectMapper objectMapper;

    @Transactional
    public ReportDTO generateReport(Long taskId) {
        // 1. Load analysis data from database
        AnalysisData analysisData = analysisDataRepository.findByAnalysisTaskId(taskId)
                .orElseThrow(() -> new RuntimeException("Analysis data not found for task: " + taskId));

        // 2. Parse JSON into DTO
        AnalysisResultDTO analysisResult;
        try {
            analysisResult = objectMapper.readValue(analysisData.getDataJson(), AnalysisResultDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse analysis data JSON", e);
        }

        // 3. Generate data-driven report first (always succeeds)
        ReportDTO reportDTO = dataDrivenGenerator.generate(analysisResult);
        log.info("[AiReport] Data-driven report generated for task: {}, healthScore={}", taskId, reportDTO.getHealthScore());

        // 4. Try to enhance with DeepSeek AI
        try {
            ReportDTO aiReport = callDeepSeekForReport(analysisResult);
            if (aiReport != null && isValidReport(aiReport)) {
                // Preserve the deterministic data-driven healthScore.
                // AI text is used for richer insights/recommendations,
                // but the score stays data-driven for consistency.
                int dataDrivenScore = reportDTO.getHealthScore();
                reportDTO = aiReport;
                reportDTO.setHealthScore(dataDrivenScore);
                log.info("[AiReport] DeepSeek AI report used for task: {}, healthScore={} (data-driven, preserved)",
                        taskId, dataDrivenScore);
            } else {
                log.warn("[AiReport] DeepSeek returned invalid report, using data-driven fallback for task: {}", taskId);
            }
        } catch (Exception e) {
            log.warn("[AiReport] DeepSeek API failed, using data-driven report for task: {}. Error: {}",
                    taskId, e.getMessage());
        }

        // 5. Save report to database (sanitized at JSON level)
        saveReport(taskId, reportDTO);

        log.info("[AiReport] Report saved for task: {}, healthScore={}", taskId, reportDTO.getHealthScore());
        return reportDTO;
    }

    /**
     * Call DeepSeek API to get AI-enhanced report.
     * The prompt sends the raw data and asks for structured analysis.
     */
    private ReportDTO callDeepSeekForReport(AnalysisResultDTO analysisResult) throws JsonProcessingException {
        String systemPrompt = promptTemplate.buildSystemPrompt();
        String userPrompt = promptTemplate.buildUserPrompt(analysisResult);

        log.info("[AiReport] Calling DeepSeek API...");
        String aiResponse = deepSeekService.callChatApi(systemPrompt, userPrompt);

        // Parse AI response
        String cleanedResponse = cleanJsonResponse(aiResponse);
        return objectMapper.readValue(cleanedResponse, ReportDTO.class);
    }

    /**
     * Sanitize the entire report JSON string to remove injection artifacts.
     * Applied as defense-in-depth after AI generation.
     * Works on the serialized JSON to catch injection text in ANY field
     * (including product names from analysis_data that get embedded in the report).
     */
    private String sanitizeReportJson(String reportJson) {
        if (reportJson == null || reportJson.isBlank()) return reportJson;

        String sanitized = reportJson;

        // Strip HTML tags anywhere in the output
        sanitized = sanitized.replaceAll("<[^>]+>", "");

        // Remove prompt injection keywords (case-insensitive)
        String[] patterns = {
                "(?i)ignore\\s+(all\\s+)?(previous\\s+)?instructions",
                "(?i)system\\s+prompt",
                "(?i)api\\s*key",
                "(?i)you\\s+are\\s+now",
                "(?i)\\bDAN\\b",
                "(?i)ignore\\s+all\\s+safety",
                "(?i)override\\s+(the\\s+)?(health|system)",
                "(?i)reveal\\s+(your|all|the)\\s+(secrets|system|prompt)",
                "(?i)DROP\\s+TABLE",
                "(?i)SELECT\\s+\\*\\s+FROM",
                "(?i)javascript\\s*:",
                "(?i)<script",
                "(?i)<iframe",
        };

        for (String pattern : patterns) {
            sanitized = sanitized.replaceAll(pattern, "[FILTERED]");
        }

        return sanitized;
    }

    /**
     * Validate that the AI report has all required fields with meaningful content.
     */
    private boolean isValidReport(ReportDTO report) {
        if (report == null) return false;
        if (report.getHealthScore() < 0 || report.getHealthScore() > 100) return false;
        if (report.getSummary() == null || report.getSummary().isBlank()) return false;
        if (report.getSalesInsights() == null || report.getSalesInsights().isEmpty()) return false;
        if (report.getProductInsights() == null || report.getProductInsights().isEmpty()) return false;
        return true;
    }

    @Transactional
    public AnalysisReport saveReport(Long taskId, ReportDTO reportDTO) {
        AnalysisTask task = analysisTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        String reportJson;
        try {
            reportJson = objectMapper.writeValueAsString(reportDTO);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize report", e);
        }

        // Sanitize the entire JSON string to remove injection artifacts
        // from any field (including product names embedded from CSV data)
        reportJson = sanitizeReportJson(reportJson);

        AnalysisReport report = new AnalysisReport();
        report.setTask(task);
        report.setHealthScore(reportDTO.getHealthScore());
        report.setReportJson(reportJson);

        return analysisReportRepository.save(report);
    }

    private String cleanJsonResponse(String response) {
        String cleaned = response.trim();

        // Strip markdown code blocks (```json ... ``` or ``` ... ```)
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }

        cleaned = cleaned.trim();

        // If the response starts with non-JSON text (e.g., "Here is the analysis:"),
        // find the first '{' and extract from there.
        int firstBrace = cleaned.indexOf('{');
        if (firstBrace > 0) {
            log.info("[AiReport] Stripping {} chars of preamble before JSON", firstBrace);
            cleaned = cleaned.substring(firstBrace);
        }

        // Find the matching closing brace for the outermost JSON object
        int braceCount = 0;
        int lastBrace = -1;
        for (int i = 0; i < cleaned.length(); i++) {
            char c = cleaned.charAt(i);
            if (c == '{') braceCount++;
            else if (c == '}') {
                braceCount--;
                if (braceCount == 0) {
                    lastBrace = i;
                    break;
                }
            }
        }
        if (lastBrace >= 0 && lastBrace < cleaned.length() - 1) {
            cleaned = cleaned.substring(0, lastBrace + 1);
        }

        return cleaned.trim();
    }
}