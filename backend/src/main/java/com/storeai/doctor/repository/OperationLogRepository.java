package com.storeai.doctor.repository;

import com.storeai.doctor.entity.OperationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OperationLogRepository extends JpaRepository<OperationLog, Long> {

    List<OperationLog> findByUserIdOrderByCreatedTimeDesc(Long userId);

    Page<OperationLog> findByOperationContainingIgnoreCase(String operation, Pageable pageable);
}
