package com.jobportal.repository;

import com.jobportal.model.Bookmark;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends MongoRepository<Bookmark, String> {
    List<Bookmark> findByUserId(String userId);
    Optional<Bookmark> findByUserIdAndJobId(String userId, String jobId);
    boolean existsByUserIdAndJobId(String userId, String jobId);
}
