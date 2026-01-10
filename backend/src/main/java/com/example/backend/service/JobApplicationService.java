package com.example.backend.service;

import com.example.backend.model.ApplicationStatus;
import com.example.backend.model.Job;
import com.example.backend.model.JobApplication;
import com.example.backend.model.User;
import com.example.backend.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class JobApplicationService {
    
    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    
    public List<JobApplication> getAllApplications() {
        return jobApplicationRepository.findAll();
    }
    
    public Optional<JobApplication> getApplicationById(Long id) {
        return jobApplicationRepository.findById(id);
    }
    
    public List<JobApplication> getApplicationsByApplicant(User applicant) {
        return jobApplicationRepository.findByApplicant(applicant);
    }
    
    public List<JobApplication> getApplicationsByJob(Job job) {
        return jobApplicationRepository.findByJob(job);
    }
    
    public List<JobApplication> getApplicationsByStatus(ApplicationStatus status) {
        return jobApplicationRepository.findByStatus(status);
    }
    
    public List<JobApplication> getApplicationsByJobAndStatus(Job job, ApplicationStatus status) {
        return jobApplicationRepository.findByJobAndStatus(job, status);
    }
    
    public List<JobApplication> getApplicationsByApplicantAndStatus(User applicant, ApplicationStatus status) {
        return jobApplicationRepository.findByApplicantAndStatus(applicant, status);
    }
    
    public Optional<JobApplication> getApplicationByJobAndApplicant(Job job, User applicant) {
        return jobApplicationRepository.findByJobAndApplicant(job, applicant);
    }
    
    public boolean hasApplied(Job job, User applicant) {
        return jobApplicationRepository.existsByJobAndApplicant(job, applicant);
    }
    
    @Transactional
    public JobApplication createApplication(JobApplication application) {
        return jobApplicationRepository.save(application);
    }
    
    @Transactional
    public JobApplication updateApplication(JobApplication application) {
        return jobApplicationRepository.save(application);
    }
    
    @Transactional
    public void deleteApplication(Long id) {
        jobApplicationRepository.deleteById(id);
    }
    
    @Transactional
    public JobApplication updateApplicationStatus(Long id, ApplicationStatus status) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(status);
        return jobApplicationRepository.save(application);
    }
    
    @Transactional
    public JobApplication addEmployerNotes(Long id, String notes) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setEmployerNotes(notes);
        return jobApplicationRepository.save(application);
    }
}
