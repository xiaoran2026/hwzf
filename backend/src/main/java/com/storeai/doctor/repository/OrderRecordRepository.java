package com.storeai.doctor.repository;

import com.storeai.doctor.entity.OrderRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRecordRepository extends JpaRepository<OrderRecord, Long> {

    List<OrderRecord> findByTaskId(Long taskId);

    long countByTaskId(Long taskId);

    List<OrderRecord> findByTaskIdAndTaskUploadedFileStoreUserId(Long taskId, Long userId);

    long countByTaskIdAndTaskUploadedFileStoreUserId(Long taskId, Long userId);

    /**
     * 通过店铺ID查询所有订单记录（关联关系：OrderRecord -> Task -> UploadedFile -> Store）
     */
    @Query("SELECT o FROM OrderRecord o JOIN o.task t JOIN t.uploadedFile f WHERE f.store.id = :storeId")
    List<OrderRecord> findByStoreId(@Param("storeId") Long storeId);
}
