package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.model.Job;
import com.example.backend.model.SavedJob;
import com.example.backend.model.User;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.JobService;
import com.example.backend.service.SavedJobService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/saved-jobs")
public class SavedJobController {

    @Autowired
    private SavedJobService savedJobService;

    @Autowired
    private UserService userService;

    @Autowired
    private JobService jobService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getCurrentUserSavedJobs() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User student = userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<SavedJob> savedJobs = savedJobService.getSavedJobsByStudent(student);
        return ResponseEntity.ok(savedJobs);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isUser(#studentId, authentication.name)")
    public ResponseEntity<?> getSavedJobsByStudent(@PathVariable Long studentId) {
        return userService.getUserById(studentId)
                .map(student -> ResponseEntity.ok(savedJobService.getSavedJobsByStudent(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> isJobSaved(@PathVariable Long jobId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User student = userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Job job = jobService.getJobById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        boolean isSaved = savedJobService.isJobSavedByStudent(student, job);
        return ResponseEntity.ok(Map.of("saved", isSaved));
    }

    @PostMapping("/job/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> saveJob(@PathVariable Long jobId, @RequestBody(required = false) Map<String, String> notes) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User student = userService.getUserById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Job job = jobService.getJobById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            
            // Check if already saved
            if (savedJobService.isJobSavedByStudent(student, job)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "Job already saved by this student"));
            }
            
            SavedJob savedJob = new SavedJob();
            savedJob.setStudent(student);
            savedJob.setJob(job);
            if (notes != null && notes.containsKey("notes")) {
                savedJob.setNotes(notes.get("notes"));
            }
            
            SavedJob result = savedJobService.saveJob(savedJob);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to save job: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') and @securityService.isSavedJobOwner(#id, authentication.name)")
    public ResponseEntity<?> updateSavedJobNotes(@PathVariable Long id, @Valid @RequestBody Map<String, String> notes) {
        return savedJobService.getSavedJobById(id)
                .map(savedJob -> {
                    if (notes.containsKey("notes")) {
                        savedJob.setNotes(notes.get("notes"));
                    }
                    
                    return ResponseEntity.ok(savedJobService.updateSavedJob(savedJob));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/job/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> unsaveJob(@PathVariable Long jobId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User student = userService.getUserById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Job job = jobService.getJobById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            
            // Check if job is saved by student
            if (!savedJobService.isJobSavedByStudent(student, job)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(false, "Job is not saved by this student"));
            }
            
            savedJobService.unsaveJob(student, job);
            return ResponseEntity.ok(new ApiResponse(true, "Job unsaved successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to unsave job: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isSavedJobOwner(#id, authentication.name)")
    public ResponseEntity<?> deleteSavedJob(@PathVariable Long id) {
        return savedJobService.getSavedJobById(id)
                .map(savedJob -> {
                    savedJobService.deleteSavedJob(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Saved job deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
