package com.storeai.doctor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeai.doctor.common.ApiResponse;
import com.storeai.doctor.dto.AnalysisResultDTO;
import com.storeai.doctor.dto.ReportDTO;
import com.storeai.doctor.entity.*;
import com.storeai.doctor.repository.*;
import com.storeai.doctor.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final StoreRepository storeRepository;
    private final AnalysisReportRepository analysisReportRepository;
    private final AnalysisDataRepository analysisDataRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final AnalysisTaskRepository analysisTaskRepository;
    private final OrderRecordRepository orderRecordRepository;
    private final ObjectMapper objectMapper;

    /**
     * 获取当前用户的所有店铺列表（用于前端切换）
     * 每个店铺附带最新报告的 healthScore 和报告总数
     */
    @GetMapping("/stores")
    @Transactional(readOnly = true)
    public ApiResponse<List<Map<String, Object>>> getStoreList() {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("未登录");
        }

        Long userId = CurrentUser.getUserId();
        List<Store> stores = storeRepository.findByUserIdOrderByCreatedTimeDesc(userId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Store store : stores) {
            Map<String, Object> item = new HashMap<>();
            item.put("storeId", store.getId());
            item.put("storeName", store.getStoreName());
            item.put("platform", store.getPlatform());
            item.put("createdAt", store.getCreatedTime());

            // 查询该店铺的所有报告，取第一条作为最新报告
            List<AnalysisReport> reports = analysisReportRepository
                    .findByTaskUploadedFileStoreIdOrderByCreatedTimeDesc(store.getId());

            if (!reports.isEmpty()) {
                // 直接使用 entity 上的 healthScore 字段
                item.put("latestHealthScore", reports.get(0).getHealthScore());
            } else {
                item.put("latestHealthScore", null);
            }
            item.put("reportCount", reports.size());

            result.add(item);
        }

        return ApiResponse.success(result);
    }

    /**
     * 获取指定店铺的完整 Dashboard 数据
     * 包含：基础指标、趋势数据、健康趋势、最新上传、最新报告等
     */
    @GetMapping("/store/{storeId}")
    @Transactional(readOnly = true)
    public ApiResponse<Map<String, Object>> getDashboard(@PathVariable Long storeId) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("未登录");
        }

        Long userId = CurrentUser.getUserId();

        // 验证店铺归属权
        Store store = storeRepository.findByIdAndUserId(storeId, userId).orElse(null);
        if (store == null) {
            return ApiResponse.error("店铺不存在或无权访问");
        }

        // 初始化结果，设置默认值
        Map<String, Object> result = new HashMap<>();
        result.put("storeId", store.getId());
        result.put("storeName", store.getStoreName());
        result.put("healthScore", 0);
        result.put("totalRevenue", BigDecimal.ZERO);
        result.put("totalOrders", 0L);
        result.put("averageOrderValue", BigDecimal.ZERO);
        result.put("repeatRate", BigDecimal.ZERO);
        result.put("topProducts", new ArrayList<>());
        result.put("summary", "");
        result.put("monthlyRevenueTrend", new LinkedHashMap<>());
        result.put("monthlyOrdersTrend", new LinkedHashMap<>());
        result.put("healthTrend", new ArrayList<>());
        result.put("latestUpload", null);
        result.put("latestReport", null);

        // 查询该店铺所有报告（按时间倒序）
        List<AnalysisReport> reports = analysisReportRepository
                .findByTaskUploadedFileStoreIdOrderByCreatedTimeDesc(storeId);

        // ====== healthTrend：从所有 reports 取 healthScore 和 createdAt ======
        List<Map<String, Object>> healthTrend = reports.stream().map(r -> {
            Map<String, Object> point = new HashMap<>();
            point.put("reportId", r.getId());
            point.put("createdAt", r.getCreatedTime());
            point.put("healthScore", r.getHealthScore());
            return point;
        }).toList();
        result.put("healthTrend", healthTrend);

        // 没有报告时直接返回默认数据
        if (reports.isEmpty()) {
            // 仍然尝试填充 latestUpload
            fillLatestUpload(result, store);
            return ApiResponse.success(result);
        }

        AnalysisReport latestReport = reports.get(0);

        // ====== latestReport ======
        Map<String, Object> latestReportInfo = new HashMap<>();
        latestReportInfo.put("reportId", latestReport.getId());
        latestReportInfo.put("healthScore", latestReport.getHealthScore());
        latestReportInfo.put("createdAt", latestReport.getCreatedTime());
        result.put("latestReport", latestReportInfo);

        // ====== 解析最新报告 JSON ======
        try {
            ReportDTO reportDTO = objectMapper.readValue(latestReport.getReportJson(), ReportDTO.class);
            result.put("healthScore", reportDTO.getHealthScore());
            result.put("summary", reportDTO.getSummary());
        } catch (Exception e) {
            // 解析失败不影响整体返回
        }

        // ====== 解析 analysis_data 获取详细指标 ======
        AnalysisTask task = latestReport.getTask();
        if (task != null) {
            Long taskId = task.getId();
            try {
                AnalysisData data = analysisDataRepository.findByAnalysisTaskId(taskId).orElse(null);
                if (data != null) {
                    AnalysisResultDTO analysisResult = objectMapper.readValue(
                            data.getDataJson(), AnalysisResultDTO.class);

                    // 销售指标
                    if (analysisResult.getSalesAnalysis() != null) {
                        AnalysisResultDTO.SalesAnalysis sales = analysisResult.getSalesAnalysis();
                        result.put("totalRevenue", sales.getTotalRevenue());
                        result.put("totalOrders", sales.getTotalOrders());
                        result.put("averageOrderValue", sales.getAverageOrderValue());

                        // monthlyRevenueTrend：直接从 analysis_data 取
                        if (sales.getMonthlyRevenueTrend() != null) {
                            result.put("monthlyRevenueTrend", sales.getMonthlyRevenueTrend());
                        }
                    }

                    // 复购率
                    if (analysisResult.getCustomerAnalysis() != null) {
                        result.put("repeatRate", analysisResult.getCustomerAnalysis().getRepeatRate());
                    }

                    // Top 产品排行
                    if (analysisResult.getProductAnalysis() != null
                            && analysisResult.getProductAnalysis().getProductRanking() != null) {
                        List<Map<String, Object>> topProducts = analysisResult.getProductAnalysis()
                                .getProductRanking().stream()
                                .limit(5)
                                .map(p -> {
                                    Map<String, Object> map = new HashMap<>();
                                    map.put("name", p.getProductName());
                                    map.put("revenue", p.getRevenue());
                                    return map;
                                })
                                .toList();
                        result.put("topProducts", topProducts);
                    }
                }
            } catch (Exception e) {
                // 解析失败不影响整体返回
            }
        }

        // ====== monthlyOrdersTrend：从 OrderRecord 按月统计 ======
        try {
            List<OrderRecord> allOrders = orderRecordRepository.findByStoreId(storeId);
            Map<String, Long> monthlyOrdersTrend = allOrders.stream()
                    .filter(o -> o.getOrderDate() != null)
                    .collect(Collectors.groupingBy(
                            o -> o.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                            TreeMap::new,
                            Collectors.counting()
                    ));
            result.put("monthlyOrdersTrend", monthlyOrdersTrend);
        } catch (Exception e) {
            // 查询失败不影响整体返回
        }

        // ====== latestUpload ======
        fillLatestUpload(result, store);

        return ApiResponse.success(result);
    }

    /**
     * 填充最新上传文件信息（含关联报告和分析数据）
     */
    private void fillLatestUpload(Map<String, Object> result, Store store) {
        try {
            List<UploadedFile> files = uploadedFileRepository.findByStoreIdOrderByCreatedTimeDesc(store.getId());
            if (!files.isEmpty()) {
                UploadedFile latest = files.get(0);
                Map<String, Object> uploadInfo = new HashMap<>();
                uploadInfo.put("fileName", latest.getFileName());
                uploadInfo.put("status", latest.getStatus());
                uploadInfo.put("createdAt", latest.getCreatedTime());
                uploadInfo.put("storeName", store.getStoreName());

                // 查找关联 task -> analysis_data -> totalOrders (CSV rows)
                List<AnalysisTask> tasks = analysisTaskRepository.findAllByUploadedFileId(latest.getId());
                if (!tasks.isEmpty()) {
                    AnalysisTask task = tasks.get(0);
                    AnalysisData data = analysisDataRepository.findByAnalysisTaskId(task.getId()).orElse(null);
                    if (data != null) {
                        try {
                            AnalysisResultDTO analysisResult = objectMapper.readValue(data.getDataJson(), AnalysisResultDTO.class);
                            if (analysisResult.getSalesAnalysis() != null) {
                                uploadInfo.put("totalRows", analysisResult.getSalesAnalysis().getTotalOrders());
                            }
                        } catch (Exception ignored) {}

                        // 查找关联报告
                        AnalysisReport report = analysisReportRepository.findByTaskId(task.getId()).orElse(null);
                        if (report != null) {
                            Map<String, Object> reportInfo = new HashMap<>();
                            reportInfo.put("reportId", report.getId());
                            reportInfo.put("healthScore", report.getHealthScore());
                            reportInfo.put("createdAt", report.getCreatedTime());
                            uploadInfo.put("report", reportInfo);
                        }
                    }
                }

                result.put("latestUpload", uploadInfo);
            }
        } catch (Exception e) {
            // 查询失败不影响整体返回
        }
    }
}