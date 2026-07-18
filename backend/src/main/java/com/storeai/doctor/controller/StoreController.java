package com.storeai.doctor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeai.doctor.common.ApiResponse;
import com.storeai.doctor.dto.AnalysisResultDTO;
import com.storeai.doctor.dto.StoreListItemDTO;
import com.storeai.doctor.dto.StoreRequest;
import com.storeai.doctor.entity.AnalysisData;
import com.storeai.doctor.entity.AnalysisReport;
import com.storeai.doctor.entity.Store;
import com.storeai.doctor.entity.UploadedFile;
import com.storeai.doctor.entity.User;
import com.storeai.doctor.repository.AnalysisDataRepository;
import com.storeai.doctor.repository.AnalysisReportRepository;
import com.storeai.doctor.repository.AnalysisTaskRepository;
import com.storeai.doctor.repository.StoreRepository;
import com.storeai.doctor.repository.UploadedFileRepository;
import com.storeai.doctor.repository.UserRepository;
import com.storeai.doctor.security.CurrentUser;
import com.storeai.doctor.service.AuditLogService;
import com.storeai.doctor.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final AnalysisReportRepository analysisReportRepository;
    private final AnalysisDataRepository analysisDataRepository;
    private final AnalysisTaskRepository analysisTaskRepository;
    private final SubscriptionService subscriptionService;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ApiResponse<Store> createStore(@RequestBody StoreRequest request) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        if (request == null) {
            return ApiResponse.error("Request body is required");
        }
        if (!StringUtils.hasText(request.getStoreName())) {
            return ApiResponse.error("Store name is required");
        }
        if (!StringUtils.hasText(request.getPlatform())) {
            return ApiResponse.error("Platform is required");
        }

        Long userId = CurrentUser.getUserId();
        if (!subscriptionService.canCreateStore(userId)) {
            return ApiResponse.error("Store limit reached for your plan");
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ApiResponse.error("User not found");
        }

        Store store = new Store();
        store.setStoreName(request.getStoreName().trim());
        store.setPlatform(request.getPlatform().trim());
        store.setUser(user);
        Store savedStore = storeRepository.save(store);

        auditLogService.logCreateStore(userId, savedStore.getStoreName());

        return ApiResponse.success(savedStore);
    }

    @GetMapping
    public ApiResponse<List<StoreListItemDTO>> getStores() {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        List<Store> stores = storeRepository.findByUserIdOrderByCreatedTimeDesc(userId);
        List<StoreListItemDTO> result = new ArrayList<>();

        for (Store store : stores) {
            StoreListItemDTO.StoreListItemDTOBuilder builder = StoreListItemDTO.builder()
                    .storeId(store.getId())
                    .storeName(store.getStoreName())
                    .platform(store.getPlatform())
                    .createdAt(store.getCreatedTime() != null ? store.getCreatedTime().toString() : null);

            // Reports for this store
            List<AnalysisReport> reports = analysisReportRepository.findByTaskUploadedFileStoreIdOrderByCreatedTimeDesc(store.getId());
            builder.totalReports(reports.size());

            if (!reports.isEmpty()) {
                AnalysisReport latestReport = reports.get(0);
                builder.healthScore(latestReport.getHealthScore());
                builder.lastAnalysisDate(latestReport.getCreatedTime() != null ? latestReport.getCreatedTime().toString() : null);

                // Get analysis data for revenue/orders
                try {
                    var taskOpt = analysisTaskRepository.findById(latestReport.getTask().getId());
                    if (taskOpt.isPresent()) {
                        var dataOpt = analysisDataRepository.findByAnalysisTaskId(taskOpt.get().getId());
                        if (dataOpt.isPresent()) {
                            AnalysisResultDTO analysisResult = objectMapper.readValue(dataOpt.get().getDataJson(), AnalysisResultDTO.class);
                            if (analysisResult.getSalesAnalysis() != null) {
                                builder.totalRevenue(analysisResult.getSalesAnalysis().getTotalRevenue());
                                builder.totalOrders(analysisResult.getSalesAnalysis().getTotalOrders());
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            // Latest upload
            List<UploadedFile> files = uploadedFileRepository.findByStoreIdOrderByCreatedTimeDesc(store.getId());
            if (!files.isEmpty()) {
                builder.latestUploadDate(files.get(0).getCreatedTime() != null ? files.get(0).getCreatedTime().toString() : null);
            }

            result.add(builder.build());
        }

        return ApiResponse.success(result);
    }

    @GetMapping("/{storeId}")
    public ApiResponse<Store> getStore(@PathVariable Long storeId) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        Store store = storeRepository.findByIdAndUserId(storeId, userId).orElse(null);
        if (store == null) {
            return ApiResponse.error("Store not found or access denied");
        }
        return ApiResponse.success(store);
    }
}
