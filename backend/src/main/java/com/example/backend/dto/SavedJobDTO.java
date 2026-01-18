package com.example.backend.dto;

import com.example.backend.model.Job;
import com.example.backend.model.SavedJob;
import com.example.backend.model.User;

import java.time.LocalDateTime;

public class SavedJobDTO {
    private Long id;
    private User student;
    private Job job;
    private LocalDateTime savedAt;
    private String notes;
    private boolean isApplied;

    public SavedJobDTO() {}

    public SavedJobDTO(Long id, User student, Job job, LocalDateTime savedAt, String notes, boolean isApplied) {
        this.id = id;
        this.student = student;
        this.job = job;
        this.savedAt = savedAt;
        this.notes = notes;
        this.isApplied = isApplied;
    }

    public static SavedJobDTO fromSavedJob(SavedJob savedJob, boolean isApplied) {
        return new SavedJobDTO(
            savedJob.getId(),
            savedJob.getStudent(),
            savedJob.getJob(),
            savedJob.getSavedAt(),
            savedJob.getNotes(),
            isApplied
        );
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isApplied() { return isApplied; }
    public void setApplied(boolean applied) { isApplied = applied; }
}