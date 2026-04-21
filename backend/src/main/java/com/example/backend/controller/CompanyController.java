package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CompanyRequest;
import com.example.backend.model.Company;
import com.example.backend.model.User;
import com.example.backend.model.UserRole;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.CompanyService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final Path logoStorageLocation = Paths.get("uploads", "company-logos").toAbsolutePath().normalize();

    @Autowired
    private CompanyService companyService;

    @Autowired
    private UserService userService;

    {
        try {
            Files.createDirectories(logoStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("无法创建企业 Logo 上传目录", ex);
        }
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/verified")
    public ResponseEntity<List<Company>> getVerifiedCompanies() {
        return ResponseEntity.ok(companyService.getVerifiedCompanies(true));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCompanyById(@PathVariable Long id) {
        return companyService.getCompanyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/logo/{fileName:.+}")
    public ResponseEntity<Resource> getCompanyLogo(@PathVariable String fileName) {
        try {
            Path filePath = logoStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(logoStorageLocation)) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(resource);
        } catch (MalformedURLException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Company>> searchCompanies(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String industry) {
        
        if (name != null && !name.isEmpty()) {
            return ResponseEntity.ok(companyService.searchCompaniesByName(name));
        } else if (industry != null && !industry.isEmpty()) {
            return ResponseEntity.ok(companyService.searchCompaniesByIndustry(industry));
        } else {
            return ResponseEntity.ok(companyService.getAllCompanies());
        }
    }

    @GetMapping("/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Company>> getEmployerCompanies() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User employer = userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(companyService.getCompaniesByEmployer(employer));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> createCompany(@Valid @RequestBody CompanyRequest companyRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User employer = userService.getUserById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (employer.getRole() != UserRole.EMPLOYER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "Only employers can create companies"));
            }

            Company company = new Company();
            company.setName(companyRequest.getName());
            company.setDescription(companyRequest.getDescription());
            company.setIndustry(companyRequest.getIndustry());
            company.setLocation(companyRequest.getLocation());
            company.setWebsite(companyRequest.getWebsite());
            company.setLogoUrl(companyRequest.getLogoUrl());
            company.setContactEmail(companyRequest.getContactEmail());
            company.setContactPhone(companyRequest.getContactPhone());
            company.setEmployer(employer);
            company.setVerified(false); // New companies start as unverified

            Company createdCompany = companyService.createCompany(company);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCompany);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to create company: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateCompany(@PathVariable Long id, @Valid @RequestBody CompanyRequest companyRequest) {
        return companyService.getCompanyById(id)
                .map(company -> {
                    // Check if the current user is the employer or an admin
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                    boolean isAdmin = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isOwner = company.getEmployer().getId().equals(userDetails.getId());

                    if (!isAdmin && !isOwner) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to update this company"));
                    }

                    company.setName(companyRequest.getName());
                    company.setDescription(companyRequest.getDescription());
                    company.setIndustry(companyRequest.getIndustry());
                    company.setLocation(companyRequest.getLocation());
                    company.setWebsite(companyRequest.getWebsite());
                    company.setLogoUrl(companyRequest.getLogoUrl());
                    company.setContactEmail(companyRequest.getContactEmail());
                    company.setContactPhone(companyRequest.getContactPhone());

                    return ResponseEntity.ok(companyService.updateCompany(company));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/logo")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadCompanyLogo(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return companyService.getCompanyById(id)
                .map(company -> {
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                    boolean isAdmin = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isOwner = company.getEmployer().getId().equals(userDetails.getId());

                    if (!isAdmin && !isOwner) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to update this company logo"));
                    }

                    if (file.isEmpty()) {
                        return ResponseEntity.badRequest().body(new ApiResponse(false, "请选择要上传的图片"));
                    }

                    String contentType = file.getContentType();
                    if (contentType == null || !contentType.startsWith("image/")) {
                        return ResponseEntity.badRequest().body(new ApiResponse(false, "仅支持上传图片文件"));
                    }

                    if (file.getSize() > 2 * 1024 * 1024) {
                        return ResponseEntity.badRequest().body(new ApiResponse(false, "Logo 文件大小不能超过 2MB"));
                    }

                    try {
                        String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "logo");
                        String extension = "";
                        int lastDot = originalName.lastIndexOf('.');
                        if (lastDot >= 0) {
                            extension = originalName.substring(lastDot).replaceAll("[^a-zA-Z0-9.]", "");
                        }

                        String storedFileName = "company_" + id + "_" + UUID.randomUUID() + extension;
                        Path targetLocation = logoStorageLocation.resolve(storedFileName).normalize();
                        if (!targetLocation.startsWith(logoStorageLocation)) {
                            return ResponseEntity.badRequest().body(new ApiResponse(false, "非法的文件路径"));
                        }
                        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                        deleteOldLogoIfManagedBySystem(company.getLogoUrl());

                        company.setLogoUrl("/api/companies/logo/" + storedFileName);
                        Company updatedCompany = companyService.updateCompany(company);
                        return ResponseEntity.ok(updatedCompany);
                    } catch (IOException ex) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(new ApiResponse(false, "上传 Logo 失败: " + ex.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyCompany(@PathVariable Long id, @RequestParam boolean verified) {
        try {
            Company company = companyService.verifyCompany(id, verified);
            return ResponseEntity.ok(company);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update verification status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCompanyOwner(#id, authentication.name)")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        return companyService.getCompanyById(id)
                .map(company -> {
                    companyService.deleteCompany(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Company deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void deleteOldLogoIfManagedBySystem(String logoUrl) {
        if (logoUrl == null || !logoUrl.startsWith("/api/companies/logo/")) {
            return;
        }

        String fileName = logoUrl.substring("/api/companies/logo/".length());
        Path oldFile = logoStorageLocation.resolve(fileName).normalize();
        if (!oldFile.startsWith(logoStorageLocation)) {
            return;
        }

        try {
            Files.deleteIfExists(oldFile);
        } catch (IOException ignored) {
            // Ignore cleanup failures so they don't block the upload flow.
        }
    }
}
