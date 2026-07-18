package com.storeai.doctor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 50)
    private String plan;

    @Column(length = 50)
    private String status;

    @Column(name = "payment_provider", length = 50)
    private String paymentProvider;

    @Column(name = "customer_id", length = 255)
    private String customerId;

    @Column(name = "payment_id", length = 255)
    private String paymentId;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "expire_time")
    private LocalDateTime expireTime;

    @Column(name = "renew_time")
    private LocalDateTime renewTime;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancel_at_period_end")
    private Boolean cancelAtPeriodEnd = false;

    @Column(name = "created_time")
    private LocalDateTime createdTime = LocalDateTime.now();
}