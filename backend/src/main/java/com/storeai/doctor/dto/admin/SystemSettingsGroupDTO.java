package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingsGroupDTO {
    // Sentry
    private boolean sentryEnabled;
    private String sentryDsn;
    private String sentryEnvironment;
    private String sentryRelease;
    private String sentryStatus;
    // PostHog
    private boolean posthogEnabled;
    private String posthogProjectName;
    private String posthogApiHost;
    private String posthogProjectId;
    private String posthogStatus;
    // Error stats (from operation_logs)
    private long errorCount24h;
    private long warningCount24h;
    private double crashFreeRate;
    private String lastErrorTime;
    // PostHog events (mock for now, real integration later)
    private Map<String, Long> posthogEvents;
}
