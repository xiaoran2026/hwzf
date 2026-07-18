package com.storeai.doctor.service;

import com.storeai.doctor.dto.AnalysisResultDTO;
import com.storeai.doctor.dto.ReportDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Pure data-driven report generator.
 * All report content is derived from analysis_data — zero hardcoded text.
 * Falls back to this when DeepSeek API is unavailable, or can be used standalone.
 */
@Component
@Slf4j
public class DataDrivenReportGenerator {

    // ========== Public entry point ==========

    /**
     * Generate a complete ReportDTO purely from statistical analysis data.
     * Every insight, problem, and recommendation is computed from the numbers.
     */
    public ReportDTO generate(AnalysisResultDTO data) {
        log.info("[ReportGenerator] Starting data-driven report generation");

        int healthScore = calculateHealthScore(data);
        String summary = generateSummary(data, healthScore);
        List<String> salesInsights = generateSalesInsights(data);
        List<String> productInsights = generateProductInsights(data);
        List<String> customerInsights = generateCustomerInsights(data);
        List<String> problems = detectProblems(data);
        List<String> recommendations = generateRecommendations(data, problems);

        ReportDTO report = ReportDTO.builder()
                .healthScore(healthScore)
                .summary(summary)
                .salesInsights(salesInsights)
                .productInsights(productInsights)
                .customerInsights(customerInsights)
                .problems(problems)
                .recommendations(recommendations)
                .build();

        log.info("[ReportGenerator] Report generated: healthScore={}, salesInsights={}, problems={}",
                healthScore, salesInsights.size(), problems.size());
        return report;
    }

    // ========== 1. Health Score ==========

    /**
     * Multi-factor health score (0-100).
     * Factors: revenue trend, repeat rate, product concentration, AOV, order volume, customer growth.
     */
    private int calculateHealthScore(AnalysisResultDTO data) {
        double score = 50.0; // Base score

        // Factor 1: Revenue trend (up to +20 or -20)
        score += revenueTrendScore(data);

        // Factor 2: Repeat rate (up to +15)
        score += repeatRateScore(data);

        // Factor 3: Product concentration risk (0 to -10)
        score += productDiversityScore(data);

        // Factor 4: AOV evaluation (up to +10)
        score += aovScore(data);

        // Factor 5: Order volume (up to +5)
        score += orderVolumeScore(data);

        // Clamp to 0-100
        return (int) Math.max(0, Math.min(100, Math.round(score)));
    }

    /** Revenue trend: compare last month to first month */
    private double revenueTrendScore(AnalysisResultDTO data) {
        Map<String, BigDecimal> trend = data.getSalesAnalysis().getMonthlyRevenueTrend();
        if (trend == null || trend.size() < 2) return 0;

        List<BigDecimal> values = new ArrayList<>(trend.values());
        BigDecimal first = values.get(0);
        BigDecimal last = values.get(values.size() - 1);

        if (first.compareTo(BigDecimal.ZERO) == 0) return 0;

        BigDecimal growth = last.subtract(first)
                .divide(first, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        if (growth.compareTo(BigDecimal.valueOf(30)) >= 0) return 20;
        if (growth.compareTo(BigDecimal.valueOf(15)) >= 0) return 15;
        if (growth.compareTo(BigDecimal.valueOf(5)) >= 0) return 10;
        if (growth.compareTo(BigDecimal.valueOf(-5)) >= 0) return 0;
        if (growth.compareTo(BigDecimal.valueOf(-15)) >= 0) return -10;
        return -20;
    }

    /** Repeat rate: higher is better, capped at 50%+ */
    private double repeatRateScore(AnalysisResultDTO data) {
        BigDecimal rate = data.getCustomerAnalysis().getRepeatRate();
        if (rate == null) return 0;
        double r = rate.doubleValue();
        if (r >= 50) return 15;
        if (r >= 35) return 10;
        if (r >= 20) return 5;
        return 0;
    }

    /** Product diversity: penalize if top 3 products > 70% revenue */
    private double productDiversityScore(AnalysisResultDTO data) {
        List<AnalysisResultDTO.ProductRanking> products = data.getProductAnalysis().getProductRanking();
        if (products == null || products.isEmpty()) return 0;

        BigDecimal totalRevenue = products.stream()
                .map(AnalysisResultDTO.ProductRanking::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalRevenue.compareTo(BigDecimal.ZERO) == 0) return 0;

        BigDecimal top3Revenue = products.stream()
                .limit(3)
                .map(AnalysisResultDTO.ProductRanking::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double concentration = top3Revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();

        if (concentration > 85) return -10;
        if (concentration > 70) return -5;
        return 0;
    }

    /** AOV: reward higher AOV relative to typical e-commerce */
    private double aovScore(AnalysisResultDTO data) {
        BigDecimal aov = data.getSalesAnalysis().getAverageOrderValue();
        if (aov == null) return 0;
        double aovVal = aov.doubleValue();
        if (aovVal >= 100) return 10;
        if (aovVal >= 60) return 7;
        if (aovVal >= 30) return 3;
        return 0;
    }

    /** Order volume: more orders = slight bonus */
    private double orderVolumeScore(AnalysisResultDTO data) {
        long orders = data.getSalesAnalysis().getTotalOrders();
        if (orders >= 1000) return 5;
        if (orders >= 500) return 3;
        if (orders >= 100) return 1;
        return 0;
    }

    // ========== 2. Summary ==========

    /**
     * Generate a 2-3 sentence summary based on key metrics and health score.
     * No hardcoded text — every clause is data-conditional.
     */
    private String generateSummary(AnalysisResultDTO data, int healthScore) {
        List<String> sentences = new ArrayList<>();

        // Revenue trend description
        Map<String, BigDecimal> trend = data.getSalesAnalysis().getMonthlyRevenueTrend();
        BigDecimal totalRevenue = data.getSalesAnalysis().getTotalRevenue();

        if (trend != null && trend.size() >= 2) {
            List<BigDecimal> values = new ArrayList<>(trend.values());
            BigDecimal first = values.get(0);
            BigDecimal last = values.get(values.size() - 1);

            if (first.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal change = last.subtract(first)
                        .divide(first, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                if (change.compareTo(BigDecimal.valueOf(10)) >= 0) {
                    sentences.add(String.format(
                            "Revenue shows an upward trend of %s%%, reaching $%s across %d orders.",
                            change.setScale(1, RoundingMode.HALF_UP).toPlainString(),
                            formatMoney(totalRevenue),
                            data.getSalesAnalysis().getTotalOrders()));
                } else if (change.compareTo(BigDecimal.valueOf(-10)) < 0) {
                    sentences.add(String.format(
                            "Revenue has declined by %s%%, totaling $%s from %d orders.",
                            change.abs().setScale(1, RoundingMode.HALF_UP).toPlainString(),
                            formatMoney(totalRevenue),
                            data.getSalesAnalysis().getTotalOrders()));
                } else {
                    sentences.add(String.format(
                            "Revenue remains relatively stable at $%s across %d orders.",
                            formatMoney(totalRevenue),
                            data.getSalesAnalysis().getTotalOrders()));
                }
            }
        } else {
            sentences.add(String.format(
                    "Total revenue is $%s from %d orders.",
                    formatMoney(totalRevenue),
                    data.getSalesAnalysis().getTotalOrders()));
        }

        // Repeat rate description
        BigDecimal repeatRate = data.getCustomerAnalysis().getRepeatRate();
        if (repeatRate != null) {
            double rr = repeatRate.doubleValue();
            if (rr >= 40) {
                sentences.add(String.format(
                        "Customer loyalty is strong with a repeat purchase rate of %s%%.",
                        repeatRate.toPlainString()));
            } else if (rr >= 20) {
                sentences.add(String.format(
                        "Repeat purchase rate is %s%%, indicating moderate customer retention.",
                        repeatRate.toPlainString()));
            } else {
                sentences.add(String.format(
                        "Repeat purchase rate is low at %s%%, suggesting customer retention needs attention.",
                        repeatRate.toPlainString()));
            }
        }

        // AOV description
        BigDecimal aov = data.getSalesAnalysis().getAverageOrderValue();
        if (aov != null) {
            sentences.add(String.format("Average order value stands at $%s.", formatMoney(aov)));
        }

        return String.join(" ", sentences);
    }

    // ========== 3. Sales Insights ==========

    /** Generate 4-6 sales insights from monthly revenue trend data. */
    private List<String> generateSalesInsights(AnalysisResultDTO data) {
        List<String> insights = new ArrayList<>();
        Map<String, BigDecimal> trend = data.getSalesAnalysis().getMonthlyRevenueTrend();

        if (trend == null || trend.isEmpty()) {
            insights.add("Insufficient monthly data for sales trend analysis.");
            return insights;
        }

        List<Map.Entry<String, BigDecimal>> sorted = new ArrayList<>(trend.entrySet());

        // Best and worst months
        Map.Entry<String, BigDecimal> best = Collections.max(sorted, Map.Entry.comparingByValue());
        Map.Entry<String, BigDecimal> worst = Collections.min(sorted, Map.Entry.comparingByValue());

        insights.add(String.format("Peak revenue month: %s with $%s.", best.getKey(), formatMoney(best.getValue())));
        insights.add(String.format("Lowest revenue month: %s with $%s.", worst.getKey(), formatMoney(worst.getValue())));

        if (sorted.size() >= 2) {
            // Growth/decline analysis
            List<BigDecimal> values = sorted.stream().map(Map.Entry::getValue).toList();
            int growingMonths = 0;
            int decliningMonths = 0;

            for (int i = 1; i < values.size(); i++) {
                int cmp = values.get(i).compareTo(values.get(i - 1));
                if (cmp > 0) growingMonths++;
                else if (cmp < 0) decliningMonths++;
            }

            if (growingMonths > decliningMonths * 2) {
                insights.add(String.format("Revenue is on a consistent upward trajectory, growing in %d out of %d months.",
                        growingMonths, sorted.size() - 1));
            } else if (decliningMonths > growingMonths * 2) {
                insights.add(String.format("Revenue shows a declining pattern, dropping in %d out of %d months.",
                        decliningMonths, sorted.size() - 1));
            } else {
                insights.add("Revenue fluctuates month-to-month without a clear directional trend.");
            }

            // Volatility: check if best/worst ratio is high
            if (worst.getValue().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal ratio = best.getValue().divide(worst.getValue(), 2, RoundingMode.HALF_UP);
                if (ratio.compareTo(BigDecimal.valueOf(3)) >= 0) {
                    insights.add(String.format(
                            "High revenue volatility detected: peak month is %.1fx the lowest month.",
                            ratio.doubleValue()));
                }
            }
        }

        // Seasonality: check for repeating patterns (if 6+ months)
        if (sorted.size() >= 6) {
            BigDecimal firstHalf = sorted.subList(0, sorted.size() / 2).stream()
                    .map(Map.Entry::getValue).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal secondHalf = sorted.subList(sorted.size() / 2, sorted.size()).stream()
                    .map(Map.Entry::getValue).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal halfRatio = firstHalf.compareTo(BigDecimal.ZERO) > 0
                    ? secondHalf.divide(firstHalf, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ONE;

            if (halfRatio.compareTo(BigDecimal.valueOf(1.3)) >= 0) {
                insights.add("Strong second-half performance suggests possible seasonal demand patterns.");
            } else if (halfRatio.compareTo(BigDecimal.valueOf(0.7)) <= 0) {
                insights.add("Revenue concentration in the first half may indicate seasonal decline.");
            }
        }

        // Total revenue insight
        BigDecimal total = data.getSalesAnalysis().getTotalRevenue();
        insights.add(String.format("Total revenue across all months: $%s from %d orders.",
                formatMoney(total), data.getSalesAnalysis().getTotalOrders()));

        return insights;
    }

    // ========== 4. Product Insights ==========

    /** Generate product insights from product ranking data. */
    private List<String> generateProductInsights(AnalysisResultDTO data) {
        List<String> insights = new ArrayList<>();
        List<AnalysisResultDTO.ProductRanking> products = data.getProductAnalysis().getProductRanking();

        if (products == null || products.isEmpty()) {
            insights.add("No product data available for analysis.");
            return insights;
        }

        BigDecimal totalRevenue = products.stream()
                .map(AnalysisResultDTO.ProductRanking::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalQuantity = products.stream()
                .mapToLong(AnalysisResultDTO.ProductRanking::getQuantity).sum();

        // Top seller
        AnalysisResultDTO.ProductRanking top = products.get(0);
        BigDecimal topShare = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                ? top.getRevenue().divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        insights.add(String.format("Top seller: \"%s\" with $%s revenue (%s%% of total), %d units sold across %d orders.",
                top.getProductName(), formatMoney(top.getRevenue()),
                topShare.setScale(1, RoundingMode.HALF_UP).toPlainString(),
                top.getQuantity(), top.getOrderCount()));

        // 2nd and 3rd place
        if (products.size() >= 2) {
            AnalysisResultDTO.ProductRanking second = products.get(1);
            insights.add(String.format("Second best: \"%s\" with $%s revenue, %d units.",
                    second.getProductName(), formatMoney(second.getRevenue()), second.getQuantity()));
        }
        if (products.size() >= 3) {
            AnalysisResultDTO.ProductRanking third = products.get(2);
            insights.add(String.format("Third best: \"%s\" with $%s revenue, %d units.",
                    third.getProductName(), formatMoney(third.getRevenue()), third.getQuantity()));
        }

        // Revenue concentration
        BigDecimal top3Revenue = products.stream().limit(3)
                .map(AnalysisResultDTO.ProductRanking::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        double top3Pct = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                ? top3Revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0;

        if (top3Pct > 80) {
            insights.add(String.format("High revenue concentration: top 3 products account for %.1f%% of total revenue.",
                    top3Pct));
        } else if (top3Pct > 60) {
            insights.add(String.format("Moderate revenue concentration: top 3 products generate %.1f%% of revenue.",
                    top3Pct));
        } else {
            insights.add(String.format("Healthy product diversification: top 3 products only account for %.1f%% of revenue.",
                    top3Pct));
        }

        // Low performers
        if (products.size() > 1) {
            AnalysisResultDTO.ProductRanking worst = products.get(products.size() - 1);
            insights.add(String.format("Lowest performer: \"%s\" with $%s revenue — consider promotion or retirement.",
                    worst.getProductName(), formatMoney(worst.getRevenue())));
        }

        // Average product revenue
        if (!products.isEmpty()) {
            BigDecimal avgRevenue = totalRevenue.divide(BigDecimal.valueOf(products.size()), 2, RoundingMode.HALF_UP);
            insights.add(String.format("Average revenue per product: $%s across %d products.",
                    formatMoney(avgRevenue), products.size()));
        }

        return insights;
    }

    // ========== 5. Customer Insights ==========

    /** Generate customer insights from customer analysis data. */
    private List<String> generateCustomerInsights(AnalysisResultDTO data) {
        List<String> insights = new ArrayList<>();
        AnalysisResultDTO.CustomerAnalysis cust = data.getCustomerAnalysis();

        if (cust == null) {
            insights.add("No customer data available for analysis.");
            return insights;
        }

        long total = cust.getTotalCustomers();
        long newCust = cust.getNewCustomerCount();
        long repeatCust = cust.getRepeatCustomerCount();
        BigDecimal repeatRate = cust.getRepeatRate();

        // Customer base overview
        insights.add(String.format("Total customer base: %d customers (%d new, %d repeat).",
                total, newCust, repeatCust));

        // Loyalty assessment
        if (repeatRate != null) {
            double rr = repeatRate.doubleValue();
            if (rr >= 50) {
                insights.add(String.format(
                        "Strong customer loyalty: %s%% of customers have made repeat purchases.",
                        repeatRate.toPlainString()));
            } else if (rr >= 25) {
                insights.add(String.format(
                        "Moderate loyalty: %s%% repeat rate shows room for retention improvement.",
                        repeatRate.toPlainString()));
            } else if (rr > 0) {
                insights.add(String.format(
                        "Low loyalty: only %s%% of customers returned. Retention strategies are critical.",
                        repeatRate.toPlainString()));
            } else {
                insights.add("No repeat customers detected — all purchases are from first-time buyers.");
            }
        }

        // New vs repeat ratio
        if (total > 0) {
            double newPct = (double) newCust / total * 100;
            if (newPct > 80) {
                insights.add(String.format("%.1f%% of customers are first-time buyers, indicating heavy reliance on new customer acquisition.",
                        newPct));
            } else if (newPct < 40) {
                insights.add(String.format("Only %.1f%% are new customers — the store relies heavily on existing customers.",
                        newPct));
            }
        }

        // Revenue per customer
        BigDecimal totalRev = data.getSalesAnalysis().getTotalRevenue();
        if (total > 0 && totalRev != null) {
            BigDecimal revPerCust = totalRev.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
            insights.add(String.format("Revenue per customer: $%s.", formatMoney(revPerCust)));
        }

        return insights;
    }

    // ========== 6. Problems ==========

    /** Detect business problems based on data thresholds. */
    private List<String> detectProblems(AnalysisResultDTO data) {
        List<String> problems = new ArrayList<>();

        // P1: Revenue declining
        Map<String, BigDecimal> trend = data.getSalesAnalysis().getMonthlyRevenueTrend();
        if (trend != null && trend.size() >= 2) {
            List<BigDecimal> values = new ArrayList<>(trend.values());
            BigDecimal first = values.get(0);
            BigDecimal last = values.get(values.size() - 1);

            if (first.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal change = last.subtract(first).divide(first, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                if (change.compareTo(BigDecimal.valueOf(-10)) < 0) {
                    problems.add(String.format("Revenue is declining by %s%% from the first to the last recorded month.",
                            change.abs().setScale(1, RoundingMode.HALF_UP).toPlainString()));
                }
            }

            // Check for consecutive monthly declines
            int consecutiveDeclines = 0;
            for (int i = values.size() - 1; i >= 1; i--) {
                if (values.get(i).compareTo(values.get(i - 1)) < 0) {
                    consecutiveDeclines++;
                } else {
                    break;
                }
            }
            if (consecutiveDeclines >= 3) {
                problems.add(String.format("Revenue has declined for %d consecutive months — a critical warning sign.",
                        consecutiveDeclines));
            }
        }

        // P2: Low repeat rate
        BigDecimal repeatRate = data.getCustomerAnalysis().getRepeatRate();
        if (repeatRate != null && repeatRate.doubleValue() < 20) {
            problems.add(String.format("Repeat purchase rate is only %s%%, well below the healthy 25-35%% range.",
                    repeatRate.toPlainString()));
        }

        // P3: Low AOV
        BigDecimal aov = data.getSalesAnalysis().getAverageOrderValue();
        if (aov != null && aov.doubleValue() < 25) {
            problems.add(String.format("Average order value ($%s) is very low — consider upselling strategies.",
                    formatMoney(aov)));
        }

        // P4: Top 3 product concentration > 70%
        List<AnalysisResultDTO.ProductRanking> products = data.getProductAnalysis().getProductRanking();
        if (products != null && !products.isEmpty()) {
            BigDecimal totalRev = products.stream()
                    .map(AnalysisResultDTO.ProductRanking::getRevenue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalRev.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal top3Rev = products.stream().limit(3)
                        .map(AnalysisResultDTO.ProductRanking::getRevenue)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                double top3Pct = top3Rev.divide(totalRev, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();

                if (top3Pct > 70) {
                    problems.add(String.format("Revenue is overly concentrated: top 3 products generate %.1f%% of total revenue.",
                            top3Pct));
                }
            }
        }

        // P5: Low order volume
        if (data.getSalesAnalysis().getTotalOrders() < 50) {
            problems.add(String.format("Only %d orders in the dataset — the sample size may be too small for reliable trends.",
                    data.getSalesAnalysis().getTotalOrders()));
        }

        // P6: Single-country dependency
        List<AnalysisResultDTO.CountryStat> countries = data.getCountryAnalysis().getCountryStats();
        if (countries != null && !countries.isEmpty()) {
            long totalCountryOrders = countries.stream().mapToLong(AnalysisResultDTO.CountryStat::getOrderCount).sum();
            if (totalCountryOrders > 0) {
                long topCountryOrders = countries.get(0).getOrderCount();
                double topCountryPct = (double) topCountryOrders / totalCountryOrders * 100;
                if (topCountryPct > 90 && countries.size() > 1) {
                    problems.add(String.format("%.1f%% of orders come from a single country (%s) — geographic diversification is needed.",
                            topCountryPct, countries.get(0).getCountry()));
                }
            }
        }

        return problems;
    }

    // ========== 7. Recommendations ==========

    /** Generate recommendations that directly address detected problems. */
    private List<String> generateRecommendations(AnalysisResultDTO data, List<String> problems) {
        List<String> recs = new ArrayList<>();
        Set<String> categories = new HashSet<>();

        for (String problem : problems) {
            // Revenue decline → Marketing & Promotion
            if (problem.contains("declining") || problem.contains("Revenue is declining")) {
                if (categories.add("marketing")) {
                    recs.add("Launch targeted marketing campaigns focusing on customer segments with the highest historical spend to reverse the revenue decline.");
                }
                if (categories.add("promotion")) {
                    recs.add("Introduce limited-time promotions or bundle deals to stimulate order frequency and increase average order value.");
                }
            }

            // Low repeat rate → Retention
            if (problem.contains("Repeat purchase rate") || problem.contains("retention")) {
                if (categories.add("retention")) {
                    recs.add("Implement a loyalty or email re-engagement program to convert one-time buyers into repeat customers.");
                }
            }

            // Low AOV → Pricing & Bundle
            if (problem.contains("order value") || problem.contains("AOV")) {
                if (categories.add("pricing")) {
                    recs.add("Introduce product bundles or minimum-order discounts to increase average order value.");
                }
                if (categories.add("bundle")) {
                    recs.add("Create tiered pricing incentives: spend $X to get free shipping or a discount.");
                }
            }

            // Product concentration → Inventory & Diversification
            if (problem.contains("concentrated") || problem.contains("generate")) {
                if (categories.add("inventory")) {
                    recs.add("Diversify product offerings to reduce dependency on top products and mitigate revenue risk.");
                }
            }

            // Geographic → Marketing
            if (problem.contains("country") || problem.contains("geographic")) {
                if (categories.add("expansion")) {
                    recs.add("Explore international markets through localized marketing and shipping options to reduce single-country dependency.");
                }
            }

            // Low order volume → Marketing
            if (problem.contains("sample size") || problem.contains("orders in the dataset")) {
                if (categories.add("growth")) {
                    recs.add("Increase order volume through SEO optimization, social media marketing, and paid advertising campaigns.");
                }
            }
        }

        // If no problems detected, provide positive recommendations
        if (recs.isEmpty()) {
            recs.add("The store shows healthy metrics. Focus on sustaining growth through consistent marketing efforts.");
            recs.add("Consider expanding into new markets or product categories to maintain the upward trajectory.");
        }

        // Always add a data-driven recommendation
        BigDecimal repeatRate = data.getCustomerAnalysis().getRepeatRate();
        if (repeatRate != null && repeatRate.doubleValue() < 35) {
            if (categories.add("retention_upsell")) {
                recs.add(String.format(
                        "With a %s%% repeat rate, targeted email campaigns to past buyers could significantly boost revenue.",
                        repeatRate.toPlainString()));
            }
        }

        return recs;
    }

    // ========== Utility ==========

    /** Format BigDecimal as USD currency string. */
    private String formatMoney(BigDecimal value) {
        if (value == null) return "$0.00";
        return "$" + value.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }
}