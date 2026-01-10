package com.example.backend.repository;

import com.example.backend.model.Company;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByEmployer(User employer);
    List<Company> findByNameContainingIgnoreCase(String name);
    List<Company> findByIndustryContainingIgnoreCase(String industry);
    List<Company> findByIsVerified(boolean isVerified);
}
