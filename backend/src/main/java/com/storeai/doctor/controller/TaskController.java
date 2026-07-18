package com.storeai.doctor.controller;

import com.storeai.doctor.common.ApiResponse;
import com.storeai.doctor.dto.TaskStatusDTO;
import com.storeai.doctor.entity.AnalysisReport;
import com.storeai.doctor.entity.AnalysisTask;
import com.storeai.doctor.repository.AnalysisReportRepository;
import com.storeai.doctor.repository.AnalysisTaskRepository;
import com.storeai.doctor.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final AnalysisTaskRepository analysisTaskRepository;
    private final AnalysisReportRepository analysisReportRepository;

    @GetMapping("/{taskId}")
    public ApiResponse<TaskStatusDTO> getTaskStatus(@PathVariable Long taskId) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();

        AnalysisTask task = analysisTaskRepository.findByIdAndUploadedFileStoreUserId(taskId, userId)
                .orElse(null);

        if (task == null) {
            return ApiResponse.error("Task not found or access denied");
        }

        Long reportId = null;
        if ("COMPLETED".equals(task.getStatus())) {
            AnalysisReport report = analysisReportRepository.findByTaskId(taskId).orElse(null);
            if (report != null) {
                reportId = report.getId();
            }
        }

        TaskStatusDTO dto = TaskStatusDTO.builder()
                .taskId(task.getId())
                .fileId(task.getUploadedFile() != null ? task.getUploadedFile().getId() : null)
                .fileName(task.getUploadedFile() != null ? task.getUploadedFile().getFileName() : null)
                .status(task.getStatus())
                .progress(task.getProgress())
                .reportId(reportId)
                .createdTime(task.getCreatedTime())
                .build();

        return ApiResponse.success(dto);
    }
}
