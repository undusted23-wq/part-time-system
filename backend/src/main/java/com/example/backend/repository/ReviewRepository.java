package com.example.backend.repository;

import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.Review;
import com.example.backend.model.ReviewAuthorType;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCompany(Company company);
    List<Review> findByJob(Job job);
    List<Review> findByStudent(User student);
    List<Review> findByCompanyOrderByCreatedAtDesc(Company company);
    List<Review> findByJobOrderByCreatedAtDesc(Job job);
    List<Review> findByCompanyAndReviewerRoleOrderByCreatedAtDesc(Company company, ReviewAuthorType reviewerRole);
    List<Review> findByStudentAndReviewerRoleOrderByCreatedAtDesc(User student, ReviewAuthorType reviewerRole);
    Long countByCompany(Company company);
    Long countByCompanyAndReviewerRole(Company company, ReviewAuthorType reviewerRole);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.company = :company")
    Double findAverageRatingByCompany(@Param("company") Company company);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.company = :company AND r.reviewerRole = :reviewerRole")
    Double findAverageRatingByCompanyAndReviewerRole(
            @Param("company") Company company,
            @Param("reviewerRole") ReviewAuthorType reviewerRole
    );
}
