package com.storeai.doctor.controller;

import com.storeai.doctor.common.ApiResponse;
import com.storeai.doctor.dto.BillingDTO;
import com.storeai.doctor.dto.PaymentRecordDTO;
import com.storeai.doctor.dto.PaymentRequest;
import com.storeai.doctor.dto.PaymentResponse;
import com.storeai.doctor.dto.SubscriptionDTO;
import com.storeai.doctor.entity.PaymentRecord;
import com.storeai.doctor.entity.User;
import com.storeai.doctor.entity.WebhookLog;
import com.storeai.doctor.enums.PlanEnum;
import com.storeai.doctor.repository.StoreRepository;
import com.storeai.doctor.repository.UserRepository;
import com.storeai.doctor.security.CurrentUser;
import com.storeai.doctor.service.GumroadPaymentService;
import com.storeai.doctor.service.PaymentRecordService;
import com.storeai.doctor.service.SubscriptionService;
import com.storeai.doctor.service.WebhookLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final GumroadPaymentService gumroadPaymentService;
    private final SubscriptionService subscriptionService;
    private final PaymentRecordService paymentRecordService;
    private final WebhookLogService webhookLogService;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    @Value("${gumroad.pro-product-id}")
    private String proProductId;

    @Value("${gumroad.starter-product-id}")
    private String starterProductId;

    @Value("${gumroad.webhook-token:}")
    private String webhookToken;

    // ==================== Payment Creation ====================

    @PostMapping("/create")
    public ApiResponse<PaymentResponse> createPayment(@RequestBody PaymentRequest request) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        if (request == null) {
            return ApiResponse.error("Request body is required");
        }

        String plan = request.getPlan();
        if (!StringUtils.hasText(plan)) {
            return ApiResponse.error("Plan is required");
        }
        plan = plan.trim();

        if ("FREE".equalsIgnoreCase(plan)) {
            return ApiResponse.error("FREE plan does not require payment");
        }

        String paymentUrl = gumroadPaymentService.generatePaymentUrl(plan);
        if (paymentUrl == null) {
            return ApiResponse.error("Invalid plan: " + plan);
        }

        PaymentResponse response = new PaymentResponse(paymentUrl, plan.toUpperCase());
        return ApiResponse.success(response);
    }

    // ==================== Gumroad Webhook ====================

    @PostMapping("/webhook/gumroad")
    public String gumroadWebhook(
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "product_id", required = false) String productId,
            @RequestParam(value = "sale_id", required = false) String saleId,
            @RequestParam(value = "resource_name", required = false) String eventType,
            @RequestParam(value = "price", required = false) String price,
            @RequestParam(value = "currency", required = false) String currency,
            @RequestParam(value = "subscription_id", required = false) String subscriptionId,
            @RequestParam(value = "order_number", required = false) String orderNumber,
            @RequestParam(value = "token", required = false) String token,
            @RequestParam Map<String, String> allParams) {

        WebhookLog webhookLog = null;

        try {
            if (eventType == null) {
                eventType = "sale";
            }

            if (StringUtils.hasText(webhookToken) && !webhookToken.equals(token)) {
                Map<String, Object> payload = new HashMap<>();
                payload.put("eventType", eventType);
                payload.put("product_id", productId);
                payload.put("price", price);
                payload.put("currency", currency);
                webhookLog = webhookLogService.logWebhook("GUMROAD", eventType, payload, null, saleId);
                if (webhookLog != null) {
                    webhookLogService.markProcessed(webhookLog, "REJECTED", "Invalid webhook token");
                }
                return "OK";
            }

            Map<String, Object> payload = new HashMap<>(allParams);
            payload.remove("email");
            payload.remove("full_name");
            payload.remove("buyer_name");
            payload.remove("ip_address");
            payload.remove("street_address");
            payload.remove("city");
            payload.remove("state");
            payload.remove("zip_code");
            payload.remove("country");
            payload.remove("order_number");
            payload.remove("subscription_id");
            payload.remove("token");

            // Log webhook
            webhookLog = webhookLogService.logWebhook("GUMROAD", eventType, payload, null, saleId);

            // === CRITICAL: Validate sale_id / transaction_id ===
            if (!StringUtils.hasText(saleId)) {
                log.warn("[Webhook] Rejected: sale_id is null or blank — eventType={}, productId={}", eventType, productId);
                if (webhookLog != null) {
                    webhookLogService.markProcessed(webhookLog, "REJECTED", "sale_id is null or blank");
                }
                return "OK";
            }

            if (saleId.trim().isEmpty()) {
                log.warn("[Webhook] Rejected: sale_id is blank — eventType={}", eventType);
                if (webhookLog != null) {
                    webhookLogService.markProcessed(webhookLog, "REJECTED", "sale_id is blank");
                }
                return "OK";
            }

            // === Validate required fields ===
            if (!StringUtils.hasText(email) || !StringUtils.hasText(productId)) {
                log.warn("[Webhook] Missing email or product_id, skipping");
                if (webhookLog != null) {
                    webhookLogService.markProcessed(webhookLog, "FAILED", "Missing email or product_id");
                }
                return "OK";
            }

            // === Determine plan from product_id ===
            String plan;
            if (proProductId != null && proProductId.equals(productId)) {
                plan = "PRO";
            } else if (starterProductId != null && starterProductId.equals(productId)) {
                plan = "STARTER";
            } else {
                log.warn("[Webhook] Unknown product_id: {}", productId);
                if (webhookLog != null) {
                    webhookLogService.markProcessed(webhookLog, "FAILED", "Unknown product_id: " + productId);
                }
                return "OK";
            }

            // === Find user by email ===
            Optional<User> optionalUser = userRepository.findByEmail(email);
            if (optionalUser.isEmpty()) {
                log.warn("[Webhook] User not found for provided email");
                if (webhookLog != null) {
                    webhookLogService.markProcessed(webhookLog, "FAILED", "User not found for provided email");
                }
                return "OK";
            }

            Long userId = optionalUser.get().getId();

            // === Idempotency check - event-type aware ===
            // For "sale" events: skip if PaymentRecord already exists
            // For "refund" events: allow if PaymentRecord exists but not yet REFUNDED
            // For other events: allow (they don't create duplicate records)
            String eventTypeLower = eventType.toLowerCase();
            if ("sale".equals(eventTypeLower)) {
                if (paymentRecordService.existsByProviderTransactionId(saleId)) {
                    log.info("[Webhook] Sale already processed for transaction {}, skipping", saleId);
                    if (webhookLog != null) {
                        webhookLogService.markDuplicate(webhookLog);
                    }
                    return "OK";
                }
            }

            // === Process based on event type ===
            synchronized (this) {
                // Double-check for sale events after acquiring lock
                if ("sale".equals(eventTypeLower) && paymentRecordService.existsByProviderTransactionId(saleId)) {
                    log.info("[Webhook] Sale already processed for transaction {} (after lock), skipping", saleId);
                    if (webhookLog != null) {
                        webhookLogService.markDuplicate(webhookLog);
                    }
                    return "OK";
                }

                switch (eventType.toLowerCase()) {
                    case "sale":
                        processSale(userId, plan, saleId, price, currency, webhookLog);
                        break;
                    case "refund":
                        processRefund(userId, saleId, price, webhookLog);
                        break;
                    case "subscription_cancelled":
                        processCancellation(userId, saleId, webhookLog);
                        break;
                    case "subscription_reactivated":
                        processReactivation(userId, plan, saleId, webhookLog);
                        break;
                    case "subscription_ended":
                        processSubscriptionEnd(userId, saleId, webhookLog);
                        break;
                    case "subscription_payment_failed":
                        processPaymentFailed(userId, saleId, webhookLog);
                        break;
                    default:
                        log.info("[Webhook] Unhandled event type: {} for transaction {}", eventType, saleId);
                        if (webhookLog != null) {
                            webhookLogService.markProcessed(webhookLog, "SKIPPED", "Unhandled event type: " + eventType);
                        }
                }
            }

            log.info("[Webhook] Successfully processed event {} transaction {} for user {}",
                    eventType, saleId, userId);

        } catch (Exception e) {
            log.error("[Webhook] Processing failed for transaction {}: {}", saleId, e.getMessage(), e);
            if (webhookLog != null) {
                webhookLogService.incrementRetry(webhookLog, e.getMessage());
            }
        }

        return "OK";
    }

    private void processSale(Long userId, String plan, String saleId, String price, String currency, WebhookLog webhookLog) {
        // Parse amount
        BigDecimal amount = parseAmount(price);

        // Create payment record FIRST (before upgrading subscription)
        paymentRecordService.createPaymentRecord(userId, plan, amount, "GUMROAD", saleId, "SUCCESS", "Gumroad");
        log.info("[Webhook] Created PaymentRecord for transaction {}, plan={}, amount={}", saleId, plan, amount);

        // Upgrade subscription
        subscriptionService.upgradePlan(userId, plan, "GUMROAD", saleId);

        if (webhookLog != null) {
            webhookLogService.markProcessed(webhookLog, "PROCESSED", null);
        }
    }

    private void processRefund(Long userId, String saleId, String price, WebhookLog webhookLog) {
        log.info("[Webhook] Processing refund for transaction {} user {}", saleId, userId);

        BigDecimal refundAmount = parseAmount(price);

        // Update payment record status
        PaymentRecord refunded = paymentRecordService.refundPaymentRecord(saleId, refundAmount);
        if (refunded == null) {
            log.warn("[Webhook] Refund: PaymentRecord not found for transaction {}", saleId);
        }

        // Downgrade subscription immediately on refund
        subscriptionService.refundSubscription(userId, saleId);

        if (webhookLog != null) {
            webhookLogService.markProcessed(webhookLog, "PROCESSED", "Refund processed");
        }
    }

    private void processCancellation(Long userId, String saleId, WebhookLog webhookLog) {
        log.info("[Webhook] Processing cancellation for transaction {} user {}", saleId, userId);

        // Mark subscription for cancellation at period end
        subscriptionService.cancelSubscription(userId);

        if (webhookLog != null) {
            webhookLogService.markProcessed(webhookLog, "PROCESSED", "Subscription marked for cancellation at period end");
        }
    }

    private void processReactivation(Long userId, String plan, String saleId, WebhookLog webhookLog) {
        log.info("[Webhook] Processing reactivation for transaction {} user {}", saleId, userId);

        // Reactivate: upgrade plan again
        subscriptionService.upgradePlan(userId, plan, "GUMROAD", saleId);

        if (webhookLog != null) {
            webhookLogService.markProcessed(webhookLog, "PROCESSED", "Subscription reactivated");
        }
    }

    private void processSubscriptionEnd(Long userId, String saleId, WebhookLog webhookLog) {
        log.info("[Webhook] Processing subscription end for transaction {} user {}", saleId, userId);

        // Trigger expired subscription processing
        subscriptionService.processExpiredSubscriptions();

        if (webhookLog != null) {
            webhookLogService.markProcessed(webhookLog, "PROCESSED", "Subscription ended");
        }
    }

    private void processPaymentFailed(Long userId, String saleId, WebhookLog webhookLog) {
        log.info("[Webhook] Processing payment failed for transaction {} user {}", saleId, userId);

        // Mark payment as failed
        paymentRecordService.failPaymentRecord(saleId);

        if (webhookLog != null) {
            webhookLogService.markProcessed(webhookLog, "PROCESSED", "Payment marked as failed");
        }
    }

    private BigDecimal parseAmount(String price) {
        try {
            if (!StringUtils.hasText(price)) {
                return BigDecimal.ZERO;
            }
            String normalized = price.trim();
            if (normalized.contains(".")) {
                return new BigDecimal(normalized);
            }
            // Fallback for providers that send integer cents.
            long cents = Long.parseLong(normalized);
            return BigDecimal.valueOf(cents).divide(BigDecimal.valueOf(100));
        } catch (NumberFormatException e) {
            log.warn("[Webhook] Failed to parse price: {}", price);
            return BigDecimal.ZERO;
        }
    }

    // ==================== Subscription & Billing APIs ====================

    @GetMapping("/subscription")
    public ApiResponse<SubscriptionDTO> getSubscription() {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        SubscriptionDTO subscription = subscriptionService.getSubscriptionDetail(userId);
        return ApiResponse.success(subscription);
    }

    @GetMapping("/history")
    public ApiResponse<List<PaymentRecordDTO>> getPaymentHistory() {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        List<PaymentRecordDTO> history = paymentRecordService.getPaymentHistory(userId);
        return ApiResponse.success(history);
    }

    @GetMapping("/billing")
    public ApiResponse<BillingDTO> getBilling() {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        String currentPlan = subscriptionService.getCurrentPlan(userId);
        SubscriptionDTO subscription = subscriptionService.getSubscriptionDetail(userId);
        List<PaymentRecordDTO> paymentHistory = paymentRecordService.getPaymentHistory(userId);

        boolean isFree = "FREE".equalsIgnoreCase(currentPlan);
        boolean canUpgrade = isFree;
        boolean canCancel = !isFree && subscription != null && "ACTIVE".equals(subscription.getStatus());

        // Build usage info
        PlanEnum planEnum = PlanEnum.getInstance(currentPlan);
        long storesUsed = storeRepository.countByUserId(userId);
        long csvRowsUsed = 0;

        String nextResetDate = null;
        if (subscription != null && subscription.getExpireTime() != null && !subscription.getExpireTime().isEmpty()) {
            try {
                nextResetDate = java.time.LocalDate.parse(subscription.getExpireTime(), java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME).format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            } catch (Exception e) {
                nextResetDate = subscription.getExpireTime().substring(0, 10);
            }
        }

        com.storeai.doctor.dto.UsageDTO usage = com.storeai.doctor.dto.UsageDTO.builder()
                .currentPlan(currentPlan)
                .storesUsed((int) storesUsed)
                .storeLimit(planEnum.getStoreLimit())
                .csvRowsUsed(csvRowsUsed)
                .csvRowLimit(planEnum.getCsvRowLimit())
                .remainingQuota(planEnum.getCsvRowLimit() < 0 ? -1 : Math.max(0, planEnum.getCsvRowLimit() - csvRowsUsed))
                .nextResetDate(nextResetDate)
                .build();

        BillingDTO billing = BillingDTO.builder()
                .subscription(subscription)
                .paymentHistory(paymentHistory)
                .currentPlan(currentPlan)
                .canUpgrade(canUpgrade)
                .canCancel(canCancel)
                .usage(usage)
                .build();

        return ApiResponse.success(billing);
    }

    @PostMapping("/cancel")
    public ApiResponse<Map<String, String>> cancelSubscription() {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }

        Long userId = CurrentUser.getUserId();
        try {
            subscriptionService.cancelSubscription(userId);
            Map<String, String> result = new HashMap<>();
            result.put("message", "Subscription will be cancelled at the end of the current billing period");
            result.put("plan", subscriptionService.getCurrentPlan(userId));
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Get usage summary for the current user.
     * Returns plan limits, store usage, upload usage, and upgrade prompts.
     */
    @GetMapping("/usage")
    public ApiResponse<Map<String, Object>> getUsage() {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }
        Long userId = CurrentUser.getUserId();
        Map<String, Object> usage = subscriptionService.getUsageSummary(userId);
        return ApiResponse.success(usage);
    }

    /**
     * Check if the current user can run a specific analysis type.
     */
    @GetMapping("/can-run-analysis")
    public ApiResponse<Map<String, Object>> canRunAnalysis(@RequestParam String type) {
        if (!CurrentUser.isAuthenticated()) {
            return ApiResponse.error("Unauthorized");
        }
        Long userId = CurrentUser.getUserId();
        boolean canRun = subscriptionService.canRunAnalysis(userId, type);
        PlanEnum plan = subscriptionService.getUserPlan(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("type", type);
        result.put("canRun", canRun);
        result.put("currentPlan", plan.name());
        return ApiResponse.success(result);
    }
}
