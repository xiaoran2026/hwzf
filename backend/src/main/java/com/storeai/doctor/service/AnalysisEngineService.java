package com.storeai.doctor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeai.doctor.dto.AnalysisResultDTO;
import com.storeai.doctor.entity.AnalysisData;
import com.storeai.doctor.entity.AnalysisTask;
import com.storeai.doctor.entity.OrderRecord;
import com.storeai.doctor.repository.AnalysisDataRepository;
import com.storeai.doctor.repository.AnalysisTaskRepository;
import com.storeai.doctor.repository.OrderRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisEngineService {

    private final OrderRecordRepository orderRecordRepository;
    private final AnalysisTaskRepository analysisTaskRepository;
    private final AnalysisDataRepository analysisDataRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AnalysisResultDTO analyze(Long taskId) {
        List<OrderRecord> records = orderRecordRepository.findByTaskId(taskId);
        if (records.isEmpty()) {
            throw new RuntimeException("No order records found for task: " + taskId);
        }

        AnalysisResultDTO result = new AnalysisResultDTO();
        result.setSalesAnalysis(buildSalesAnalysis(records));
        result.setProductAnalysis(buildProductAnalysis(records));
        result.setCustomerAnalysis(buildCustomerAnalysis(records));
        result.setCountryAnalysis(buildCountryAnalysis(records));
        return result;
    }

    @Transactional
    public AnalysisData analyzeAndSave(Long taskId) {
        AnalysisResultDTO result = analyze(taskId);

        String json;
        try {
            json = objectMapper.writeValueAsString(result);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize analysis result", e);
        }

        AnalysisTask task = analysisTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        AnalysisData data = new AnalysisData();
        data.setAnalysisTask(task);
        data.setDataJson(json);
        return analysisDataRepository.save(data);
    }

    // ========== Sales Analysis ==========

    private BigDecimal safeRevenue(OrderRecord r) {
        if (r.getPrice() == null || r.getQuantity() == null) {
            return BigDecimal.ZERO;
        }
        return r.getPrice().multiply(BigDecimal.valueOf(r.getQuantity()));
    }

    private AnalysisResultDTO.SalesAnalysis buildSalesAnalysis(List<OrderRecord> records) {
        BigDecimal totalRevenue = records.stream()
                .map(this::safeRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = records.stream()
                .map(OrderRecord::getOrderId)
                .distinct()
                .count();

        BigDecimal averageOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, BigDecimal> monthlyRevenueTrend = records.stream()
                .filter(r -> r.getOrderDate() != null)
                .collect(Collectors.groupingBy(
                        r -> YearMonth.from(r.getOrderDate()).toString(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                this::safeRevenue,
                                BigDecimal::add
                        )
                ))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (oldVal, newVal) -> oldVal,
                        LinkedHashMap::new
                ));

        return AnalysisResultDTO.SalesAnalysis.builder()
                .totalRevenue(totalRevenue.setScale(2, RoundingMode.HALF_UP))
                .totalOrders(totalOrders)
                .averageOrderValue(averageOrderValue)
                .monthlyRevenueTrend(monthlyRevenueTrend)
                .build();
    }

    // ========== Product Analysis ==========

    private AnalysisResultDTO.ProductAnalysis buildProductAnalysis(List<OrderRecord> records) {
        Map<String, List<OrderRecord>> byProduct = records.stream()
                .filter(r -> r.getProductName() != null)
                .collect(Collectors.groupingBy(OrderRecord::getProductName));

        List<AnalysisResultDTO.ProductRanking> ranking = byProduct.entrySet().stream()
                .map(entry -> {
                    String name = entry.getKey();
                    List<OrderRecord> items = entry.getValue();
                    BigDecimal revenue = items.stream()
                            .map(this::safeRevenue)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .setScale(2, RoundingMode.HALF_UP);
                    long quantity = items.stream()
                            .filter(r -> r.getQuantity() != null)
                            .mapToLong(OrderRecord::getQuantity).sum();
                    long orderCount = items.stream().map(OrderRecord::getOrderId).distinct().count();
                    return AnalysisResultDTO.ProductRanking.builder()
                            .productName(name)
                            .revenue(revenue)
                            .quantity(quantity)
                            .orderCount(orderCount)
                            .build();
                })
                .sorted(Comparator.comparing(AnalysisResultDTO.ProductRanking::getRevenue).reversed())
                .collect(Collectors.toList());

        return AnalysisResultDTO.ProductAnalysis.builder()
                .productRanking(ranking)
                .build();
    }

    // ========== Customer Analysis ==========

    private AnalysisResultDTO.CustomerAnalysis buildCustomerAnalysis(List<OrderRecord> records) {
        Map<String, Long> purchaseCounts = records.stream()
                .filter(r -> r.getCustomerId() != null)
                .collect(Collectors.groupingBy(OrderRecord::getCustomerId, Collectors.counting()));

        long totalCustomers = purchaseCounts.size();
        long repeatCustomerCount = purchaseCounts.values().stream()
                .filter(count -> count > 1)
                .count();
        long newCustomerCount = totalCustomers - repeatCustomerCount;

        BigDecimal repeatRate = totalCustomers > 0
                ? BigDecimal.valueOf(repeatCustomerCount)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalCustomers), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return AnalysisResultDTO.CustomerAnalysis.builder()
                .totalCustomers(totalCustomers)
                .newCustomerCount(newCustomerCount)
                .repeatCustomerCount(repeatCustomerCount)
                .repeatRate(repeatRate)
                .build();
    }

    // ========== Country Analysis ==========

    private AnalysisResultDTO.CountryAnalysis buildCountryAnalysis(List<OrderRecord> records) {
        Map<String, List<OrderRecord>> byCountry = records.stream()
                .collect(Collectors.groupingBy(r -> r.getCountry() != null ? r.getCountry() : "UNKNOWN"));

        List<AnalysisResultDTO.CountryStat> stats = byCountry.entrySet().stream()
                .map(entry -> {
                    String country = entry.getKey();
                    List<OrderRecord> items = entry.getValue();
                    long orderCount = items.stream().map(OrderRecord::getOrderId).distinct().count();
                    BigDecimal revenue = items.stream()
                            .map(this::safeRevenue)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .setScale(2, RoundingMode.HALF_UP);
                    return AnalysisResultDTO.CountryStat.builder()
                            .country(country)
                            .orderCount(orderCount)
                            .revenue(revenue)
                            .build();
                })
                .sorted(Comparator.comparing(AnalysisResultDTO.CountryStat::getRevenue).reversed())
                .collect(Collectors.toList());

        return AnalysisResultDTO.CountryAnalysis.builder()
                .countryStats(stats)
                .build();
    }
}
