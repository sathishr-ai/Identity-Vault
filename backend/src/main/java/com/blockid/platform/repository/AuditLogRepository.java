package com.blockid.platform.repository;

import com.blockid.platform.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    Page<AuditLog> findBySeverityOrderByTimestampDesc(String severity, Pageable pageable);

    List<AuditLog> findAllByOrderByTimestampDesc();
}
