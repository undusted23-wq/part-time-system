package com.example.backend.service;

import com.example.backend.model.Education;
import com.example.backend.model.Resume;
import com.example.backend.repository.EducationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EducationService {

    @Autowired
    private EducationRepository educationRepository;

    public Optional<Education> getEducationById(Long id) {
        return educationRepository.findById(id);
    }

    public List<Education> getEducationByResume(Resume resume) {
        return educationRepository.findByResume(resume);
    }

    @Transactional
    public Education createEducation(Education education) {
        return educationRepository.save(education);
    }

    @Transactional
    public Education updateEducation(Education education) {
        return educationRepository.save(education);
    }

    @Transactional
    public void deleteEducation(Long id) {
        educationRepository.deleteById(id);
    }
}
