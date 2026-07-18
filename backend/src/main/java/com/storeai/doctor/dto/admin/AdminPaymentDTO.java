package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPaymentDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String plan;
    private BigDecimal amount;
    private String currency;
    private String paymentProvider;
    private String providerTransactionId;
    private String status;
    private String paymentMethod;
    private String paidAt;
    private String createdTime;
}