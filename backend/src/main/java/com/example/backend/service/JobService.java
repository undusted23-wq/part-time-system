package com.example.backend.service;

import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.JobType;
import com.example.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobService {
    
    @Autowired
    private JobRepository jobRepository;
    
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
    
    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }
    
    public List<Job> getJobsByCompany(Company company) {
        return jobRepository.findByCompany(company);
    }
    
    public List<Job> searchJobsByTitle(String title) {
        return jobRepository.findByTitleContainingIgnoreCase(title);
    }
    
    public List<Job> searchJobsByLocation(String location) {
        return jobRepository.findByLocationContainingIgnoreCase(location);
    }
    
    public List<Job> getJobsByType(JobType jobType) {
        return jobRepository.findByJobType(jobType);
    }
    
    public List<Job> getJobsByMinSalary(BigDecimal minSalary) {
        return jobRepository.findBySalaryGreaterThanEqual(minSalary);
    }
    
    public List<Job> getActiveJobs() {
        return jobRepository.findByIsActiveTrue();
    }
    
    public List<Job> getJobsWithDeadlineAfter(LocalDateTime dateTime) {
        return jobRepository.findByApplicationDeadlineAfter(dateTime);
    }
    
    public List<Job> searchActiveJobs(String keyword) {
        return jobRepository.searchActiveJobs(LocalDateTime.now(), keyword);
    }
    
    @Transactional
    public Job createJob(Job job) {
        return jobRepository.save(job);
    }
    
    @Transactional
    public Job updateJob(Job job) {
        return jobRepository.save(job);
    }
    
    @Transactional
    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }
    
    @Transactional
    public Job setJobActive(Long id, boolean active) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setActive(active);
        return jobRepository.save(job);
    }
    
    @Transactional
    public Job updateJobDeadline(Long id, LocalDateTime newDeadline) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setApplicationDeadline(newDeadline);
        return jobRepository.save(job);
    }
}
