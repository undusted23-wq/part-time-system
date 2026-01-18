import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookmarkIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import savedJobService, { SavedJob } from "@/services/savedJobService";
import applicationService from "@/services/applicationService";
import { toast } from "sonner";

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelApplicationDialogOpen, setCancelApplicationDialogOpen] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);

  const loadSavedJobs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await savedJobService.getMySavedJobs();
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load saved jobs:", error);
      setErrorMessage("加载收藏失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const handleUnsave = async (jobId?: number) => {
    if (!jobId) {
      return;
    }
    try {
      await savedJobService.unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job && item.job.id !== jobId));
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
      
      // Update the saved job status locally
      setSavedJobs(prev => 
        prev.map(saved => 
          saved.job && saved.job.id === jobId 
            ? { ...saved, applied: true }
            : saved
        )
      );
      
      toast.success("申请已提交！");
    } catch (error) {
      console.error("Failed to apply:", error);
      toast.error("申请失败，请稍后再试。");
    }
  };

  const handleCancelApplication = async (jobId?: number) => {
    if (!jobId) {
      return;
    }
    
    setCancelLoading(jobId);
    try {
      // Assuming we have a method to cancel applications
      await applicationService.cancelApplication(jobId);
      
      // Update the saved job status locally
      setSavedJobs(prev => 
        prev.map(saved => 
          saved.job && saved.job.id === jobId 
            ? { ...saved, applied: false }
            : saved
        )
      );
      
      setCancelApplicationDialogOpen(null);
      toast.success("已取消申请！");
    } catch (error) {
      console.error("Failed to cancel application:", error);
      toast.error("取消申请失败，请稍后再试。");
    } finally {
      setCancelLoading(null);
    }
  };

  const formatJobType = (type?: string) => {
    const typeMap: Record<string, string> = {
      PART_TIME: "兼职",
      FULL_TIME: "全职",
      INTERNSHIP: "实习",
      CONTRACT: "合同工",
      TEMPORARY: "临时工",
      FREELANCE: "自由职业"
    };
    return typeMap[type ? type : ""] || (type || "-");
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
    return `¥${salary}/${periodMap[period ? period : ""] || "薪资"}`;
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">保存的工作</h1>
      
      {loading && (
        <div className="text-center text-sm text-muted-foreground">正在加载收藏...</div>
      )}

      {errorMessage && (
        <div className="text-center text-sm text-red-500">{errorMessage}</div>
      )}

      {!loading && !errorMessage && savedJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookmarkIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">您还没有保存任何工作</p>
            <Button className="mt-4">浏览可用工作</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {savedJobs.map(saved => {
            const job = saved.job;
            return (
            <Card key={saved.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{job && job.title || "未知职位"}</CardTitle>
                    <CardDescription className="mt-1">{job && job.company && job.company.name || "未知企业"} · {job && job.location || "未标注地点"}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleUnsave(job && job.id)}>
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex gap-2 text-sm">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {formatJobType(job && job.jobType)}
                    </span>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {formatSalary(job && job.salary, job && job.salaryPeriod)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{job && job.description}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {saved.savedAt ? `保存于 ${new Date(saved.savedAt).toLocaleDateString()}` : "保存时间未知"}
                </div>
                
                {saved.applied ? (
                  <Dialog open={cancelApplicationDialogOpen === (job && job.id)} onOpenChange={(open) => 
                    setCancelApplicationDialogOpen(open ? (job && job.id) || null : null)
                  }>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                        已申请
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>确认取消申请</DialogTitle>
                        <DialogDescription>
                          您确定要取消对此职位的申请吗？此操作无法撤销。
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setCancelApplicationDialogOpen(null)}
                          disabled={cancelLoading === (job && job.id)}
                        >
                          取消
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleCancelApplication(job && job.id)}
                          disabled={cancelLoading === (job && job.id)}
                        >
                          {cancelLoading === (job && job.id) ? "处理中..." : "确认取消"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button onClick={() => handleApply(job && job.id)}>申请</Button>
                )}
              </CardFooter>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}
