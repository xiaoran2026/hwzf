package com.storeai.doctor.controller;

import com.storeai.doctor.common.ApiResponse;
import com.storeai.doctor.dto.OrderDataDTO;
import com.storeai.doctor.dto.UploadResponse;
import com.storeai.doctor.entity.AnalysisReport;
import com.storeai.doctor.entity.AnalysisTask;
import com.storeai.doctor.entity.OrderRecord;
import com.storeai.doctor.entity.Store;
import com.storeai.doctor.entity.UploadedFile;
import com.storeai.doctor.enums.PlanEnum;
import com.storeai.doctor.repository.AnalysisReportRepository;
import com.storeai.doctor.repository.AnalysisTaskRepository;
import com.storeai.doctor.repository.OrderRecordRepository;
import com.storeai.doctor.repository.StoreRepository;
import com.storeai.doctor.repository.UploadedFileRepository;
import com.storeai.doctor.security.CurrentUser;
import com.storeai.doctor.service.AsyncAnalysisService;
import com.storeai.doctor.service.AuditLogService;
import com.storeai.doctor.service.CsvParseService;
import com.storeai.doctor.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final UploadedFileRepository uploadedFileRepository;
    private final StoreRepository storeRepository;
    private final AnalysisTaskRepository analysisTaskRepository;
    private final AnalysisReportRepository analysisReportRepository;
    private final OrderRecordRepository orderRecordRepository;
    private final CsvParseService csvParseService;
    private final AsyncAnalysisService asyncAnalysisService;
    private final AuditLogService auditLogService;
    private final SubscriptionService subscriptionService;

    private static final String UPLOAD_DIR = "uploads/";

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final int MAX_CSV_ROWS = 50000;

    @PostMapping("/upload")
    @Transactional
    public ApiResponse<UploadResponse> uploadCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("storeId") Long storeId) {

        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        if (storeId == null) {
            return ApiResponse.error("Store ID is required");
        }

        Long userId = CurrentUser.getUserId();

        // 1. Validate file
        if (file.isEmpty()) {
            return ApiResponse.error("File is empty. Please upload a valid CSV file.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ApiResponse.error("File size exceeds 10MB limit.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".csv")) {
            return ApiResponse.error("Only CSV files are allowed");
        }

        // 2. Find store and verify ownership
        Store store = storeRepository.findByIdAndUserId(storeId, userId)
                .orElse(null);
        if (store == null) {
            return ApiResponse.error("Store not found or access denied");
        }

        // 2.5 Compute file hash and check for recent duplicates
        String fileHash;
        try {
            byte[] bytes = file.getBytes();
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(bytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) sb.append(String.format("%02x", b));
            fileHash = sb.toString();
        } catch (Exception e) {
            fileHash = "";
        }

        if (!fileHash.isEmpty()) {
            LocalDateTime duplicateCutoff = LocalDateTime.now().minusHours(24);
            long recentDuplicates = uploadedFileRepository.countByStoreIdAndFileHashAndCreatedTimeAfter(
                    storeId, fileHash, duplicateCutoff);
            if (recentDuplicates > 0) {
                return ApiResponse.error("This file was already uploaded in the last 24 hours. Please upload a different file.");
            }
        }

        // 3. Save file to disk
        Path targetPath;
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            // Sanitize filename to prevent path traversal
            String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
            String storedFilename = UUID.randomUUID() + "_" + safeFilename;
            targetPath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to save uploaded file", e);
            return ApiResponse.error("Failed to save file: " + e.getMessage());
        }

        // 4. Save uploaded_file record
        UploadedFile uploadedFile = new UploadedFile();
        uploadedFile.setStore(store);
        uploadedFile.setFileName(originalFilename);
        uploadedFile.setFilePath(targetPath.toString());
        uploadedFile.setFileHash(fileHash);
        uploadedFile.setStatus("UPLOADED");
        UploadedFile savedFile = uploadedFileRepository.save(uploadedFile);

        // 5. Create analysis_task
        AnalysisTask task = new AnalysisTask();
        task.setUploadedFile(savedFile);
        task.setStatus("PENDING");
        task.setProgress(0);
        AnalysisTask savedTask = analysisTaskRepository.save(task);

        // 6. Parse CSV
        List<OrderDataDTO> orders;
        try (FileInputStream fis = new FileInputStream(targetPath.toFile())) {
            orders = csvParseService.parseCsv(fis);
        } catch (Exception e) {
            savedTask.setStatus("FAILED");
            savedTask.setProgress(0);
            analysisTaskRepository.save(savedTask);
            savedFile.setStatus("FAILED");
            uploadedFileRepository.save(savedFile);
            log.error("CSV parse failed for file: {}", originalFilename, e);
            return ApiResponse.error("CSV parse failed: " + e.getMessage());
        }

        // Check empty file
        if (orders.isEmpty()) {
            savedTask.setStatus("FAILED");
            savedTask.setProgress(0);
            analysisTaskRepository.save(savedTask);
            savedFile.setStatus("FAILED");
            uploadedFileRepository.save(savedFile);
            return ApiResponse.error("CSV file contains no valid order records. Please check the file format.");
        }

        // Check row count limit
        if (orders.size() > MAX_CSV_ROWS) {
            savedTask.setStatus("FAILED");
            savedTask.setProgress(0);
            analysisTaskRepository.save(savedTask);
            savedFile.setStatus("FAILED");
            uploadedFileRepository.save(savedFile);
            return ApiResponse.error("CSV file exceeds maximum limit of " + MAX_CSV_ROWS + " rows.");
        }

        // Check subscription upload limit
        if (!subscriptionService.canUpload(userId)) {
            savedTask.setStatus("FAILED");
            savedTask.setProgress(0);
            analysisTaskRepository.save(savedTask);
            savedFile.setStatus("FAILED");
            uploadedFileRepository.save(savedFile);
            PlanEnum plan = subscriptionService.getUserPlan(userId);
            String upgradeMsg = plan.isFree()
                ? "You have reached your Free plan upload limit. Upgrade to Starter to upload more data."
                : "You have reached your monthly upload limit. Upgrade to Pro for unlimited uploads.";
            return ApiResponse.error(upgradeMsg);
        }

        if (!subscriptionService.canUploadRows(userId, orders.size())) {
            savedTask.setStatus("FAILED");
            savedTask.setProgress(0);
            analysisTaskRepository.save(savedTask);
            savedFile.setStatus("FAILED");
            uploadedFileRepository.save(savedFile);
            return ApiResponse.error("CSV row count exceeds your plan limit of " + PlanEnum.fromString(subscriptionService.getUserPlan(userId).name()).getMaxCsvRows() + " rows.");
        }

        // Check report creation limit
        if (!subscriptionService.canCreateReport(userId)) {
            savedTask.setStatus("FAILED");
            savedTask.setProgress(0);
            analysisTaskRepository.save(savedTask);
            savedFile.setStatus("FAILED");
            uploadedFileRepository.save(savedFile);
            PlanEnum reportPlan = subscriptionService.getUserPlan(userId);
            String reportLimitMsg = reportPlan.isFree()
                ? "You have reached your Free plan limit of 1 AI report. Upgrade to Starter for up to 10 reports per month."
                : "You have reached your monthly report limit. Upgrade to Pro for unlimited reports.";
            return ApiResponse.error(reportLimitMsg);
        }

        // 7. Save order records in batch
        try {
            List<OrderRecord> records = new ArrayList<>();
            for (OrderDataDTO dto : orders) {
                OrderRecord record = new OrderRecord();
                record.setTask(savedTask);
                record.setOrderId(dto.getOrderId());
                record.setOrderDate(dto.getDate());
                record.setCustomerId(dto.getCustomerId());
                record.setProductName(dto.getProductName());
                record.setQuantity(dto.getQuantity());
                record.setPrice(dto.getPrice());
                record.setCountry(dto.getCountry());
                records.add(record);
            }
            orderRecordRepository.saveAll(records);
            log.info("Saved {} order records for task: {}", records.size(), savedTask.getId());
        } catch (Exception e) {
            savedTask.setStatus("FAILED");
            savedTask.setProgress(0);
            analysisTaskRepository.save(savedTask);
            savedFile.setStatus("FAILED");
            uploadedFileRepository.save(savedFile);
            log.error("Failed to save order records", e);
            return ApiResponse.error("Failed to save order records: " + e.getMessage());
        }

        // 8. Update task status to PARSING before async analysis
        savedTask.setStatus("PARSING");
        savedTask.setProgress(10);
        analysisTaskRepository.save(savedTask);

        // 9. Start async analysis AFTER transaction commits
        //    @Async runs in a separate thread; if called before commit,
        //    the async thread can't see uncommitted data → silent failure.
        final Long taskIdForAsync = savedTask.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                log.info("[Upload] Transaction committed, starting async analysis for task: {}", taskIdForAsync);
                asyncAnalysisService.runAnalysis(taskIdForAsync);
            }
        });

        // 10. Audit log
        auditLogService.logUpload(userId, originalFilename);

        UploadResponse response = new UploadResponse(
                savedFile.getId(),
                savedFile.getFileName(),
                savedFile.getStatus(),
                storeId,
                savedTask.getId()
        );
        return ApiResponse.success(response);
    }

    /**
     * 获取指定店铺的上传历史列表
     * 每条记录包含文件名、状态、上传时间、关联任务状态、报告ID和Health Score
     */
    @GetMapping("/store/{storeId}")
    @Transactional(readOnly = true)
    public ApiResponse<List<Map<String, Object>>> getUploadHistory(@PathVariable Long storeId) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        Store store = storeRepository.findByIdAndUserId(storeId, userId).orElse(null);
        if (store == null) {
            return ApiResponse.error("Store not found or access denied");
        }

        List<UploadedFile> files = uploadedFileRepository.findByStoreIdOrderByCreatedTimeDesc(storeId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (UploadedFile file : files) {
            Map<String, Object> item = new HashMap<>();
            item.put("fileId", file.getId());
            item.put("fileName", file.getFileName());
            item.put("status", file.getStatus());
            item.put("uploadedAt", file.getCreatedTime());

            // 查找关联任务
            List<AnalysisTask> tasks = analysisTaskRepository.findAllByUploadedFileId(file.getId());
            if (!tasks.isEmpty()) {
                AnalysisTask task = tasks.get(0);
                item.put("taskStatus", task.getStatus());
                item.put("taskId", task.getId());

                // 查找关联报告
                AnalysisReport report = analysisReportRepository.findByTaskId(task.getId()).orElse(null);
                if (report != null) {
                    item.put("reportId", report.getId());
                    item.put("healthScore", report.getHealthScore());
                    item.put("completedAt", report.getCreatedTime());
                }
            }

            result.add(item);
        }

        return ApiResponse.success(result);
    }
}
