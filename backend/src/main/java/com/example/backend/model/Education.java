package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data; // 确保你装了Lombok，或者手动写Getter/Setter
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@Table(name = "education")
public class Education {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String schoolName;
    private String major;
    private String degree;       // 本科/高中等
    private String startDate;
    private String endDate;

    // 关联回简历，JsonBackReference防止死循环
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    @JsonBackReference 
    private Resume resume;
}