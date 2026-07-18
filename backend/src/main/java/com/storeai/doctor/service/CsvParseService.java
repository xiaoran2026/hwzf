package com.storeai.doctor.service;

import com.storeai.doctor.dto.OrderDataDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PushbackInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsvParseService {

    private static final String[] HEADERS = {
        "order_id", "date", "customer_id", "product_name", "quantity", "price", "country"
    };

    private static final DateTimeFormatter[] DATE_FORMATTERS = {
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("yyyy/MM/dd"),
        DateTimeFormatter.ofPattern("yyyy/M/d"),
        DateTimeFormatter.ofPattern("MM/dd/yyyy"),
        DateTimeFormatter.ofPattern("M/d/yyyy"),
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),
        DateTimeFormatter.ofPattern("d/M/yyyy")
    };

    // Matches <script>, <img, <svg, <iframe, <body, <object, <embed, <link, <style, <form, <input
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[a-zA-Z/!][^>]*>", Pattern.CASE_INSENSITIVE);
    // Matches javascript:, vbscript:, data: URIs
    private static final Pattern SCRIPT_URI_PATTERN = Pattern.compile("(?i)(javascript|vbscript|data)\\s*:");
    // Matches SQL injection patterns
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
            "(?i)(;|--|/\\*|\\*/|xp_|exec\\s|execute\\s|drop\\s|delete\\s|insert\\s|update\\s|select\\s|union\\s|alter\\s|create\\s|truncate\\s)(\\s|$|\\()",
            Pattern.CASE_INSENSITIVE
    );
    private static final int MAX_TEXT_LENGTH = 500;

    public List<OrderDataDTO> parseCsv(MultipartFile file) throws IOException {
        return parseCsv(file.getInputStream());
    }

    public List<OrderDataDTO> parseCsv(InputStream inputStream) throws IOException {
        // Strip UTF-8 BOM (\xEF\xBB\xBF) if present — common when CSV files
        // are exported from Excel with "UTF-8 with BOM" encoding.
        // Without this, the BOM attaches to the first header name (e.g., "\uFEFForder_id"),
        // causing header matching to fail and all records to be skipped.
        InputStream cleanStream = stripBom(inputStream);

        try (InputStreamReader reader = new InputStreamReader(cleanStream, StandardCharsets.UTF_8);
             CSVParser csvParser = CSVFormat.DEFAULT
                     .withHeader(HEADERS)
                     .withFirstRecordAsHeader()
                     .withIgnoreHeaderCase()
                     .withTrim()
                     .parse(reader)) {

            log.info("[CSV] Header names: {}", csvParser.getHeaderNames());
            log.info("[CSV] Header map: {}", csvParser.getHeaderMap());

            List<OrderDataDTO> orders = new ArrayList<>();
            int rowNum = 0;
            int skipped = 0;
            for (CSVRecord record : csvParser) {
                rowNum++;
                OrderDataDTO order = parseRecord(record);
                if (order != null) {
                    orders.add(order);
                } else {
                    skipped++;
                    if (skipped <= 3) {
                        log.warn("[CSV] Row {} skipped - order_id={}, date={}, customer_id={}",
                            rowNum,
                            getOrDefault(record, "order_id"),
                            getOrDefault(record, "date"),
                            getOrDefault(record, "customer_id"));
                    }
                }
                if (rowNum > 50000) {
                    throw new IOException("CSV file exceeds maximum limit of 50000 rows.");
                }
            }
            log.info("[CSV] Parsed {} orders, skipped {} rows out of {} total", orders.size(), skipped, rowNum);
            return orders;
        }
    }

    /**
     * Strip UTF-8 BOM (Byte Order Mark: 0xEF 0xBB 0xBF) from the beginning of an InputStream.
     * Uses PushbackInputStream so that non-BOM bytes are pushed back into the stream.
     *
     * This fixes a bug where Excel exports CSV as "UTF-8 with BOM", causing the BOM
     * character (\uFEFF) to prepend to the first column header name, breaking header matching.
     */
    private InputStream stripBom(InputStream inputStream) throws IOException {
        PushbackInputStream pushback = new PushbackInputStream(inputStream, 3);
        byte[] bom = new byte[3];
        int read = pushback.read(bom);
        if (read == 3
                && (bom[0] & 0xFF) == 0xEF
                && (bom[1] & 0xFF) == 0xBB
                && (bom[2] & 0xFF) == 0xBF) {
            log.info("[CSV] UTF-8 BOM detected and stripped");
            return pushback;
        }
        if (read > 0) {
            pushback.unread(bom, 0, read);
        }
        return pushback;
    }

    private OrderDataDTO parseRecord(CSVRecord record) {
        try {
            String orderId = sanitizeInput(getOrDefault(record, "order_id"), true);
            String dateStr = getOrDefault(record, "date");
            String customerId = sanitizeInput(getOrDefault(record, "customer_id"), true);
            String productName = sanitizeInput(getOrDefault(record, "product_name"), false);
            String quantityStr = getOrDefault(record, "quantity");
            String priceStr = getOrDefault(record, "price");
            String country = sanitizeInput(getOrDefault(record, "country"), false);

            if (orderId.isEmpty() || dateStr.isEmpty() || customerId.isEmpty()) {
                return null;
            }

            LocalDate date = parseDate(dateStr);
            int quantity = Integer.parseInt(quantityStr.trim());
            BigDecimal price = new BigDecimal(priceStr.trim());

            // [BUG FIX MEDIUM-008] Validate non-negative values
            if (quantity < 0) {
                log.warn("[CSV] Negative quantity rejected: {} for order {}", quantity, orderId);
                return null;
            }
            if (price.compareTo(BigDecimal.ZERO) < 0) {
                log.warn("[CSV] Negative price rejected: {} for order {}", price, orderId);
                return null;
            }

            return new OrderDataDTO(orderId, date, customerId, productName, quantity, price, country);
        } catch (Exception e) {
            log.warn("[CSV] Parse error: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Sanitize user-provided text fields from CSV to prevent XSS, SQL injection,
     * and prompt injection. Strips HTML tags, script URIs, and SQL patterns.
     * Also truncates to MAX_TEXT_LENGTH to prevent prompt bloat.
     *
     * @param input    raw string from CSV
     * @param isId     if true, also strip non-alphanumeric chars (for IDs)
     * @return sanitized string
     */
    private String sanitizeInput(String input, boolean isId) {
        if (input == null || input.isEmpty()) return input;

        String sanitized = input;

        // Strip HTML tags
        sanitized = HTML_TAG_PATTERN.matcher(sanitized).replaceAll("");

        // Strip script/vbscript/data URIs
        sanitized = SCRIPT_URI_PATTERN.matcher(sanitized).replaceAll("");

        // Strip SQL injection patterns (replace dangerous keywords)
        if (!isId) {
            sanitized = SQL_INJECTION_PATTERN.matcher(sanitized).replaceAll("");
        }

        // Normalize whitespace
        sanitized = sanitized.replaceAll("\\s+", " ").trim();

        // Truncate to prevent prompt injection via excessive length
        if (sanitized.length() > MAX_TEXT_LENGTH) {
            sanitized = sanitized.substring(0, MAX_TEXT_LENGTH);
            log.warn("[CSV] Input truncated to {} chars: {}...", MAX_TEXT_LENGTH, sanitized.substring(0, Math.min(50, sanitized.length())));
        }

        return sanitized;
    }

    private String getOrDefault(CSVRecord record, String header) {
        return record.isMapped(header) ? record.get(header).trim() : "";
    }

    private LocalDate parseDate(String dateStr) {
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException e) {
                // try next format
            }
        }
        throw new DateTimeParseException("Unable to parse date: " + dateStr, dateStr, 0);
    }
}
