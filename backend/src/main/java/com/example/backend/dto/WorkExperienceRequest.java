package com.example.backend.dto;

import lombok.Data;

@Data
public class WorkExperienceRequest {
    private String companyName;
    private String position;
    private String startDate;
    private String endDate;
    private String description;
}
