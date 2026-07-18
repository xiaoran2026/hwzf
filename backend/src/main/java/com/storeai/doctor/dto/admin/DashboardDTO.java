package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalUsers;
    private long totalStores;
    private long totalReports;
    private double totalRevenue;
    private long todayUploads;
    private long todayPayments;
    private long todayNewUsers;
    private long totalTasks;
    private long totalSubscriptions;
    private long totalWebhookLogs;
}