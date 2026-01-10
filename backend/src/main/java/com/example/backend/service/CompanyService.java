package com.example.backend.service;

import com.example.backend.model.Company;
import com.example.backend.model.User;
import com.example.backend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CompanyService {
    
    @Autowired
    private CompanyRepository companyRepository;
    
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }
    
    public Optional<Company> getCompanyById(Long id) {
        return companyRepository.findById(id);
    }
    
    public List<Company> getCompaniesByEmployer(User employer) {
        return companyRepository.findByEmployer(employer);
    }
    
    public List<Company> searchCompaniesByName(String name) {
        return companyRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<Company> searchCompaniesByIndustry(String industry) {
        return companyRepository.findByIndustryContainingIgnoreCase(industry);
    }
    
    public List<Company> getVerifiedCompanies(boolean isVerified) {
        return companyRepository.findByIsVerified(isVerified);
    }
    
    @Transactional
    public Company createCompany(Company company) {
        return companyRepository.save(company);
    }
    
    @Transactional
    public Company updateCompany(Company company) {
        return companyRepository.save(company);
    }
    
    @Transactional
    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);
    }
    
    @Transactional
    public Company verifyCompany(Long id, boolean verified) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setVerified(verified);
        return companyRepository.save(company);
    }
}
