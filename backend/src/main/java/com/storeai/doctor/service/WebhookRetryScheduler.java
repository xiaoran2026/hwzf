package com.storeai.doctor.service;

import com.storeai.doctor.entity.WebhookLog;
import com.storeai.doctor.repository.WebhookLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebhookRetryScheduler {

    private final WebhookLogRepository webhookLogRepository;

    /**
     * Log failed webhooks for manual review every 5 minutes.
     * Since we can't re-call external webhooks automatically,
     * we log them for admin attention.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void logFailedWebhooks() {
        try {
            LocalDateTime since = LocalDateTime.now().minusHours(1);
            List<WebhookLog> failedLogs = webhookLogRepository.findByStatusAndRetryCountGreaterThan("FAILED", 0);
            if (!failedLogs.isEmpty()) {
                log.warn("[Scheduler] Found {} failed webhooks requiring attention", failedLogs.size());
                for (WebhookLog logEntry : failedLogs) {
                    log.warn("[Scheduler] Failed webhook: provider={}, txn={}, retries={}, error={}",
                            logEntry.getProvider(),
                            logEntry.getProviderTransactionId(),
                            logEntry.getRetryCount(),
                            logEntry.getErrorMessage());
                }
            }
        } catch (Exception e) {
            log.error("[Scheduler] Failed to check failed webhooks: {}", e.getMessage(), e);
        }
    }
}
