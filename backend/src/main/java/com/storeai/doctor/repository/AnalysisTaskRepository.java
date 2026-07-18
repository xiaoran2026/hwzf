package com.storeai.doctor.repository;

import com.storeai.doctor.entity.AnalysisTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalysisTaskRepository extends JpaRepository<AnalysisTask, Long> {

    Optional<AnalysisTask> findByUploadedFileId(Long uploadedFileId);

    List<AnalysisTask> findAllByUploadedFileId(Long uploadedFileId);

    Optional<AnalysisTask> findByIdAndUploadedFileStoreUserId(Long id, Long userId);

    long countByUploadedFileStoreId(Long storeId);
}
