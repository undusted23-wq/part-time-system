package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.WorkExperienceRequest;
import com.example.backend.model.Resume;
import com.example.backend.model.WorkExperience;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.ResumeService;
import com.example.backend.service.WorkExperienceService;
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
@RequestMapping("/api/work-experiences")
public class WorkExperienceController {

    @Autowired
    private WorkExperienceService workExperienceService;

    @Autowired
    private ResumeService resumeService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> getWorkExperienceById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return workExperienceService.getWorkExperienceById(id)
                .map(workExperience -> {
                    boolean isOwner = workExperience.getResume().getStudent().getId().equals(userDetails.getId());
                    if (isAdmin || isOwner) {
                        return ResponseEntity.ok(workExperience);
                    }
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new ApiResponse(false, "You don't have permission to view this work experience entry"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/resume/{resumeId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> getWorkExperienceByResume(@PathVariable Long resumeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return resumeService.getResumeById(resumeId)
                .map(resume -> {
                    boolean isOwner = resume.getStudent().getId().equals(userDetails.getId());
                    if (isAdmin || isOwner) {
                        List<WorkExperience> workExperienceList = workExperienceService.getWorkExperienceByResume(resume);
                        return ResponseEntity.ok(workExperienceList);
                    }
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new ApiResponse(false, "You don't have permission to view these work experience entries"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/resume/{resumeId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> createWorkExperience(@PathVariable Long resumeId, @Valid @RequestBody WorkExperienceRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            Resume resume = resumeService.getResumeById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));

            boolean isOwner = resume.getStudent().getId().equals(userDetails.getId());
            if (!isAdmin && !isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "You don't have permission to add work experience for this resume"));
            }

            WorkExperience workExperience = new WorkExperience();
            workExperience.setResume(resume);
            workExperience.setCompanyName(request.getCompanyName());
            workExperience.setPosition(request.getPosition());
            workExperience.setStartDate(request.getStartDate());
            workExperience.setEndDate(request.getEndDate());
            workExperience.setDescription(request.getDescription());

            WorkExperience savedWorkExperience = workExperienceService.createWorkExperience(workExperience);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedWorkExperience);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create work experience: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> updateWorkExperience(@PathVariable Long id, @Valid @RequestBody WorkExperienceRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return workExperienceService.getWorkExperienceById(id)
                .map(workExperience -> {
                    boolean isOwner = workExperience.getResume().getStudent().getId().equals(userDetails.getId());
                    if (!isAdmin && !isOwner) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to update this work experience entry"));
                    }

                    workExperience.setCompanyName(request.getCompanyName());
                    workExperience.setPosition(request.getPosition());
                    workExperience.setStartDate(request.getStartDate());
                    workExperience.setEndDate(request.getEndDate());
                    workExperience.setDescription(request.getDescription());

                    return ResponseEntity.ok(workExperienceService.updateWorkExperience(workExperience));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> deleteWorkExperience(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return workExperienceService.getWorkExperienceById(id)
                .map(workExperience -> {
                    boolean isOwner = workExperience.getResume().getStudent().getId().equals(userDetails.getId());
                    if (!isAdmin && !isOwner) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to delete this work experience entry"));
                    }
                    workExperienceService.deleteWorkExperience(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Work experience entry deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
