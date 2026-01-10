package com.example.backend.dto;

import lombok.Data;

@Data
public class EducationRequest {
    private String schoolName;
    private String major;
    private String degree;
    private String startDate;
    private String endDate;
}
