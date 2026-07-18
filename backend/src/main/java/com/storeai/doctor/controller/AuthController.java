package com.storeai.doctor.controller;

import com.storeai.doctor.common.ApiResponse;
import com.storeai.doctor.dto.LoginRequest;
import com.storeai.doctor.dto.LoginResponse;
import com.storeai.doctor.dto.RegisterRequest;
import com.storeai.doctor.dto.UserDTO;
import com.storeai.doctor.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<UserDTO> register(@RequestBody RegisterRequest request) {
        if (request == null) {
            return ApiResponse.error("Request body is required");
        }
        if (!StringUtils.hasText(request.getEmail())) {
            return ApiResponse.error("Email is required");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            return ApiResponse.error("Password is required");
        }
        try {
            UserDTO userDTO = authService.register(request);
            return ApiResponse.success(userDTO);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        if (request == null) {
            return ApiResponse.error("Request body is required");
        }
        if (!StringUtils.hasText(request.getEmail())) {
            return ApiResponse.error("Email is required");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            return ApiResponse.error("Password is required");
        }
        try {
            LoginResponse loginResponse = authService.login(request);
            return ApiResponse.success(loginResponse);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
