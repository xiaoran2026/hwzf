package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLogDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String type;
    private String operation;
    private String details;
    private String ipAddress;
    private String createdTime;
}