package com.storeai.doctor.enums;

import java.util.*;

/**
 * StoreAI Doctor — Subscription Plans
 * Four tiers designed for growth:
 * - FREE: one-time trial, one upload
 * - STARTER: growing stores
 * - GROWTH: scaling businesses with AI-powered growth
 * - AGENCY: agencies managing multiple client stores
 * - PRO: legacy plan, maps to GROWTH
 */
public enum PlanEnum {
    FREE(1, 1, 1, 50000, 0.0, Set.of("AI_INSIGHTS")),
    STARTER(3, -1, -1, 50000, 29.0, Set.of(
            "AI_INSIGHTS", "AI_FORECAST", "GROWTH_OPPORTUNITIES",
            "HISTORICAL_TRENDS", "PDF_EXPORT")),
    GROWTH(10, -1, -1, 50000, 79.0, Set.of(
            "AI_INSIGHTS", "AI_FORECAST", "GROWTH_OPPORTUNITIES",
            "HISTORICAL_TRENDS", "PDF_EXPORT",
            "CUSTOMER_RETENTION", "DEEP_AI_ANALYSIS", "AI_ASSISTANT", "AI_CAMPAIGNS")),
    AGENCY(-1, -1, -1, 50000, 199.0, Set.of(
            "AI_INSIGHTS", "AI_FORECAST", "GROWTH_OPPORTUNITIES",
            "HISTORICAL_TRENDS", "PDF_EXPORT",
            "CUSTOMER_RETENTION", "COHORT_ANALYSIS", "CROSS_STORE_ANALYSIS",
            "DEEP_AI_ANALYSIS", "ANOMALY_DETECTION",
            "SCHEDULED_REPORTS", "EMAIL_ALERTS", "API_ACCESS", "TEAM_COLLABORATION",
            "CLIENT_REPORTING", "AI_ASSISTANT", "AI_CAMPAIGNS")),
    PRO(-1, -1, -1, 50000, 19.0, Set.of(
            "AI_INSIGHTS", "AI_FORECAST", "GROWTH_OPPORTUNITIES",
            "HISTORICAL_TRENDS", "PDF_EXPORT",
            "CUSTOMER_RETENTION", "COHORT_ANALYSIS", "CROSS_STORE_ANALYSIS",
            "DEEP_AI_ANALYSIS", "ANOMALY_DETECTION",
            "SCHEDULED_REPORTS", "EMAIL_ALERTS", "API_ACCESS", "TEAM_COLLABORATION"));

    private final int maxStores;
    private final int maxUploadsPerMonth;
    private final int maxReports; // -1 = unlimited
    private final int maxCsvRows;
    private final double monthlyPrice;
    private final Set<String> features;

    PlanEnum(int maxStores, int maxUploadsPerMonth, int maxReports, int maxCsvRows, double monthlyPrice, Set<String> features) {
        this.maxStores = maxStores;
        this.maxUploadsPerMonth = maxUploadsPerMonth;
        this.maxReports = maxReports;
        this.maxCsvRows = maxCsvRows;
        this.monthlyPrice = monthlyPrice;
        this.features = Collections.unmodifiableSet(features);
    }

    public int getMaxStores() { return maxStores; }
    public int getMaxUploadsPerMonth() { return maxUploadsPerMonth; }
    public int getMaxReports() { return maxReports; }
    public int getMaxCsvRows() { return maxCsvRows; }
    public double getMonthlyPrice() { return monthlyPrice; }
    public Set<String> getFeatures() { return features; }

    public boolean isUnlimitedStores() { return maxStores == -1; }
    public boolean isUnlimitedUploads() { return maxUploadsPerMonth == -1; }
    public boolean isUnlimitedReports() { return maxReports == -1; }
    public boolean isFree() { return this == FREE; }

    // Backward-compatible aliases
    public int getStoreLimit() { return maxStores; }
    public int getCsvRowLimit() { return maxCsvRows; }
    public double getPrice() { return monthlyPrice; }

    /**
     * Check if this plan has access to a specific feature.
     */
    public boolean hasFeature(String feature) {
        return feature != null && features.contains(feature);
    }

    /**
     * Check if this plan can run a specific analysis type.
     * "store_health" is always available regardless of plan.
     */
    public boolean canRunAnalysis(String analysisType) {
        if (analysisType == null || "store_health".equals(analysisType)) return true;
        String requiredFeature = switch (analysisType) {
            case "revenue_analysis" -> "HISTORICAL_TRENDS";
            case "product_analysis" -> "AI_INSIGHTS";
            case "customer_retention" -> "CUSTOMER_RETENTION";
            case "ai_forecast" -> "AI_FORECAST";
            case "growth_opportunities" -> "GROWTH_OPPORTUNITIES";
            case "deep_analysis" -> "DEEP_AI_ANALYSIS";
            default -> null;
        };
        if (requiredFeature == null) return true; // unknown types allowed by default
        return features.contains(requiredFeature);
    }

    public static PlanEnum fromString(String plan) {
        if (plan == null) return FREE;
        try {
            return PlanEnum.valueOf(plan.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Legacy PRO → GROWTH, ENTERPRISE → STARTER
            if (plan.equalsIgnoreCase("PRO")) return GROWTH;
            if (plan.equalsIgnoreCase("ENTERPRISE")) return STARTER;
            return FREE;
        }
    }

    /** @deprecated use fromString() */
    public static PlanEnum getInstance(String plan) {
        return fromString(plan);
    }
}
