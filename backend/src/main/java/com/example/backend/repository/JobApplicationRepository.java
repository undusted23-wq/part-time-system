package com.example.backend.repository;

import com.example.backend.model.ApplicationStatus;
import com.example.backend.model.Job;
import com.example.backend.model.JobApplication;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByApplicant(User applicant);
    List<JobApplication> findByJob(Job job);
    List<JobApplication> findByStatus(ApplicationStatus status);
    List<JobApplication> findByJobAndStatus(Job job, ApplicationStatus status);
    List<JobApplication> findByApplicantAndStatus(User applicant, ApplicationStatus status);
    Optional<JobApplication> findByJobAndApplicant(Job job, User applicant);
    boolean existsByJobAndApplicant(Job job, User applicant);
}
