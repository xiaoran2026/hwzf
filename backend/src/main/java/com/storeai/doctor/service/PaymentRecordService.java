package com.storeai.doctor.service;

import com.storeai.doctor.dto.PaymentRecordDTO;
import com.storeai.doctor.entity.PaymentRecord;
import com.storeai.doctor.entity.User;
import com.storeai.doctor.repository.PaymentRecordRepository;
import com.storeai.doctor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentRecordService {

    private final PaymentRecordRepository paymentRecordRepository;
    private final UserRepository userRepository;

    @Transactional
    public PaymentRecord createPaymentRecord(Long userId, String plan, BigDecimal amount,
                                              String paymentProvider, String providerTransactionId,
                                              String status, String paymentMethod) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        PaymentRecord record = new PaymentRecord();
        record.setUser(user);
        record.setPlan(plan);
        record.setAmount(amount);
        record.setCurrency("USD");
        record.setPaymentProvider(paymentProvider);
        record.setProviderTransactionId(providerTransactionId);
        record.setStatus(status);
        record.setPaymentMethod(paymentMethod);
        if ("SUCCESS".equals(status)) {
            record.setPaidAt(LocalDateTime.now());
        }
        record.setCreatedTime(LocalDateTime.now());

        return paymentRecordRepository.save(record);
    }

    @Transactional
    public PaymentRecord refundPaymentRecord(String providerTransactionId, BigDecimal refundAmount) {
        Optional<PaymentRecord> optional = paymentRecordRepository.findByProviderTransactionId(providerTransactionId);
        if (optional.isEmpty()) {
            log.warn("[Refund] PaymentRecord not found for transaction: {}", providerTransactionId);
            return null;
        }
        PaymentRecord record = optional.get();
        record.setStatus("REFUNDED");
        record.setAmount(refundAmount != null ? refundAmount : BigDecimal.ZERO);
        return paymentRecordRepository.save(record);
    }

    @Transactional
    public PaymentRecord failPaymentRecord(String providerTransactionId) {
        Optional<PaymentRecord> optional = paymentRecordRepository.findByProviderTransactionId(providerTransactionId);
        if (optional.isEmpty()) {
            return null;
        }
        PaymentRecord record = optional.get();
        record.setStatus("FAILED");
        return paymentRecordRepository.save(record);
    }

    @Transactional(readOnly = true)
    public Optional<PaymentRecord> findByProviderTransactionId(String providerTransactionId) {
        return paymentRecordRepository.findByProviderTransactionId(providerTransactionId);
    }

    @Transactional(readOnly = true)
    public List<PaymentRecordDTO> getPaymentHistory(Long userId) {
        List<PaymentRecord> records = paymentRecordRepository.findByUserIdOrderByCreatedTimeDesc(userId);
        return records.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean existsByProviderTransactionId(String providerTransactionId) {
        if (providerTransactionId == null || providerTransactionId.isBlank()) {
            return false;
        }
        return paymentRecordRepository.existsByProviderTransactionId(providerTransactionId);
    }

    private PaymentRecordDTO toDTO(PaymentRecord record) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return PaymentRecordDTO.builder()
                .id(record.getId())
                .plan(record.getPlan())
                .amount(record.getAmount())
                .currency(record.getCurrency())
                .paymentProvider(record.getPaymentProvider())
                .providerTransactionId(record.getProviderTransactionId())
                .status(record.getStatus())
                .paymentMethod(record.getPaymentMethod())
                .paidAt(record.getPaidAt() != null ? record.getPaidAt().format(formatter) : null)
                .createdTime(record.getCreatedTime() != null ? record.getCreatedTime().format(formatter) : null)
                .build();
    }
}
