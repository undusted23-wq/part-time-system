package com.example.backend.repository;

import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.JobType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCompany(Company company);
    List<Job> findByTitleContainingIgnoreCase(String title);
    List<Job> findByLocationContainingIgnoreCase(String location);
    List<Job> findByJobType(JobType jobType);
    List<Job> findBySalaryGreaterThanEqual(BigDecimal minSalary);
    List<Job> findByIsActiveTrue();
    List<Job> findByApplicationDeadlineAfter(LocalDateTime now);
    
    @Query("SELECT j FROM Job j WHERE j.isActive = true AND j.applicationDeadline > ?1 AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', ?2, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', ?2, '%')))")
    List<Job> searchActiveJobs(LocalDateTime now, String keyword);
}
