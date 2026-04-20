package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.JobRequest;
import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.JobType;
import com.example.backend.model.User;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.CompanyService;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Job>> getActiveJobs() {
        return ResponseEntity.ok(jobService.getActiveJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getJobsByCompany(@PathVariable Long companyId) {
        return companyService.getCompanyById(companyId)
                .map(company -> ResponseEntity.ok(jobService.getJobsByCompany(company)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) String keyword) {

        if (keyword != null && !keyword.isEmpty()) {
            return ResponseEntity.ok(jobService.searchActiveJobs(keyword));
        } else if (title != null && !title.isEmpty()) {
            return ResponseEntity.ok(jobService.searchJobsByTitle(title));
        } else if (location != null && !location.isEmpty()) {
            return ResponseEntity.ok(jobService.searchJobsByLocation(location));
        } else if (jobType != null) {
            return ResponseEntity.ok(jobService.getJobsByType(jobType));
        } else if (minSalary != null) {
            return ResponseEntity.ok(jobService.getJobsByMinSalary(minSalary));
        } else {
            return ResponseEntity.ok(jobService.getActiveJobs());
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> createJob(@Valid @RequestBody JobRequest jobRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User employer = userService.getUserById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Company company = companyService.getCompanyById(jobRequest.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));

            // Verify that the employer owns the company
            if (!company.getEmployer().getId().equals(employer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "You don't have permission to post jobs for this company"));
            }

            Job job = new Job();
            job.setTitle(jobRequest.getTitle());
            job.setDescription(jobRequest.getDescription());
            job.setJobType(jobRequest.getJobType());
            job.setLocation(jobRequest.getLocation());
            job.setSalary(jobRequest.getSalary());
            job.setSalaryPeriod(jobRequest.getSalaryPeriod());
            job.setRequirements(jobRequest.getRequirements());
            job.setBenefits(jobRequest.getBenefits());
            job.setWorkingHours(jobRequest.getWorkingHours());
            job.setCompany(company);
            job.setApplicationDeadline(jobRequest.getApplicationDeadline());
            job.setActive(false);

            Job createdJob = jobService.createEmployerJob(job);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create job: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest jobRequest) {
        return jobService.getJobById(id)
                .map(job -> {
                    // Check if the current user is the employer of the company or an admin
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                    boolean isAdmin = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isOwner = job.getCompany().getEmployer().getId().equals(userDetails.getId());

                    if (!isAdmin && !isOwner) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to update this job"));
                    }

                    // Only update the company if the employer owns the new company too
                    if (!job.getCompany().getId().equals(jobRequest.getCompanyId())) {
                        Company newCompany = companyService.getCompanyById(jobRequest.getCompanyId())
                                .orElseThrow(() -> new RuntimeException("Company not found"));
                        
                        if (!isAdmin && !newCompany.getEmployer().getId().equals(userDetails.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body(new ApiResponse(false, "You don't have permission to move this job to another company"));
                        }
                        job.setCompany(newCompany);
                    }

                    job.setTitle(jobRequest.getTitle());
                    job.setDescription(jobRequest.getDescription());
                    job.setJobType(jobRequest.getJobType());
                    job.setLocation(jobRequest.getLocation());
                    job.setSalary(jobRequest.getSalary());
                    job.setSalaryPeriod(jobRequest.getSalaryPeriod());
                    job.setRequirements(jobRequest.getRequirements());
                    job.setBenefits(jobRequest.getBenefits());
                    job.setWorkingHours(jobRequest.getWorkingHours());
                    job.setApplicationDeadline(jobRequest.getApplicationDeadline());

                    if (!isAdmin) {
                        return ResponseEntity.ok(jobService.updateEmployerJob(job));
                    }

                    return ResponseEntity.ok(jobService.updateJob(job));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateJobStatus(@PathVariable Long id, @RequestParam boolean active) {
        try {
            // Check if current user has permission
            Job job = jobService.getJobById(id)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
                    
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean isOwner = job.getCompany().getEmployer().getId().equals(userDetails.getId());

            if (!isAdmin && !isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "You don't have permission to update this job status"));
            }
            
            if (!isAdmin && active) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "Only admins can publish jobs after review"));
            }

            Job updatedJob = jobService.setJobActive(id, active);
            return ResponseEntity.ok(updatedJob);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update job status: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/deadline")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateJobDeadline(@PathVariable Long id, @RequestParam LocalDateTime deadline) {
        try {
            // Check if current user has permission
            Job job = jobService.getJobById(id)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
                    
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean isOwner = job.getCompany().getEmployer().getId().equals(userDetails.getId());

            if (!isAdmin && !isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "You don't have permission to update this job deadline"));
            }
            
            Job updatedJob = jobService.updateJobDeadline(id, deadline);
            return ResponseEntity.ok(updatedJob);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update job deadline: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isJobOwner(#id, authentication.name)")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(job -> {
                    jobService.deleteJob(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Job deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
