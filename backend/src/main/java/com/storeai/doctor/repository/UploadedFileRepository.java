package com.storeai.doctor.repository;

import com.storeai.doctor.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    List<UploadedFile> findByStoreIdOrderByCreatedTimeDesc(Long storeId);
    List<UploadedFile> findByStoreIdAndStoreUserIdOrderByCreatedTimeDesc(Long storeId, Long userId);
    long countByStoreId(Long storeId);
    long countByCreatedTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(uf) FROM UploadedFile uf JOIN uf.store s WHERE s.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(uf) FROM UploadedFile uf JOIN uf.store s WHERE s.user.id = :userId AND uf.createdTime BETWEEN :start AND :end")
    long countByUserIdAndCreatedTimeBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByStoreIdAndFileHashAndCreatedTimeAfter(Long storeId, String fileHash, LocalDateTime after);
}
