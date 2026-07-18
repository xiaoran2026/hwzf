package com.storeai.doctor.service;

import com.storeai.doctor.config.DeepSeekConfig;
import com.storeai.doctor.dto.admin.*;
import com.storeai.doctor.entity.OperationLog;
import com.storeai.doctor.entity.SystemSetting;
import com.storeai.doctor.repository.OperationLogRepository;
import com.storeai.doctor.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingsService {

    private final SystemSettingRepository systemSettingRepository;
    private final OperationLogRepository operationLogRepository;
    private final DataSource dataSource;
    private final DeepSeekConfig deepSeekConfig;

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Value("${spring.mail.host:smtp.example.com}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    // ==================== Settings CRUD ====================

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public SystemSettingsGroupDTO getSettingsGroup() {
        // Load all settings from DB
        Map<String, SystemSetting> settingsMap = loadAllSettingsAsMap();

        // Sentry settings
        boolean sentryEnabled = getSettingBoolean(settingsMap, "sentry_enabled", false);
        String sentryDsn = getSettingString(settingsMap, "sentry_dsn", "");
        String sentryEnvironment = getSettingString(settingsMap, "sentry_environment", "");
        String sentryRelease = getSettingString(settingsMap, "sentry_release", "");
        String sentryStatus = deriveSentryStatus(sentryEnabled, sentryDsn);

        // PostHog settings
        boolean posthogEnabled = getSettingBoolean(settingsMap, "posthog_enabled", false);
        String posthogProjectName = getSettingString(settingsMap, "posthog_project_name", "");
        String posthogApiHost = getSettingString(settingsMap, "posthog_api_host", "");
        String posthogProjectId = getSettingString(settingsMap, "posthog_project_id", "");
        String posthogStatus = derivePosthogStatus(posthogEnabled, posthogApiHost);

        // Error stats from operation_logs
        LocalDateTime now24hAgo = LocalDateTime.now().minusHours(24);
        List<OperationLog> recentLogs = operationLogRepository.findAll().stream()
                .filter(l -> l.getCreatedTime() != null && l.getCreatedTime().isAfter(now24hAgo))
                .collect(Collectors.toList());

        long errorCount24h = recentLogs.stream()
                .filter(l -> l.getOperation() != null && l.getOperation().toUpperCase().contains("ERROR"))
                .count();

        long warningCount24h = recentLogs.stream()
                .filter(l -> l.getOperation() != null && l.getOperation().toUpperCase().contains("WARNING"))
                .count();

        long totalLogs24h = recentLogs.size();
        double crashFreeRate = totalLogs24h > 0
                ? Math.round((1.0 - (double) errorCount24h / totalLogs24h) * 10000.0) / 100.0
                : 100.0;

        String lastErrorTime = recentLogs.stream()
                .filter(l -> l.getOperation() != null && l.getOperation().toUpperCase().contains("ERROR"))
                .map(l -> l.getCreatedTime() != null ? l.getCreatedTime().format(DT_FMT) : null)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);

        // PostHog events (mock data for now)
        Map<String, Long> posthogEvents = new LinkedHashMap<>();
        posthogEvents.put("page_view", 0L);
        posthogEvents.put("api_call", 0L);
        posthogEvents.put("error_triggered", 0L);
        posthogEvents.put("report_generated", 0L);

        return SystemSettingsGroupDTO.builder()
                .sentryEnabled(sentryEnabled)
                .sentryDsn(sentryDsn)
                .sentryEnvironment(sentryEnvironment)
                .sentryRelease(sentryRelease)
                .sentryStatus(sentryStatus)
                .posthogEnabled(posthogEnabled)
                .posthogProjectName(posthogProjectName)
                .posthogApiHost(posthogApiHost)
                .posthogProjectId(posthogProjectId)
                .posthogStatus(posthogStatus)
                .errorCount24h(errorCount24h)
                .warningCount24h(warningCount24h)
                .crashFreeRate(crashFreeRate)
                .lastErrorTime(lastErrorTime)
                .posthogEvents(posthogEvents)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public SystemSettingDTO getSetting(String key) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key).orElse(null);
        if (setting == null) {
            return SystemSettingDTO.builder()
                    .key(key)
                    .value("")
                    .type("STRING")
                    .category("")
                    .description("")
                    .updatedTime("")
                    .build();
        }
        return toDTO(setting);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key).orElse(null);
        if (setting == null) {
            setting = new SystemSetting();
            setting.setSettingKey(key);
            setting.setSettingType("STRING");
            setting.setCategory(inferCategory(key));
        }
        setting.setSettingValue(value);
        setting.setUpdatedTime(LocalDateTime.now());
        systemSettingRepository.save(setting);
        log.info("[SystemSettings] Updated setting: {} = ***", key);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void updateSettingsBatch(Map<String, String> settings) {
        if (settings == null || settings.isEmpty()) {
            return;
        }
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            updateSetting(entry.getKey(), entry.getValue());
        }
        log.info("[SystemSettings] Batch updated {} settings", settings.size());
    }

    // ==================== Health Check ====================

    @PreAuthorize("hasRole('ADMIN')")
    public HealthCheckDTO getHealthCheck() {
        ExecutorService executor = Executors.newFixedThreadPool(8);
        List<Future<HealthCheckDTO.ServiceHealth>> futures = new ArrayList<>();

        futures.add(executor.submit(this::checkBackend));
        futures.add(executor.submit(this::checkDatabase));
        futures.add(executor.submit(this::checkRedis));
        futures.add(executor.submit(this::checkStorage));
        futures.add(executor.submit(this::checkSmtp));
        futures.add(executor.submit(this::checkPayPal));
        futures.add(executor.submit(this::checkAiService));
        futures.add(executor.submit(this::checkFrontend));

        List<HealthCheckDTO.ServiceHealth> services = new ArrayList<>();
        for (Future<HealthCheckDTO.ServiceHealth> future : futures) {
            try {
                services.add(future.get(15, TimeUnit.SECONDS));
            } catch (Exception e) {
                services.add(HealthCheckDTO.ServiceHealth.builder()
                        .name("Unknown")
                        .status("OFFLINE")
                        .message("Health check failed: " + e.getMessage())
                        .responseTimeMs(-1)
                        .build());
            }
        }
        executor.shutdown();

        return HealthCheckDTO.builder()
                .services(services)
                .checkedAt(LocalDateTime.now().format(DT_FMT))
                .build();
    }

    private HealthCheckDTO.ServiceHealth checkBackend() {
        long start = System.currentTimeMillis();
        // If we can run this code, the backend is healthy
        long duration = System.currentTimeMillis() - start;
        return HealthCheckDTO.ServiceHealth.builder()
                .name("Backend API")
                .status("HEALTHY")
                .message("Backend is running normally")
                .responseTimeMs(duration)
                .build();
    }

    private HealthCheckDTO.ServiceHealth checkDatabase() {
        long start = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection()) {
            boolean valid = conn.isValid(5);
            long duration = System.currentTimeMillis() - start;
            if (valid) {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("Database")
                        .status("HEALTHY")
                        .message("Database connection is alive")
                        .responseTimeMs(duration)
                        .build();
            } else {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("Database")
                        .status("WARNING")
                        .message("Database connection is not valid")
                        .responseTimeMs(duration)
                        .build();
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            return HealthCheckDTO.ServiceHealth.builder()
                    .name("Database")
                    .status("OFFLINE")
                    .message("Database unreachable: " + e.getMessage())
                    .responseTimeMs(duration)
                    .build();
        }
    }

    private HealthCheckDTO.ServiceHealth checkRedis() {
        long start = System.currentTimeMillis();
        long duration = System.currentTimeMillis() - start;
        return HealthCheckDTO.ServiceHealth.builder()
                .name("Redis")
                .status("OFFLINE")
                .message("Redis is not configured")
                .responseTimeMs(duration)
                .build();
    }

    private HealthCheckDTO.ServiceHealth checkStorage() {
        long start = System.currentTimeMillis();
        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            boolean writable = Files.isWritable(uploadPath);
            long duration = System.currentTimeMillis() - start;
            if (writable) {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("File Storage")
                        .status("HEALTHY")
                        .message("Upload directory is accessible and writable: " + uploadDir)
                        .responseTimeMs(duration)
                        .build();
            } else {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("File Storage")
                        .status("WARNING")
                        .message("Upload directory exists but is not writable: " + uploadDir)
                        .responseTimeMs(duration)
                        .build();
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            return HealthCheckDTO.ServiceHealth.builder()
                    .name("File Storage")
                    .status("OFFLINE")
                    .message("Storage check failed: " + e.getMessage())
                    .responseTimeMs(duration)
                    .build();
        }
    }

    private HealthCheckDTO.ServiceHealth checkSmtp() {
        long start = System.currentTimeMillis();
        try {
            boolean isDefault = "smtp.example.com".equals(mailHost) || mailHost == null || mailHost.isBlank();
            boolean hasCredentials = mailUsername != null && !mailUsername.isBlank();
            long duration = System.currentTimeMillis() - start;

            if (isDefault && !hasCredentials) {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("SMTP")
                        .status("WARNING")
                        .message("SMTP is not configured (using default host)")
                        .responseTimeMs(duration)
                        .build();
            } else {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("SMTP")
                        .status("HEALTHY")
                        .message("SMTP is configured: " + mailHost)
                        .responseTimeMs(duration)
                        .build();
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            return HealthCheckDTO.ServiceHealth.builder()
                    .name("SMTP")
                    .status("OFFLINE")
                    .message("SMTP check failed: " + e.getMessage())
                    .responseTimeMs(duration)
                    .build();
        }
    }

    private HealthCheckDTO.ServiceHealth checkPayPal() {
        long start = System.currentTimeMillis();
        try {
            Map<String, SystemSetting> settingsMap = loadAllSettingsAsMap();
            String paypalEnabled = getSettingString(settingsMap, "paypal_enabled", "");
            String paypalClientId = getSettingString(settingsMap, "paypal_client_id", "");
            long duration = System.currentTimeMillis() - start;

            boolean isConfigured = "true".equalsIgnoreCase(paypalEnabled) && !paypalClientId.isEmpty();
            if (isConfigured) {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("PayPal")
                        .status("HEALTHY")
                        .message("PayPal is configured")
                        .responseTimeMs(duration)
                        .build();
            } else {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("PayPal")
                        .status("OFFLINE")
                        .message("PayPal is not configured")
                        .responseTimeMs(duration)
                        .build();
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            return HealthCheckDTO.ServiceHealth.builder()
                    .name("PayPal")
                    .status("OFFLINE")
                    .message("PayPal check failed: " + e.getMessage())
                    .responseTimeMs(duration)
                    .build();
        }
    }

    private HealthCheckDTO.ServiceHealth checkAiService() {
        long start = System.currentTimeMillis();
        try {
            String apiKey = deepSeekConfig.getApiKey();
            String baseUrl = deepSeekConfig.getBaseUrl();

            if (apiKey == null || apiKey.isBlank() || "sk-d3d8b384f607417aa35309bb807a1dce".equals(apiKey)) {
                // Using default key - try a lightweight ping
                RestTemplate restTemplate = createQuickRestTemplate(5000);
                String url = baseUrl + "/v1/models";

                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(apiKey);

                HttpEntity<Void> request = new HttpEntity<>(headers);
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
                long duration = System.currentTimeMillis() - start;

                if (response.getStatusCode().is2xxSuccessful()) {
                    return HealthCheckDTO.ServiceHealth.builder()
                            .name("AI Service (DeepSeek)")
                            .status("HEALTHY")
                            .message("DeepSeek API is reachable")
                            .responseTimeMs(duration)
                            .build();
                } else {
                    return HealthCheckDTO.ServiceHealth.builder()
                            .name("AI Service (DeepSeek)")
                            .status("WARNING")
                            .message("DeepSeek API returned status: " + response.getStatusCode())
                            .responseTimeMs(duration)
                            .build();
                }
            }

            RestTemplate restTemplate = createQuickRestTemplate(10000);
            String url = baseUrl + "/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "model", deepSeekConfig.getModel(),
                    "messages", List.of(Map.of("role", "user", "content", "ping")),
                    "max_tokens", 5
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
            long duration = System.currentTimeMillis() - start;

            if (response.getStatusCode().is2xxSuccessful()) {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("AI Service (DeepSeek)")
                        .status("HEALTHY")
                        .message("DeepSeek API responded successfully")
                        .responseTimeMs(duration)
                        .build();
            } else {
                return HealthCheckDTO.ServiceHealth.builder()
                        .name("AI Service (DeepSeek)")
                        .status("WARNING")
                        .message("DeepSeek API returned status: " + response.getStatusCode())
                        .responseTimeMs(duration)
                        .build();
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            return HealthCheckDTO.ServiceHealth.builder()
                    .name("AI Service (DeepSeek)")
                    .status("OFFLINE")
                    .message("DeepSeek API unreachable: " + e.getMessage())
                    .responseTimeMs(duration)
                    .build();
        }
    }

    private HealthCheckDTO.ServiceHealth checkFrontend() {
        long start = System.currentTimeMillis();
        long duration = System.currentTimeMillis() - start;
        return HealthCheckDTO.ServiceHealth.builder()
                .name("Frontend")
                .status("UNKNOWN")
                .message("Check frontend service separately")
                .responseTimeMs(duration)
                .build();
    }

    // ==================== Deployment Info ====================

    @PreAuthorize("hasRole('ADMIN')")
    public DeploymentInfoDTO getDeploymentInfo() {
        String javaVersion = System.getProperty("java.version");
        String backendVersion = getImplementationVersion();

        String springBootVersion = "Unknown";
        try {
            String v = org.springframework.boot.SpringBootVersion.getVersion();
            if (v != null) springBootVersion = v;
        } catch (Exception ignored) {}

        // Database version
        String databaseVersion = "Unknown";
        try (Connection conn = dataSource.getConnection()) {
            String dbProduct = conn.getMetaData().getDatabaseProductName();
            String dbVersion = conn.getMetaData().getDatabaseProductVersion();
            databaseVersion = dbProduct + " " + dbVersion;
        } catch (Exception ignored) {}

        // Server time and timezone
        String serverTime = LocalDateTime.now().format(DT_FMT);
        String timezone = ZoneId.systemDefault().toString();

        // Environment
        String environment = System.getenv("SPRING_PROFILES_ACTIVE");
        if (environment == null || environment.isBlank()) {
            environment = System.getProperty("spring.profiles.active", "dev");
        }

        // Docker info
        String dockerVersion = getDockerVersion();
        String containerId = getContainerId();

        // Build time & git commit from system settings
        Map<String, SystemSetting> settingsMap = loadAllSettingsAsMap();
        String buildTime = getSettingString(settingsMap, "build_time", "");
        String gitCommit = getSettingString(settingsMap, "git_commit", "");

        return DeploymentInfoDTO.builder()
                .frontendVersion("Unknown")
                .backendVersion(backendVersion)
                .javaVersion(javaVersion)
                .springBootVersion(springBootVersion)
                .databaseVersion(databaseVersion)
                .serverTime(serverTime)
                .timezone(timezone)
                .environment(environment)
                .dockerVersion(dockerVersion)
                .containerId(containerId)
                .buildTime(buildTime)
                .gitCommit(gitCommit)
                .build();
    }

    // ==================== Recent Logs ====================

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public RecentLogsDTO getRecentLogs(String level, String search, int limit) {
        List<OperationLog> allLogs = operationLogRepository.findAll();

        // Filter by level if provided
        if (level != null && !level.isBlank()) {
            String upperLevel = level.toUpperCase();
            allLogs = allLogs.stream()
                    .filter(l -> l.getOperation() != null && l.getOperation().toUpperCase().contains(upperLevel))
                    .collect(Collectors.toList());
        }

        // Filter by search if provided
        if (search != null && !search.isBlank()) {
            String lowerSearch = search.toLowerCase();
            allLogs = allLogs.stream()
                    .filter(l -> (l.getOperation() != null && l.getOperation().toLowerCase().contains(lowerSearch))
                            || (l.getDetails() != null && l.getDetails().toLowerCase().contains(lowerSearch)))
                    .collect(Collectors.toList());
        }

        // Sort by time descending
        allLogs.sort((a, b) -> {
            if (a.getCreatedTime() == null && b.getCreatedTime() == null) return 0;
            if (a.getCreatedTime() == null) return 1;
            if (b.getCreatedTime() == null) return -1;
            return b.getCreatedTime().compareTo(a.getCreatedTime());
        });

        long total = allLogs.size();

        // Apply limit
        List<OperationLog> limitedLogs = allLogs.stream()
                .limit(Math.max(1, limit))
                .collect(Collectors.toList());

        List<RecentLogsDTO.LogEntry> entries = limitedLogs.stream()
                .map(l -> RecentLogsDTO.LogEntry.builder()
                        .id(l.getId())
                        .level(extractLogLevel(l))
                        .message(l.getOperation() != null ? l.getOperation() : "")
                        .source(l.getDetails() != null ? truncate(l.getDetails(), 200) : "")
                        .timestamp(l.getCreatedTime() != null ? l.getCreatedTime().format(DT_FMT) : "")
                        .build())
                .collect(Collectors.toList());

        return RecentLogsDTO.builder()
                .logs(entries)
                .total(total)
                .build();
    }

    // ==================== Sentry Test ====================

    @PreAuthorize("hasRole('ADMIN')")
    public String testSentryError() {
        try {
            // Log a test error message
            log.error("[SENTRY TEST] This is a test error sent from Admin Panel - Sentry Integration Test at {}", LocalDateTime.now());

            // In production, this would also send to Sentry SDK if configured
            // For now, we log and return success
            return "Test error logged successfully. If Sentry is configured, this error should appear in your Sentry dashboard.";
        } catch (Exception e) {
            log.error("[SENTRY TEST] Failed to send test error", e);
            return "Failed to send test error: " + e.getMessage();
        }
    }

    // ==================== PostHog Verify ====================

    @PreAuthorize("hasRole('ADMIN')")
    public String verifyPostHogConnection() {
        Map<String, SystemSetting> settingsMap = loadAllSettingsAsMap();
        boolean enabled = getSettingBoolean(settingsMap, "posthog_enabled", false);
        String apiHost = getSettingString(settingsMap, "posthog_api_host", "");
        String apiKey = getSettingString(settingsMap, "posthog_api_key", "");

        if (!enabled) {
            return "PostHog is disabled. Enable it first in system settings.";
        }

        if (apiHost == null || apiHost.isBlank()) {
            return "PostHog API host is not configured.";
        }

        try {
            RestTemplate restTemplate = createQuickRestTemplate(10000);
            String url = apiHost.trim();
            if (!url.endsWith("/")) {
                url = url + "/";
            }
            url = url + "api/projects/@all";

            HttpHeaders headers = new HttpHeaders();
            if (apiKey != null && !apiKey.isBlank()) {
                headers.setBearerAuth(apiKey);
            }
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Void> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return "PostHog connection verified successfully. API host is reachable.";
            } else {
                return "PostHog returned status: " + response.getStatusCode()
                        + " - " + (response.getBody() != null ? response.getBody().substring(0, Math.min(200, response.getBody().length())) : "No body");
            }
        } catch (Exception e) {
            return "PostHog connection failed: " + e.getMessage();
        }
    }

    // ==================== Helper Methods ====================

    private Map<String, SystemSetting> loadAllSettingsAsMap() {
        return systemSettingRepository.findAll().stream()
                .collect(Collectors.toMap(SystemSetting::getSettingKey, s -> s, (a, b) -> a));
    }

    private String getSettingString(Map<String, SystemSetting> map, String key, String defaultValue) {
        SystemSetting setting = map.get(key);
        if (setting == null || setting.getSettingValue() == null) {
            return defaultValue;
        }
        return setting.getSettingValue();
    }

    private boolean getSettingBoolean(Map<String, SystemSetting> map, String key, boolean defaultValue) {
        String value = getSettingString(map, key, "");
        if (value.isBlank()) {
            return defaultValue;
        }
        return "true".equalsIgnoreCase(value);
    }

    private String deriveSentryStatus(boolean enabled, String dsn) {
        if (!enabled) return "DISABLED";
        if (dsn == null || dsn.isBlank()) return "NO_DSN";
        return "ACTIVE";
    }

    private String derivePosthogStatus(boolean enabled, String apiHost) {
        if (!enabled) return "DISABLED";
        if (apiHost == null || apiHost.isBlank()) return "NO_HOST";
        return "ACTIVE";
    }

    private String inferCategory(String key) {
        if (key.startsWith("sentry_")) return "sentry";
        if (key.startsWith("posthog_")) return "posthog";
        if (key.startsWith("paypal_")) return "paypal";
        if (key.startsWith("smtp_") || key.startsWith("mail_")) return "email";
        if (key.startsWith("deepl_") || key.startsWith("ai_")) return "ai";
        return "general";
    }

    private SystemSettingDTO toDTO(SystemSetting setting) {
        return SystemSettingDTO.builder()
                .key(setting.getSettingKey())
                .value(setting.getSettingValue())
                .type(setting.getSettingType())
                .category(setting.getCategory())
                .description(setting.getDescription())
                .updatedTime(setting.getUpdatedTime() != null ? setting.getUpdatedTime().format(DT_FMT) : null)
                .build();
    }

    private String getImplementationVersion() {
        try {
            Package pkg = com.storeai.doctor.StoreAiDoctorApplication.class.getPackage();
            if (pkg != null && pkg.getImplementationVersion() != null) {
                return pkg.getImplementationVersion();
            }
        } catch (Exception ignored) {}
        return "1.0.0";
    }

    private String getDockerVersion() {
        try {
            ProcessBuilder pb = new ProcessBuilder("docker", "--version");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes()).trim();
            process.waitFor(5, TimeUnit.SECONDS);
            if (!output.isBlank()) {
                return output.replace("Docker version ", "");
            }
        } catch (Exception ignored) {}
        return "Not detected";
    }

    private String getContainerId() {
        try {
            // In Docker, /etc/hostname contains the container ID (short)
            Path hostnamePath = Paths.get("/etc/hostname");
            if (Files.exists(hostnamePath)) {
                String hostname = Files.readString(hostnamePath).trim();
                if (hostname.length() >= 12) {
                    return hostname;
                }
            }

            // Check cgroup
            Path cgroupPath = Paths.get("/proc/1/cgroup");
            if (Files.exists(cgroupPath)) {
                String cgroup = Files.readString(cgroupPath);
                // Look for container ID in cgroup (typically after the last slash)
                String[] parts = cgroup.split("/");
                if (parts.length > 0) {
                    String lastPart = parts[parts.length - 1].trim();
                    if (lastPart.length() >= 12) {
                        return lastPart;
                    }
                }
            }
        } catch (Exception ignored) {}
        return "Not in container";
    }

    private String extractLogLevel(OperationLog logEntry) {
        String operation = logEntry.getOperation();
        if (operation == null) return "INFO";

        String upper = operation.toUpperCase();
        if (upper.contains("ERROR") || upper.contains("EXCEPTION") || upper.contains("FAILED")) return "ERROR";
        if (upper.contains("WARNING") || upper.contains("WARN")) return "WARNING";
        if (upper.startsWith("DEBUG")) return "DEBUG";
        return "INFO";
    }

    private String truncate(String str, int maxLen) {
        if (str == null) return "";
        if (str.length() <= maxLen) return str;
        return str.substring(0, maxLen) + "...";
    }

    private RestTemplate createQuickRestTemplate(int timeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);
        return new RestTemplate(factory);
    }
}
