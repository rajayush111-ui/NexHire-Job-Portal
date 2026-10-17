package com.jobportal.service;

import com.jobportal.model.Job;
import com.jobportal.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {
    @Autowired
    private JobRepository jobRepository;

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(String id) {
        return jobRepository.findById(id);
    }

    public List<Job> searchJobs(String title, String location) {
        if ((title == null || title.isEmpty()) && (location == null || location.isEmpty())) {
            return jobRepository.findAll();
        }
        return jobRepository.searchJobs(title != null ? title : "", location != null ? location : "");
    }

    public Job createJob(Job job, String recruiterId) {
        job.setPostedBy(recruiterId);
        return jobRepository.save(job);
    }

    public Job updateJob(String id, Job jobDetails) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setTitle(jobDetails.getTitle());
        job.setCompany(jobDetails.getCompany());
        job.setLocation(jobDetails.getLocation());
        job.setDescription(jobDetails.getDescription());
        job.setSalary(jobDetails.getSalary());
        job.setSkills(jobDetails.getSkills());
        return jobRepository.save(job);
    }

    public void deleteJob(String id) {
        jobRepository.deleteById(id);
    }
}
