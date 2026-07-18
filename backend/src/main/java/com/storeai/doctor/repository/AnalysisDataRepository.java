package com.storeai.doctor.repository;

import com.storeai.doctor.entity.AnalysisData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalysisDataRepository extends JpaRepository<AnalysisData, Long> {

    Optional<AnalysisData> findByAnalysisTaskId(Long analysisTaskId);
}
