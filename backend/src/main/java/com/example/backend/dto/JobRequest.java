package com.example.backend.dto;

import com.example.backend.model.JobType;
import com.example.backend.model.SalaryPeriod;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class JobRequest {
    @NotBlank
    private String title;
    
    @NotBlank
    private String description;
    
    @NotNull
    private JobType jobType;
    
    private String location;
    
    @NotNull
    @Positive
    private BigDecimal salary;
    
    @NotNull
    private SalaryPeriod salaryPeriod;
    
    private String requirements;
    
    private String benefits;
    
    private String workingHours;
    
    @NotNull
    private Long companyId;
    
    @Future
    private LocalDateTime applicationDeadline;
}
