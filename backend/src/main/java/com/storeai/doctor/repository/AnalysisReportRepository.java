package com.storeai.doctor.repository;

import com.storeai.doctor.entity.AnalysisReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {

    Optional<AnalysisReport> findByTaskId(Long taskId);

    @Query("SELECT r.task.id FROM AnalysisReport r WHERE r.id = :reportId")
    Optional<Long> findTaskIdByReportId(@Param("reportId") Long reportId);

    List<AnalysisReport> findByTaskUploadedFileStoreIdOrderByCreatedTimeDesc(Long storeId);

    Optional<AnalysisReport> findByIdAndTaskUploadedFileStoreUserId(Long id, Long userId);

    List<AnalysisReport> findByTaskUploadedFileStoreUserIdOrderByCreatedTimeDesc(Long userId);

    List<AnalysisReport> findByTaskUploadedFileStoreIdAndTaskUploadedFileStoreUserIdOrderByCreatedTimeDesc(Long storeId, Long userId);

    long countByTaskUploadedFileStoreUserId(Long userId);

    @Query("SELECT COUNT(r) FROM AnalysisReport r WHERE r.task.uploadedFile.store.user.id = :userId AND r.createdTime BETWEEN :start AND :end")
    long countReportsByUserIdAndCreatedTimeBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
