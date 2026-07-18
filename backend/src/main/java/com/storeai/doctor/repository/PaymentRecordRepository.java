package com.storeai.doctor.repository;

import com.storeai.doctor.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {

    List<PaymentRecord> findByUserIdOrderByCreatedTimeDesc(Long userId);

    boolean existsByProviderTransactionId(String providerTransactionId);

    Optional<PaymentRecord> findByProviderTransactionId(String providerTransactionId);

    long countByCreatedTimeBetween(LocalDateTime start, LocalDateTime end);
}
