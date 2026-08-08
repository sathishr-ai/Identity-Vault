package com.blockid.platform.repository;

import com.blockid.platform.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByTimestampDesc(Long userId);

    List<Notification> findByUserIdAndIsReadOrderByTimestampDesc(Long userId, boolean isRead);
}
