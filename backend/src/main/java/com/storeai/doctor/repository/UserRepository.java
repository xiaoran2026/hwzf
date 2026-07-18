package com.storeai.doctor.repository;

import com.storeai.doctor.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    long countByCreatedTimeBetween(LocalDateTime start, LocalDateTime end);
}
