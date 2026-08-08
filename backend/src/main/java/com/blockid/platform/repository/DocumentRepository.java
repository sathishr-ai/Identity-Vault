package com.blockid.platform.repository;

import com.blockid.platform.model.Document;
import com.blockid.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUser(User user);

    List<Document> findByUserId(Long userId);

    List<Document> findByUserIdAndType(Long userId, String type);
}
