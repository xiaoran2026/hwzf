package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusDTO {

    private Long taskId;
    private Long fileId;
    private String fileName;
    private String status;
    private Integer progress;
    private Long reportId;
    private String errorMessage;
    private LocalDateTime createdTime;
}
