package com.storeai.doctor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_records")
public class OrderRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private AnalysisTask task;

    @Column(name = "order_id")
    private String orderId;

    @Column(name = "order_date")
    private LocalDate orderDate;

    @Column(name = "customer_id")
    private String customerId;

    @Column(name = "product_name")
    private String productName;

    private Integer quantity;

    private BigDecimal price;

    private String country;

    @Column(name = "created_time")
    private LocalDateTime createdTime = LocalDateTime.now();
}
