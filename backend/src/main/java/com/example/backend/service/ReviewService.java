package com.example.backend.service;

import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.Review;
import com.example.backend.model.User;

import java.util.List;
import java.util.Optional;

public interface ReviewService {
    List<Review> getAllReviews();
    Optional<Review> getReviewById(Long id);
    List<Review> getReviewsByCompany(Company company);
    List<Review> getReviewsReceivedByCompany(Company company);
    List<Review> getReviewsWrittenByCompany(Company company);
    List<Review> getReviewsByJob(Job job);
    List<Review> getReviewsByStudent(User student);
    List<Review> getReviewsReceivedByStudent(User student);
    Long getReviewCountForCompany(Company company);
    Double getAverageRatingForCompany(Company company);
    Review createReview(Review review);
    Review updateReview(Review review);
    void verifyReview(Long id);
    void deleteReview(Long id);
}
