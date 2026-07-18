package com.storeai.doctor.repository;

import com.storeai.doctor.entity.WebhookLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WebhookLogRepository extends JpaRepository<WebhookLog, Long> {

    Optional<WebhookLog> findByProviderTransactionId(String providerTransactionId);

    boolean existsByProviderTransactionId(String providerTransactionId);

    List<WebhookLog> findByStatusAndRetryCountGreaterThan(String status, int retryCount);
}
