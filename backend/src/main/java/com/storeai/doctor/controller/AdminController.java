package com.storeai.doctor.controller;

import com.storeai.doctor.common.ApiResponse;
import com.storeai.doctor.dto.admin.*;
import com.storeai.doctor.service.AdminService;
import com.storeai.doctor.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final SystemSettingsService systemSettingsService;

    // ==================== Dashboard ====================

    @GetMapping("/dashboard")
    public ApiResponse<DashboardDTO> getDashboard() {
        DashboardDTO dashboard = adminService.getDashboard();
        return ApiResponse.success(dashboard);
    }

    // ==================== Users ====================

    @GetMapping("/users")
    public ApiResponse<PageDTO<AdminUserDTO>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageDTO<AdminUserDTO> result = adminService.listUsers(search, page, size);
        return ApiResponse.success(result);
    }

    @PutMapping("/users/{userId}/plan")
    public ApiResponse<Void> updateUserPlan(
            @PathVariable Long userId,
            @RequestBody UpdatePlanRequest request) {
        adminService.updateUserPlan(userId, request.getPlan());
        return ApiResponse.success(null);
    }

    @PutMapping("/users/{userId}/role")
    public ApiResponse<Void> updateUserRole(
            @PathVariable Long userId,
            @RequestBody UpdateRoleRequest request) {
        adminService.updateUserRole(userId, request.getRole());
        return ApiResponse.success(null);
    }

    @PostMapping("/users/{userId}/ban")
    public ApiResponse<Void> toggleBanUser(
            @PathVariable Long userId,
            @RequestBody ToggleBanRequest request) {
        adminService.toggleBanUser(userId, request.isBanned());
        return ApiResponse.success(null);
    }

    @DeleteMapping("/users/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ApiResponse.success(null);
    }

    // ==================== Stores ====================

    @GetMapping("/stores")
    public ApiResponse<PageDTO<AdminStoreDTO>> listStores(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageDTO<AdminStoreDTO> result = adminService.listStores(search, page, size);
        return ApiResponse.success(result);
    }

    @DeleteMapping("/stores/{storeId}")
    public ApiResponse<Void> deleteStore(@PathVariable Long storeId) {
        adminService.deleteStore(storeId);
        return ApiResponse.success(null);
    }

    // ==================== Reports ====================

    @GetMapping("/reports")
    public ApiResponse<PageDTO<AdminReportDTO>> listReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageDTO<AdminReportDTO> result = adminService.listReports(page, size);
        return ApiResponse.success(result);
    }

    @DeleteMapping("/reports/{reportId}")
    public ApiResponse<Void> deleteReport(@PathVariable Long reportId) {
        adminService.deleteReport(reportId);
        return ApiResponse.success(null);
    }

    // ==================== Payments ====================

    @GetMapping("/payments")
    public ApiResponse<PageDTO<AdminPaymentDTO>> listPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageDTO<AdminPaymentDTO> result = adminService.listPayments(page, size);
        return ApiResponse.success(result);
    }

    // ==================== Logs ====================

    @GetMapping("/logs")
    public ApiResponse<PageDTO<AdminLogDTO>> listLogs(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageDTO<AdminLogDTO> result = adminService.listLogs(type, page, size);
        return ApiResponse.success(result);
    }

    @GetMapping("/logs/webhook")
    public ApiResponse<PageDTO<AdminLogDTO>> listWebhookLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageDTO<AdminLogDTO> result = adminService.listWebhookLogs(page, size);
        return ApiResponse.success(result);
    }

    // ==================== System Settings ====================

    @GetMapping("/settings")
    public ApiResponse<SystemSettingsGroupDTO> getSettingsGroup() {
        SystemSettingsGroupDTO result = systemSettingsService.getSettingsGroup();
        return ApiResponse.success(result);
    }

    @GetMapping("/settings/{key}")
    public ApiResponse<SystemSettingDTO> getSetting(@PathVariable String key) {
        SystemSettingDTO result = systemSettingsService.getSetting(key);
        return ApiResponse.success(result);
    }

    @PutMapping("/settings")
    public ApiResponse<Void> updateSetting(@RequestBody UpdateSettingRequest request) {
        systemSettingsService.updateSetting(request.getKey(), request.getValue());
        return ApiResponse.success(null);
    }

    @PutMapping("/settings/batch")
    public ApiResponse<Void> updateSettingsBatch(@RequestBody UpdateSettingsBatchRequest request) {
        systemSettingsService.updateSettingsBatch(request.getSettings());
        return ApiResponse.success(null);
    }

    // ==================== Health Check ====================

    @GetMapping("/health-check")
    public ApiResponse<HealthCheckDTO> getHealthCheck() {
        HealthCheckDTO result = systemSettingsService.getHealthCheck();
        return ApiResponse.success(result);
    }

    // ==================== Deployment Info ====================

    @GetMapping("/deployment-info")
    public ApiResponse<DeploymentInfoDTO> getDeploymentInfo() {
        DeploymentInfoDTO result = systemSettingsService.getDeploymentInfo();
        return ApiResponse.success(result);
    }

    // ==================== Recent Logs ====================

    @GetMapping("/recent-logs")
    public ApiResponse<RecentLogsDTO> getRecentLogs(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "100") int limit) {
        RecentLogsDTO result = systemSettingsService.getRecentLogs(level, search, limit);
        return ApiResponse.success(result);
    }

    // ==================== Sentry ====================

    @PostMapping("/sentry/test")
    public ApiResponse<String> testSentryError() {
        String result = systemSettingsService.testSentryError();
        return ApiResponse.success(result);
    }

    // ==================== PostHog ====================

    @PostMapping("/posthog/verify")
    public ApiResponse<String> verifyPostHogConnection() {
        String result = systemSettingsService.verifyPostHogConnection();
        return ApiResponse.success(result);
    }

    // ==================== Request DTOs ====================

    @lombok.Data
    public static class UpdatePlanRequest {
        private String plan;
    }

    @lombok.Data
    public static class UpdateRoleRequest {
        private String role;
    }

    @lombok.Data
    public static class ToggleBanRequest {
        private boolean banned;
    }
}
