package com.storeai.doctor.security;

import com.storeai.doctor.entity.User;
import com.storeai.doctor.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractTokenFromRequest(request);

        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            try {
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                String email = jwtTokenProvider.getEmailFromToken(token);
                String plan = jwtTokenProvider.getPlanFromToken(token);
                String role = jwtTokenProvider.getRoleFromToken(token);

                if (userId != null) {
                    // Real-time banned check against DB
                    boolean isBanned = userRepository.findById(userId)
                            .map(User::getBanned)
                            .orElse(false);

                    if (Boolean.TRUE.equals(isBanned)) {
                        log.warn("[Auth] Blocked banned user {} from accessing {}", userId, request.getRequestURI());
                        filterChain.doFilter(request, response);
                        return;
                    }

                    Map<String, Object> principal = new HashMap<>();
                    principal.put("userId", userId);
                    principal.put("email", email);
                    principal.put("plan", plan);
                    principal.put("role", role);

                    List<SimpleGrantedAuthority> authorities = role != null
                            ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                            : Collections.emptyList();

                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                            principal, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                log.warn("[Auth] Token parse failed for request {}: {}", request.getRequestURI(), e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}