package com.storeai.doctor.repository;

import com.storeai.doctor.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findByUserId(Long userId);

    Optional<Subscription> findByUserIdAndStatus(Long userId, String status);

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId AND s.status = 'ACTIVE' ORDER BY s.id DESC")
    List<Subscription> findActiveByUserIdOrderByIdDesc(@Param("userId") Long userId);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.cancelAtPeriodEnd = true AND s.expireTime <= :now")
    List<Subscription> findExpiredCancellations(@Param("now") LocalDateTime now);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.expireTime <= :now")
    List<Subscription> findExpiredSubscriptions(@Param("now") LocalDateTime now);
}
