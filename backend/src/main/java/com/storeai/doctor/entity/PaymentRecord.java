package com.storeai.doctor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payment_records")
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 50)
    private String plan;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 10)
    private String currency = "USD";

    @Column(name = "payment_provider", length = 50)
    private String paymentProvider;

    @Column(name = "provider_transaction_id", length = 255)
    private String providerTransactionId;

    @Column(length = 50)
    private String status; // SUCCESS, FAILED, PENDING, REFUNDED

    @Column(name = "payment_method", length = 100)
    private String paymentMethod;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_time")
    private LocalDateTime createdTime = LocalDateTime.now();
}
