package com.trueface3d.repository;

import com.trueface3d.model.TelemetrySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelemetrySnapshotRepository extends JpaRepository<TelemetrySnapshot, Long> {
    List<TelemetrySnapshot> findBySessionUuidOrderByTimestampMsAsc(String sessionUuid);
    void deleteBySessionUuid(String sessionUuid);
}
