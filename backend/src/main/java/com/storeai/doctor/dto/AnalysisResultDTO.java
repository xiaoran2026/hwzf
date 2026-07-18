package com.storeai.doctor.dto;

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
public class AnalysisResultDTO {

    private SalesAnalysis salesAnalysis;
    private ProductAnalysis productAnalysis;
    private CustomerAnalysis customerAnalysis;
    private CountryAnalysis countryAnalysis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesAnalysis {
        private BigDecimal totalRevenue;
        private long totalOrders;
        private BigDecimal averageOrderValue;
        private Map<String, BigDecimal> monthlyRevenueTrend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductAnalysis {
        private List<ProductRanking> productRanking;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductRanking {
        private String productName;
        private BigDecimal revenue;
        private long quantity;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerAnalysis {
        private long totalCustomers;
        private long newCustomerCount;
        private long repeatCustomerCount;
        private BigDecimal repeatRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountryAnalysis {
        private List<CountryStat> countryStats;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountryStat {
        private String country;
        private long orderCount;
        private BigDecimal revenue;
    }
}
