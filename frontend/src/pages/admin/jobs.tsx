import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BriefcaseIcon,
  CheckIcon,
  SearchIcon,
  TrashIcon,
  XIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import jobService from "@/services/jobService";
import applicationService, { JobApplication } from "@/services/applicationService";

export default function JobManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [jobToDelete, setJobToDelete] = useState<JobRow | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const [jobData, applicationData] = await Promise.all([
          jobService.getAllJobs(),
          applicationService.getAllApplications()
        ]);
        setJobs(jobData);
        setApplications(applicationData);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setErrorMessage("加载职位列表失败，请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const applicationsByJobId = useMemo(() => {
    const map = new Map<number, number>();
    applications.forEach((application) => {
      const jobId = application.job?.id;
      if (!jobId) {
        return;
      }
      map.set(jobId, (map.get(jobId) || 0) + 1);
    });
    return map;
  }, [applications]);

  const jobTypeLabel = (jobType?: string) => {
    switch (jobType) {
      case "PART_TIME":
        return "兼职";
      case "INTERNSHIP":
        return "实习";
      case "FULL_TIME":
        return "全职";
      case "TEMPORARY":
        return "临时工";
      case "CONTRACT":
        return "合同工";
      case "FREELANCE":
        return "自由职业";
      default:
        return jobType || "-";
    }
  };

  const salaryPeriodLabel = (period?: string) => {
    switch (period) {
      case "HOURLY":
        return "/小时";
      case "DAILY":
        return "/天";
      case "WEEKLY":
        return "/周";
      case "MONTHLY":
        return "/月";
      case "ANNUALLY":
        return "/年";
      case "PROJECT_BASED":
        return "/项目";
      default:
        return "";
    }
  };

  const formatSalary = (salary?: number, period?: string) => {
    if (salary === undefined || salary === null) {
      return "-";
    }
    return `¥${salary}${salaryPeriodLabel(period)}`;
  };

  // 前端过滤，服务端已返回全量职位数据
  const filteredJobs = jobs.filter(job => {
    const status = job.active ? "active" : "closed";
    // 状态筛选
    if (statusFilter !== "all" && status !== statusFilter) {
      return false;
    }

    // 类型筛选
    if (typeFilter !== "all" && jobTypeLabel(job.jobType) !== typeFilter) {
      return false;
    }

    // 搜索查询
    if (searchQuery && !job.title.includes(searchQuery) &&
      !(job.company?.name || "").includes(searchQuery)) {
      return false;
    }

    return true;
  });

  const handleToggleJob = async (job: JobRow) => {
    if (!job.id) {
      return;
    }
    const nextActive = !job.active;
    try {
      const updated = await jobService.updateJobStatus(job.id, nextActive);
      setJobs((prev) => prev.map((item) => (item.id === job.id ? updated : item)));
    } catch (error) {
      console.error("Failed to update job status:", error);
      setErrorMessage("更新职位状态失败，请稍后再试。");
    }
  };

  const handleDeleteJob = async (job: JobRow) => {
    if (!job.id) {
      return;
    }
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete?.id) {
      return;
    }
    try {
      await jobService.deleteJob(jobToDelete.id);
      setJobs((prev) => prev.filter((item) => item.id !== jobToDelete.id));
    } catch (error) {
      console.error("Failed to delete job:", error);
      setErrorMessage("删除职位失败，请稍后再试。");
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">招聘信息管理</h1>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索职位名称或企业..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">所有状态</option>
          <option value="active">已发布</option>
          <option value="closed">待审核/已下线</option>
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-1"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">所有类型</option>
          <option value="兼职">兼职</option>
          <option value="实习">实习</option>
          <option value="全职">全职</option>
          <option value="临时工">临时工</option>
          <option value="合同工">合同工</option>
          <option value="自由职业">自由职业</option>
        </select>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>职位列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">职位名称</th>
                  <th className="p-2 text-left font-medium">企业</th>
                  <th className="p-2 text-left font-medium">类型</th>
                  <th className="p-2 text-left font-medium">薪资</th>
                  <th className="p-2 text-left font-medium">地点</th>
                  <th className="p-2 text-left font-medium">发布时间</th>
                  <th className="p-2 text-left font-medium">状态</th>
                  <th className="p-2 text-left font-medium">申请数</th>
                  <th className="p-2 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b">
                    <td className="p-2">{job.title}</td>
                    <td className="p-2">{job.company?.name || "-"}</td>
                    <td className="p-2">
                      <Badge
                        variant="outline"
                        className={
                          jobTypeLabel(job.jobType) === "兼职" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" :
                            jobTypeLabel(job.jobType) === "实习" ? "bg-green-50 text-green-700 hover:bg-green-50" :
                              jobTypeLabel(job.jobType) === "全职" ? "bg-purple-50 text-purple-700 hover:bg-purple-50" :
                                jobTypeLabel(job.jobType) === "自由职业" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" :
                                  "bg-orange-50 text-orange-700 hover:bg-orange-50"
                        }
                      >
                        {jobTypeLabel(job.jobType)}
                      </Badge>
                    </td>
                    <td className="p-2">{formatSalary(job.salary, job.salaryPeriod)}</td>
                    <td className="p-2">{job.location}</td>
                    <td className="p-2">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.active ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                        }`}>
                        {job.active ? "已发布" : "待审核/已下线"}
                      </span>
                    </td>
                    <td className="p-2">{applicationsByJobId.get(job.id || 0) || 0}</td>
                    <td className="p-2">
                      <div className="flex justify-center gap-1">
                        {job.active ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => handleToggleJob(job)}
                          >
                            <XIcon className="h-4 w-4" />
                            <span className="sr-only">下线</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={() => handleToggleJob(job)}
                          >
                            <CheckIcon className="h-4 w-4" />
                            <span className="sr-only">审核通过并发布</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDeleteJob(job)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">删除</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">正在加载职位列表...</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-red-500">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">没有找到符合条件的职位</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示 {filteredJobs.length} 条记录，共 {jobs.length} 条
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>上一页</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">下一页</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">职位概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">总职位数量</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="h-4 w-4 text-green-500" />
                  已发布
                </span>
                <span>{jobs.filter(c => c.active).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="h-4 w-4 text-yellow-500" />
                  待审核/已下线
                </span>
                <span>{jobs.filter(c => !c.active).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">职位类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px] flex items-center justify-center">
              <p className="text-muted-foreground">饼图区域</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">最新发布职位</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                .slice(0, 3)
                .map(job => (
                  <div key={job.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.company?.name || "-"} | {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleToggleJob(job)}>
                      {job.active ? "下线" : "审核发布"}
                    </Button>
                  </div>
                ))}

              {jobs.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  暂无职位数据
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Applications Section */}
      <JobApplicationsSection
        applications={applications}
        onApplicationDeleted={async () => {
          const applicationData = await applicationService.getAllApplications();
          setApplications(applicationData);
        }}
      />

      {/* 删除职位的提示框（修复点：移回 JobManagement 中） */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除职位</AlertDialogTitle>
            <AlertDialogDescription>
              确认删除职位"{jobToDelete?.title}"吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Job Applications Section Component
function JobApplicationsSection({ applications, onApplicationDeleted }: {
  applications: JobApplication[];
  onApplicationDeleted: () => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "待处理",
      REVIEWING: "审核中",
      SHORTLISTED: "入围",
      INTERVIEW: "面试",
      OFFERED: "已录用",
      ACCEPTED: "已接受",
      REJECTED: "已拒绝",
      WITHDRAWN: "已撤回"
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWING":
        return "bg-blue-100 text-blue-800";
      case "SHORTLISTED":
        return "bg-purple-100 text-purple-800";
      case "INTERVIEW":
        return "bg-indigo-100 text-indigo-800";
      case "OFFERED":
        return "bg-green-100 text-green-800";
      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteApplication = async (id: number, applicantName: string) => {
    if (!confirm(`确定要删除 ${applicantName} 的申请吗？此操作不可撤销。`)) {
      return;
    }

    try {
      setErrorMessage(null);
      await applicationService.deleteApplication(id);
      setSuccessMessage("申请已删除");
      setTimeout(() => setSuccessMessage(null), 3000);
      await onApplicationDeleted();
    } catch (error: any) {
      console.error("Failed to delete application:", error);
      setErrorMessage(error.response?.data?.message || "删除申请失败");
    }
  };

  const filteredApplications = applications.filter(app => {
    // Status filter
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const applicantName = app.applicant?.fullName?.toLowerCase() || "";
      const jobTitle = app.job?.title?.toLowerCase() || "";
      const companyName = app.job?.company?.name?.toLowerCase() || "";

      return applicantName.includes(query) ||
        jobTitle.includes(query) ||
        companyName.includes(query);
    }

    return true;
  });

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "PENDING").length,
    reviewing: applications.filter(a => a.status === "REVIEWING").length,
    interview: applications.filter(a => a.status === "INTERVIEW").length,
    offered: applications.filter(a => a.status === "OFFERED").length,
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">岗位申请管理</h2>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索申请人、职位或企业..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">所有状态</option>
          <option value="PENDING">待处理</option>
          <option value="REVIEWING">审核中</option>
          <option value="SHORTLISTED">入围</option>
          <option value="INTERVIEW">面试</option>
          <option value="OFFERED">已录用</option>
          <option value="ACCEPTED">已接受</option>
          <option value="REJECTED">已拒绝</option>
          <option value="WITHDRAWN">已撤回</option>
        </select>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>申请列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">申请人</th>
                  <th className="p-2 text-left font-medium">职位</th>
                  <th className="p-2 text-left font-medium">企业</th>
                  <th className="p-2 text-left font-medium">状态</th>
                  <th className="p-2 text-left font-medium">申请时间</th>
                  <th className="p-2 text-left font-medium">简历</th>
                  <th className="p-2 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="border-b">
                    <td className="p-2">{app.applicant?.fullName || app.applicant?.username || "-"}</td>
                    <td className="p-2">{app.job?.title || "-"}</td>
                    <td className="p-2">{app.job?.company?.name || "-"}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="p-2">
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString('zh-CN')
                        : "-"}
                    </td>
                    <td className="p-2">
                      {app.resumeUrl ? (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          查看
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteApplication(app.id!, app.applicant?.fullName || "该申请")}
                          title="删除申请"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">删除</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">
                {searchQuery || statusFilter !== "all" ? "没有找到符合条件的申请" : "暂无申请数据"}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示 {filteredApplications.length} 条记录，共 {applications.length} 条
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Statistics */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>申请统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="flex flex-col p-4 border rounded-lg">
              <span className="text-sm text-muted-foreground">总申请数</span>
              <span className="text-3xl font-bold mt-2">{stats.total}</span>
            </div>
            <div className="flex flex-col p-4 border rounded-lg">
              <span className="text-sm text-muted-foreground">待处理</span>
              <span className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</span>
            </div>
            <div className="flex flex-col p-4 border rounded-lg">
              <span className="text-sm text-muted-foreground">审核中</span>
              <span className="text-3xl font-bold mt-2 text-blue-600">{stats.reviewing}</span>
            </div>
            <div className="flex flex-col p-4 border rounded-lg">
              <span className="text-sm text-muted-foreground">面试</span>
              <span className="text-3xl font-bold mt-2 text-indigo-600">{stats.interview}</span>
            </div>
            <div className="flex flex-col p-4 border rounded-lg">
              <span className="text-sm text-muted-foreground">已录用</span>
              <span className="text-3xl font-bold mt-2 text-green-600">{stats.offered}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface JobRow {
  id?: number;
  title: string;
  location?: string;
  jobType?: string;
  salary?: number;
  salaryPeriod?: string;
  createdAt?: string;
  active?: boolean;
  company?: {
    id?: number;
    name?: string;
  };
}
