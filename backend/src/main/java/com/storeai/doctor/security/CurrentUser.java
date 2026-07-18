package com.storeai.doctor.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

public class CurrentUser {

    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public static Long getUserId() {
        Authentication authentication = getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Map<?, ?> principal) {
            Object userId = principal.get("userId");
            if (userId instanceof Number) {
                return ((Number) userId).longValue();
            }
        }
        return null;
    }

    public static String getEmail() {
        Authentication authentication = getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Map<?, ?> principal) {
            Object email = principal.get("email");
            if (email instanceof String) {
                return (String) email;
            }
        }
        return null;
    }

    public static String getPlan() {
        Authentication authentication = getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Map<?, ?> principal) {
            Object plan = principal.get("plan");
            if (plan instanceof String) {
                return (String) plan;
            }
        }
        return null;
    }

    public static String getRole() {
        Authentication authentication = getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Map<?, ?> principal) {
            Object role = principal.get("role");
            if (role instanceof String) {
                return (String) role;
            }
        }
        return null;
    }

    public static boolean isAdmin() {
        return "ADMIN".equals(getRole());
    }

    public static boolean isAuthenticated() {
        Authentication authentication = getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}
