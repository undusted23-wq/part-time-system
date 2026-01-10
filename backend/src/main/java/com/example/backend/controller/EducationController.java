package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.EducationRequest;
import com.example.backend.model.Education;
import com.example.backend.model.Resume;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.EducationService;
import com.example.backend.service.ResumeService;
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
@RequestMapping("/api/education")
public class EducationController {

    @Autowired
    private EducationService educationService;

    @Autowired
    private ResumeService resumeService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> getEducationById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return educationService.getEducationById(id)
                .map(education -> {
                    boolean isOwner = education.getResume().getStudent().getId().equals(userDetails.getId());
                    if (isAdmin || isOwner) {
                        return ResponseEntity.ok(education);
                    }
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new ApiResponse(false, "You don't have permission to view this education entry"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/resume/{resumeId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> getEducationByResume(@PathVariable Long resumeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return resumeService.getResumeById(resumeId)
                .map(resume -> {
                    boolean isOwner = resume.getStudent().getId().equals(userDetails.getId());
                    if (isAdmin || isOwner) {
                        List<Education> educationList = educationService.getEducationByResume(resume);
                        return ResponseEntity.ok(educationList);
                    }
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new ApiResponse(false, "You don't have permission to view these education entries"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/resume/{resumeId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> createEducation(@PathVariable Long resumeId, @Valid @RequestBody EducationRequest request) {
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
                        .body(new ApiResponse(false, "You don't have permission to add education for this resume"));
            }

            Education education = new Education();
            education.setResume(resume);
            education.setSchoolName(request.getSchoolName());
            education.setMajor(request.getMajor());
            education.setDegree(request.getDegree());
            education.setStartDate(request.getStartDate());
            education.setEndDate(request.getEndDate());

            Education savedEducation = educationService.createEducation(education);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedEducation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create education: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> updateEducation(@PathVariable Long id, @Valid @RequestBody EducationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return educationService.getEducationById(id)
                .map(education -> {
                    boolean isOwner = education.getResume().getStudent().getId().equals(userDetails.getId());
                    if (!isAdmin && !isOwner) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to update this education entry"));
                    }

                    education.setSchoolName(request.getSchoolName());
                    education.setMajor(request.getMajor());
                    education.setDegree(request.getDegree());
                    education.setStartDate(request.getStartDate());
                    education.setEndDate(request.getEndDate());

                    return ResponseEntity.ok(educationService.updateEducation(education));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> deleteEducation(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return educationService.getEducationById(id)
                .map(education -> {
                    boolean isOwner = education.getResume().getStudent().getId().equals(userDetails.getId());
                    if (!isAdmin && !isOwner) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to delete this education entry"));
                    }
                    educationService.deleteEducation(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Education entry deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
