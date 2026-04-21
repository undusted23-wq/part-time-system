package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.model.Resume;
import com.example.backend.model.User;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.ResumeService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.net.MalformedURLException;
import com.example.backend.repository.ResumeRepository; // 临时引入，为了方便
import com.example.backend.model.Education;
import com.example.backend.model.WorkExperience;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "http://localhost:1420", allowCredentials = "true") // <--- 加上这一行！
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Resume>> getAllResumes() {
        return ResponseEntity.ok(resumeService.getAllResumes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return resumeService.getResumeById(id)
                .map(resume -> {
                    // Only allow admins, or the student who owns the resume to view it
                    boolean isAdmin = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isOwner = resume.getStudent().getId().equals(userDetails.getId());
                    
                    if (isAdmin || isOwner) {
                        return ResponseEntity.ok(resume);
                    } else {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to view this resume"));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isUser(#studentId, authentication.name)")
    public ResponseEntity<?> getResumesByStudent(@PathVariable Long studentId) {
        return userService.getUserById(studentId)
                .map(student -> ResponseEntity.ok(resumeService.getResumesByStudent(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}/active")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isUser(#studentId, authentication.name)")
    public ResponseEntity<?> getActiveResumesByStudent(@PathVariable Long studentId) {
        return userService.getUserById(studentId)
                .map(student -> ResponseEntity.ok(resumeService.getActiveResumesByStudent(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}/default")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isUser(#studentId, authentication.name)")
    public ResponseEntity<?> getDefaultResume(@PathVariable Long studentId) {
        return userService.getUserById(studentId)
                .flatMap(student -> resumeService.getDefaultResume(student))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createResume(@Valid @RequestBody Resume resume) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User student = userService.getUserById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            resume.setStudent(student);
            Resume savedResume = resumeService.createResume(resume);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedResume);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create resume: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') and @securityService.isResumeOwner(#id, authentication.name)")
    public ResponseEntity<?> updateResume(@PathVariable Long id, @Valid @RequestBody Resume resumeDetails) {
        return resumeService.getResumeById(id)
                .map(resume -> {
                    // Update resume fields
                    resume.setTitle(resumeDetails.getTitle());
                    resume.setFileUrl(resumeDetails.getFileUrl());
                    resume.setSummary(resumeDetails.getSummary());
                    resume.setSkills(resumeDetails.getSkills());
                    resume.setActive(resumeDetails.isActive());
                    
                    // Update student/user information if provided
                    if (resumeDetails.getStudent() != null) {
                        User student = resume.getStudent();
                        User updatedStudent = resumeDetails.getStudent();
                        
                        if (updatedStudent.getFullName() != null) {
                            student.setFullName(updatedStudent.getFullName());
                        }
                        if (updatedStudent.getEmail() != null) {
                            student.setEmail(updatedStudent.getEmail());
                        }
                        if (updatedStudent.getPhoneNumber() != null) {
                            student.setPhoneNumber(updatedStudent.getPhoneNumber());
                        }
                        if (updatedStudent.getSkills() != null) {
                            student.setSkills(updatedStudent.getSkills());
                        }
                        
                        // Save the updated student information
                        userService.updateUser(student);
                    }
                    
                    return ResponseEntity.ok(resumeService.updateResume(resume));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/default")
    @PreAuthorize("hasRole('STUDENT') and @securityService.isResumeOwner(#id, authentication.name)")
    public ResponseEntity<?> setDefaultResume(@PathVariable Long id) {
        return resumeService.getResumeById(id)
                .map(resume -> {
                    User student = resume.getStudent();
                    resumeService.setDefaultResume(id, student);
                    return ResponseEntity.ok(new ApiResponse(true, "Resume set as default"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isResumeOwner(#id, authentication.name)")
    public ResponseEntity<?> deleteResume(@PathVariable Long id) {
        return resumeService.getResumeById(id)
                .map(resume -> {
                    resumeService.deleteResume(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Resume deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
// --- 为了实现文件功能，我们需要注入 Repository ---
    // 虽然最好放在 Service 层，但为了不破坏你现有的 Service 结构，我们先在这里注入
    @Autowired
    private ResumeRepository resumeRepository;
    
    private final Path fileStorageLocation = Paths.get("uploads", "resumes").toAbsolutePath().normalize();

    // 构造函数中初始化文件夹（如果你的Controller已经有构造函数，加在里面；没有就加这个代码块）
    {
        try {
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("无法创建上传目录", ex);
        }
    }

    // ==========================================
    // 1. 上传简历 PDF 文件
    // ==========================================
    @PostMapping("/{id}/upload")
    @PreAuthorize("hasRole('STUDENT') and @securityService.isResumeOwner(#id, authentication.name)")
    public ResponseEntity<?> uploadResumeFile(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return resumeService.getResumeById(id).map(resume -> {
            try {
                if (file.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new ApiResponse(false, "请选择要上传的简历文件"));
                }

                String contentType = file.getContentType();
                String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "resume.pdf");
                String lowerName = originalName.toLowerCase();
                boolean isPdf = "application/pdf".equalsIgnoreCase(contentType) || lowerName.endsWith(".pdf");
                if (!isPdf) {
                    return ResponseEntity.badRequest()
                            .body(new ApiResponse(false, "当前仅支持上传 PDF 简历，便于系统在线预览"));
                }

                String sanitizedName = Paths.get(originalName).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");
                String fileName = "resume_" + id + "_" + sanitizedName;
                Path targetLocation = fileStorageLocation.resolve(fileName).normalize();
                if (!targetLocation.startsWith(fileStorageLocation)) {
                    return ResponseEntity.badRequest()
                            .body(new ApiResponse(false, "非法的文件路径"));
                }
                
                // 保存文件
                Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                
                // 更新数据库
                resume.setResumeFilePath(fileName);
                resume.setFileUrl("/uploads/resumes/" + fileName);
                Resume savedResume = resumeRepository.save(resume); // 这里直接调用Repo保存
                
                return ResponseEntity.ok(savedResume);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse(false, "Upload failed: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // 2. 下载简历 PDF 文件
    // ==========================================
    @GetMapping("/{id}/download")
    // 允许 ADMIN 下载，或者 简历的主人 下载
    @PreAuthorize("hasRole('ADMIN') or @securityService.isResumeOwner(#id, authentication.name)")
    public ResponseEntity<Resource> downloadResumeFile(@PathVariable Long id) {
        var resumeOpt = resumeService.getResumeById(id);
        if (resumeOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        Resume resume = resumeOpt.get();
        String fileName = resume.getResumeFilePath();
        if ((fileName == null || fileName.isBlank()) && resume.getFileUrl() != null && resume.getFileUrl().startsWith("/uploads/resumes/")) {
            fileName = resume.getFileUrl().substring("/uploads/resumes/".length());
        }
        if (fileName == null || fileName.isBlank()) return ResponseEntity.notFound().build();

        try {
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                        .orElse(MediaType.APPLICATION_OCTET_STREAM);
                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            }
        } catch (MalformedURLException e) {
            // log error
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // 3. 添加一条教育经历
    // ==========================================
    @PostMapping("/{id}/education")
    @PreAuthorize("hasRole('STUDENT') and @securityService.isResumeOwner(#id, authentication.name)")
    public ResponseEntity<?> addEducation(@PathVariable Long id, @RequestBody Education education) {
        return resumeService.getResumeById(id).map(resume -> {
            resume.addEducation(education); // 使用我们在Model里写的辅助方法
            resumeRepository.save(resume);  // 保存主对象，级联保存教育经历
            return ResponseEntity.ok(resume);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // 4. 添加一条工作经历
    // ==========================================
    @PostMapping("/{id}/work-experience")
    @PreAuthorize("hasRole('STUDENT') and @securityService.isResumeOwner(#id, authentication.name)")
    public ResponseEntity<?> addWorkExperience(@PathVariable Long id, @RequestBody WorkExperience work) {
        return resumeService.getResumeById(id).map(resume -> {
            resume.addWorkExperience(work);
            resumeRepository.save(resume);
            return ResponseEntity.ok(resume);
        }).orElse(ResponseEntity.notFound().build());
    }
}
