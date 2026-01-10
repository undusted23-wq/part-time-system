package com.example.backend.repository;
import com.example.backend.model.Education;
import com.example.backend.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByResume(Resume resume);
}
