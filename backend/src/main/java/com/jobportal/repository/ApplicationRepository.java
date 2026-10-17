package com.jobportal.repository;

import com.jobportal.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    List<Application> findBySeekerId(String seekerId);
    List<Application> findByJobId(String jobId);
    boolean existsByJobIdAndSeekerId(String jobId, String seekerId);
}
