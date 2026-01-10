package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MessageUpdateRequest {
    @NotBlank
    private String subject;

    @NotBlank
    private String content;

    private Long relatedJobId;

    private Long relatedApplicationId;
}
