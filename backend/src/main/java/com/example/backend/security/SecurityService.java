package com.example.backend.security;

import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.JobApplication;
import com.example.backend.model.Message;
import com.example.backend.model.Review;
import com.example.backend.model.Resume;
import com.example.backend.model.SavedJob;
import com.example.backend.model.User;
import com.example.backend.service.CompanyService;
import com.example.backend.service.JobApplicationService;
import com.example.backend.service.JobService;
import com.example.backend.service.MessageService;
import com.example.backend.service.ReviewService;
import com.example.backend.service.ResumeService;
import com.example.backend.service.SavedJobService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("securityService")
public class SecurityService {

    @Autowired
    private UserService userService;

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private SavedJobService savedJobService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private JobService jobService;

    @Autowired
    private JobApplicationService applicationService;

    public boolean isUser(Long userId, String username) {
        if (userId == null || username == null) {
            return false;
        }
        return userService.getUserById(userId)
                .map(user -> username.equals(user.getUsername()))
                .orElse(false);
    }

    public boolean isResumeOwner(Long resumeId, String username) {
        return getResume(resumeId)
                .map(resume -> isOwnerUsername(resume.getStudent(), username))
                .orElse(false);
    }

    public boolean isSavedJobOwner(Long savedJobId, String username) {
        return getSavedJob(savedJobId)
                .map(savedJob -> isOwnerUsername(savedJob.getStudent(), username))
                .orElse(false);
    }

    public boolean isReviewOwner(Long reviewId, String username) {
        return getReview(reviewId)
                .map(review -> isOwnerUsername(review.getStudent(), username))
                .orElse(false);
    }

    public boolean isMessageParticipant(Long messageId, String username) {
        if (messageId == null || username == null) {
            return false;
        }
        return messageService.getMessageById(messageId)
                .map(message -> isOwnerUsername(message.getSender(), username)
                        || isOwnerUsername(message.getReceiver(), username))
                .orElse(false);
    }

    public boolean isCompanyOwner(Long companyId, String username) {
        return getCompany(companyId)
                .map(company -> isOwnerUsername(company.getEmployer(), username))
                .orElse(false);
    }

    public boolean isJobOwner(Long jobId, String username) {
        return getJob(jobId)
                .map(job -> isOwnerUsername(job.getCompany().getEmployer(), username))
                .orElse(false);
    }

    public boolean isJobEmployer(Long jobId, String username) {
        return isJobOwner(jobId, username);
    }

    public boolean isApplicationApplicant(Long applicationId, String username) {
        return getApplication(applicationId)
                .map(app -> isOwnerUsername(app.getApplicant(), username))
                .orElse(false);
    }

    public boolean isApplicationEmployer(Long applicationId, String username) {
        return getApplication(applicationId)
                .map(app -> isOwnerUsername(app.getJob().getCompany().getEmployer(), username))
                .orElse(false);
    }

    private Optional<Resume> getResume(Long resumeId) {
        if (resumeId == null) {
            return Optional.empty();
        }
        return resumeService.getResumeById(resumeId);
    }

    private Optional<SavedJob> getSavedJob(Long savedJobId) {
        if (savedJobId == null) {
            return Optional.empty();
        }
        return savedJobService.getSavedJobById(savedJobId);
    }

    private Optional<Review> getReview(Long reviewId) {
        if (reviewId == null) {
            return Optional.empty();
        }
        return reviewService.getReviewById(reviewId);
    }

    private Optional<Company> getCompany(Long companyId) {
        if (companyId == null) {
            return Optional.empty();
        }
        return companyService.getCompanyById(companyId);
    }

    private Optional<Job> getJob(Long jobId) {
        if (jobId == null) {
            return Optional.empty();
        }
        return jobService.getJobById(jobId);
    }

    private Optional<JobApplication> getApplication(Long applicationId) {
        if (applicationId == null) {
            return Optional.empty();
        }
        return applicationService.getApplicationById(applicationId);
    }

    private boolean isOwnerUsername(User user, String username) {
        if (user == null || username == null) {
            return false;
        }
        return username.equals(user.getUsername());
    }
}
