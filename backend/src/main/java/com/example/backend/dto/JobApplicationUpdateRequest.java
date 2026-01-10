package com.example.backend.dto;

import lombok.Data;

@Data
public class JobApplicationUpdateRequest {
    private String coverLetter;
    private String resumeUrl;
}
