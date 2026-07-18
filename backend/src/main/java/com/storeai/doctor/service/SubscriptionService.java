package com.storeai.doctor.service;

import com.storeai.doctor.entity.Subscription;
import com.storeai.doctor.entity.UploadedFile;
import com.storeai.doctor.entity.User;
import com.storeai.doctor.enums.PlanEnum;
import com.storeai.doctor.repository.AnalysisReportRepository;
import com.storeai.doctor.repository.StoreRepository;
import com.storeai.doctor.repository.SubscriptionRepository;
import com.storeai.doctor.repository.UploadedFileRepository;
import com.storeai.doctor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final StoreRepository storeRepository;
    private final AnalysisReportRepository analysisReportRepository;

    /**
     * Get user's active subscription. If none exists, create a FREE one.
     */
    public Subscription getUserSubscription(Long userId) {
        List<Subscription> activeSubs = subscriptionRepository.findActiveByUserIdOrderByIdDesc(userId);
        if (!activeSubs.isEmpty()) {
            return activeSubs.get(0);
        }
        return createFreeSubscription(userId);
    }

    private Subscription createFreeSubscription(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlan("FREE");
        sub.setStatus("ACTIVE");
        sub.setCancelAtPeriodEnd(false);
        sub.setStartTime(LocalDateTime.now());
        sub.setExpireTime(LocalDateTime.now().plusYears(100));
        return subscriptionRepository.save(sub);
    }

    /**
     * Check if user can create a new store.
     */
    public boolean canCreateStore(Long userId) {
        PlanEnum plan = getUserPlan(userId);
        if (plan.isUnlimitedStores()) return true;
        long storeCount = storeRepository.countByUserId(userId);
        return storeCount < plan.getMaxStores();
    }

    /**
     * Check if user can upload CSV (by upload count, not row count).
     */
    public boolean canUpload(Long userId) {
        PlanEnum plan = getUserPlan(userId);
        if (plan.isUnlimitedUploads()) return true;

        if (plan.isFree()) {
            long totalUploads = uploadedFileRepository.countByUserId(userId);
            return totalUploads < plan.getMaxUploadsPerMonth();
        }

        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        long monthUploads = uploadedFileRepository.countByUserIdAndCreatedTimeBetween(userId, startOfMonth, endOfMonth);
        return monthUploads < plan.getMaxUploadsPerMonth();
    }

    /**
     * Legacy method for backward compatibility.
     */
    public boolean canUploadRows(Long userId, int rowCount) {
        PlanEnum plan = getUserPlan(userId);
        if (!canUpload(userId)) return false;
        return rowCount <= plan.getMaxCsvRows();
    }

    /**
     * Check if user can create a new report (enforces maxReports limit).
     */
    public boolean canCreateReport(Long userId) {
        PlanEnum plan = getUserPlan(userId);
        if (plan.isUnlimitedReports()) return true;

        // For FREE plan: 1 report lifetime
        if (plan.isFree()) {
            long reportCount = analysisReportRepository.countByTaskUploadedFileStoreUserId(userId);
            return reportCount < plan.getMaxReports();
        }

        // For paid plans: check monthly
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        long monthReports = analysisReportRepository.countReportsByUserIdAndCreatedTimeBetween(userId, startOfMonth, endOfMonth);
        return monthReports < plan.getMaxReports();
    }

    /**
     * Check if user's plan supports a specific analysis type.
     */
    public boolean canRunAnalysis(Long userId, String analysisType) {
        PlanEnum plan = getUserPlan(userId);
        return plan.canRunAnalysis(analysisType);
    }

    /**
     * Get remaining report quota.
     */
    public int getRemainingReports(Long userId) {
        PlanEnum plan = getUserPlan(userId);
        if (plan.isUnlimitedReports()) return -1;

        long used;
        if (plan.isFree()) {
            used = analysisReportRepository.countByTaskUploadedFileStoreUserId(userId);
        } else {
            YearMonth currentMonth = YearMonth.now();
            LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
            used = analysisReportRepository.countReportsByUserIdAndCreatedTimeBetween(userId, startOfMonth, endOfMonth);
        }
        return Math.max(0, plan.getMaxReports() - (int) used);
    }

    /**
     * Get user's plan as enum.
     */
    public PlanEnum getUserPlan(Long userId) {
        Subscription sub = getUserSubscription(userId);
        if (sub == null) return PlanEnum.FREE;
        return PlanEnum.fromString(sub.getPlan());
    }

    /**
     * Get remaining store slots.
     */
    public int getRemainingStoreSlots(Long userId) {
        PlanEnum plan = getUserPlan(userId);
        if (plan.isUnlimitedStores()) return -1;
        long storeCount = storeRepository.countByUserId(userId);
        return Math.max(0, plan.getMaxStores() - (int) storeCount);
    }

    /**
     * Get remaining uploads this month (or lifetime for FREE).
     */
    public int getRemainingUploads(Long userId) {
        PlanEnum plan = getUserPlan(userId);
        if (plan.isUnlimitedUploads()) return -1;

        long used;
        if (plan.isFree()) {
            used = uploadedFileRepository.countByUserId(userId);
        } else {
            YearMonth currentMonth = YearMonth.now();
            LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
            used = uploadedFileRepository.countByUserIdAndCreatedTimeBetween(userId, startOfMonth, endOfMonth);
        }
        return Math.max(0, plan.getMaxUploadsPerMonth() - (int) used);
    }

    /**
     * Get current plan name as string.
     */
    public String getCurrentPlan(Long userId) {
        Subscription sub = getUserSubscription(userId);
        return sub != null ? sub.getPlan() : "FREE";
    }

    /**
     * Get subscription detail as DTO.
     */
    public com.storeai.doctor.dto.SubscriptionDTO getSubscriptionDetail(Long userId) {
        Subscription sub = getUserSubscription(userId);
        if (sub == null) return null;
        return com.storeai.doctor.dto.SubscriptionDTO.builder()
                .id(sub.getId())
                .plan(sub.getPlan())
                .status(sub.getStatus())
                .paymentProvider(sub.getPaymentProvider())
                .paymentId(sub.getPaymentId())
                .startTime(sub.getStartTime() != null ? sub.getStartTime().toString() : null)
                .expireTime(sub.getExpireTime() != null ? sub.getExpireTime().toString() : null)
                .renewTime(sub.getRenewTime() != null ? sub.getRenewTime().toString() : null)
                .cancelledAt(sub.getCancelledAt() != null ? sub.getCancelledAt().toString() : null)
                .createdTime(sub.getCreatedTime() != null ? sub.getCreatedTime().toString() : null)
                .build();
    }

    /**
     * Cancel user's subscription at period end (does NOT immediately downgrade).
     * The subscription remains ACTIVE until expireTime.
     */
    @Transactional
    public void cancelSubscription(Long userId) {
        List<Subscription> activeSubs = subscriptionRepository.findActiveByUserIdOrderByIdDesc(userId);
        if (activeSubs.isEmpty()) {
            throw new RuntimeException("No active subscription found");
        }
        Subscription sub = activeSubs.get(0);
        // Prevent double-cancel
        if (Boolean.TRUE.equals(sub.getCancelAtPeriodEnd())) {
            throw new RuntimeException("Subscription is already scheduled for cancellation");
        }
        sub.setCancelAtPeriodEnd(true);
        sub.setCancelledAt(LocalDateTime.now());
        subscriptionRepository.save(sub);
        log.info("[Subscription] User {} subscription marked for cancellation at period end (expireTime={})",
                userId, sub.getExpireTime());
    }

    /**
     * Process expired subscriptions: downgrade to FREE when period ends.
     * Should be called by a scheduled job periodically.
     */
    @Transactional
    public void processExpiredSubscriptions() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Subscriptions with cancelAtPeriodEnd=true that have expired
        List<Subscription> expiredCancellations = subscriptionRepository.findExpiredCancellations(now);
        for (Subscription sub : expiredCancellations) {
            downgradeSubscription(sub);
        }

        // 2. Subscriptions that have passed expireTime (without explicit cancel)
        List<Subscription> expiredSubs = subscriptionRepository.findExpiredSubscriptions(now);
        for (Subscription sub : expiredSubs) {
            // Skip FREE subscriptions (they never expire)
            if ("FREE".equalsIgnoreCase(sub.getPlan())) continue;
            downgradeSubscription(sub);
        }

        log.info("[Subscription] Processed {} expired cancellations and {} expired subscriptions",
                expiredCancellations.size(), expiredSubs.size());
    }

    @Transactional
    public void downgradeSubscription(Subscription sub) {
        if (sub == null || sub.getUser() == null) return;
        Long userId = sub.getUser().getId();

        sub.setStatus("CANCELLED");
        subscriptionRepository.save(sub);

        // Create new FREE subscription
        Subscription freeSub = new Subscription();
        freeSub.setUser(sub.getUser());
        freeSub.setPlan("FREE");
        freeSub.setStatus("ACTIVE");
        freeSub.setCancelAtPeriodEnd(false);
        freeSub.setStartTime(LocalDateTime.now());
        freeSub.setExpireTime(LocalDateTime.now().plusYears(100));
        subscriptionRepository.save(freeSub);

        // Update user plan
        User user = sub.getUser();
        user.setPlan("FREE");
        userRepository.save(user);

        log.info("[Subscription] User {} subscription expired/downgraded to FREE", userId);
    }

    /**
     * Upgrade user's subscription to a new plan.
     * Uses pessimistic locking to prevent concurrent duplicate upgrades.
     */
    @Transactional
    public synchronized void upgradePlan(Long userId, String plan, String paymentProvider, String saleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Normalize plan name
        plan = plan.toUpperCase();
        if ("ENTERPRISE".equals(plan)) {
            plan = "STARTER";
        }

        // Cancel existing active subscriptions
        List<Subscription> activeSubs = subscriptionRepository.findActiveByUserIdOrderByIdDesc(userId);
        for (Subscription existing : activeSubs) {
            if (existing != null) {
                existing.setStatus("CANCELLED");
                existing.setCancelledAt(LocalDateTime.now());
                subscriptionRepository.save(existing);
            }
        }

        // Create new subscription
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlan(plan);
        sub.setStatus("ACTIVE");
        sub.setCancelAtPeriodEnd(false);
        sub.setPaymentProvider(paymentProvider);
        sub.setPaymentId(saleId);
        sub.setStartTime(LocalDateTime.now());
        sub.setExpireTime(LocalDateTime.now().plusMonths(1));
        sub.setRenewTime(LocalDateTime.now().plusMonths(1).minusDays(3));
        subscriptionRepository.save(sub);

        // Update user plan
        user.setPlan(plan);
        userRepository.save(user);

        log.info("[Subscription] User {} upgraded to plan {}", userId, plan);
    }

    /**
     * Refund user's subscription: immediately downgrade and create FREE sub.
     */
    @Transactional
    public void refundSubscription(Long userId, String transactionId) {
        List<Subscription> activeSubs = subscriptionRepository.findActiveByUserIdOrderByIdDesc(userId);
        if (!activeSubs.isEmpty()) {
            Subscription sub = activeSubs.get(0);
            sub.setStatus("CANCELLED");
            sub.setCancelledAt(LocalDateTime.now());
            subscriptionRepository.save(sub);
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            Subscription freeSub = new Subscription();
            freeSub.setUser(user);
            freeSub.setPlan("FREE");
            freeSub.setStatus("ACTIVE");
            freeSub.setCancelAtPeriodEnd(false);
            freeSub.setStartTime(LocalDateTime.now());
            freeSub.setExpireTime(LocalDateTime.now().plusYears(100));
            subscriptionRepository.save(freeSub);

            user.setPlan("FREE");
            userRepository.save(user);
        }

        log.info("[Subscription] User {} refunded, downgraded to FREE (transaction={})", userId, transactionId);
    }

    /**
     * Get usage summary for frontend dashboard.
     */
    public Map<String, Object> getUsageSummary(Long userId) {
        PlanEnum plan = getUserPlan(userId);
        Map<String, Object> summary = new HashMap<>();

        summary.put("plan", plan.name());
        summary.put("planDisplay", plan == PlanEnum.FREE ? "Free" : plan == PlanEnum.STARTER ? "Starter" : "Pro");
        summary.put("monthlyPrice", plan.getMonthlyPrice());
        summary.put("maxStores", plan.isUnlimitedStores() ? null : plan.getMaxStores());
        summary.put("maxUploadsPerMonth", plan.isUnlimitedUploads() ? null : plan.getMaxUploadsPerMonth());
        summary.put("maxCsvRows", plan.getMaxCsvRows());
        summary.put("unlimitedStores", plan.isUnlimitedStores());
        summary.put("unlimitedUploads", plan.isUnlimitedUploads());

        // Store usage
        long storeCount = storeRepository.countByUserId(userId);
        summary.put("storeCount", storeCount);
        summary.put("storeLimit", plan.isUnlimitedStores() ? null : plan.getMaxStores());
        summary.put("storeUsagePct", plan.isUnlimitedStores() ? 0 : (int) ((storeCount * 100) / plan.getMaxStores()));
        summary.put("canCreateStore", canCreateStore(userId));
        summary.put("remainingStoreSlots", getRemainingStoreSlots(userId));

        // Upload usage
        long uploadCount;
        if (plan.isFree()) {
            uploadCount = uploadedFileRepository.countByUserId(userId);
        } else {
            YearMonth currentMonth = YearMonth.now();
            LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
            uploadCount = uploadedFileRepository.countByUserIdAndCreatedTimeBetween(userId, startOfMonth, endOfMonth);
        }
        summary.put("uploadCount", uploadCount);
        summary.put("uploadLimit", plan.isUnlimitedUploads() ? null : plan.getMaxUploadsPerMonth());
        summary.put("uploadUsagePct", plan.isUnlimitedUploads() ? 0 : (int) ((uploadCount * 100) / plan.getMaxUploadsPerMonth()));
        summary.put("canUpload", canUpload(userId));
        summary.put("remainingUploads", getRemainingUploads(userId));

        // Report usage
        long reportCount;
        if (plan.isFree()) {
            reportCount = analysisReportRepository.countByTaskUploadedFileStoreUserId(userId);
        } else {
            YearMonth currentMonth = YearMonth.now();
            LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
            reportCount = analysisReportRepository.countReportsByUserIdAndCreatedTimeBetween(userId, startOfMonth, endOfMonth);
        }
        summary.put("reportCount", reportCount);
        summary.put("reportLimit", plan.isUnlimitedReports() ? null : plan.getMaxReports());
        summary.put("canCreateReport", canCreateReport(userId));
        summary.put("remainingReports", getRemainingReports(userId));

        return summary;
    }
}
