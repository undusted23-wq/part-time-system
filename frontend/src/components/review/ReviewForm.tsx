import { useEffect, useMemo, useState } from "react";
import {
  BuildingIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
  SaveIcon,
  StarIcon,
} from "lucide-react";
import { toast } from "sonner";

import applicationService, { JobApplication } from "@/services/applicationService";
import authService from "@/services/authService";
import reviewService, { ReviewCreateInput } from "@/services/reviewService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ReviewFormProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  onSuccess?: () => Promise<void> | void;
};

type ReviewFormState = {
  title: string;
  content: string;
  pros: string;
  cons: string;
  workPeriod: string;
  anonymous: boolean;
};

const emptyForm: ReviewFormState = {
  title: "",
  content: "",
  pros: "",
  cons: "",
  workPeriod: "",
  anonymous: false,
};

const isEligibleApplication = (application: JobApplication) =>
  Boolean(application.id && application.job?.id && application.job?.company?.id);

const ratingDescriptions: Record<number, string> = {
  1: "很差，不推荐",
  2: "较差，有待改进",
  3: "一般，符合预期",
  4: "良好，有不少优点",
  5: "非常好，强烈推荐",
};

export default function ReviewForm({
  title = "提交评价",
  description = "分享你的兼职体验，帮助其他同学更好地了解岗位。",
  submitLabel = "提交评价",
  onSuccess,
}: ReviewFormProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState<ReviewFormState>(emptyForm);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      setLoadingApplications(true);
      setApplicationError(null);

      try {
        const currentUser = authService.getCurrentUser();
        const token = localStorage.getItem("token");

        if (!currentUser?.id || !token) {
          setApplications([]);
          setSelectedApplicationId(null);
          setApplicationError("请先登录后提交评价。");
          return;
        }

        const data = await applicationService.getMyApplications();
        const eligibleApplications = (Array.isArray(data) ? data : []).filter(isEligibleApplication);

        setApplications(eligibleApplications);
        setSelectedApplicationId((current) => {
          if (current && eligibleApplications.some((application) => application.id === current)) {
            return current;
          }

          return eligibleApplications[0]?.id ?? null;
        });
      } catch (error) {
        console.error("Failed to load applications:", error);
        setApplicationError("加载申请记录失败，请稍后再试。");
      } finally {
        setLoadingApplications(false);
      }
    };

    loadApplications();
  }, []);

  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId]
  );

  const contentLength = form.content.trim().length;

  const updateField = <K extends keyof ReviewFormState>(field: K, value: ReviewFormState[K]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setRating(0);
    setHoverRating(0);
  };

  const handleSubmit = async () => {
    const currentUser = authService.getCurrentUser();
    const token = localStorage.getItem("token");

    if (!currentUser?.id || !token) {
      toast.error("请先登录后提交评价。");
      return;
    }

    if (!selectedApplication?.job?.id || !selectedApplication.job.company?.id) {
      toast.error("请选择可评价的职位。");
      return;
    }

    if (!form.title.trim()) {
      toast.error("请填写评价标题。");
      return;
    }

    if (!form.content.trim()) {
      toast.error("请填写评价内容。");
      return;
    }

    if (contentLength < 10) {
      toast.error("评价内容至少需要 10 个字。");
      return;
    }

    if (rating <= 0) {
      toast.error("请为本次体验评分。");
      return;
    }

    const payload: ReviewCreateInput = {
      title: form.title.trim(),
      content: form.content.trim(),
      rating,
      pros: form.pros.trim() || undefined,
      cons: form.cons.trim() || undefined,
      workPeriod: form.workPeriod.trim() || undefined,
      jobTitle: selectedApplication.job.title,
      anonymous: form.anonymous,
      companyId: selectedApplication.job.company.id,
      jobId: selectedApplication.job.id,
    };

    setSubmitting(true);

    try {
      await reviewService.createReview(payload);
      toast.success("评价提交成功！");
      resetForm();
      await onSuccess?.();
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("提交失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>选择已申请的职位</Label>
          <Select
            value={selectedApplicationId?.toString()}
            onValueChange={(value) => setSelectedApplicationId(value ? Number(value) : null)}
            disabled={loadingApplications || applications.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingApplications ? "正在加载职位..." : "请选择职位"} />
            </SelectTrigger>
            <SelectContent>
              {applications.map((application) => (
                <SelectItem
                  key={application.id}
                  value={application.id!.toString()}
                >
                  {application.job?.title || "未知职位"} · {application.job?.company?.name || "未知企业"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {applicationError && (
            <p className="text-sm text-red-500">{applicationError}</p>
          )}
          {!applicationError && !loadingApplications && applications.length === 0 && (
            <p className="text-sm text-muted-foreground">
              暂无可评价的申请记录。请先申请并完成带有企业信息的职位。
            </p>
          )}
        </div>

        {selectedApplication && (
          <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <BuildingIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">
                {selectedApplication.job?.title || "未知职位"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedApplication.job?.company?.name || "未知企业"}
                {form.workPeriod.trim() ? ` · ${form.workPeriod.trim()}` : ""}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="review-title">评价标题</Label>
          <Input
            id="review-title"
            placeholder="例如：工作体验不错，收获很大"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-work-period">工作周期</Label>
          <Input
            id="review-work-period"
            placeholder="例如：2025.01 - 2025.03"
            value={form.workPeriod}
            onChange={(event) => updateField("workPeriod", event.target.value)}
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
                aria-label={`评分 ${star} 星`}
              >
                <StarIcon
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {ratingDescriptions[rating] || "请选择您的评分"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-content">评价内容</Label>
          <Textarea
            id="review-content"
            placeholder="请描述您的兼职体验，包括工作内容、收获、建议等..."
            rows={6}
            value={form.content}
            onChange={(event) => updateField("content", event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            最少 10 个字，当前 {contentLength} 字
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-pros">优点（可选）</Label>
          <Textarea
            id="review-pros"
            placeholder="例如：团队氛围好、成长空间大"
            rows={3}
            value={form.pros}
            onChange={(event) => updateField("pros", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-cons">不足（可选）</Label>
          <Textarea
            id="review-cons"
            placeholder="例如：流程不够清晰、沟通节奏慢"
            rows={3}
            value={form.cons}
            onChange={(event) => updateField("cons", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-anonymous">匿名选项</Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="review-anonymous"
              checked={form.anonymous}
              onCheckedChange={(checked) => updateField("anonymous", checked === true)}
            />
            <Label htmlFor="review-anonymous" className="cursor-pointer text-sm font-normal">
              匿名发布此评价
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            匿名评价将不会显示您的姓名和个人信息。
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={resetForm}
            disabled={submitting}
          >
            <RotateCcwIcon className="mr-2 h-4 w-4" />
            重置
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={handleSubmit}
            disabled={submitting || loadingApplications || applications.length === 0}
          >
            {submitting ? (
              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
            ) : (
              <SaveIcon className="h-4 w-4" />
            )}
            {submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
