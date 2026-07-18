package com.storeai.doctor.repository;

import com.storeai.doctor.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByIdAndUserId(Long id, Long userId);
    List<Store> findByUserIdOrderByCreatedTimeDesc(Long userId);
    long countByUserId(Long userId);
    Page<Store> findByStoreNameContainingIgnoreCase(String storeName, Pageable pageable);
}
