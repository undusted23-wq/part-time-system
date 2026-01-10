package com.example.backend.service;

import com.example.backend.model.Job;
import com.example.backend.model.SavedJob;
import com.example.backend.model.User;

import java.util.List;
import java.util.Optional;

public interface SavedJobService {
    List<SavedJob> getAllSavedJobs();
    Optional<SavedJob> getSavedJobById(Long id);
    List<SavedJob> getSavedJobsByStudent(User student);
    Optional<SavedJob> getSavedJobByStudentAndJob(User student, Job job);
    boolean isJobSavedByStudent(User student, Job job);
    SavedJob saveJob(SavedJob savedJob);
    SavedJob updateSavedJob(SavedJob savedJob);
    void unsaveJob(User student, Job job);
    void deleteSavedJob(Long id);
}
