package com.storeai.doctor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeai.doctor.dto.AnalysisResultDTO;
import com.storeai.doctor.entity.AnalysisTask;
import com.storeai.doctor.entity.OrderRecord;
import com.storeai.doctor.repository.OrderRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AnalysisEngineServiceTest {

    private AnalysisEngineService service;
    private OrderRecordRepository orderRecordRepository;
    private AnalysisTask mockTask;
    private List<OrderRecord> testRecords;

    @BeforeEach
    void setUp() {
        orderRecordRepository = mock(OrderRecordRepository.class);
        service = new AnalysisEngineService(orderRecordRepository, null, null, new ObjectMapper());
        mockTask = new AnalysisTask();
        mockTask.setId(1L);

        testRecords = new ArrayList<>();

        // Order 1: Customer A buys 2 Wireless Earbuds @ $29.99 in US on 2024-01-15
        testRecords.add(createRecord(mockTask, "ORD001", LocalDate.of(2024, 1, 15),
                "CUST_A", "Wireless Earbuds", 2, new BigDecimal("29.99"), "US"));

        // Order 2: Customer B buys 1 Smart Watch @ $149.99 in CA on 2024-01-20
        testRecords.add(createRecord(mockTask, "ORD002", LocalDate.of(2024, 1, 20),
                "CUST_B", "Smart Watch", 1, new BigDecimal("149.99"), "CA"));

        // Order 3: Customer A (repeat!) buys 3 USB Cable @ $9.99 in US on 2024-02-10
        testRecords.add(createRecord(mockTask, "ORD003", LocalDate.of(2024, 2, 10),
                "CUST_A", "USB Cable", 3, new BigDecimal("9.99"), "US"));

        // Order 4: Customer C buys 1 Smart Watch @ $149.99 in GB on 2024-02-15
        testRecords.add(createRecord(mockTask, "ORD004", LocalDate.of(2024, 2, 15),
                "CUST_C", "Smart Watch", 1, new BigDecimal("149.99"), "GB"));

        // Order 5: Customer B (repeat!) buys 2 Laptop Stand @ $49.99 in CA on 2024-03-05
        testRecords.add(createRecord(mockTask, "ORD005", LocalDate.of(2024, 3, 5),
                "CUST_B", "Laptop Stand", 2, new BigDecimal("49.99"), "CA"));

        when(orderRecordRepository.findByTaskId(1L)).thenReturn(testRecords);
    }

    @Test
    void testSalesAnalysis() {
        AnalysisResultDTO result = service.analyze(1L);

        assertNotNull(result);
        assertNotNull(result.getSalesAnalysis());

        AnalysisResultDTO.SalesAnalysis sales = result.getSalesAnalysis();
        // Revenue: 2*29.99 + 1*149.99 + 3*9.99 + 1*149.99 + 2*49.99 = 59.98 + 149.99 + 29.97 + 149.99 + 99.98 = 489.91
        assertEquals(new BigDecimal("489.91"), sales.getTotalRevenue());
        assertEquals(5, sales.getTotalOrders());
        // AOV = 489.91 / 5 = 97.98
        assertEquals(new BigDecimal("97.98"), sales.getAverageOrderValue());

        assertNotNull(sales.getMonthlyRevenueTrend());
        Map<String, BigDecimal> trend = sales.getMonthlyRevenueTrend();
        assertEquals(3, trend.size()); // Jan, Feb, Mar
        assertTrue(trend.containsKey("2024-01"));
        assertTrue(trend.containsKey("2024-02"));
        assertTrue(trend.containsKey("2024-03"));
    }

    @Test
    void testSalesMonthlyRevenueAccuracy() {
        AnalysisResultDTO result = service.analyze(1L);
        Map<String, BigDecimal> trend = result.getSalesAnalysis().getMonthlyRevenueTrend();

        // Jan: 2*29.99 + 1*149.99 = 59.98 + 149.99 = 209.97
        assertEquals(new BigDecimal("209.97"), trend.get("2024-01"));
        // Feb: 3*9.99 + 1*149.99 = 29.97 + 149.99 = 179.96
        assertEquals(new BigDecimal("179.96"), trend.get("2024-02"));
        // Mar: 2*49.99 = 99.98
        assertEquals(new BigDecimal("99.98"), trend.get("2024-03"));
    }

    @Test
    void testProductAnalysis() {
        AnalysisResultDTO result = service.analyze(1L);

        assertNotNull(result.getProductAnalysis());
        List<AnalysisResultDTO.ProductRanking> ranking = result.getProductAnalysis().getProductRanking();
        assertNotNull(ranking);
        assertEquals(4, ranking.size()); // Wireless Earbuds, Smart Watch, USB Cable, Laptop Stand

        // Smart Watch should be #1: 149.99 + 149.99 = 299.98
        assertEquals("Smart Watch", ranking.get(0).getProductName());
        assertEquals(new BigDecimal("299.98"), ranking.get(0).getRevenue());
        assertEquals(2, ranking.get(0).getOrderCount());
        assertEquals(2, ranking.get(0).getQuantity());

        // Laptop Stand #2: 2*49.99 = 99.98 (revenue-desc ranking)
        assertEquals("Laptop Stand", ranking.get(1).getProductName());
        assertEquals(new BigDecimal("99.98"), ranking.get(1).getRevenue());

        // Wireless Earbuds #3: 2*29.99 = 59.98
        assertEquals("Wireless Earbuds", ranking.get(2).getProductName());
        assertEquals(new BigDecimal("59.98"), ranking.get(2).getRevenue());
    }

    @Test
    void testCustomerAnalysis() {
        AnalysisResultDTO result = service.analyze(1L);

        assertNotNull(result.getCustomerAnalysis());
        AnalysisResultDTO.CustomerAnalysis customer = result.getCustomerAnalysis();

        assertEquals(3, customer.getTotalCustomers()); // A, B, C
        assertEquals(1, customer.getNewCustomerCount()); // C (only 1 purchase)
        assertEquals(2, customer.getRepeatCustomerCount()); // A (2 purchases), B (2 purchases)

        // Repeat rate = 2/3 * 100 = 66.67
        assertEquals(new BigDecimal("66.67"), customer.getRepeatRate());
    }

    @Test
    void testCountryAnalysis() {
        AnalysisResultDTO result = service.analyze(1L);

        assertNotNull(result.getCountryAnalysis());
        List<AnalysisResultDTO.CountryStat> stats = result.getCountryAnalysis().getCountryStats();
        assertNotNull(stats);
        assertEquals(3, stats.size()); // US, CA, GB

        // CA should be #1 by revenue: 149.99 + 99.98 = 249.97
        assertEquals("CA", stats.get(0).getCountry());
        assertEquals(new BigDecimal("249.97"), stats.get(0).getRevenue());
        assertEquals(2, stats.get(0).getOrderCount());

        // GB #2: 149.99 (single order beats US total)
        assertEquals("GB", stats.get(1).getCountry());
        assertEquals(new BigDecimal("149.99"), stats.get(1).getRevenue());

        // US #3: 59.98 + 29.97 = 89.95
        assertEquals("US", stats.get(2).getCountry());
        assertEquals(new BigDecimal("89.95"), stats.get(2).getRevenue());
    }

    @Test
    void testAnalysisResultJsonSerialization() throws Exception {
        // Since analyze() uses repository and we can't mock easily without Mockito,
        // we test serialization directly
        AnalysisResultDTO result = new AnalysisResultDTO();
        result.setSalesAnalysis(AnalysisResultDTO.SalesAnalysis.builder()
                .totalRevenue(new BigDecimal("1000.00"))
                .totalOrders(50)
                .averageOrderValue(new BigDecimal("20.00"))
                .monthlyRevenueTrend(Map.of("2024-01", new BigDecimal("500.00")))
                .build());
        result.setCustomerAnalysis(AnalysisResultDTO.CustomerAnalysis.builder()
                .totalCustomers(30)
                .newCustomerCount(20)
                .repeatCustomerCount(10)
                .repeatRate(new BigDecimal("33.33"))
                .build());

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(result);

        assertNotNull(json);
        assertTrue(json.contains("\"totalRevenue\":1000"));
        assertTrue(json.contains("\"totalOrders\":50"));
        assertTrue(json.contains("\"repeatRate\":33.33"));

        // Verify round-trip
        AnalysisResultDTO deserialized = mapper.readValue(json, AnalysisResultDTO.class);
        assertEquals(new BigDecimal("1000.00"), deserialized.getSalesAnalysis().getTotalRevenue());
        assertEquals(10, deserialized.getCustomerAnalysis().getRepeatCustomerCount());
    }

    private OrderRecord createRecord(AnalysisTask task, String orderId, LocalDate date,
                                      String customerId, String productName, int quantity,
                                      BigDecimal price, String country) {
        OrderRecord record = new OrderRecord();
        record.setTask(task);
        record.setOrderId(orderId);
        record.setOrderDate(date);
        record.setCustomerId(customerId);
        record.setProductName(productName);
        record.setQuantity(quantity);
        record.setPrice(price);
        record.setCountry(country);
        return record;
    }
}
