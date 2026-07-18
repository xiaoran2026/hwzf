package com.storeai.doctor.service;

import com.storeai.doctor.entity.OperationLog;
import com.storeai.doctor.repository.OperationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final OperationLogRepository operationLogRepository;

    @Transactional
    public void log(Long userId, String operation, String details, String ipAddress) {
        OperationLog log = new OperationLog();
        log.setUserId(userId);
        log.setOperation(operation);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        operationLogRepository.save(log);
    }

    @Transactional
    public void logUpload(Long userId, String filename) {
        log(userId, "UPLOAD_FILE", "Uploaded file: " + filename, null);
    }

    @Transactional
    public void logCreateStore(Long userId, String storeName) {
        log(userId, "CREATE_STORE", "Created store: " + storeName, null);
    }

    @Transactional
    public void logViewReport(Long userId, Long reportId) {
        log(userId, "VIEW_REPORT", "Viewed report ID: " + reportId, null);
    }

    @Transactional
    public void logDeleteReport(Long userId, Long reportId) {
        log(userId, "DELETE_REPORT", "Deleted report ID: " + reportId, null);
    }
}
