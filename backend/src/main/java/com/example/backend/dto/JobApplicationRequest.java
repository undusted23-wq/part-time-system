package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobApplicationRequest {
    @NotNull
    private Long jobId;
    
    private String coverLetter;
    
    private String resumeUrl;
}
