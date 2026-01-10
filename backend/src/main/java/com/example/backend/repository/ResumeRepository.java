package com.example.backend.repository;

import com.example.backend.model.Resume;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByStudent(User student);
    List<Resume> findByStudentAndIsActiveTrue(User student);
    Optional<Resume> findFirstByStudentAndIsDefaultTrueOrderByUpdatedAtDesc(User student);
}
