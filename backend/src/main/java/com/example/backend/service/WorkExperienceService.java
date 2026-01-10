package com.example.backend.service;

import com.example.backend.model.Resume;
import com.example.backend.model.WorkExperience;
import com.example.backend.repository.WorkExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class WorkExperienceService {

    @Autowired
    private WorkExperienceRepository workExperienceRepository;

    public Optional<WorkExperience> getWorkExperienceById(Long id) {
        return workExperienceRepository.findById(id);
    }

    public List<WorkExperience> getWorkExperienceByResume(Resume resume) {
        return workExperienceRepository.findByResume(resume);
    }

    @Transactional
    public WorkExperience createWorkExperience(WorkExperience workExperience) {
        return workExperienceRepository.save(workExperience);
    }

    @Transactional
    public WorkExperience updateWorkExperience(WorkExperience workExperience) {
        return workExperienceRepository.save(workExperience);
    }

    @Transactional
    public void deleteWorkExperience(Long id) {
        workExperienceRepository.deleteById(id);
    }
}
