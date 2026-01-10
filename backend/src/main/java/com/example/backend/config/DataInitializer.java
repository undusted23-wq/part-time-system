package com.example.backend.config;

import com.example.backend.model.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository,
            ResumeRepository resumeRepository,
            ReviewRepository reviewRepository,
            MessageRepository messageRepository,
            SavedJobRepository savedJobRepository) {
        return args -> {
            // Create default users if they don't exist
            if (userRepository.count() == 0) {
                // Create admin user
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setEmail("admin@example.com");
                admin.setFullName("系统管理员");
                admin.setPhoneNumber("+1234567890");
                admin.setRole(UserRole.ADMIN);
                admin.setActive(true);
                admin.setCreatedAt(LocalDateTime.now());
                admin.setUpdatedAt(LocalDateTime.now());
                userRepository.save(admin);

                // Create employer users
                User employer1 = new User();
                employer1.setUsername("employer1");
                employer1.setPassword(passwordEncoder.encode("123456"));
                employer1.setEmail("tech@example.com");
                employer1.setFullName("科技公司招聘专员");
                employer1.setPhoneNumber("+1987654321");
                employer1.setRole(UserRole.EMPLOYER);
                employer1.setActive(true);
                employer1.setCreatedAt(LocalDateTime.now());
                employer1.setUpdatedAt(LocalDateTime.now());
                userRepository.save(employer1);
                
                User employer2 = new User();
                employer2.setUsername("employer2");
                employer2.setPassword(passwordEncoder.encode("123456"));
                employer2.setEmail("cafe@example.com");
                employer2.setFullName("咖啡店经理");
                employer2.setPhoneNumber("+1555666777");
                employer2.setRole(UserRole.EMPLOYER);
                employer2.setActive(true);
                employer2.setCreatedAt(LocalDateTime.now());
                employer2.setUpdatedAt(LocalDateTime.now());
                userRepository.save(employer2);

                // Create student users
                User student1 = new User();
                student1.setUsername("mengying");
                student1.setPassword(passwordEncoder.encode("123456"));
                student1.setEmail("student1@example.com");
                student1.setFullName("张三");
                student1.setPhoneNumber("+1122334455");
                student1.setRole(UserRole.STUDENT);
                student1.setActive(true);
                student1.setCreatedAt(LocalDateTime.now());
                student1.setUpdatedAt(LocalDateTime.now());
                userRepository.save(student1);
                
                User student2 = new User();
                student2.setUsername("student2");
                student2.setPassword(passwordEncoder.encode("student123"));
                student2.setEmail("student2@example.com");
                student2.setFullName("李四");
                student2.setPhoneNumber("+1566778899");
                student2.setRole(UserRole.STUDENT);
                student2.setActive(true);
                student2.setCreatedAt(LocalDateTime.now());
                student2.setUpdatedAt(LocalDateTime.now());
                userRepository.save(student2);

                // Create companies
                Company company1 = new Company();
                company1.setName("科技创新有限公司");
                company1.setDescription("我们是一家专注于人工智能和机器学习的科技公司，致力于为客户提供最前沿的技术解决方案。");
                company1.setIndustry("科技/IT");
                company1.setLocation("北京市海淀区");
                company1.setWebsite("https://techcompany.example.com");
                company1.setLogoUrl("/images/tech-logo.png");
                company1.setContactEmail("hr@techcompany.example.com");
                company1.setContactPhone("+86 10 12345678");
                company1.setEmployer(employer1);
                company1.setVerified(true);
                company1.setCreatedAt(LocalDateTime.now());
                company1.setUpdatedAt(LocalDateTime.now());
                companyRepository.save(company1);
                
                Company company2 = new Company();
                company2.setName("市中心咖啡馆");
                company2.setDescription("一家位于市中心的精品咖啡馆，提供优质的咖啡和舒适的工作环境。");
                company2.setIndustry("餐饮/服务");
                company2.setLocation("北京市朝阳区");
                company2.setWebsite("https://cafe.example.com");
                company2.setLogoUrl("/images/cafe-logo.png");
                company2.setContactEmail("jobs@cafe.example.com");
                company2.setContactPhone("+86 10 87654321");
                company2.setEmployer(employer2);
                company2.setVerified(true);
                company2.setCreatedAt(LocalDateTime.now());
                company2.setUpdatedAt(LocalDateTime.now());
                companyRepository.save(company2);
                
                // Create jobs
                Job job1 = new Job();
                job1.setTitle("前端开发实习生");
                job1.setDescription("我们正在寻找有才华的前端开发实习生加入我们的团队，负责开发和维护公司的网站和移动应用程序界面。");
                job1.setJobType(JobType.PART_TIME);
                job1.setLocation("北京市海淀区");
                job1.setSalary(new BigDecimal("50.00"));
                job1.setSalaryPeriod(SalaryPeriod.HOURLY);
                job1.setRequirements("1. 计算机科学或相关专业在读学生\n2. 熟悉HTML, CSS, JavaScript\n3. 了解React, Vue等前端框架\n4. 良好的沟通能力和团队合作精神");
                job1.setBenefits("1. 有竞争力的薪资\n2. 灵活的工作时间\n3. 专业技能培训\n4. 实习期满可考虑转正");
                job1.setWorkingHours("每周15-20小时，时间灵活");
                job1.setCompany(company1);
                job1.setApplicationDeadline(LocalDateTime.now().plusMonths(1));
                job1.setActive(true);
                job1.setCreatedAt(LocalDateTime.now());
                job1.setUpdatedAt(LocalDateTime.now());
                jobRepository.save(job1);
                
                Job job2 = new Job();
                job2.setTitle("移动应用测试员");
                job2.setDescription("为我们即将发布的移动应用进行全面测试，发现并记录问题，提供改进建议。");
                job2.setJobType(JobType.FREELANCE);
                job2.setLocation("远程工作");
                job2.setSalary(new BigDecimal("3000.00"));
                job2.setSalaryPeriod(SalaryPeriod.PROJECT_BASED);
                job2.setRequirements("1. 对移动应用有浓厚兴趣\n2. 具有良好的问题发现和分析能力\n3. 熟悉iOS和Android操作系统\n4. 有测试经验者优先");
                job2.setBenefits("1. 项目完成后有奖金\n2. 获得专业技能证明\n3. 优秀者可获得更多项目机会");
                job2.setWorkingHours("项目时长约2周，时间自由安排");
                job2.setCompany(company1);
                job2.setApplicationDeadline(LocalDateTime.now().plusWeeks(2));
                job2.setActive(true);
                job2.setCreatedAt(LocalDateTime.now());
                job2.setUpdatedAt(LocalDateTime.now());
                jobRepository.save(job2);
                
                Job job3 = new Job();
                job3.setTitle("咖啡师助理");
                job3.setDescription("协助咖啡师制作各类咖啡饮品，学习咖啡知识，提供优质的客户服务。");
                job3.setJobType(JobType.PART_TIME);
                job3.setLocation("北京市朝阳区");
                job3.setSalary(new BigDecimal("30.00"));
                job3.setSalaryPeriod(SalaryPeriod.HOURLY);
                job3.setRequirements("1. 对咖啡和服务行业有热情\n2. 良好的沟通能力和团队合作精神\n3. 能够在忙碌的环境中保持冷静和高效\n4. 无需经验，我们将提供培训");
                job3.setBenefits("1. 免费工作餐和饮品\n2. 专业咖啡技能培训\n3. 灵活的排班制度\n4. 优秀员工晋升机会");
                job3.setWorkingHours("每周20小时，主要在周末和晚上");
                job3.setCompany(company2);
                job3.setApplicationDeadline(LocalDateTime.now().plusWeeks(3));
                job3.setActive(true);
                job3.setCreatedAt(LocalDateTime.now());
                job3.setUpdatedAt(LocalDateTime.now());
                jobRepository.save(job3);
                
                // Create resumes
                Resume resume1 = new Resume();
                resume1.setStudent(student1);
                resume1.setTitle("软件开发简历");
                resume1.setFileUrl("/uploads/resumes/resume1.pdf");
                resume1.setSummary("计算机科学专业学生，对Web开发和人工智能有浓厚兴趣，寻求软件开发实习机会。");
                resume1.setSkills("编程语言: Java, Python, JavaScript, HTML/CSS\n框架: React, Spring Boot\n工具: Git, Docker\n语言: 中文(母语), 英语(流利)");
               // resume1.setEducation("山西大学 | 计算机科学学士 | 2022-2026(预计)\n主修课程: 数据结构与算法, 计算机网络, 数据库原理, 人工智能导论");
               // resume1.setExperience("学生组织 | 技术部部长 | 2023年9月至今\n- 负责维护学生会网站和微信小程序\n- 组织校园技术讲座和编程比赛");
                resume1.setActive(true);
                resume1.setDefault(true);
                resume1.setCreatedAt(LocalDateTime.now());
                resume1.setUpdatedAt(LocalDateTime.now());
                resumeRepository.save(resume1);
                
                Resume resume2 = new Resume();
                resume2.setStudent(student2);
                resume2.setTitle("通用实习简历");
                resume2.setFileUrl("/uploads/resumes/resume2.pdf");
                resume2.setSummary("市场营销专业大三学生，具有良好的沟通能力和团队合作精神，寻求市场或客户服务相关实习机会。");
                resume2.setSkills("办公软件: Microsoft Office, Photoshop\n社交媒体运营: 微信, 微博, 抖音\n语言: 中文(母语), 英语(中级), 日语(初级)");
                //resume2.setEducation("中国人民大学 | 市场营销学士 | 2022-2026(预计)\n主修课程: 市场营销原理, 消费者行为学, 广告学, 商业谈判");
                //resume2.setExperience("校园义工 | 2023年3月至今\n- 参与校园宣传活动策划和执行\n- 为新生提供校园向导服务");
                resume2.setActive(true);
                resume2.setDefault(true);
                resume2.setCreatedAt(LocalDateTime.now());
                resume2.setUpdatedAt(LocalDateTime.now());
                resumeRepository.save(resume2);
                
                // Create job applications
                JobApplication application1 = new JobApplication();
                application1.setJob(job1);
                application1.setApplicant(student1);
                application1.setCoverLetter("尊敬的招聘团队，\n\n我对贵公司发布的前端开发实习生职位非常感兴趣。作为一名计算机科学专业的学生，我在过去两年中一直专注于Web开发技术的学习...");
                application1.setResumeUrl("/uploads/resumes/resume1.pdf");
                application1.setStatus(ApplicationStatus.PENDING);
                application1.setAppliedAt(LocalDateTime.now().minusDays(2));
                application1.setUpdatedAt(LocalDateTime.now().minusDays(2));
                jobApplicationRepository.save(application1);
                
                JobApplication application2 = new JobApplication();
                application2.setJob(job3);
                application2.setApplicant(student2);
                application2.setCoverLetter("尊敬的招聘经理，\n\n我是一名对咖啡充满热情的大学生，看到贵咖啡馆的招聘信息后非常兴奋。虽然我没有专业的咖啡制作经验，但我非常愿意学习并努力提升自己的技能...");
                application2.setResumeUrl("/uploads/resumes/resume2.pdf");
                application2.setStatus(ApplicationStatus.PENDING);
                application2.setAppliedAt(LocalDateTime.now().minusDays(3));
                application2.setUpdatedAt(LocalDateTime.now().minusDays(3));
                jobApplicationRepository.save(application2);
                
                // Create reviews
                Review review1 = new Review();
                review1.setCompany(company2);
                review1.setStudent(student1);
                review1.setTitle("良好的工作环境和团队氛围");
                review1.setContent("在市中心咖啡馆的半年实习经历让我收获良多。店长非常耐心地教导新人，同事之间互相帮助，工作氛围轻松友好。最重要的是我学到了专业的咖啡知识和客户服务技能，这对我今后的职业发展很有帮助。");
                review1.setRating(4);
                review1.setPros("灵活的工作时间，友好的同事，良好的培训");
                review1.setCons("周末和节假日比较忙，有时会很累");
                review1.setWorkPeriod("2023年1月 - 2023年6月");
                review1.setJobTitle("咖啡师助理");
                review1.setVerified(true);
                review1.setAnonymous(false);
                review1.setCreatedAt(LocalDateTime.now().minusMonths(2));
                review1.setUpdatedAt(LocalDateTime.now().minusMonths(2));
                reviewRepository.save(review1);
                
                // Create messages
                Message message1 = new Message();
                message1.setSender(employer1);
                message1.setReceiver(student1);
                message1.setSubject("关于您的实习申请");
                message1.setContent("您好，感谢您对我们前端开发实习生职位的申请。我们对您的简历和经历非常感兴趣，想邀请您参加下周二下午3点的视频面试。如果时间合适，请回复确认。期待与您交流！");
                message1.setRead(false);
                message1.setRelatedJob(job1);
                message1.setRelatedApplication(application1);
                message1.setCreatedAt(LocalDateTime.now().minusHours(6));
                messageRepository.save(message1);
                
                Message message2 = new Message();
                message2.setSender(employer2);
                message2.setReceiver(student2);
                message2.setSubject("面试邀请");
                message2.setContent("您好，非常感谢您申请我们的咖啡师助理职位。我们想邀请您来店里进行一次面试和简单的实操测试。请问您本周五下午2点有空吗？期待您的回复。");
                message2.setRead(false);
                message2.setRelatedJob(job3);
                message2.setRelatedApplication(application2);
                message2.setCreatedAt(LocalDateTime.now().minusHours(12));
                messageRepository.save(message2);
                
                // Create saved jobs
                SavedJob savedJob1 = new SavedJob();
                savedJob1.setStudent(student1);
                savedJob1.setJob(job2);
                savedJob1.setNotes("看起来很有趣的项目，可以锻炼测试能力，周末可以申请");
                savedJob1.setSavedAt(LocalDateTime.now().minusDays(1));
                savedJobRepository.save(savedJob1);
                
                SavedJob savedJob2 = new SavedJob();
                savedJob2.setStudent(student2);
                savedJob2.setJob(job1);
                savedJob2.setNotes("需要学习一些前端技术再申请");
                savedJob2.setSavedAt(LocalDateTime.now().minusDays(2));
                savedJobRepository.save(savedJob2);

                // --- 新增演示数据开始 ---

                // 1. 新增一个企业：蜜雪冰城
                Company company3 = new Company();
                company3.setName("蜜雪冰城大学城店");
                company3.setDescription("深受年轻人喜爱的茶饮品牌，工作氛围轻松活泼，欢迎大学生兼职。");
                company3.setIndustry("餐饮/零售");
                company3.setLocation("大学城商业街C区");
                company3.setLogoUrl("/images/mixue.png"); // 这里的图片地址可以是虚拟的
                company3.setContactEmail("mxbc@example.com");
                company3.setContactPhone("13800138000");
                company3.setEmployer(employer2); // 挂在现有的雇主账号下
                company3.setVerified(true); // 重要：必须认证，游客才能看到
                company3.setCreatedAt(LocalDateTime.now());
                company3.setUpdatedAt(LocalDateTime.now());
                companyRepository.save(company3);

                // 2. 给它发一个职位
                Job job4 = new Job();
                job4.setTitle("周末奶茶制作员");
                job4.setDescription("负责点单、制作饮品、维持店面卫生。");
                job4.setJobType(JobType.PART_TIME);
                job4.setLocation("大学城商业街");
                job4.setSalary(new BigDecimal("25.00"));
                job4.setSalaryPeriod(SalaryPeriod.HOURLY);
                job4.setRequirements("性格开朗，手脚麻利，有健康证优先。");
                job4.setBenefits("免费畅饮，弹性排班");
                job4.setWorkingHours("周末全天");
                job4.setCompany(company3);
                job4.setActive(true); // 重要：必须活跃，游客才能看到
                job4.setApplicationDeadline(LocalDateTime.now().plusMonths(2));
                job4.setCreatedAt(LocalDateTime.now());
                job4.setUpdatedAt(LocalDateTime.now());
                jobRepository.save(job4);

                // 3. 新增评价 (游客重点看这个)
                Review review2 = new Review();
                review2.setCompany(company1); // 评价之前的科技公司
                review2.setStudent(student2);
                review2.setTitle("非常有挑战性的实习");
                review2.setContent("作为大二学生，在这里接触到了真实的项目开发流程。导师虽然严厉但能学到真东西，加班有点多，但补贴很到位。");
                review2.setRating(5);
                review2.setPros("技术牛人多，成长快，下午茶丰富");
                review2.setCons("项目赶进度时压力较大");
                review2.setWorkPeriod("2023暑期");
                review2.setJobTitle("Java开发实习生");
                review2.setVerified(true);
                review2.setAnonymous(false);
                review2.setCreatedAt(LocalDateTime.now().minusDays(10));
                review2.setUpdatedAt(LocalDateTime.now().minusDays(10));
                reviewRepository.save(review2);

                Review review3 = new Review();
                review3.setCompany(company3); // 评价新加的蜜雪冰城
                review3.setStudent(student1);
                review3.setTitle("轻松快乐的兼职体验");
                review3.setContent("店长人超好，没事的时候可以自己调配饮料喝。工作很简单，就是有时候排队人多会手忙脚乱。");
                review3.setRating(4);
                review3.setPros("饮料自由，氛围好");
                review3.setCons("站一天腿有点酸");
                review3.setWorkPeriod("2023年9月至今");
                review3.setJobTitle("兼职店员");
                review3.setVerified(true);
                review3.setAnonymous(true); // 匿名评价
                review3.setCreatedAt(LocalDateTime.now().minusDays(5));
                review3.setUpdatedAt(LocalDateTime.now().minusDays(5));
                reviewRepository.save(review3);

                // --- 新增演示数据结束 ---

                System.out.println("Database initialized with sample data");
            }
        };
    }
}
