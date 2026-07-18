package com.storeai.doctor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeai.doctor.config.DeepSeekConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeepSeekService {

    private final DeepSeekConfig deepSeekConfig;
    private final ObjectMapper objectMapper;

    private static final double TEMPERATURE = 0.3;
    private static final int CONNECT_TIMEOUT_MS = 10000;
    private static final int READ_TIMEOUT_MS = 60000;
    private static final int MAX_RETRIES = 3;
    private static final long[] RETRY_DELAYS_MS = {1000L, 3000L, 9000L};

    public String callChatApi(String systemPrompt, String userPrompt) {
        String url = deepSeekConfig.getBaseUrl() + "/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(deepSeekConfig.getApiKey());

        Map<String, Object> body = Map.of(
                "model", deepSeekConfig.getModel(),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", TEMPERATURE,
                "max_tokens", deepSeekConfig.getMaxTokens()
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        log.info("Calling DeepSeek API: model={}, url={}, promptLength={}",
                deepSeekConfig.getModel(), url, userPrompt.length());

        // Retry loop with exponential backoff
        Exception lastException = null;
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                RestTemplate restTemplate = createRestTemplate();
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

                if (response.getStatusCode() == HttpStatus.OK) {
                    return parseApiResponse(response.getBody());
                }

                // Non-retryable client errors (4xx except 429)
                if (response.getStatusCode().is4xxClientError() && response.getStatusCode() != HttpStatus.TOO_MANY_REQUESTS) {
                    log.error("DeepSeek API client error (non-retryable): {}", response.getStatusCode());
                    throw new RuntimeException("DeepSeek API call failed with status: " + response.getStatusCode());
                }

                // Retryable: 429, 5xx
                log.warn("DeepSeek API returned retryable status: {} on attempt {}/{}",
                        response.getStatusCode(), attempt, MAX_RETRIES);

            } catch (HttpClientErrorException.TooManyRequests e) {
                lastException = e;
                // Try to get Retry-After header
                List<String> retryAfterHeaders = e.getResponseHeaders() != null
                        ? e.getResponseHeaders().get("Retry-After") : null;
                String retryAfter = (retryAfterHeaders != null && !retryAfterHeaders.isEmpty())
                        ? retryAfterHeaders.get(0) : null;
                long waitMs = retryAfter != null
                        ? Long.parseLong(retryAfter) * 1000L
                        : RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)];
                log.warn("DeepSeek API rate limited (429) on attempt {}/{}. Waiting {}ms. Retry-After: {}",
                        attempt, MAX_RETRIES, waitMs, retryAfter);
                if (attempt < MAX_RETRIES) {
                    sleep(waitMs);
                }

            } catch (HttpServerErrorException e) {
                lastException = e;
                log.warn("DeepSeek API server error: {} on attempt {}/{}",
                        e.getStatusCode(), attempt, MAX_RETRIES);
                if (attempt < MAX_RETRIES) {
                    sleep(RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)]);
                }

            } catch (ResourceAccessException e) {
                lastException = e;
                log.warn("DeepSeek API network/timeout error on attempt {}/{}: {}",
                        attempt, MAX_RETRIES, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    sleep(RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)]);
                }
            } catch (RuntimeException e) {
                // Already handled above
                throw e;
            } catch (Exception e) {
                lastException = e;
                log.warn("DeepSeek API unexpected error on attempt {}/{}: {}",
                        attempt, MAX_RETRIES, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    sleep(RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)]);
                }
            }
        }

        // All retries exhausted
        log.error("DeepSeek API failed after {} attempts", MAX_RETRIES);
        throw new RuntimeException("DeepSeek API request failed after " + MAX_RETRIES + " retries", lastException);
    }

    private String parseApiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty() || choices.get(0).isNull() || choices.get(0).isMissingNode()) {
                throw new RuntimeException("DeepSeek API response missing choices");
            }
            String content = choices.get(0).path("message").path("content").asText();
            log.info("DeepSeek API response received, content length={}", content.length());
            return content;
        } catch (Exception e) {
            log.error("Failed to parse DeepSeek API response: {}", responseBody, e);
            throw new RuntimeException("Failed to parse DeepSeek API response", e);
        }
    }

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);
        return new RestTemplate(factory);
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted during API retry backoff", e);
        }
    }
}