import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BuildingIcon,
  BriefcaseIcon, 
  SaveIcon, 
  StarIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import applicationService, { JobApplication } from "@/services/applicationService";
import reviewService from "@/services/reviewService";
import { toast } from "sonner";

export default function WriteReview() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [workPeriod, setWorkPeriod] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await applicationService.getMyApplications();
        const list = Array.isArray(data) ? data : [];
        setApplications(list);
        if (list.length > 0) {
          setSelectedApplicationId(list[0].id || null);
        }
      } catch (error) {
        console.error("Failed to load applications:", error);
        setErrorMessage("加载申请记录失败，请稍后再试。");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const selectedApplication = useMemo(
    () => applications.find((item) => item.id === selectedApplicationId) || null,
    [applications, selectedApplicationId]
  );

  const handleSubmit = async () => {
    if (!selectedApplication?.job?.company?.id) {
      toast.error("请选择包含企业信息的职位。");
      return;
    }
    if (!title.trim()) {
      toast.error("请填写评价标题。");
      return;
    }
    if (!content.trim()) {
      toast.error("请填写评价内容。");
      return;
    }
    if (rating <= 0) {
      toast.error("请为本次体验评分。");
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.createReview({
        title: title.trim(),
        content: content.trim(),
        rating,
        pros: pros.trim() || undefined,
        cons: cons.trim() || undefined,
        workPeriod: workPeriod.trim() || undefined,
        jobTitle: selectedApplication.job?.title,
        anonymous,
        companyId: selectedApplication.job.company.id,
        jobId: selectedApplication.job?.id
      });
      toast.success("评价提交成功！");
      setTitle("");
      setContent("");
      setPros("");
      setCons("");
      setWorkPeriod("");
      setRating(0);
      setAnonymous(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("提交失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">提交评价</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>评价兼职体验</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>选择已申请的职位</Label>
            <Select 
              value={selectedApplicationId?.toString() || ""} 
              onValueChange={(value) => setSelectedApplicationId(value ? Number(value) : null)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((application) => (
                  <SelectItem key={application.id} value={application.id?.toString() || ""}>
                    {application.job?.title || "未知职位"} · {application.job?.company?.name || "未知企业"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>

          {selectedApplication && (
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BuildingIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">{selectedApplication.job?.title || "未知职位"}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.job?.company?.name || "未知企业"} · {workPeriod || "未填写工作周期"}
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">评价标题</Label>
            <Input
              id="title"
              placeholder="例如：工作体验不错，收获很大"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workPeriod">工作周期</Label>
            <Input
              id="workPeriod"
              placeholder="例如：2025.01 - 2025.03"
              value={workPeriod}
              onChange={(e) => setWorkPeriod(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>满意度评分</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <StarIcon 
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-muted-foreground"
                    }`} 
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "很差，不推荐"}
              {rating === 2 && "较差，有待改进"}
              {rating === 3 && "一般，符合预期"}
              {rating === 4 && "良好，有不少优点"}
              {rating === 5 && "非常好，强烈推荐"}
              {rating === 0 && "请选择您的评分"}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review">评价内容</Label>
            <Textarea 
              id="review" 
              placeholder="请描述您的兼职体验，包括工作内容、收获、建议等..."
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">最少10个字，最多500字</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pros">优点（可选）</Label>
            <Textarea
              id="pros"
              placeholder="例如：团队氛围好、成长空间大"
              rows={3}
              value={pros}
              onChange={(e) => setPros(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cons">不足（可选）</Label>
            <Textarea
              id="cons"
              placeholder="例如：流程不够清晰、沟通节奏慢"
              rows={3}
              value={cons}
              onChange={(e) => setCons(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>匿名选项</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                className="h-4 w-4"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              <Label htmlFor="anonymous" className="text-sm font-normal">匿名发布此评价</Label>
            </div>
            <p className="text-xs text-muted-foreground">匿名评价将不会显示您的姓名和个人信息</p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline">取消</Button>
            <Button className="gap-2" onClick={handleSubmit} disabled={submitting}>
              <SaveIcon className="h-4 w-4" />
              提交评价
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>待评价的工作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">暂无可评价的申请记录</p>
            )}
            {applications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BriefcaseIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{application.job?.title || "未知职位"}</h3>
                    <p className="text-sm text-muted-foreground">{application.job?.company?.name || "未知企业"}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApplicationId(application.id || null)}
                >
                  评价
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
