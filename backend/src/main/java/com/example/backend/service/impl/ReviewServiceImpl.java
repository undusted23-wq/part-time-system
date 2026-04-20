package com.example.backend.service.impl;

import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.Review;
import com.example.backend.model.ReviewAuthorType;
import com.example.backend.model.User;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Override
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Override
    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    @Override
    public List<Review> getReviewsByCompany(Company company) {
        return getReviewsReceivedByCompany(company);
    }

    @Override
    public List<Review> getReviewsReceivedByCompany(Company company) {
        return reviewRepository.findByCompanyAndReviewerRoleOrderByCreatedAtDesc(company, ReviewAuthorType.STUDENT);
    }

    @Override
    public List<Review> getReviewsWrittenByCompany(Company company) {
        return reviewRepository.findByCompanyAndReviewerRoleOrderByCreatedAtDesc(company, ReviewAuthorType.EMPLOYER);
    }

    @Override
    public List<Review> getReviewsByJob(Job job) {
        return reviewRepository.findByJobOrderByCreatedAtDesc(job);
    }

    @Override
    public List<Review> getReviewsByStudent(User student) {
        return reviewRepository.findByStudentAndReviewerRoleOrderByCreatedAtDesc(student, ReviewAuthorType.STUDENT);
    }

    @Override
    public List<Review> getReviewsReceivedByStudent(User student) {
        return reviewRepository.findByStudentAndReviewerRoleOrderByCreatedAtDesc(student, ReviewAuthorType.EMPLOYER);
    }

    @Override
    public Long getReviewCountForCompany(Company company) {
        return reviewRepository.countByCompanyAndReviewerRole(company, ReviewAuthorType.STUDENT);
    }

    @Override
    public Double getAverageRatingForCompany(Company company) {
        return reviewRepository.findAverageRatingByCompanyAndReviewerRole(company, ReviewAuthorType.STUDENT);
    }

    @Override
    public Review createReview(Review review) {
        // Set creation timestamp if not already set
        if (review.getCreatedAt() == null) {
            review.setCreatedAt(LocalDateTime.now());
        }
        review.setUpdatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    @Override
    public Review updateReview(Review review) {
        review.setUpdatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    @Override
    public void verifyReview(Long id) {
        reviewRepository.findById(id).ifPresent(review -> {
            review.setVerified(true);
            review.setUpdatedAt(LocalDateTime.now());
            reviewRepository.save(review);
        });
    }

    @Override
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
}
