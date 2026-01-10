package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRequest {
    @NotBlank
    private String name;
    
    private String description;
    
    private String industry;
    
    private String location;
    
    private String website;
    
    private String logoUrl;
    
    @Email
    private String contactEmail;
    
    private String contactPhone;
}
