package com.example.backend.service;

import com.example.backend.model.Education;
import com.example.backend.model.Job;
import com.example.backend.model.JobApplication;
import com.example.backend.model.Resume;
import com.example.backend.model.SavedJob;
import com.example.backend.model.User;
import com.example.backend.model.WorkExperience;
import com.example.backend.repository.JobApplicationRepository;
import com.example.backend.repository.JobRepository;
import com.example.backend.repository.ResumeRepository;
import com.example.backend.repository.SavedJobRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RecommendationService {

    private static final Pattern LATIN_TOKEN_PATTERN = Pattern.compile("[a-zA-Z0-9+#.]{2,}");
    private static final Pattern CHINESE_BLOCK_PATTERN = Pattern.compile("[\\u4e00-\\u9fff]{2,}");
    private static final Set<String> STOP_WORDS = Set.of(
            "兼职", "岗位", "工作", "负责", "要求", "能够", "以及", "相关", "进行", "具有",
            "我们", "你将", "优先", "提供", "需要", "经验", "岗位职责", "任职要求",
            "the", "and", "for", "with", "you", "are", "job", "work", "will", "this"
    );
    private static final String DEFAULT_PROFILE_TEXT = "学生兼职 校园 灵活排班 沟通协作 客服 助理 文员 销售";

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public RecommendationService(
            JobRepository jobRepository,
            UserRepository userRepository,
            ResumeRepository resumeRepository,
            SavedJobRepository savedJobRepository,
            JobApplicationRepository jobApplicationRepository
    ) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.savedJobRepository = savedJobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public List<Job> getRecommendedJobs(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Job> activeJobs = jobRepository.findByIsActiveTrue();
        if (activeJobs.isEmpty()) {
            return List.of();
        }

        RecommendationProfile profile = buildRecommendationProfile(user);
        Set<Long> appliedJobIds = loadAppliedJobIds(user);

        List<Job> candidateJobs = activeJobs.stream()
                .filter(job -> !appliedJobIds.contains(job.getId()))
                .toList();

        List<Job> rankedCandidates = rankJobs(
                candidateJobs.isEmpty() ? activeJobs : candidateJobs,
                profile
        );

        if (candidateJobs.isEmpty()) {
            return rankedCandidates;
        }

        List<Job> appliedJobs = activeJobs.stream()
                .filter(job -> appliedJobIds.contains(job.getId()))
                .toList();

        List<Job> result = new ArrayList<>(rankedCandidates);
        result.addAll(rankJobs(appliedJobs, profile));
        return result;
    }

    private RecommendationProfile buildRecommendationProfile(User user) {
        Map<String, Double> profileVector = new HashMap<>();
        Set<String> skillTerms = new LinkedHashSet<>();

        addTextWeight(profileVector, user.getSkills(), 4.2, skillTerms);
        addTextWeight(profileVector, user.getFullName(), 0.2, null);

        Optional<Resume> defaultResume = resumeRepository.findFirstByStudentAndIsDefaultTrueOrderByUpdatedAtDesc(user);
        if (defaultResume.isPresent()) {
            mergeResumeProfile(profileVector, skillTerms, defaultResume.get(), 1.0);
        } else {
            resumeRepository.findByStudentAndIsActiveTrue(user).stream()
                    .max(Comparator.comparing(Resume::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                    .ifPresent(resume -> mergeResumeProfile(profileVector, skillTerms, resume, 0.85));
        }

        Map<String, Double> behaviorVector = new HashMap<>();
        for (SavedJob savedJob : savedJobRepository.findByStudent(user)) {
            addJobWeight(behaviorVector, savedJob.getJob(), 2.3);
        }
        for (JobApplication application : jobApplicationRepository.findByApplicant(user)) {
            addJobWeight(behaviorVector, application.getJob(), 1.8);
        }

        if (profileVector.isEmpty()) {
            addTextWeight(profileVector, DEFAULT_PROFILE_TEXT, 1.0, skillTerms);
        }

        normalize(profileVector);
        normalize(behaviorVector);
        return new RecommendationProfile(profileVector, behaviorVector, skillTerms);
    }

    private void mergeResumeProfile(Map<String, Double> profileVector, Set<String> skillTerms, Resume resume, double scale) {
        addTextWeight(profileVector, resume.getTitle(), 1.0 * scale, null);
        addTextWeight(profileVector, resume.getSkills(), 3.8 * scale, skillTerms);
        addTextWeight(profileVector, resume.getSummary(), 2.6 * scale, null);

        for (Education education : resume.getEducationList()) {
            addTextWeight(profileVector, education.getMajor(), 1.6 * scale, skillTerms);
            addTextWeight(profileVector, education.getDegree(), 0.8 * scale, null);
            addTextWeight(profileVector, education.getSchoolName(), 0.5 * scale, null);
        }

        for (WorkExperience experience : resume.getWorkExperienceList()) {
            addTextWeight(profileVector, experience.getPosition(), 1.9 * scale, skillTerms);
            addTextWeight(profileVector, experience.getDescription(), 1.4 * scale, null);
            addTextWeight(profileVector, experience.getCompanyName(), 0.6 * scale, null);
        }
    }

    private Set<Long> loadAppliedJobIds(User user) {
        Set<Long> appliedJobIds = new HashSet<>();
        for (JobApplication application : jobApplicationRepository.findByApplicant(user)) {
            if (application.getJob() != null && application.getJob().getId() != null) {
                appliedJobIds.add(application.getJob().getId());
            }
        }
        return appliedJobIds;
    }

    private List<Job> rankJobs(List<Job> jobs, RecommendationProfile profile) {
        return jobs.stream()
                .sorted(Comparator
                        .comparingDouble((Job job) -> calculateScore(job, profile)).reversed()
                        .thenComparing(Job::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Job::getSalary, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Job::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private double calculateScore(Job job, RecommendationProfile profile) {
        Map<String, Double> jobVector = new HashMap<>();
        Set<String> jobTerms = new LinkedHashSet<>();
        addJobWeight(jobVector, job, 1.0, jobTerms);
        normalize(jobVector);

        double contentSimilarity = cosineSimilarity(profile.profileVector(), jobVector);
        double behaviorSimilarity = profile.behaviorVector().isEmpty()
                ? 0.0
                : cosineSimilarity(profile.behaviorVector(), jobVector);
        double skillOverlap = overlapScore(profile.skillTerms(), jobTerms);
        double titleFocus = overlapScore(profile.skillTerms(), extractTerms(job.getTitle()));
        double freshness = freshnessScore(job);
        double salaryBoost = salaryScore(job.getSalary());

        return contentSimilarity * 0.55
                + behaviorSimilarity * 0.23
                + skillOverlap * 0.12
                + titleFocus * 0.05
                + freshness * 0.03
                + salaryBoost * 0.02;
    }

    private void addJobWeight(Map<String, Double> vector, Job job, double scale) {
        addJobWeight(vector, job, scale, null);
    }

    private void addJobWeight(Map<String, Double> vector, Job job, double scale, Set<String> termCollector) {
        if (job == null) {
            return;
        }
        addTextWeight(vector, job.getTitle(), 3.4 * scale, termCollector);
        addTextWeight(vector, job.getDescription(), 2.8 * scale, termCollector);
        addTextWeight(vector, job.getRequirements(), 3.2 * scale, termCollector);
        addTextWeight(vector, job.getBenefits(), 1.0 * scale, termCollector);
        addTextWeight(vector, job.getWorkingHours(), 0.8 * scale, termCollector);
        addTextWeight(vector, job.getLocation(), 1.1 * scale, termCollector);
        if (job.getJobType() != null) {
            addTextWeight(vector, job.getJobType().name(), 1.0 * scale, termCollector);
        }
        if (job.getSalaryPeriod() != null) {
            addTextWeight(vector, job.getSalaryPeriod().name(), 0.6 * scale, termCollector);
        }
        if (job.getCompany() != null) {
            addTextWeight(vector, job.getCompany().getName(), 0.8 * scale, termCollector);
            addTextWeight(vector, job.getCompany().getIndustry(), 1.4 * scale, termCollector);
            addTextWeight(vector, job.getCompany().getDescription(), 0.9 * scale, termCollector);
            addTextWeight(vector, job.getCompany().getLocation(), 0.7 * scale, termCollector);
        }
    }

    private void addTextWeight(Map<String, Double> vector, String text, double weight, Set<String> skillCollector) {
        if (text == null || text.isBlank()) {
            return;
        }
        for (String term : extractTerms(text)) {
            vector.merge(term, weight, Double::sum);
            if (skillCollector != null) {
                skillCollector.add(term);
            }
        }
    }

    private Set<String> extractTerms(String text) {
        Set<String> terms = new LinkedHashSet<>();
        if (text == null || text.isBlank()) {
            return terms;
        }

        String normalized = text.toLowerCase(Locale.ROOT)
                .replace('，', ' ')
                .replace('。', ' ')
                .replace('、', ' ')
                .replace('；', ' ')
                .replace('：', ' ')
                .replace('/', ' ')
                .replace('|', ' ')
                .replace('\n', ' ')
                .replace('\r', ' ');

        Matcher latinMatcher = LATIN_TOKEN_PATTERN.matcher(normalized);
        while (latinMatcher.find()) {
            maybeAddTerm(terms, latinMatcher.group());
        }

        Matcher chineseMatcher = CHINESE_BLOCK_PATTERN.matcher(normalized);
        while (chineseMatcher.find()) {
            String block = chineseMatcher.group();
            maybeAddTerm(terms, block);
            if (block.length() <= 8) {
                continue;
            }
            for (int n = 2; n <= 4; n++) {
                for (int i = 0; i <= block.length() - n; i++) {
                    maybeAddTerm(terms, block.substring(i, i + n));
                }
            }
        }

        return terms;
    }

    private void maybeAddTerm(Set<String> terms, String raw) {
        if (raw == null) {
            return;
        }
        String term = raw.trim().toLowerCase(Locale.ROOT);
        if (term.length() < 2 || STOP_WORDS.contains(term)) {
            return;
        }
        terms.add(term);
    }

    private void normalize(Map<String, Double> vector) {
        double norm = 0.0;
        for (double value : vector.values()) {
            norm += value * value;
        }
        if (norm == 0.0) {
            return;
        }
        double scale = Math.sqrt(norm);
        vector.replaceAll((key, value) -> value / scale);
    }

    private double cosineSimilarity(Map<String, Double> left, Map<String, Double> right) {
        if (left.isEmpty() || right.isEmpty()) {
            return 0.0;
        }
        Map<String, Double> smaller = left.size() <= right.size() ? left : right;
        Map<String, Double> larger = smaller == left ? right : left;

        double score = 0.0;
        for (Map.Entry<String, Double> entry : smaller.entrySet()) {
            score += entry.getValue() * larger.getOrDefault(entry.getKey(), 0.0);
        }
        return score;
    }

    private double overlapScore(Set<String> preferredTerms, Set<String> targetTerms) {
        if (preferredTerms == null || preferredTerms.isEmpty() || targetTerms == null || targetTerms.isEmpty()) {
            return 0.0;
        }
        int hits = 0;
        for (String term : preferredTerms) {
            if (targetTerms.contains(term)) {
                hits++;
            }
        }
        return (double) hits / Math.max(6, Math.min(preferredTerms.size(), 18));
    }

    private double freshnessScore(Job job) {
        double createdBonus = 0.0;
        if (job.getCreatedAt() != null) {
            long hours = Math.max(0, Duration.between(job.getCreatedAt(), LocalDateTime.now()).toHours());
            createdBonus = 1.0 / (1.0 + hours / 72.0);
        }

        double deadlineBonus = 0.0;
        if (job.getApplicationDeadline() != null) {
            long hoursToDeadline = Duration.between(LocalDateTime.now(), job.getApplicationDeadline()).toHours();
            if (hoursToDeadline >= 0) {
                deadlineBonus = Math.min(1.0, hoursToDeadline / 240.0);
            }
        }

        return createdBonus * 0.6 + deadlineBonus * 0.4;
    }

    private double salaryScore(BigDecimal salary) {
        if (salary == null || salary.signum() <= 0) {
            return 0.0;
        }
        double value = salary.doubleValue();
        return Math.min(1.0, Math.log10(value + 10) / 4.0);
    }

    private record RecommendationProfile(
            Map<String, Double> profileVector,
            Map<String, Double> behaviorVector,
            Set<String> skillTerms
    ) {
    }
}
