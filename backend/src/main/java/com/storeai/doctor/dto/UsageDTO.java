package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageDTO {
    private String currentPlan;
    private int storesUsed;
    private int storeLimit;
    private long csvRowsUsed;
    private long csvRowLimit;
    private long remainingQuota;
    private String nextResetDate;

    private static final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public String getStoreLimitDisplay() {
        return storeLimit < 0 ? "Unlimited" : String.valueOf(storeLimit);
    }

    public String getCsvRowLimitDisplay() {
        return csvRowLimit < 0 ? "Unlimited" : String.format("%,d", csvRowLimit);
    }

    public String getRemainingDisplay() {
        if (csvRowLimit < 0) return "Unlimited";
        return String.format("%,d", remainingQuota);
    }

    public double getStoreUsagePct() {
        if (storeLimit <= 0) return 0;
        return Math.min(100.0, (storesUsed / (double) storeLimit) * 100);
    }

    public double getCsvUsagePct() {
        if (csvRowLimit <= 0) return 0;
        return Math.min(100.0, (csvRowsUsed / (double) csvRowLimit) * 100);
    }
}