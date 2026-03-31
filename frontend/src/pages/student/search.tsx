import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookmarkIcon, SearchIcon } from "lucide-react";
import jobService, { Job } from "@/services/jobService";
import savedJobService from "@/services/savedJobService";
import applicationService from "@/services/applicationService";
import { toast } from "sonner";

export default function JobSearch() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const fetchJobs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = keyword || location || jobType
        ? await jobService.searchJobs({
            keyword: keyword || undefined,
            location: location || undefined,
            jobType: jobType || undefined
          })
        : await jobService.getActiveJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      setErrorMessage("加载职位失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const saved = await savedJobService.getMySavedJobs();
      const ids = Array.isArray(saved) ? saved.map((item) => item.job?.id).filter(Boolean) : [];
      setSavedJobIds(ids as number[]);
    } catch (error) {
      console.error("Failed to load saved jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  const handleSearch = () => {
    fetchJobs();
  };

  const handleSaveJob = async (jobId?: number) => {
    if (!jobId) {
      return;
    }
    try {
      await savedJobService.saveJob(jobId);
      setSavedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
      toast.success("收藏成功！");
    } catch (error) {
      console.error("Failed to save job:", error);
      toast.error("收藏失败，请稍后再试。");
    }
  };

  const handleUnsaveJob = async (jobId?: number) => {
    if (!jobId) {
      return;
    }
    try {
      await savedJobService.unsaveJob(jobId);
      setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
      toast.success("已取消收藏");
    } catch (error) {
      console.error("Failed to unsave job:", error);
      toast.error("取消收藏失败，请稍后再试。");
    }
  };

  const handleApply = async (jobId?: number) => {
    if (!jobId) {
      return;
    }
    try {
      await applicationService.applyForJob({ jobId });
      toast.success("申请已提交！");
    } catch (error) {
      console.error("Failed to apply:", error);
      toast.error("申请失败，请稍后再试。");
    }
  };
  
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">查找工作</h1>
      
      <div className="grid gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="搜索职位关键词"
                  className="pl-9"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input 
                  placeholder="地点"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="工作类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">所有类型</SelectItem>
                    <SelectItem value="PART_TIME">兼职</SelectItem>
                    <SelectItem value="INTERNSHIP">实习</SelectItem>
                    <SelectItem value="FULL_TIME">全职</SelectItem>
                    <SelectItem value="TEMPORARY">临时工</SelectItem>
                    <SelectItem value="CONTRACT">合同工</SelectItem>
                    <SelectItem value="FREELANCE">自由职业</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button onClick={handleSearch}>搜索</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">正在加载职位...</div>
      )}
      {errorMessage && (
        <div className="text-center text-sm text-red-500">{errorMessage}</div>
      )}
      {!loading && !errorMessage && jobs.length === 0 && (
        <div className="text-center text-sm text-muted-foreground">暂无符合条件的职位</div>
      )}
      <div className="grid gap-4">
        {jobs.map(job => {
          const isSaved = job.id ? savedJobIds.includes(job.id) : false;
          return (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription className="mt-1">{job.company?.name || "未知企业"} · {job.location || "未标注地点"}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (isSaved ? handleUnsaveJob(job.id) : handleSaveJob(job.id))}
                    title={isSaved ? "取消收藏" : "收藏职位"}
                  >
                    <BookmarkIcon className={`h-5 w-5 ${isSaved ? "text-blue-600" : ""}`} />
                  </Button>
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
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {job.createdAt ? `发布于 ${new Date(job.createdAt).toLocaleDateString()}` : "发布时间未知"}
                </div>
                <Button onClick={() => handleApply(job.id)}>申请</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}