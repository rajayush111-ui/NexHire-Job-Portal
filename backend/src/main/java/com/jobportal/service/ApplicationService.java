package com.jobportal.service;

import com.jobportal.model.Application;
import com.jobportal.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {
    @Autowired
    private ApplicationRepository applicationRepository;

    public Application apply(Application application) {
        if (applicationRepository.existsByJobIdAndSeekerId(application.getJobId(), application.getSeekerId())) {
            throw new RuntimeException("Already applied to this job");
        }
        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsBySeeker(String seekerId) {
        return applicationRepository.findBySeekerId(seekerId);
    }

    public List<Application> getApplicationsByJob(String jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Application updateStatus(String id, String status) {
        Application app = applicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(status);
        return applicationRepository.save(app);
    }
}
