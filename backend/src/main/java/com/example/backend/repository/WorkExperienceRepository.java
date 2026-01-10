package com.example.backend.repository;
import com.example.backend.model.Resume;
import com.example.backend.model.WorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
    List<WorkExperience> findByResume(Resume resume);
}
