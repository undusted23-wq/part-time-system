package com.example.backend.service.impl;

import com.example.backend.model.Job;
import com.example.backend.model.SavedJob;
import com.example.backend.model.User;
import com.example.backend.repository.SavedJobRepository;
import com.example.backend.service.SavedJobService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SavedJobServiceImpl implements SavedJobService {

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Override
    public List<SavedJob> getAllSavedJobs() {
        return savedJobRepository.findAll();
    }

    @Override
    public Optional<SavedJob> getSavedJobById(Long id) {
        return savedJobRepository.findById(id);
    }

    @Override
    public List<SavedJob> getSavedJobsByStudent(User student) {
        return savedJobRepository.findByStudent(student);
    }

    @Override
    public Optional<SavedJob> getSavedJobByStudentAndJob(User student, Job job) {
        return savedJobRepository.findByStudentAndJob(student, job);
    }

    @Override
    public boolean isJobSavedByStudent(User student, Job job) {
        return savedJobRepository.existsByStudentAndJob(student, job);
    }

    @Override
    public SavedJob saveJob(SavedJob savedJob) {
        // Ensure saved time is set
        if (savedJob.getSavedAt() == null) {
            savedJob.setSavedAt(LocalDateTime.now());
        }
        
        return savedJobRepository.save(savedJob);
    }

    @Override
    public SavedJob updateSavedJob(SavedJob savedJob) {
        return savedJobRepository.save(savedJob);
    }

    @Override
    @Transactional
    public void unsaveJob(User student, Job job) {
        savedJobRepository.deleteByStudentAndJob(student, job);
    }

    @Override
    public void deleteSavedJob(Long id) {
        savedJobRepository.deleteById(id);
    }
}
