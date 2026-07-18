package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDTO {
    private Long id;
    private String plan;
    private String status;
    private String paymentProvider;
    private String paymentId;
    private String startTime;
    private String expireTime;
    private String renewTime;
    private String cancelledAt;
    private String createdTime;
}
