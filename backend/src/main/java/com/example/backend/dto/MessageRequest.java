package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequest {
    @NotBlank
    private String subject;

    @NotBlank
    private String content;

    @NotNull
    private Long receiverId;

    private Long relatedJobId;

    private Long relatedApplicationId;
}
