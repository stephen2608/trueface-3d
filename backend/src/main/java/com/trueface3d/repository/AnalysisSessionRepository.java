package com.trueface3d.repository;

import com.trueface3d.model.AnalysisSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AnalysisSessionRepository extends JpaRepository<AnalysisSession, Long> {
    Optional<AnalysisSession> findBySessionUuid(String sessionUuid);
    List<AnalysisSession> findAllByOrderByStartTimeDesc();
}
