package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {

    private long totalUsers;
    private long paidUsers;
    private long totalStores;
    private long totalReports;
    private long totalOrders;
    private long freeUsers;
    private long proUsers;
    private long enterpriseUsers;
    private double mrr;  // Monthly Recurring Revenue: proUsers * 29 + enterpriseUsers * 99
}