package com.blockid.platform.repository;

import com.blockid.platform.model.VerificationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface VerificationHistoryRepository extends JpaRepository<VerificationHistory, Long> {
    List<VerificationHistory> findByUserId(Long userId);

    List<VerificationHistory> findByVerifierId(Long verifierId);

    Page<VerificationHistory> findByVerifierId(Long verifierId, Pageable pageable);

    @Query("SELECT COUNT(v) FROM VerificationHistory v WHERE v.verificationDate >= CURRENT_DATE")
    long countTodayVerifications();
}
