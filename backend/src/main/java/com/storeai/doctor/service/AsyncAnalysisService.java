package com.storeai.doctor.service;

import com.storeai.doctor.entity.AnalysisTask;
import com.storeai.doctor.repository.AnalysisTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.Semaphore;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncAnalysisService {

    private final AnalysisTaskRepository analysisTaskRepository;
    private final AnalysisEngineService analysisEngineService;
    private final AiReportService aiReportService;

    // Limit concurrent AI API calls to prevent quota exhaustion.
    // Max 3 DeepSeek API calls at a time; 4th+ tasks wait in queue.
    private static final Semaphore AI_CALL_SEMAPHORE = new Semaphore(3);

    @Async("analysisExecutor")
    public void runAnalysis(Long taskId) {
        log.info("[AsyncAnalysis] Starting analysis for task: {}", taskId);

        try {
            AnalysisTask task = analysisTaskRepository.findById(taskId).orElse(null);
            if (task == null) {
                log.error("[AsyncAnalysis] Task not found: {}. Aborting.", taskId);
                return;
            }
            log.info("[AsyncAnalysis] Task found: {}, current status: {}", taskId, task.getStatus());

            // Step 1: ANALYZING (25%)
            updateTaskStatus(taskId, "ANALYZING", 25);
            log.info("[AsyncAnalysis] Starting AnalysisEngine for task: {}", taskId);
            analysisEngineService.analyzeAndSave(taskId);
            log.info("[AsyncAnalysis] Analysis engine completed for task: {}", taskId);

            // Step 2: GENERATING_REPORT (50%)
            updateTaskStatus(taskId, "GENERATING_REPORT", 50);
            log.info("[AsyncAnalysis] Starting AI report generation for task: {}", taskId);
            AI_CALL_SEMAPHORE.acquire();
            try {
                aiReportService.generateReport(taskId);
            } finally {
                AI_CALL_SEMAPHORE.release();
            }
            log.info("[AsyncAnalysis] AI report generated for task: {}", taskId);

            // Step 3: COMPLETED (100%)
            updateTaskStatus(taskId, "COMPLETED", 100);
            log.info("[AsyncAnalysis] Task completed: {}", taskId);

        } catch (Exception e) {
            log.error("[AsyncAnalysis] Analysis failed for task: {}. Original error:", taskId, e);
            failTask(taskId);
        }
    }

    @Transactional
    protected void updateTaskStatus(Long taskId, String status, int progress) {
        AnalysisTask task = analysisTaskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setStatus(status);
            task.setProgress(progress);
            analysisTaskRepository.save(task);
            log.info("[AsyncAnalysis] Task {} updated: status={}, progress={}", taskId, status, progress);
        } else {
            log.warn("[AsyncAnalysis] Task not found for status update: {}", taskId);
        }
    }

    @Transactional
    protected void failTask(Long taskId) {
        AnalysisTask task = analysisTaskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setStatus("FAILED");
            task.setProgress(0);
            analysisTaskRepository.save(task);
            log.info("[AsyncAnalysis] Task {} marked as FAILED", taskId);
        } else {
            log.warn("[AsyncAnalysis] Task not found for failure marking: {}", taskId);
        }
    }
}
