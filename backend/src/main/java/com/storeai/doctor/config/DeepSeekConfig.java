package com.storeai.doctor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "deepseek")
public class DeepSeekConfig {

    private String apiKey;

    private String baseUrl = "https://api.deepseek.com";

    private String model = "deepseek-chat";

    private int maxTokens = 4096;

}
