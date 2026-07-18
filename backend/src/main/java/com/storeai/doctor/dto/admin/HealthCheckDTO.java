package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCheckDTO {
    private List<ServiceHealth> services;
    private String checkedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceHealth {
        private String name;
        private String status; // HEALTHY, WARNING, OFFLINE
        private String message;
        private long responseTimeMs;
    }
}
