package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRecordDTO {
    private Long id;
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
