package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingDTO {
    private SubscriptionDTO subscription;
    private List<PaymentRecordDTO> paymentHistory;
    private String currentPlan;
    private boolean canUpgrade;
    private boolean canCancel;
    private UsageDTO usage;
}
