package com.storeai.doctor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "webhook_logs")
public class WebhookLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String provider; // GUMROAD

    @Column(length = 100)
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(length = 500)
    private String signature;

    @Column(length = 50)
    private String status; // RECEIVED, PROCESSED, FAILED, DUPLICATE

    @Column
    private Boolean processed = false;

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "provider_transaction_id", length = 255)
    private String providerTransactionId;

    @Column(name = "created_time")
    private LocalDateTime createdTime = LocalDateTime.now();

    @Column(name = "processed_time")
    private LocalDateTime processedTime;
}
