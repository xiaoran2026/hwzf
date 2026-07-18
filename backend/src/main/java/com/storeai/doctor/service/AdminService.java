package com.storeai.doctor.service;

import com.storeai.doctor.dto.admin.*;
import com.storeai.doctor.entity.*;
import com.storeai.doctor.enums.RoleEnum;
import com.storeai.doctor.repository.*;
import com.storeai.doctor.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final AnalysisReportRepository analysisReportRepository;
    private final AnalysisTaskRepository analysisTaskRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final WebhookLogRepository webhookLogRepository;
    private final OperationLogRepository operationLogRepository;
    private final SubscriptionRepository subscriptionRepository;

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // ==================== Dashboard ====================

    private void preventSelfOperation(Long targetUserId) {
        Long currentUserId = CurrentUser.getUserId();
        if (currentUserId != null && currentUserId.equals(targetUserId)) {
            throw new RuntimeException("You cannot perform this operation on yourself.");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public DashboardDTO getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.plusDays(1).atStartOfDay();

        List<PaymentRecord> allPayments = paymentRecordRepository.findAll();
        double totalRevenue = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()) && p.getAmount() != null)
                .mapToDouble(p -> p.getAmount().doubleValue())
                .sum();

        long todayUploads = uploadedFileRepository.countByCreatedTimeBetween(todayStart, todayEnd);
        long todayPayments = paymentRecordRepository.countByCreatedTimeBetween(todayStart, todayEnd);
        long todayNewUsers = userRepository.countByCreatedTimeBetween(todayStart, todayEnd);

        return DashboardDTO.builder()
                .totalUsers(userRepository.count())
                .totalStores(storeRepository.count())
                .totalReports(analysisReportRepository.count())
                .totalRevenue(totalRevenue)
                .todayUploads(todayUploads)
                .todayPayments(todayPayments)
                .todayNewUsers(todayNewUsers)
                .totalTasks(analysisTaskRepository.count())
                .totalSubscriptions(subscriptionRepository.count())
                .totalWebhookLogs(webhookLogRepository.count())
                .build();
    }

    // ==================== Users ====================

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PageDTO<AdminUserDTO> listUsers(String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdTime"));
        Page<User> userPage;

        if (StringUtils.hasText(search)) {
            userPage = userRepository.findByEmailContainingIgnoreCase(search, pageRequest);
        } else {
            userPage = userRepository.findAll(pageRequest);
        }

        List<AdminUserDTO> content = userPage.getContent().stream()
                .map(this::toAdminUserDTO)
                .collect(Collectors.toList());

        return PageDTO.<AdminUserDTO>builder()
                .content(content)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateUserPlan(Long userId, String plan) {
        preventSelfOperation(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setPlan(plan.toUpperCase());
        userRepository.save(user);
        log.info("[Admin] Updated user {} plan to {}", userId, plan);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateUserRole(Long userId, String role) {
        preventSelfOperation(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setRole(RoleEnum.valueOf(role.toUpperCase()));
        userRepository.save(user);
        log.info("[Admin] Updated user {} role to {}", userId, role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void toggleBanUser(Long userId, boolean banned) {
        preventSelfOperation(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setBanned(banned);
        userRepository.save(user);
        log.info("[Admin] {} user {} ({})", banned ? "Banned" : "Unbanned", userId, user.getEmail());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteUser(Long userId) {
        preventSelfOperation(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        userRepository.delete(user);
        log.info("[Admin] Deleted user {} ({})", userId, user.getEmail());
    }

    private AdminUserDTO toAdminUserDTO(User user) {
        long storeCount = storeRepository.countByUserId(user.getId());
        long reportCount = analysisReportRepository.countByTaskUploadedFileStoreUserId(user.getId());

        return AdminUserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .plan(user.getPlan())
                .role(user.getRole().name())
                .banned(user.getBanned())
                .storeCount(storeCount)
                .reportCount(reportCount)
                .createdTime(user.getCreatedTime() != null ? user.getCreatedTime().format(DT_FMT) : null)
                .build();
    }

    // ==================== Stores ====================

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PageDTO<AdminStoreDTO> listStores(String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdTime"));
        Page<Store> storePage;

        if (StringUtils.hasText(search)) {
            storePage = storeRepository.findByStoreNameContainingIgnoreCase(search, pageRequest);
        } else {
            storePage = storeRepository.findAll(pageRequest);
        }

        List<AdminStoreDTO> content = storePage.getContent().stream()
                .map(this::toAdminStoreDTO)
                .collect(Collectors.toList());

        return PageDTO.<AdminStoreDTO>builder()
                .content(content)
                .totalElements(storePage.getTotalElements())
                .totalPages(storePage.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteStore(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found: " + storeId));
        storeRepository.delete(store);
        log.info("[Admin] Deleted store {} ({})", storeId, store.getStoreName());
    }

    private AdminStoreDTO toAdminStoreDTO(Store store) {
        long uploadCount = uploadedFileRepository.countByStoreId(store.getId());
        long taskCount = analysisTaskRepository.countByUploadedFileStoreId(store.getId());

        return AdminStoreDTO.builder()
                .id(store.getId())
                .userId(store.getUser() != null ? store.getUser().getId() : null)
                .userEmail(store.getUser() != null ? store.getUser().getEmail() : null)
                .storeName(store.getStoreName())
                .platform(store.getPlatform())
                .uploadCount(uploadCount)
                .taskCount(taskCount)
                .createdTime(store.getCreatedTime() != null ? store.getCreatedTime().format(DT_FMT) : null)
                .build();
    }

    // ==================== Reports ====================

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PageDTO<AdminReportDTO> listReports(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdTime"));
        Page<AnalysisReport> reportPage = analysisReportRepository.findAll(pageRequest);

        List<AdminReportDTO> content = reportPage.getContent().stream()
                .map(this::toAdminReportDTO)
                .collect(Collectors.toList());

        return PageDTO.<AdminReportDTO>builder()
                .content(content)
                .totalElements(reportPage.getTotalElements())
                .totalPages(reportPage.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteReport(Long reportId) {
        AnalysisReport report = analysisReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));
        analysisReportRepository.delete(report);
        log.info("[Admin] Deleted report {}", reportId);
    }

    private AdminReportDTO toAdminReportDTO(AnalysisReport report) {
        AnalysisTask task = report.getTask();
        UploadedFile file = task != null ? task.getUploadedFile() : null;
        Store store = file != null ? file.getStore() : null;

        return AdminReportDTO.builder()
                .id(report.getId())
                .userId(store != null && store.getUser() != null ? store.getUser().getId() : null)
                .userEmail(store != null && store.getUser() != null ? store.getUser().getEmail() : null)
                .storeId(store != null ? store.getId() : null)
                .storeName(store != null ? store.getStoreName() : null)
                .taskId(task != null ? task.getId() : null)
                .healthScore(report.getHealthScore())
                .createdAt(report.getCreatedTime() != null ? report.getCreatedTime().format(DT_FMT) : null)
                .build();
    }

    // ==================== Payments ====================

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PageDTO<AdminPaymentDTO> listPayments(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdTime"));
        Page<PaymentRecord> paymentPage = paymentRecordRepository.findAll(pageRequest);

        List<AdminPaymentDTO> content = paymentPage.getContent().stream()
                .map(this::toAdminPaymentDTO)
                .collect(Collectors.toList());

        return PageDTO.<AdminPaymentDTO>builder()
                .content(content)
                .totalElements(paymentPage.getTotalElements())
                .totalPages(paymentPage.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    private AdminPaymentDTO toAdminPaymentDTO(PaymentRecord record) {
        return AdminPaymentDTO.builder()
                .id(record.getId())
                .userId(record.getUser().getId())
                .userEmail(record.getUser().getEmail())
                .plan(record.getPlan())
                .amount(record.getAmount())
                .currency(record.getCurrency())
                .paymentProvider(record.getPaymentProvider())
                .providerTransactionId(record.getProviderTransactionId())
                .status(record.getStatus())
                .paymentMethod(record.getPaymentMethod())
                .paidAt(record.getPaidAt() != null ? record.getPaidAt().format(DT_FMT) : null)
                .createdTime(record.getCreatedTime() != null ? record.getCreatedTime().format(DT_FMT) : null)
                .build();
    }

    // ==================== Logs ====================

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PageDTO<AdminLogDTO> listLogs(String type, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdTime"));
        Page<OperationLog> logPage;

        if (StringUtils.hasText(type)) {
            logPage = operationLogRepository.findByOperationContainingIgnoreCase(type, pageRequest);
        } else {
            logPage = operationLogRepository.findAll(pageRequest);
        }

        List<AdminLogDTO> content = logPage.getContent().stream()
                .map(this::toAdminLogDTO)
                .collect(Collectors.toList());

        return PageDTO.<AdminLogDTO>builder()
                .content(content)
                .totalElements(logPage.getTotalElements())
                .totalPages(logPage.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PageDTO<AdminLogDTO> listWebhookLogs(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdTime"));
        Page<WebhookLog> logPage = webhookLogRepository.findAll(pageRequest);

        List<AdminLogDTO> content = logPage.getContent().stream()
                .map(this::toAdminWebhookLogDTO)
                .collect(Collectors.toList());

        return PageDTO.<AdminLogDTO>builder()
                .content(content)
                .totalElements(logPage.getTotalElements())
                .totalPages(logPage.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    private AdminLogDTO toAdminLogDTO(OperationLog log) {
        String userEmail = null;
        if (log.getUserId() != null) {
            try {
                userEmail = userRepository.findById(log.getUserId())
                        .map(User::getEmail).orElse(null);
            } catch (Exception ignored) {}
        }

        return AdminLogDTO.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userEmail(userEmail)
                .type("OPERATION")
                .operation(log.getOperation())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .createdTime(log.getCreatedTime() != null ? log.getCreatedTime().format(DT_FMT) : null)
                .build();
    }

    private AdminLogDTO toAdminWebhookLogDTO(WebhookLog log) {
        return AdminLogDTO.builder()
                .id(log.getId())
                .type("WEBHOOK")
                .operation(log.getEventType())
                .details("Provider: " + log.getProvider() + ", Status: " + log.getStatus()
                        + ", TX: " + log.getProviderTransactionId()
                        + (log.getErrorMessage() != null ? ", Error: " + log.getErrorMessage() : ""))
                .createdTime(log.getCreatedTime() != null ? log.getCreatedTime().format(DT_FMT) : null)
                .build();
    }
}