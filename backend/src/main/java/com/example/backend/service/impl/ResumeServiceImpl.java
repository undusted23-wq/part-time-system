package com.example.backend.service.impl;

import com.example.backend.model.Resume;
import com.example.backend.model.User;
import com.example.backend.repository.ResumeRepository;
import com.example.backend.service.ResumeService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ResumeServiceImpl implements ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Override
    public List<Resume> getAllResumes() {
        return resumeRepository.findAll();
    }

    @Override
    public Optional<Resume> getResumeById(Long id) {
        return resumeRepository.findById(id);
    }

    @Override
    public List<Resume> getResumesByStudent(User student) {
        return resumeRepository.findByStudentOrderByIdDesc(student);
    }

    @Override
    public List<Resume> getActiveResumesByStudent(User student) {
        return resumeRepository.findByStudentAndIsActiveTrue(student);
    }

    @Override
    public Optional<Resume> getDefaultResume(User student) {
        Optional<Resume> defaultResume = resumeRepository.findFirstByStudentAndIsDefaultTrueOrderByUpdatedAtDesc(student);
        if (defaultResume.isPresent()) {
            return defaultResume;
        }

        return resumeRepository.findFirstByStudentAndIsActiveTrueOrderByIdDesc(student);
    }

    @Override
    public Resume createResume(Resume resume) {
        // Set creation timestamp if not already set
        if (resume.getCreatedAt() == null) {
            resume.setCreatedAt(LocalDateTime.now());
        }
        resume.setUpdatedAt(LocalDateTime.now());
        
        // If this is the first resume for a student, make it default
        if (resumeRepository.findByStudentOrderByIdDesc(resume.getStudent()).isEmpty()) {
            resume.setDefault(true);
        }
        
        return resumeRepository.save(resume);
    }

    @Override
    public Resume updateResume(Resume resume) {
        resume.setUpdatedAt(LocalDateTime.now());
        return resumeRepository.save(resume);
    }

    @Override
    @Transactional
    public void setDefaultResume(Long resumeId, User student) {
        // First, unset default for all resumes of this student
        List<Resume> studentResumes = resumeRepository.findByStudentOrderByIdDesc(student);
        for (Resume r : studentResumes) {
            r.setDefault(false);
            resumeRepository.save(r);
        }
        
        // Then set the specified resume as default
        resumeRepository.findById(resumeId).ifPresent(resume -> {
            resume.setDefault(true);
            resumeRepository.save(resume);
        });
    }

    @Override
    public void deleteResume(Long id) {
        resumeRepository.deleteById(id);
    }
}
