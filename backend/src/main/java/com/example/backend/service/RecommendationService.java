package com.example.backend.service;

import com.example.backend.model.Job;
import com.example.backend.model.User;
import com.example.backend.repository.JobRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;

    // Python AI 服务的地址
    private final String AI_SERVICE_URL = "http://localhost:5000/recommend";

    public List<Job> getRecommendedJobs(Long userId) {
        // 1. 获取用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("========== 🚀 开始智能推荐流程 ==========");
        System.out.println("当前用户: " + user.getUsername());

        // 2. 获取数据库里所有活跃的兼职
        List<Job> allJobs = jobRepository.findByIsActiveTrue();
        if (allJobs.isEmpty()) {
            System.out.println("【警告】数据库里没有活跃职位，直接返回空");
            return new ArrayList<>();
        }

        // 3. 构造发送给 Python 的数据包
        Map<String, Object> requestPayload = new HashMap<>();
        // 注意：如果用户 skills 为空，给一个默认值，防止 Python 报错
        String userSkills = (user.getSkills() != null && !user.getSkills().isEmpty()) ? user.getSkills() : "通用 求职";
        requestPayload.put("user_skills", userSkills);

        List<Map<String, Object>> jobsList = new ArrayList<>();
        for (Job job : allJobs) {
            Map<String, Object> jobMap = new HashMap<>();
            jobMap.put("id", job.getId());
            // 拼接所有文本信息供 AI 分析
            String fullText = job.getTitle() + "。 " + job.getDescription() + "。 " + 
                              (job.getRequirements() != null ? job.getRequirements() : "");
            jobMap.put("text", fullText);
            jobsList.add(jobMap);
        }
        requestPayload.put("jobs", jobsList);

        try {
            // 4. 【核心一步】打电话给 Python (5000端口)
            System.out.println("正在呼叫 Python AI 服务...");
            List<Map<String, Object>> response = restTemplate.postForObject(AI_SERVICE_URL, requestPayload, List.class);

            if (response == null) {
                return allJobs;
            }
            
            System.out.println("✅ Python AI 返回成功！正在解析排序...");

            // 5. 解析 Python 返回的 ID 排序
            List<Long> sortedJobIds = new ArrayList<>();
            for (Map<String, Object> item : response) {
                Object idObj = item.get("job_id");
                if (idObj instanceof Number) {
                    sortedJobIds.add(((Number) idObj).longValue());
                }
            }

            // 6. 根据 ID 列表重新排列 Job 对象
            Map<Long, Job> jobMap = allJobs.stream()
                    .collect(Collectors.toMap(Job::getId, job -> job));
            
            List<Job> sortedJobs = new ArrayList<>();
            for (Long id : sortedJobIds) {
                if (jobMap.containsKey(id)) {
                    Job job = jobMap.get(id);
                    // 偷偷把分数塞进 Job 对象里（如果前端需要显示匹配度的话，这里可以做扩展，目前先不塞）
                    sortedJobs.add(job);
                }
            }
            
            // 把 Python 没返回的职位（虽然不太可能）补在最后
            for (Job job : allJobs) {
                if (!sortedJobs.contains(job)) {
                    sortedJobs.add(job);
                }
            }

            System.out.println("【成功】返回 " + sortedJobs.size() + " 个经过 AI 排序的职位");
            return sortedJobs;

        } catch (Exception e) {
            // 如果 Python 挂了，或者连不上，降级返回普通列表
            System.err.println("❌ AI 服务连接失败 (使用普通列表兜底): " + e.getMessage());
            return allJobs;
        }
    }
}