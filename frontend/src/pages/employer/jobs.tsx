import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon, EyeIcon, Trash2Icon, PlusCircleIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Link } from "react-router-dom";
import jobService, { Job } from "@/services/jobService";
import applicationService from "@/services/applicationService";
import { toast } from "sonner";

interface EmployerJob extends Job {
  applicationCount?: number;
}

export default function JobsList() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<EmployerJob | null>(null);

  const formatJobType = (type?: string) => {
    const typeMap: Record<string, string> = {
      PART_TIME: "兼职",
      FULL_TIME: "全职",
      INTERNSHIP: "实习",
      CONTRACT: "合同工",
      TEMPORARY: "临时工",
      FREELANCE: "自由职业"
    };
    return typeMap[type || ""] || type || "-";
  };

  const formatSalary = (salary?: number, period?: string) => {
    if (!salary) {
      return "面议";
    }
    const periodMap: Record<string, string> = {
      HOURLY: "小时",
      DAILY: "天",
      WEEKLY: "周",
      MONTHLY: "月",
      ANNUALLY: "年",
      PROJECT_BASED: "项目"
    };
    return `¥${salary}/${periodMap[period || ""] || "薪资"}`;
  };

  const loadJobs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Directly fetch all jobs from /api/jobs endpoint
      const allJobs = await jobService.getAllJobs();

      // Get application counts for each job
      const counts = await Promise.all(
        allJobs.map((job: Job) =>
          job.id
            ? applicationService
              .getApplicationsByJob(job.id)
              .then((list) => ({ id: job.id as number, count: list.length }))
              .catch(() => ({ id: job.id as number, count: 0 }))
            : Promise.resolve({ id: 0, count: 0 })
        )
      );
      const countMap = new Map(counts.map((item) => [item.id, item.count]));
      setJobs(
        allJobs.map((job: Job) => ({
          ...job,
          applicationCount: job.id ? countMap.get(job.id) || 0 : 0
        }))
      );
    } catch (error) {
      console.error("Failed to load employer jobs:", error);
      setErrorMessage("加载职位失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const status = job.active ? "active" : "inactive";
      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = job.title?.toLowerCase().includes(query);
        const companyMatch = job.company?.name?.toLowerCase().includes(query);
        if (!titleMatch && !companyMatch) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, searchQuery, statusFilter]);

  const handleToggleJob = async (job: EmployerJob) => {
    if (!job.id) {
      return;
    }
    try {
      const updated = await jobService.updateJobStatus(job.id, !job.active);
      setJobs((prev) => prev.map((item) => (item.id === job.id ? { ...item, ...updated } : item)));
      toast.success(job.active ? "职位已下线" : "状态已更新");
    } catch (error) {
      console.error("Failed to update job status:", error);
      toast.error("更新状态失败，请稍后再试。");
    }
  };

  const handleDeleteJob = async (job: EmployerJob) => {
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
      toast.success("职位已删除");
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("删除失败，请稍后再试。");
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">我的职位列表</h1>
        <Button className="gap-1" asChild>
          <Link to="/employer/post-job">
            <PlusCircleIcon className="h-4 w-4" />
            发布新职位
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索职位"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="active">已发布</SelectItem>
            <SelectItem value="inactive">待审核/已下线</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">正在加载职位...</div>
      )}
      {errorMessage && (
        <div className="text-center text-sm text-red-500">{errorMessage}</div>
      )}

      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <Card key={job.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription className="mt-1">
                    发布时间: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "-"} · 地点: {job.location || "-"}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    job.active
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }
                >
                  {job.active ? "已发布" : "待审核/已下线"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex gap-2 text-sm">
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {formatJobType(job.jobType)}
                  </span>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {formatSalary(job.salary, job.salaryPeriod)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{job.description}</p>

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">收到申请：</span> {job.applicationCount || 0}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <Link to="/employer/applications">
                  <EyeIcon className="h-4 w-4" />
                  查看申请
                </Link>
              </Button>
              {job.active ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleToggleJob(job)}
                >
                  <PencilIcon className="h-4 w-4" />
                  下线
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="gap-1" disabled>
                  <PencilIcon className="h-4 w-4" />
                  等待审核
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteJob(job)}
              >
                <Trash2Icon className="h-4 w-4" />
                删除
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {!loading && !errorMessage && filteredJobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-muted-foreground">您还没有发布任何职位</p>
            <Button className="mt-4 gap-1" asChild>
              <Link to="/employer/post-job">
                <PlusCircleIcon className="h-4 w-4" />
                发布新职位
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
