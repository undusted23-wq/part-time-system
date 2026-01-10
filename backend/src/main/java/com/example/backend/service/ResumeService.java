package com.example.backend.service;

import com.example.backend.model.Resume;
import com.example.backend.model.User;

import java.util.List;
import java.util.Optional;

public interface ResumeService {
    List<Resume> getAllResumes();
    Optional<Resume> getResumeById(Long id);
    List<Resume> getResumesByStudent(User student);
    List<Resume> getActiveResumesByStudent(User student);
    Optional<Resume> getDefaultResume(User student);
    Resume createResume(Resume resume);
    Resume updateResume(Resume resume);
    void setDefaultResume(Long resumeId, User student);
    void deleteResume(Long id);
}
