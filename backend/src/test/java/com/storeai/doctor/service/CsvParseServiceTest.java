package com.storeai.doctor.service;

import com.storeai.doctor.dto.OrderDataDTO;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CsvParseServiceTest {

    private final CsvParseService csvParseService = new CsvParseService();

    @Test
    void testParseCsvSuccess() throws IOException {
        String csvContent = """
                order_id,date,customer_id,product_name,quantity,price,country
                ORD000001,2024-01-15,CUST00001,Wireless Earbuds,2,29.99,US
                ORD000002,2024-02-20,CUST00002,Smart Watch,1,149.99,CA
                ORD000003,2024-03-10,CUST00003,USB Cable,5,9.99,GB
                """;

        InputStream inputStream = new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8));
        List<OrderDataDTO> orders = csvParseService.parseCsv(inputStream);

        assertNotNull(orders);
        assertEquals(3, orders.size());

        OrderDataDTO first = orders.get(0);
        assertEquals("ORD000001", first.getOrderId());
        assertEquals("CUST00001", first.getCustomerId());
        assertEquals("Wireless Earbuds", first.getProductName());
        assertEquals(2, first.getQuantity());
        assertEquals(new BigDecimal("29.99"), first.getPrice());
        assertEquals("US", first.getCountry());
    }

    @Test
    void testParseCsvEmptyFile() throws IOException {
        String csvContent = "order_id,date,customer_id,product_name,quantity,price,country\n";
        InputStream inputStream = new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8));
        List<OrderDataDTO> orders = csvParseService.parseCsv(inputStream);

        assertNotNull(orders);
        assertEquals(0, orders.size());
    }

    @Test
    void testParseCsvSkipInvalidRows() throws IOException {
        String csvContent = """
                order_id,date,customer_id,product_name,quantity,price,country
                ORD000001,2024-01-15,CUST00001,Wireless Earbuds,2,29.99,US
                ,2024-02-20,CUST00002,Smart Watch,1,149.99,CA
                ORD000003,,CUST00003,USB Cable,5,9.99,GB
                """;

        InputStream inputStream = new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8));
        List<OrderDataDTO> orders = csvParseService.parseCsv(inputStream);

        assertNotNull(orders);
        assertEquals(1, orders.size());
        assertEquals("ORD000001", orders.get(0).getOrderId());
    }

    @Test
    void testParseCsvMultipleDateFormats() throws IOException {
        String csvContent = """
                order_id,date,customer_id,product_name,quantity,price,country
                ORD000001,2024-01-15,CUST00001,Product A,1,19.99,US
                ORD000002,02/20/2024,CUST00002,Product B,2,29.99,CA
                ORD000003,2024/03/10,CUST00003,Product C,3,39.99,GB
                """;

        InputStream inputStream = new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8));
        List<OrderDataDTO> orders = csvParseService.parseCsv(inputStream);

        assertNotNull(orders);
        assertEquals(3, orders.size());
    }

    @Test
    void testParse1000RowCsv() throws IOException {
        String path = "src/test/resources/test_orders.csv";
        List<String> lines = Files.readAllLines(Paths.get(path), StandardCharsets.UTF_8);

        assertTrue(lines.size() > 1000, "CSV should have more than 1000 data rows plus header");

        String csvContent = String.join("\n", lines);
        InputStream inputStream = new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8));
        List<OrderDataDTO> orders = csvParseService.parseCsv(inputStream);

        assertNotNull(orders);
        assertEquals(1000, orders.size());

        long uniqueCustomers = orders.stream().map(OrderDataDTO::getCustomerId).distinct().count();
        long uniqueProducts = orders.stream().map(OrderDataDTO::getProductName).distinct().count();
        long uniqueCountries = orders.stream().map(OrderDataDTO::getCountry).distinct().count();

        assertTrue(uniqueCustomers > 0, "Should have customers");
        assertTrue(uniqueProducts > 1, "Should have multiple products");
        assertTrue(uniqueCountries > 1, "Should have multiple countries");
    }
}
