package com.storeai.doctor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "analysis_data")
public class AnalysisData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_task_id", nullable = false)
    private AnalysisTask analysisTask;

    @Column(name = "data_json", columnDefinition = "JSON")
    private String dataJson;

    @Column(name = "created_time")
    private LocalDateTime createdTime = LocalDateTime.now();
}
