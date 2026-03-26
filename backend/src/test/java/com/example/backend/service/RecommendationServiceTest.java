package com.example.backend.service;

import com.example.backend.model.Company;
import com.example.backend.model.Job;
import com.example.backend.model.JobApplication;
import com.example.backend.model.JobType;
import com.example.backend.model.Resume;
import com.example.backend.model.SalaryPeriod;
import com.example.backend.model.SavedJob;
import com.example.backend.model.User;
import com.example.backend.model.UserRole;
import com.example.backend.repository.JobApplicationRepository;
import com.example.backend.repository.JobRepository;
import com.example.backend.repository.ResumeRepository;
import com.example.backend.repository.SavedJobRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private SavedJobRepository savedJobRepository;

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @InjectMocks
    private RecommendationService recommendationService;

    @Test
    void shouldRankMatchingJobsFirstAndMoveAppliedJobsToEnd() {
        User student = buildStudent(1L, "Java 数据分析 Excel 沟通");
        Resume resume = new Resume();
        resume.setStudent(student);
        resume.setTitle("校园兼职简历");
        resume.setSkills("Java Excel 数据分析");
        resume.setSummary("熟悉报表整理、数据清洗和基础开发");
        resume.setDefault(true);
        resume.setUpdatedAt(LocalDateTime.now());

        Job matchingJob = buildJob(
                11L,
                "校园数据分析助理",
                "负责 Excel 报表整理和数据统计",
                "熟悉数据分析、Excel 和沟通协作",
                new BigDecimal("180"),
                LocalDateTime.now().minusDays(1)
        );
        Job unrelatedJob = buildJob(
                12L,
                "餐厅服务员",
                "负责点餐、传菜和门店服务",
                "吃苦耐劳，有服务意识",
                new BigDecimal("120"),
                LocalDateTime.now().minusDays(2)
        );
        Job appliedJob = buildJob(
                13L,
                "Java 开发助理",
                "参与系统维护和接口开发",
                "熟悉 Java 与数据库",
                new BigDecimal("220"),
                LocalDateTime.now().minusHours(10)
        );

        SavedJob savedJob = new SavedJob();
        savedJob.setStudent(student);
        savedJob.setJob(matchingJob);

        JobApplication application = new JobApplication();
        application.setApplicant(student);
        application.setJob(appliedJob);

        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findByIsActiveTrue()).thenReturn(List.of(matchingJob, unrelatedJob, appliedJob));
        when(resumeRepository.findFirstByStudentAndIsDefaultTrueOrderByUpdatedAtDesc(student)).thenReturn(Optional.of(resume));
        when(savedJobRepository.findByStudent(student)).thenReturn(List.of(savedJob));
        when(jobApplicationRepository.findByApplicant(student)).thenReturn(List.of(application));

        List<Job> result = recommendationService.getRecommendedJobs(1L);

        assertThat(result).extracting(Job::getId)
                .containsExactly(11L, 12L, 13L);
    }

    @Test
    void shouldFallbackToGenericProfileWhenStudentHasNoResumeOrSkills() {
        User student = buildStudent(2L, null);

        Job campusJob = buildJob(
                21L,
                "校园兼职客服",
                "面向学生提供咨询和排班支持",
                "沟通积极，能接受灵活排班",
                new BigDecimal("150"),
                LocalDateTime.now().minusHours(6)
        );
        Job normalJob = buildJob(
                22L,
                "仓库分拣员",
                "负责货品整理和分拣",
                "做事认真",
                new BigDecimal("150"),
                LocalDateTime.now().minusDays(3)
        );

        when(userRepository.findById(2L)).thenReturn(Optional.of(student));
        when(jobRepository.findByIsActiveTrue()).thenReturn(List.of(normalJob, campusJob));
        when(resumeRepository.findFirstByStudentAndIsDefaultTrueOrderByUpdatedAtDesc(student)).thenReturn(Optional.empty());
        when(resumeRepository.findByStudentAndIsActiveTrue(student)).thenReturn(List.of());
        when(savedJobRepository.findByStudent(student)).thenReturn(List.of());
        when(jobApplicationRepository.findByApplicant(student)).thenReturn(List.of());

        List<Job> result = recommendationService.getRecommendedJobs(2L);

        assertThat(result).extracting(Job::getId)
                .containsExactly(21L, 22L);
    }

    private User buildStudent(Long id, String skills) {
        User user = new User();
        user.setId(id);
        user.setUsername("student-" + id);
        user.setEmail("student-" + id + "@example.com");
        user.setRole(UserRole.STUDENT);
        user.setSkills(skills);
        return user;
    }

    private Job buildJob(
            Long id,
            String title,
            String description,
            String requirements,
            BigDecimal salary,
            LocalDateTime createdAt
    ) {
        Company company = new Company();
        company.setId(id + 100);
        company.setName("企业" + id);
        company.setIndustry("互联网教育");
        company.setDescription("提供校园招聘与学生服务");
        company.setLocation("上海");

        Job job = new Job();
        job.setId(id);
        job.setTitle(title);
        job.setDescription(description);
        job.setRequirements(requirements);
        job.setSalary(salary);
        job.setSalaryPeriod(SalaryPeriod.HOURLY);
        job.setJobType(JobType.PART_TIME);
        job.setLocation("上海");
        job.setCompany(company);
        job.setCreatedAt(createdAt);
        job.setApplicationDeadline(LocalDateTime.now().plusDays(7));
        job.setActive(true);
        return job;
    }
}
