package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentInfoDTO {
    private String frontendVersion;
    private String backendVersion;
    private String javaVersion;
    private String springBootVersion;
    private String databaseVersion;
    private String serverTime;
    private String timezone;
    private String environment;
    private String dockerVersion;
    private String containerId;
    private String buildTime;
    private String gitCommit;
}
