package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private Long storeId;
    private String storeName;
    private Long taskId;
    private Integer healthScore;
    private String createdAt;
}