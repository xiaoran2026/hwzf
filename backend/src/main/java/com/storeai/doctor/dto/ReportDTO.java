package com.storeai.doctor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReportDTO {

    private int healthScore;
    private String summary;
    private List<String> salesInsights;
    private List<String> productInsights;
    private List<String> customerInsights;
    private List<String> problems;
    private List<String> recommendations;

    // ========== Analysis Data Fields ==========

    private AnalysisMetrics salesAnalysis;

    private List<ProductRankingDTO> topProducts;

    private CustomerMetrics customerAnalysis;

    private List<CountryStatDTO> countryStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalysisMetrics {
        private BigDecimal totalRevenue;
        private long totalOrders;
        private BigDecimal averageOrderValue;
        private Map<String, BigDecimal> monthlyRevenueTrend;
        private Map<String, Long> monthlyOrdersTrend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductRankingDTO {
        private String productName;
        private BigDecimal revenue;
        private long quantity;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerMetrics {
        private long totalCustomers;
        private long newCustomerCount;
        private long repeatCustomerCount;
        private BigDecimal repeatRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountryStatDTO {
        private String country;
        private long orderCount;
        private BigDecimal revenue;
    }
}