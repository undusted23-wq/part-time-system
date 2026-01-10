package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference; 
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;     
import java.util.List;          

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "resumes")
public class Resume {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @Column(nullable = false)
    private String title;
    
    // --- 新增：文件上传路径 ---
    @Column(name = "resume_file_path")
    private String resumeFilePath;

    @Column(name = "file_url")
    private String fileUrl; 
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Column(columnDefinition = "TEXT")
    private String skills;
    
    // --- 修改：旧的String字段已注释掉 ---
    // @Column(columnDefinition = "TEXT")
    // private String education;
    
    // @Column(columnDefinition = "TEXT")
    // private String experience;

    // --- 重点：这里才是你要的 List ---
    // 关联 Education 表
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Education> educationList = new ArrayList<>();

    // 关联 WorkExperience 表
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<WorkExperience> workExperienceList = new ArrayList<>();
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "is_default")
    private boolean isDefault = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- 辅助方法 ---
    public void addEducation(Education education) {
        educationList.add(education);
        education.setResume(this);
    }

    public void addWorkExperience(WorkExperience work) {
        workExperienceList.add(work);
        work.setResume(this);
    }
}