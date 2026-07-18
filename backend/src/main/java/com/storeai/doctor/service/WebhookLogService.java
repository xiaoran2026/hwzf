package com.storeai.doctor.service;

import com.storeai.doctor.entity.WebhookLog;
import com.storeai.doctor.repository.WebhookLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookLogService {

    private final WebhookLogRepository webhookLogRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public WebhookLog logWebhook(String provider, String eventType, Map<String, Object> payload,
                                  String signature, String providerTransactionId) {
        try {
            WebhookLog webhookLog = new WebhookLog();
            webhookLog.setProvider(provider);
            webhookLog.setEventType(eventType);
            webhookLog.setPayload(objectMapper.writeValueAsString(payload));
            webhookLog.setSignature(signature);
            webhookLog.setProviderTransactionId(providerTransactionId);
            webhookLog.setStatus("RECEIVED");
            webhookLog.setProcessed(false);
            webhookLog.setRetryCount(0);
            webhookLog.setCreatedTime(LocalDateTime.now());

            return webhookLogRepository.save(webhookLog);
        } catch (Exception e) {
            log.error("[Webhook] Failed to log webhook: {}", e.getMessage());
            return null;
        }
    }

    @Transactional
    public void markProcessed(WebhookLog webhookLog, String status, String errorMessage) {
        if (webhookLog == null) return;
        webhookLog.setStatus(status);
        webhookLog.setProcessed(true);
        webhookLog.setProcessedTime(LocalDateTime.now());
        if (errorMessage != null) {
            webhookLog.setErrorMessage(errorMessage);
        }
        webhookLogRepository.save(webhookLog);
    }

    @Transactional
    public void markDuplicate(WebhookLog webhookLog) {
        if (webhookLog == null) return;
        webhookLog.setStatus("DUPLICATE");
        webhookLog.setProcessed(true);
        webhookLog.setProcessedTime(LocalDateTime.now());
        webhookLogRepository.save(webhookLog);
    }

    @Transactional
    public void incrementRetry(WebhookLog webhookLog, String errorMessage) {
        if (webhookLog == null) return;
        webhookLog.setRetryCount(webhookLog.getRetryCount() + 1);
        webhookLog.setErrorMessage(errorMessage);
        webhookLogRepository.save(webhookLog);
    }

    @Transactional(readOnly = true)
    public boolean isDuplicate(String providerTransactionId) {
        if (providerTransactionId == null || providerTransactionId.isBlank()) {
            return false;
        }
        return webhookLogRepository.existsByProviderTransactionId(providerTransactionId);
    }

    @Transactional(readOnly = true)
    public Optional<WebhookLog> findByProviderTransactionId(String providerTransactionId) {
        return webhookLogRepository.findByProviderTransactionId(providerTransactionId);
    }
}
