package com.jobportal.repository;

import com.jobportal.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByPostedBy(String recruiterId);
    
    @Query("{ '$or': [ { 'title': { '$regex': ?0, '$options': 'i' } }, { 'location': { '$regex': ?1, '$options': 'i' } } ] }")
    List<Job> searchJobs(String title, String location);
}
