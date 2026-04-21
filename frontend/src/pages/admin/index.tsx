import { type ComponentType, useEffect, useState } from "react";
import {
  BriefcaseIcon,
  BuildingIcon,
  ClipboardListIcon,
  MessageSquareIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";

import applicationService from "@/services/applicationService";
import companyService from "@/services/companyService";
import jobService from "@/services/jobService";
import reviewService from "@/services/reviewService";
import userService from "@/services/userService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardStats = {
  totalStudents: number;
  totalCompanies: number;
  activeJobs: number;
  pendingApplications: number;
  pendingReviews: number;
  verifiedCompanies: number;
  totalApplications: number;
  totalReviews: number;
};

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

type OverviewMetricProps = {
  label: string;
  value: number;
};

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function OverviewMetric({ label, value }: OverviewMetricProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value.toLocaleString()}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardStats = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const [users, companies, jobs, applications, reviews] = await Promise.all([
          userService.getAllUsers(),
          companyService.getAllCompaniesAuth(),
          jobService.getAllJobs(),
          applicationService.getAllApplications(),
          reviewService.getAllReviews(),
        ]);

        setStats({
          totalStudents: users.filter((user) => user.role === "STUDENT").length,
          totalCompanies: companies.length,
          activeJobs: jobs.filter((job) => job.active).length,
          pendingApplications: applications.filter((application) => application.status === "PENDING").length,
          pendingReviews: reviews.filter((review) => review.verified === false).length,
          verifiedCompanies: companies.filter((company) => company.verified ?? company.isVerified).length,
          totalApplications: applications.length,
          totalReviews: reviews.length,
        });
      } catch (error) {
        console.error("Failed to load admin dashboard stats:", error);
        setErrorMessage("加载管理员仪表盘统计失败，请稍后再试。");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">管理员仪表盘</h1>

      {loading && (
        <div className="text-sm text-muted-foreground">正在加载真实统计数据...</div>
      )}

      {errorMessage && (
        <div className="text-sm text-red-500">{errorMessage}</div>
      )}

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="总学生数"
              value={stats.totalStudents}
              description="当前平台注册学生"
              icon={UsersIcon}
            />
            <StatCard
              title="企业数量"
              value={stats.totalCompanies}
              description="当前平台企业数量"
              icon={BuildingIcon}
            />
            <StatCard
              title="有效职位"
              value={stats.activeJobs}
              description="当前活跃中的职位"
              icon={BriefcaseIcon}
            />
            <StatCard
              title="待处理申请"
              value={stats.pendingApplications}
              description="当前待审核申请"
              icon={ClipboardListIcon}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>审核概览</CardTitle>
              <CardDescription>来自当前平台真实业务数据</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <OverviewMetric label="待审核评价" value={stats.pendingReviews} />
              <OverviewMetric label="已认证企业" value={stats.verifiedCompanies} />
              <OverviewMetric label="申请总数" value={stats.totalApplications} />
              <OverviewMetric label="评价总数" value={stats.totalReviews} />
            </CardContent>
          </Card>
        </>
      )}

      <h2 className="mt-2 text-xl font-semibold">最近活动</h2>
      <div className="grid gap-4">
        {recentActivities.map((activity, index) => (
          <Card key={index}>
            <CardHeader className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    activity.type === "学生注册"
                      ? "bg-blue-100"
                      : activity.type === "企业注册"
                        ? "bg-green-100"
                        : activity.type === "职位发布"
                          ? "bg-purple-100"
                          : activity.type === "简历提交"
                            ? "bg-yellow-100"
                            : "bg-gray-100"
                  }`}
                >
                  {activity.type === "学生注册" && <UsersIcon className="h-5 w-5 text-blue-600" />}
                  {activity.type === "企业注册" && <BuildingIcon className="h-5 w-5 text-green-600" />}
                  {activity.type === "职位发布" && <BriefcaseIcon className="h-5 w-5 text-purple-600" />}
                  {activity.type === "简历提交" && <StarIcon className="h-5 w-5 text-yellow-600" />}
                  {activity.type === "系统维护" && <MessageSquareIcon className="h-5 w-5 text-gray-600" />}
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

const recentActivities = [
  {
    title: "新用户 张三 注册成功",
    time: "10分钟前",
    type: "学生注册",
  },
  {
    title: "科技有限公司发布了新职位：前端开发工程师",
    time: "30分钟前",
    type: "职位发布",
  },
  {
    title: "学生 李四 提交了新简历申请",
    time: "2小时前",
    type: "简历提交",
  },
  {
    title: "未来科技有限公司完成企业认证",
    time: "3小时前",
    type: "企业注册",
  },
  {
    title: "管理员处理了3个用户举报",
    time: "昨天",
    type: "系统维护",
  },
];
