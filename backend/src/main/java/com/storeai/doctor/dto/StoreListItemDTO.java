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
public class StoreListItemDTO {

    private Long storeId;
    private String storeName;
    private String platform;
    private String createdAt;

    // Statistics
    private Integer healthScore;
    private Integer totalReports;
    private String latestUploadDate;
    private String lastAnalysisDate;
    private BigDecimal totalRevenue;
    private Long totalOrders;
}
