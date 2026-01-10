package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.JobApplicationRequest;
import com.example.backend.dto.JobApplicationUpdateRequest;
import com.example.backend.model.*;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.JobApplicationService;
import com.example.backend.service.JobService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationService applicationService;

    @Autowired
    private JobService jobService;

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<JobApplication>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isApplicationApplicant(#id, authentication.name) or @securityService.isApplicationEmployer(#id, authentication.name)")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        return applicationService.getApplicationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobApplication>> getMyApplications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User student = userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(applicationService.getApplicationsByApplicant(student));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isJobEmployer(#jobId, authentication.name)")
    public ResponseEntity<?> getApplicationsByJob(@PathVariable Long jobId) {
        return jobService.getJobById(jobId)
                .map(job -> ResponseEntity.ok(applicationService.getApplicationsByJob(job)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<JobApplication>> getApplicationsByStatus(@PathVariable ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.getApplicationsByStatus(status));
    }

    @GetMapping("/job/{jobId}/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isJobEmployer(#jobId, authentication.name)")
    public ResponseEntity<?> getApplicationsByJobAndStatus(
            @PathVariable Long jobId, 
            @PathVariable ApplicationStatus status) {
        
        return jobService.getJobById(jobId)
                .map(job -> ResponseEntity.ok(applicationService.getApplicationsByJobAndStatus(job, status)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForJob(@Valid @RequestBody JobApplicationRequest applicationRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User student = userService.getUserById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (student.getRole() != UserRole.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "Only students can apply for jobs"));
            }

            Job job = jobService.getJobById(applicationRequest.getJobId())
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            // Check if application deadline has passed
            if (job.getApplicationDeadline().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "The application deadline for this job has passed"));
            }

            // Check if the job is active
            if (!job.isActive()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "This job is no longer accepting applications"));
            }

            // Check if the student has already applied
            if (applicationService.hasApplied(job, student)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "You have already applied for this job"));
            }

            JobApplication application = new JobApplication();
            application.setJob(job);
            application.setApplicant(student);
            application.setCoverLetter(applicationRequest.getCoverLetter());
            application.setResumeUrl(applicationRequest.getResumeUrl());
            application.setStatus(ApplicationStatus.PENDING);

            JobApplication createdApplication = applicationService.createApplication(application);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create application: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isApplicationEmployer(#id, authentication.name)")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id, 
            @RequestParam ApplicationStatus status) {
        
        try {
            JobApplication updatedApplication = applicationService.updateApplicationStatus(id, status);
            return ResponseEntity.ok(updatedApplication);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update application status: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isApplicationApplicant(#id, authentication.name)")
    public ResponseEntity<?> updateApplicationDetails(
            @PathVariable Long id,
            @Valid @RequestBody JobApplicationUpdateRequest updateRequest) {
        return applicationService.getApplicationById(id)
                .map(application -> {
                    application.setCoverLetter(updateRequest.getCoverLetter());
                    application.setResumeUrl(updateRequest.getResumeUrl());
                    return ResponseEntity.ok(applicationService.updateApplication(application));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/notes")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isApplicationEmployer(#id, authentication.name)")
    public ResponseEntity<?> addEmployerNotes(
            @PathVariable Long id, 
            @RequestBody String notes) {
        
        try {
            JobApplication updatedApplication = applicationService.addEmployerNotes(id, notes);
            return ResponseEntity.ok(updatedApplication);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update employer notes: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isApplicationApplicant(#id, authentication.name)")
    public ResponseEntity<?> withdrawApplication(@PathVariable Long id) {
        return applicationService.getApplicationById(id)
                .map(application -> {
                    applicationService.deleteApplication(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Application withdrawn successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
