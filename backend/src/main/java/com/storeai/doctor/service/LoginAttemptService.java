package com.storeai.doctor.service;

import com.storeai.doctor.entity.LoginAttempt;
import com.storeai.doctor.repository.LoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private final LoginAttemptRepository loginAttemptRepository;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 10;

    @Transactional
    public void recordFailedAttempt(String email) {
        Optional<LoginAttempt> optional = loginAttemptRepository.findByEmail(email);
        LoginAttempt attempt = optional.orElseGet(() -> {
            LoginAttempt newAttempt = new LoginAttempt();
            newAttempt.setEmail(email);
            return newAttempt;
        });

        int newFailCount = (attempt.getFailCount() == null ? 0 : attempt.getFailCount()) + 1;
        attempt.setFailCount(newFailCount);

        if (newFailCount >= MAX_FAILED_ATTEMPTS) {
            attempt.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
        }

        loginAttemptRepository.save(attempt);
    }

    @Transactional(readOnly = true)
    public boolean isLocked(String email) {
        Optional<LoginAttempt> optional = loginAttemptRepository.findByEmail(email);
        if (optional.isEmpty()) {
            return false;
        }
        LoginAttempt attempt = optional.get();
        if (attempt.getLockedUntil() == null) {
            return false;
        }
        return attempt.getLockedUntil().isAfter(LocalDateTime.now());
    }

    @Transactional
    public void resetAttempts(String email) {
        Optional<LoginAttempt> optional = loginAttemptRepository.findByEmail(email);
        optional.ifPresent(attempt -> {
            attempt.setFailCount(0);
            attempt.setLockedUntil(null);
            loginAttemptRepository.save(attempt);
        });
    }
}
