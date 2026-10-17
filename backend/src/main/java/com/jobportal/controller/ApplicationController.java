package com.jobportal.controller;

import com.jobportal.dto.MessageResponse;
import com.jobportal.model.Application;
import com.jobportal.security.services.UserDetailsImpl;
import com.jobportal.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<?> applyForJob(@RequestBody Application application) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        application.setSeekerId(userDetails.getId());
        application.setSeekerName(userDetails.getUsername());
        application.setSeekerEmail(userDetails.getEmail());
        try {
            return ResponseEntity.ok(applicationService.apply(application));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public List<Application> getMyApplications() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return applicationService.getApplicationsBySeeker(userDetails.getId());
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public List<Application> getApplicationsByJob(@PathVariable String jobId) {
        return applicationService.getApplicationsByJob(jobId);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public Application updateApplicationStatus(@PathVariable String id, @RequestParam String status) {
        return applicationService.updateStatus(id, status);
    }
}
