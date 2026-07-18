package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDataDTO {

    private String orderId;

    private LocalDate date;

    private String customerId;

    private String productName;

    private Integer quantity;

    private BigDecimal price;

    private String country;
}
