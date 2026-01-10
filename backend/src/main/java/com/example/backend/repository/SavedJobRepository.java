package com.example.backend.repository;

import com.example.backend.model.Job;
import com.example.backend.model.SavedJob;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findByStudent(User student);
    Optional<SavedJob> findByStudentAndJob(User student, Job job);
    boolean existsByStudentAndJob(User student, Job job);
    void deleteByStudentAndJob(User student, Job job);
}
