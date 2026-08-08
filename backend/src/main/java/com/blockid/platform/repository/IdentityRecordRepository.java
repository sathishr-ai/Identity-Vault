package com.blockid.platform.repository;

import com.blockid.platform.model.IdentityRecord;
import com.blockid.platform.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface IdentityRecordRepository extends JpaRepository<IdentityRecord, Long> {
    Optional<IdentityRecord> findByUser(User user);

    Optional<IdentityRecord> findByUserId(Long userId);

    Page<IdentityRecord> findByStatus(String status, Pageable pageable);

    long countByStatus(String status);

    @Query("SELECT r FROM IdentityRecord r JOIN r.user u WHERE " +
            "(LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.did) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(r.aadhaarNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<IdentityRecord> searchIdentities(@Param("search") String search, Pageable pageable);
}
