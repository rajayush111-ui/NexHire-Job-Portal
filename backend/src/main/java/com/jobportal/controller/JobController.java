package com.jobportal.controller;

import com.jobportal.model.Job;
import com.jobportal.security.services.UserDetailsImpl;
import com.jobportal.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @GetMapping
    public List<Job> getAllJobs(@RequestParam(required = false) String title, @RequestParam(required = false) String location) {
        return jobService.searchJobs(title, location);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable String id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public Job createJob(@RequestBody Job job) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return jobService.createJob(job, userDetails.getId());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Job> updateJob(@PathVariable String id, @RequestBody Job job) {
        return ResponseEntity.ok(jobService.updateJob(id, job));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> deleteJob(@PathVariable String id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok().build();
    }
}
