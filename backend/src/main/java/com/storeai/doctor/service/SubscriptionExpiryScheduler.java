package com.storeai.doctor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionExpiryScheduler {

    private final SubscriptionService subscriptionService;

    /**
     * Process expired subscriptions every 5 minutes.
     * Downgrades subscriptions that have passed their expireTime.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void processExpiredSubscriptions() {
        try {
            log.info("[Scheduler] Running expired subscription check...");
            subscriptionService.processExpiredSubscriptions();
        } catch (Exception e) {
            log.error("[Scheduler] Failed to process expired subscriptions: {}", e.getMessage(), e);
        }
    }
}
