package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.Review;
import com.example.backend.model.ReviewAuthorType;
import com.example.backend.model.User;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.CompanyService;
import com.example.backend.service.JobService;
import com.example.backend.service.ReviewService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private JobService jobService;

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReviewById(@PathVariable Long id) {
        return reviewService.getReviewById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getReviewsByCompany(@PathVariable Long companyId) {
        return companyService.getCompanyById(companyId)
                .map(company -> {
                    Map<String, Object> response = new HashMap<>();
                    List<Review> reviews = reviewService.getReviewsReceivedByCompany(company);
                    Double avgRating = reviewService.getAverageRatingForCompany(company);
                    Long count = reviewService.getReviewCountForCompany(company);
                    
                    response.put("reviews", reviews);
                    response.put("averageRating", avgRating);
                    response.put("count", count);
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getReviewsByJob(@PathVariable Long jobId) {
        return jobService.getJobById(jobId)
                .map(job -> ResponseEntity.ok(reviewService.getReviewsByJob(job)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getReviewsByStudent(@PathVariable Long studentId) {
        return userService.getUserById(studentId)
                .map(student -> ResponseEntity.ok(reviewService.getReviewsByStudent(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me/authored")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyReviews(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userService.getUserById(userDetails.getId())
                .map(student -> ResponseEntity.ok(reviewService.getReviewsByStudent(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}/received")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isUser(#studentId, authentication.name)")
    public ResponseEntity<?> getReviewsReceivedByStudent(@PathVariable Long studentId) {
        return userService.getUserById(studentId)
                .map(student -> ResponseEntity.ok(reviewService.getReviewsReceivedByStudent(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me/received")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyReceivedReviews(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userService.getUserById(userDetails.getId())
                .map(student -> ResponseEntity.ok(reviewService.getReviewsReceivedByStudent(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/company/{companyId}/authored")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCompanyOwner(#companyId, authentication.name)")
    public ResponseEntity<?> getReviewsWrittenByCompany(@PathVariable Long companyId) {
        return companyService.getCompanyById(companyId)
                .map(company -> ResponseEntity.ok(reviewService.getReviewsWrittenByCompany(company)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('EMPLOYER')")
    public ResponseEntity<?> createReview(@Valid @RequestBody Review review) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User currentUser = userService.getUserById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (review.getCompany() == null || review.getCompany().getId() == null) {
                throw new RuntimeException("Company is required");
            }

            Company company = companyService.getCompanyById(review.getCompany().getId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));

            if (review.getJob() != null && review.getJob().getId() != null) {
                Job job = jobService.getJobById(review.getJob().getId())
                        .orElseThrow(() -> new RuntimeException("Job not found"));
                review.setJob(job);
            }

            if (currentUser.getRole().name().equals("STUDENT")) {
                review.setStudent(currentUser);
                review.setCompany(company);
                review.setReviewerRole(ReviewAuthorType.STUDENT);
            } else {
                if (!company.getEmployer().getId().equals(currentUser.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new ApiResponse(false, "You don't have permission to review for this company"));
                }

                if (review.getStudent() == null || review.getStudent().getId() == null) {
                    throw new RuntimeException("Student is required");
                }

                User reviewedStudent = userService.getUserById(review.getStudent().getId())
                        .orElseThrow(() -> new RuntimeException("Student not found"));
                review.setStudent(reviewedStudent);
                review.setCompany(company);
                review.setReviewerRole(ReviewAuthorType.EMPLOYER);
            }

            review.setVerified(false); // New reviews are unverified by default
            
            Review savedReview = reviewService.createReview(review);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create review: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.isReviewOwner(#id, authentication.name)")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @Valid @RequestBody Review reviewDetails) {
        return reviewService.getReviewById(id)
                .map(review -> {
                    // Update fields but keep the student, company, and job as is
                    review.setTitle(reviewDetails.getTitle());
                    review.setContent(reviewDetails.getContent());
                    review.setRating(reviewDetails.getRating());
                    review.setPros(reviewDetails.getPros());
                    review.setCons(reviewDetails.getCons());
                    review.setWorkPeriod(reviewDetails.getWorkPeriod());
                    review.setJobTitle(reviewDetails.getJobTitle());
                    review.setAnonymous(reviewDetails.isAnonymous());
                    
                    // Reset verification status when updated
                    review.setVerified(false);
                    
                    return ResponseEntity.ok(reviewService.updateReview(review));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyReview(@PathVariable Long id) {
        return reviewService.getReviewById(id)
                .map(review -> {
                    reviewService.verifyReview(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Review verified successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isReviewOwner(#id, authentication.name)")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        return reviewService.getReviewById(id)
                .map(review -> {
                    reviewService.deleteReview(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Review deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
