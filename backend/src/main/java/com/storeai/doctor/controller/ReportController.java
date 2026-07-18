package com.storeai.doctor.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeai.doctor.common.ApiResponse;
import com.storeai.doctor.dto.ReportDTO;
import com.storeai.doctor.dto.ReportListItemDTO;
import com.storeai.doctor.entity.AnalysisData;
import com.storeai.doctor.entity.AnalysisReport;
import com.storeai.doctor.entity.AnalysisTask;
import com.storeai.doctor.entity.UploadedFile;
import com.storeai.doctor.repository.AnalysisDataRepository;
import com.storeai.doctor.repository.AnalysisReportRepository;
import com.storeai.doctor.security.CurrentUser;
import com.storeai.doctor.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Report management controller.
 * Provides detailed report listing with rich metadata from analysis_data.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final AnalysisReportRepository analysisReportRepository;
    private final AnalysisDataRepository analysisDataRepository;
    private final ObjectMapper objectMapper;
    private final AuditLogService auditLogService;

    /**
     * Get a single report by ID with full detail.
     */
    @GetMapping("/{reportId}")
    public ApiResponse<ReportDTO> getReport(@PathVariable Long reportId) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        AnalysisReport report = analysisReportRepository.findByIdAndTaskUploadedFileStoreUserId(reportId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        try {
            ReportDTO dto = objectMapper.readValue(report.getReportJson(), ReportDTO.class);

            // Enrich with analysis_data metrics
            Long taskId = analysisReportRepository.findTaskIdByReportId(reportId).orElse(null);
            if (taskId != null) {
                Optional<AnalysisData> analysisDataOpt = analysisDataRepository.findByAnalysisTaskId(taskId);
                if (analysisDataOpt.isPresent()) {
                JsonNode dataJson = objectMapper.readTree(analysisDataOpt.get().getDataJson());

                // Sales analysis
                JsonNode salesNode = dataJson.path("salesAnalysis");
                if (salesNode.isObject()) {
                    ReportDTO.AnalysisMetrics metrics = ReportDTO.AnalysisMetrics.builder()
                            .totalRevenue(!salesNode.path("totalRevenue").isMissingNode() && !salesNode.path("totalRevenue").isNull() ? salesNode.path("totalRevenue").decimalValue() : null)
                            .totalOrders(salesNode.path("totalOrders").asLong(0))
                            .averageOrderValue(!salesNode.path("averageOrderValue").isMissingNode() && !salesNode.path("averageOrderValue").isNull() ? salesNode.path("averageOrderValue").decimalValue() : null)
                            .build();

                    // Parse monthly revenue trend
                    JsonNode revTrend = salesNode.path("monthlyRevenueTrend");
                    if (revTrend.isObject() && revTrend.size() > 0) {
                        Map<String, java.math.BigDecimal> revMap = new java.util.LinkedHashMap<>();
                        revTrend.fields().forEachRemaining(entry -> {
                            if (entry.getValue().isNumber()) {
                                revMap.put(entry.getKey(), entry.getValue().decimalValue());
                            }
                        });
                        metrics.setMonthlyRevenueTrend(revMap);
                    }
                    dto.setSalesAnalysis(metrics);
                }

                // Product rankings
                JsonNode productNode = dataJson.path("productAnalysis").path("productRanking");
                if (productNode.isArray()) {
                    List<ReportDTO.ProductRankingDTO> products = new ArrayList<>();
                    for (JsonNode p : productNode) {
                        products.add(ReportDTO.ProductRankingDTO.builder()
                                .productName(p.path("productName").asText(""))
                                .revenue(p.path("revenue").isNumber() ? p.path("revenue").decimalValue() : null)
                                .quantity(p.path("quantity").asLong(0))
                                .orderCount(p.path("orderCount").asLong(0))
                                .build());
                    }
                    dto.setTopProducts(products);
                }

                // Customer analysis
                JsonNode customerNode = dataJson.path("customerAnalysis");
                if (customerNode.isObject()) {
                    dto.setCustomerAnalysis(ReportDTO.CustomerMetrics.builder()
                            .totalCustomers(customerNode.path("totalCustomers").asLong(0))
                            .newCustomerCount(customerNode.path("newCustomerCount").asLong(0))
                            .repeatCustomerCount(customerNode.path("repeatCustomerCount").asLong(0))
                            .repeatRate(customerNode.path("repeatRate").isNumber() ? customerNode.path("repeatRate").decimalValue() : null)
                            .build());
                }

                // Country stats
                JsonNode countryNode = dataJson.path("countryAnalysis").path("countryStats");
                if (countryNode.isArray()) {
                    List<ReportDTO.CountryStatDTO> countries = new ArrayList<>();
                    for (JsonNode c : countryNode) {
                        countries.add(ReportDTO.CountryStatDTO.builder()
                                .country(c.path("country").asText(""))
                                .orderCount(c.path("orderCount").asLong(0))
                                .revenue(c.path("revenue").isNumber() ? c.path("revenue").decimalValue() : null)
                                .build());
                    }
                    dto.setCountryStats(countries);
                }
                } // end analysisDataOpt.isPresent
            } // end taskId != null

            auditLogService.logViewReport(userId, reportId);

            // Sanitize output: strip injection keywords from any text field
            // (analysis_data may contain unsanitized product names from CSV)
            String dtoJson = objectMapper.writeValueAsString(dto);
            dtoJson = sanitizeOutput(dtoJson);
            dto = objectMapper.readValue(dtoJson, ReportDTO.class);

            return ApiResponse.success(dto);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to load report {}: {}", reportId, e.getMessage(), e);
            throw new RuntimeException("Failed to parse report data", e);
        }
    }

    /**
     * Sanitize JSON output string to remove injection artifacts.
     * Defense-in-depth: ensures API responses never contain dangerous content
     * even if the underlying data was not sanitized at ingest time.
     */
    private String sanitizeOutput(String json) {
        String sanitized = json;
        // Strip HTML tags
        sanitized = sanitized.replaceAll("<[^>]+>", "");
        // Strip prompt injection / security-sensitive keywords
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
     * Get rich report list for the authenticated user.
     * Combines data from analysis_report, analysis_task, uploaded_file, store, and analysis_data.
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ApiResponse<List<ReportListItemDTO>> getReports() {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        List<AnalysisReport> reports = analysisReportRepository.findByTaskUploadedFileStoreUserIdOrderByCreatedTimeDesc(userId);

        List<ReportListItemDTO> result = new ArrayList<>();
        for (AnalysisReport report : reports) {
            try {
                ReportListItemDTO item = buildReportListItem(report);
                result.add(item);
            } catch (Exception e) {
                log.warn("Failed to build report list item for report: {}", report.getId(), e);
                // Add a minimal item so the report still shows up
                result.add(buildMinimalItem(report));
            }
        }

        return ApiResponse.success(result);
    }

    @GetMapping("/store/{storeId}")
    public ApiResponse<List<ReportListItemDTO>> getReportsByStore(@PathVariable Long storeId) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        List<AnalysisReport> reports = analysisReportRepository.findByTaskUploadedFileStoreIdAndTaskUploadedFileStoreUserIdOrderByCreatedTimeDesc(storeId, userId);

        List<ReportListItemDTO> result = new ArrayList<>();
        for (AnalysisReport report : reports) {
            try {
                ReportListItemDTO item = buildReportListItem(report);
                result.add(item);
            } catch (Exception e) {
                log.warn("Failed to build report list item for report {}: {}", report.getId(), e.getMessage());
                result.add(buildMinimalItem(report));
            }
        }

        return ApiResponse.success(result);
    }

    /**
     * Build a rich report list item from all available data sources.
     */
    private ReportListItemDTO buildReportListItem(AnalysisReport report) throws Exception {
        AnalysisTask task = report.getTask();
        UploadedFile file = task != null ? task.getUploadedFile() : null;

        // Parse report JSON for healthScore and summary
        JsonNode reportJson = objectMapper.readTree(report.getReportJson());
        Integer healthScore = reportJson.has("healthScore") ? reportJson.get("healthScore").asInt() : report.getHealthScore();
        String summary = reportJson.has("summary") ? reportJson.get("summary").asText() : "";

        // Parse analysis_data JSON for revenue metrics
        Double totalRevenue = null;
        Long totalOrders = null;
        Double averageOrderValue = null;
        Double repeatRate = null;

        Optional<AnalysisData> analysisDataOpt = analysisDataRepository.findByAnalysisTaskId(task.getId());
        if (analysisDataOpt.isPresent()) {
            JsonNode dataJson = objectMapper.readTree(analysisDataOpt.get().getDataJson());
            JsonNode salesNode = dataJson.path("salesAnalysis");
            if (salesNode.isObject()) {
                totalRevenue = salesNode.path("totalRevenue").asDouble();
                totalOrders = salesNode.path("totalOrders").asLong();
                averageOrderValue = salesNode.path("averageOrderValue").asDouble();
            }
            JsonNode customerNode = dataJson.path("customerAnalysis");
            if (customerNode.isObject()) {
                repeatRate = customerNode.path("repeatRate").asDouble();
            }
        }

        return ReportListItemDTO.builder()
                .reportId(report.getId())
                .taskId(task != null ? task.getId() : null)
                .storeId(file != null && file.getStore() != null ? file.getStore().getId() : null)
                .storeName(file != null && file.getStore() != null ? file.getStore().getStoreName() : null)
                .fileName(file != null ? file.getFileName() : null)
                .healthScore(healthScore)
                .summary(summary)
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .averageOrderValue(averageOrderValue)
                .repeatRate(repeatRate)
                .taskStatus(task != null ? task.getStatus() : null)
                .createdAt(report.getCreatedTime() != null ? report.getCreatedTime().toString() : null)
                .archived(report.getArchived())
                .favorite(report.getFavorite())
                .build();
    }

    /**
     * Build a minimal item when full parsing fails.
     */
    private ReportListItemDTO buildMinimalItem(AnalysisReport report) {
        AnalysisTask task = report.getTask();
        UploadedFile file = task != null ? task.getUploadedFile() : null;

        return ReportListItemDTO.builder()
                .reportId(report.getId())
                .taskId(task != null ? task.getId() : null)
                .storeId(file != null && file.getStore() != null ? file.getStore().getId() : null)
                .storeName(file != null && file.getStore() != null ? file.getStore().getStoreName() : null)
                .fileName(file != null ? file.getFileName() : null)
                .healthScore(report.getHealthScore())
                .summary("—")
                .taskStatus(task != null ? task.getStatus() : null)
                .createdAt(report.getCreatedTime() != null ? report.getCreatedTime().toString() : null)
                .archived(report.getArchived())
                .favorite(report.getFavorite())
                .build();
    }

    /**
     * Delete a report.
     */
    @DeleteMapping("/{reportId}")
    @Transactional
    public ApiResponse<Void> deleteReport(@PathVariable Long reportId) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        AnalysisReport report = analysisReportRepository.findByIdAndTaskUploadedFileStoreUserId(reportId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        analysisReportRepository.delete(report);
        auditLogService.logDeleteReport(userId, reportId);
        return ApiResponse.success(null);
    }

    /**
     * Toggle archive status of a report.
     */
    @PatchMapping("/{reportId}/archive")
    @Transactional
    public ApiResponse<Void> toggleArchiveReport(@PathVariable Long reportId) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        AnalysisReport report = analysisReportRepository.findByIdAndTaskUploadedFileStoreUserId(reportId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        report.setArchived(Boolean.TRUE.equals(report.getArchived()) ? false : true);
        analysisReportRepository.save(report);
        return ApiResponse.success(null);
    }

    /**
     * Toggle favorite status of a report.
     */
    @PatchMapping("/{reportId}/favorite")
    @Transactional
    public ApiResponse<Void> toggleFavoriteReport(@PathVariable Long reportId) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        AnalysisReport report = analysisReportRepository.findByIdAndTaskUploadedFileStoreUserId(reportId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        report.setFavorite(Boolean.TRUE.equals(report.getFavorite()) ? false : true);
        analysisReportRepository.save(report);
        return ApiResponse.success(null);
    }

    /**
     * Batch delete reports.
     */
    @PostMapping("/batch/delete")
    @Transactional
    public ApiResponse<Void> batchDelete(@RequestBody List<Long> reportIds) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }
        if (reportIds == null || reportIds.isEmpty()) {
            return ApiResponse.error("No report IDs provided");
        }

        Long userId = CurrentUser.getUserId();
        for (Long reportId : reportIds) {
            analysisReportRepository.findByIdAndTaskUploadedFileStoreUserId(reportId, userId)
                    .ifPresent(analysisReportRepository::delete);
        }
        return ApiResponse.success(null);
    }

    /**
     * Batch archive reports.
     */
    @PostMapping("/batch/archive")
    @Transactional
    public ApiResponse<Void> batchArchive(@RequestBody List<Long> reportIds) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }
        if (reportIds == null || reportIds.isEmpty()) {
            return ApiResponse.error("No report IDs provided");
        }

        Long userId = CurrentUser.getUserId();
        for (Long reportId : reportIds) {
            analysisReportRepository.findByIdAndTaskUploadedFileStoreUserId(reportId, userId)
                    .ifPresent(r -> {
                        r.setArchived(true);
                        analysisReportRepository.save(r);
                    });
        }
        return ApiResponse.success(null);
    }

    /**
     * Batch favorite reports.
     */
    @PostMapping("/batch/favorite")
    @Transactional
    public ApiResponse<Void> batchFavorite(@RequestBody List<Long> reportIds) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }
        if (reportIds == null || reportIds.isEmpty()) {
            return ApiResponse.error("No report IDs provided");
        }

        Long userId = CurrentUser.getUserId();
        for (Long reportId : reportIds) {
            analysisReportRepository.findByIdAndTaskUploadedFileStoreUserId(reportId, userId)
                    .ifPresent(r -> {
                        r.setFavorite(true);
                        analysisReportRepository.save(r);
                    });
        }
        return ApiResponse.success(null);
    }
}
