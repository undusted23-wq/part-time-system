import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarIcon, SearchIcon, UserIcon, BuildingIcon } from "lucide-react";
import reviewService, { Review } from "@/services/reviewService";
import companyService from "@/services/companyService";
import applicationService, { JobApplication } from "@/services/applicationService";
import jobService from "@/services/jobService";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const eligibleStatuses = new Set(["INTERVIEW", "OFFERED", "ACCEPTED", "REJECTED"]);

export default function EmployerReviews() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [writtenReviews, setWrittenReviews] = useState<Review[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [workPeriod, setWorkPeriod] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const employerCompanies = await companyService.getEmployerCompanies();

      const [incomingResponses, writtenResponses, employerJobs] = await Promise.all([
        Promise.all((employerCompanies || []).map((company) => reviewService.getCompanyReviews(company.id!))),
        Promise.all((employerCompanies || []).map((company) => reviewService.getCompanyAuthoredReviews(company.id!))),
        Promise.all((employerCompanies || []).map((company) => jobService.getJobsByCompany(company.id!)))
      ]);

      setReceivedReviews(incomingResponses.flatMap((response) => response.reviews || []));
      setWrittenReviews(writtenResponses.flatMap((response) => response || []));

      const flatJobs = employerJobs.flat();
      const applicationLists = await Promise.all(
        flatJobs.filter((job) => job.id).map((job) => applicationService.getApplicationsByJob(job.id!))
      );
      setApplications(applicationLists.flat());
    } catch (error) {
      console.error("Failed to load employer reviews:", error);
      setErrorMessage("加载评价数据失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const eligibleApplications = useMemo(() => {
    return applications.filter((application) => {
      const applicationId = application.id;
      const applicantId = application.applicant?.id;
      const companyId = application.job?.company?.id;
      const status = application.status || "PENDING";

      if (!applicationId || !applicantId || !companyId || !eligibleStatuses.has(status)) {
        return false;
      }

      return !writtenReviews.some((review) =>
        review.student?.id === applicantId &&
        review.job?.id === application.job?.id &&
        review.company?.id === companyId
      );
    });
  }, [applications, writtenReviews]);

  const selectedApplication = eligibleApplications.find(
    (application) => application.id?.toString() === selectedApplicationId
  );
  const requestedApplicationId = searchParams.get("applicationId");

  useEffect(() => {
    if (!eligibleApplications.length) {
      return;
    }

    if (requestedApplicationId) {
      const matchedApplication = eligibleApplications.find(
        (application) => application.id?.toString() === requestedApplicationId
      );

      if (matchedApplication) {
        setSelectedApplicationId(requestedApplicationId);
        return;
      }
    }

    if (!selectedApplicationId) {
      setSelectedApplicationId(eligibleApplications[0].id?.toString() || "");
    }
  }, [eligibleApplications, requestedApplicationId, selectedApplicationId]);

  const averageRating = useMemo(() => {
    if (receivedReviews.length === 0) {
      return 0;
    }
    return receivedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / receivedReviews.length;
  }, [receivedReviews]);

  const positiveRate = useMemo(() => {
    if (receivedReviews.length === 0) {
      return 0;
    }
    return Math.round((receivedReviews.filter((review) => review.rating >= 4).length / receivedReviews.length) * 100);
  }, [receivedReviews]);

  const filteredIncomingReviews = useMemo(() => {
    if (!searchQuery.trim()) {
      return receivedReviews;
    }
    const query = searchQuery.toLowerCase();
    return receivedReviews.filter((review) => {
      const studentName = review.student?.fullName || review.student?.username || "";
      const jobTitle = review.job?.title || review.jobTitle || "";
      const companyName = review.company?.name || "";
      return (
        studentName.toLowerCase().includes(query) ||
        jobTitle.toLowerCase().includes(query) ||
        companyName.toLowerCase().includes(query) ||
        (review.content || "").toLowerCase().includes(query)
      );
    });
  }, [receivedReviews, searchQuery]);

  const handleSubmit = async () => {
    if (!selectedApplication?.job?.company?.id || !selectedApplication?.applicant?.id || !selectedApplication.job?.id) {
      toast.error("请选择可评价的学生。");
      return;
    }
    if (!title.trim() || !content.trim() || rating <= 0) {
      toast.error("请完整填写标题、内容和评分。");
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.createReview({
        title: title.trim(),
        content: content.trim(),
        rating,
        workPeriod: workPeriod.trim() || undefined,
        anonymous: false,
        companyId: selectedApplication.job.company.id,
        studentId: selectedApplication.applicant.id,
        jobId: selectedApplication.job.id,
        jobTitle: selectedApplication.job.title
      });
      toast.success("学生评价已提交，等待管理员审核。");
      setSelectedApplicationId("");
      setTitle("");
      setContent("");
      setWorkPeriod("");
      setRating(0);
      await loadData();
    } catch (error) {
      console.error("Failed to create employer review:", error);
      toast.error("提交评价失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">评价管理</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">收到评价数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receivedReviews.length}</div>
            <p className="text-xs text-muted-foreground">学生对企业的反馈</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">平均评分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating ? averageRating.toFixed(1) : "-"}</div>
            <p className="text-xs text-muted-foreground">基于收到的学生评价</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">好评率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{receivedReviews.length ? `${positiveRate}%` : "-"}</div>
            <p className="text-xs text-muted-foreground">4-5 星占比</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">已评价学生</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writtenReviews.length}</div>
            <p className="text-xs text-muted-foreground">企业已发出的评价</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>评价学生</CardTitle>
          <CardDescription>对已进入后续流程的学生补充信用评价，提交后需要管理员审核。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {requestedApplicationId && !selectedApplication && eligibleApplications.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              当前申请暂不可评价，已为您切换到其他可评价学生。
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>选择学生</Label>
              <Select value={selectedApplicationId} onValueChange={setSelectedApplicationId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择学生和对应职位" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleApplications.map((application) => (
                    <SelectItem key={application.id} value={application.id!.toString()}>
                      {(application.applicant?.fullName || application.applicant?.username || "未知学生") +
                        " · " +
                        (application.job?.title || "未知职位")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>工作时间 / 合作阶段</Label>
              <Input value={workPeriod} onChange={(e) => setWorkPeriod(e.target.value)} placeholder="如：2026.03-2026.04" />
            </div>
          </div>

          {selectedApplication && (
            <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <BuildingIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{selectedApplication.applicant?.fullName || selectedApplication.applicant?.username}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.job?.title} · {selectedApplication.job?.company?.name}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>评价标题</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：沟通积极，履约稳定" />
          </div>

          <div className="space-y-2">
            <Label>评分</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="rounded p-1"
                  onClick={() => setRating(star)}
                >
                  <StarIcon className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>评价内容</Label>
            <Textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="描述学生的履约情况、沟通协作、完成质量等。"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "提交中..." : "提交学生评价"}
            </Button>
          </div>

          {eligibleApplications.length === 0 && (
            <p className="text-sm text-muted-foreground">暂无可评价的学生，已评价记录不会重复出现在列表中。</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索学生、职位或评价内容..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">正在加载评价...</div>
      )}
      {errorMessage && (
        <div className="text-center text-sm text-red-500">{errorMessage}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>收到的学生评价</CardTitle>
          <CardDescription>学生对企业和岗位的反馈</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredIncomingReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无收到的学生评价</p>
          ) : (
            filteredIncomingReviews.map((review) => (
              <Card key={`incoming-${review.id}`} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium">{review.student?.fullName || review.student?.username || "未知学生"}</p>
                      <p className="text-sm text-muted-foreground">
                        {review.job?.title || review.jobTitle || "兼职体验"} · {review.company?.name || "未知企业"}
                      </p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{review.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>我给学生的评价</CardTitle>
          <CardDescription>企业端已经提交的学生评价</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {writtenReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无已提交的学生评价</p>
          ) : (
            writtenReviews.map((review) => (
              <Card key={`written-${review.id}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{review.student?.fullName || review.student?.username || "未知学生"}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.job?.title || review.jobTitle || "岗位"} · {review.company?.name || "企业"}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{review.content}</p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {review.verified ? "已审核" : "待审核"}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
