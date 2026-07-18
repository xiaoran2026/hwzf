package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Rich report list item for SaaS management page.
 * Combines data from analysis_report, analysis_task, uploaded_file, store, and analysis_data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportListItemDTO {

    private Long reportId;
    private Long taskId;
    private Long storeId;
    private String storeName;
    private String fileName;
    private Integer healthScore;
    private String summary;
    private Double totalRevenue;
    private Long totalOrders;
    private Double averageOrderValue;
    private Double repeatRate;
    private String taskStatus;
    private String createdAt;
    private Boolean archived;
    private Boolean favorite;
}
