package com.storeai.doctor.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GumroadPaymentService {

    @Value("${gumroad.pro-url}")
    private String proUrl;

    @Value("${gumroad.starter-url}")
    private String starterUrl;

    public String generatePaymentUrl(String plan) {
        if (plan == null) {
            return null;
        }
        return switch (plan.toUpperCase().trim()) {
            case "PRO" -> proUrl;
            case "STARTER", "ENTERPRISE" -> starterUrl;
            default -> null;
        };
    }
}
