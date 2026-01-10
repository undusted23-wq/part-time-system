package com.example.backend.model;

public enum ApplicationStatus {
    PENDING,     // Initial state when application is submitted
    REVIEWING,   // Employer is reviewing the application
    SHORTLISTED, // Application has been shortlisted
    INTERVIEW,   // Applicant has been invited for interview
    OFFERED,     // Job offer has been made
    ACCEPTED,    // Offer has been accepted by applicant
    REJECTED,    // Application has been rejected
    WITHDRAWN    // Applicant has withdrawn their application
}
