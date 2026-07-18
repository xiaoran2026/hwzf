package com.storeai.doctor.service;

import com.storeai.doctor.dto.LoginRequest;
import com.storeai.doctor.dto.LoginResponse;
import com.storeai.doctor.dto.RegisterRequest;
import com.storeai.doctor.dto.UserDTO;
import com.storeai.doctor.entity.User;
import com.storeai.doctor.enums.RoleEnum;
import com.storeai.doctor.repository.UserRepository;
import com.storeai.doctor.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.format.DateTimeFormatter;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
    }

    @Transactional
    public UserDTO register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : null;
        String password = request.getPassword() != null ? request.getPassword().trim() : null;

        if (!StringUtils.hasText(email)) {
            throw new RuntimeException("Email is required");
        }
        if (!StringUtils.hasText(password)) {
            throw new RuntimeException("Password is required");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPlan("FREE");

        User savedUser = userRepository.save(user);

        // Send welcome email asynchronously (MVP: log only)
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getEmail());

        return new UserDTO(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getPlan(),
                savedUser.getRole().name(),
                savedUser.getCreatedTime() != null
                        ? savedUser.getCreatedTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        : null
        );
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : null;
        String password = request.getPassword() != null ? request.getPassword().trim() : null;

        if (!StringUtils.hasText(email)) {
            throw new RuntimeException("Email is required");
        }
        if (!StringUtils.hasText(password)) {
            throw new RuntimeException("Password is required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (Boolean.TRUE.equals(user.getBanned())) {
            throw new RuntimeException("Your account has been banned. Please contact support.");
        }

        String token = jwtTokenProvider.generateToken(user);

        return new LoginResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getPlan(),
                user.getRole().name()
        );
    }
}
