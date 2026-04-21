package com.example.backend.controller;

import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.Review;
import com.example.backend.model.ReviewAuthorType;
import com.example.backend.service.CompanyService;
import com.example.backend.service.JobService;
import com.example.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 游客模块控制器
 * 提供不需要认证的公开接口，供未登录用户浏览企业、兼职和评价信息
 */
@RestController
@RequestMapping("/api/public")
public class VisitorController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private JobService jobService;

    @Autowired
    private ReviewService reviewService;

    /**
     * 获取所有企业列表（仅已认证的企业）
     */
    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getAllCompanies() {
        // 仅返回已认证的企业
        return ResponseEntity.ok(companyService.getVerifiedCompanies(true));
    }

    /**
     * 根据ID获取企业详情
     */
    @GetMapping("/companies/{id}")
    public ResponseEntity<?> getCompanyById(@PathVariable Long id) {
        return companyService.getCompanyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 搜索企业（按名称或行业）
     */
    @GetMapping("/companies/search")
    public ResponseEntity<List<Company>> searchCompanies(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String industry) {
        
        if (name != null && !name.isEmpty()) {
            List<Company> companies = companyService.searchCompaniesByName(name);
            // 仅返回已认证的企业
            List<Company> verified = companies.stream()
                    .filter(Company::isVerified)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(verified);
        } else if (industry != null && !industry.isEmpty()) {
            List<Company> companies = companyService.searchCompaniesByIndustry(industry);
            // 仅返回已认证的企业
            List<Company> verified = companies.stream()
                    .filter(Company::isVerified)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(verified);
        } else {
            return ResponseEntity.ok(companyService.getVerifiedCompanies(true));
        }
    }

    /**
     * 获取所有活跃的兼职岗位
     */
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        // 仅返回活跃的岗位
        return ResponseEntity.ok(jobService.getActiveJobs());
    }

    /**
     * 根据ID获取兼职详情
     */
    @GetMapping("/jobs/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 获取指定企业的所有兼职岗位
     */
    @GetMapping("/jobs/company/{companyId}")
    public ResponseEntity<?> getJobsByCompany(@PathVariable Long companyId) {
        return companyService.getCompanyById(companyId)
                .map(company -> {
                    List<Job> jobs = jobService.getJobsByCompany(company);
                    // 仅返回活跃的岗位
                    List<Job> activeJobs = jobs.stream()
                            .filter(Job::isActive)
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(activeJobs);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 搜索兼职岗位
     */
    @GetMapping("/jobs/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String keyword) {
        
        if (keyword != null && !keyword.isEmpty()) {
            return ResponseEntity.ok(jobService.searchActiveJobs(keyword));
        } else {
            return ResponseEntity.ok(jobService.getActiveJobs());
        }
    }

    /**
     * 获取所有评价
     */
    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(
                reviewService.getAllReviews().stream()
                        .filter(Review::isVerified)
                        .filter(review -> review.getReviewerRole() == ReviewAuthorType.STUDENT)
                        .toList()
        );
    }

    /**
     * 根据ID获取评价详情
     */
    @GetMapping("/reviews/{id}")
    public ResponseEntity<?> getReviewById(@PathVariable Long id) {
        return reviewService.getReviewById(id)
                .filter(Review::isVerified)
                .filter(review -> review.getReviewerRole() == ReviewAuthorType.STUDENT)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 获取指定企业的所有评价及统计信息
     */
    @GetMapping("/reviews/company/{companyId}")
    public ResponseEntity<?> getReviewsByCompany(@PathVariable Long companyId) {
        return companyService.getCompanyById(companyId)
                .map(company -> {
                    Map<String, Object> response = new HashMap<>();
                    List<Review> reviews = reviewService.getReviewsReceivedByCompany(company).stream()
                            .filter(Review::isVerified)
                            .toList();
                    double avgRating = reviews.isEmpty()
                            ? 0.0
                            : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
                    long count = reviews.size();
                    
                    response.put("reviews", reviews);
                    response.put("averageRating", avgRating);
                    response.put("count", count);
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 获取指定兼职的所有评价
     */
    @GetMapping("/reviews/job/{jobId}")
    public ResponseEntity<?> getReviewsByJob(@PathVariable Long jobId) {
        return jobService.getJobById(jobId)
                .map(job -> ResponseEntity.ok(
                        reviewService.getReviewsByJob(job).stream()
                                .filter(Review::isVerified)
                                .filter(review -> review.getReviewerRole() == ReviewAuthorType.STUDENT)
                                .toList()
                ))
                .orElse(ResponseEntity.notFound().build());
    }
}
