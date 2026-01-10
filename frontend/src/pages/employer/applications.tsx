import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchIcon, CheckIcon, XIcon, MessageSquareIcon, UserIcon, FileTextIcon } from "lucide-react";
import applicationService, { JobApplication } from "@/services/applicationService";
import companyService from "@/services/companyService";
import jobService, { Job } from "@/services/jobService";
import messageService from "@/services/messageService";

export default function Applications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statusMeta: Record<string, { label: string; className: string }> = {
    PENDING: { label: "待审核", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    REVIEWING: { label: "审核中", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    SHORTLISTED: { label: "已入围", className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100" },
    INTERVIEW: { label: "面试中", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    OFFERED: { label: "已发Offer", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    ACCEPTED: { label: "已录用", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    REJECTED: { label: "已拒绝", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    WITHDRAWN: { label: "已撤回", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" }
  };

  const loadApplications = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const companies = await companyService.getEmployerCompanies();
      const jobLists = await Promise.all(
        (companies || []).map((company) => jobService.getJobsByCompany(company.id))
      );
      const employerJobs = jobLists.flat();
      setJobs(employerJobs);

      const applicationLists = await Promise.all(
        employerJobs
          .filter((job) => job.id)
          .map((job) => applicationService.getApplicationsByJob(job.id as number))
      );
      setApplications(applicationLists.flat());
    } catch (error) {
      console.error("Failed to load applications:", error);
      setErrorMessage("加载申请记录失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const status = application.status || "PENDING";
      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }
      if (jobFilter !== "all" && application.job?.id?.toString() !== jobFilter) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const applicantName = application.applicant?.fullName || application.applicant?.username || "";
        const jobTitle = application.job?.title || "";
        if (!applicantName.toLowerCase().includes(query) && !jobTitle.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [applications, jobFilter, searchQuery, statusFilter]);

  const updateStatus = async (application: JobApplication, status: string) => {
    if (!application.id) {
      return;
    }
    try {
      const updated = await applicationService.updateApplicationStatus(application.id, status);
      setApplications((prev) => prev.map((item) => (item.id === application.id ? updated : item)));
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("更新状态失败，请稍后再试。");
    }
  };

  const handleAddNote = async (application: JobApplication) => {
    if (!application.id) {
      return;
    }
    const notes = window.prompt("输入备注", application.employerNotes || "");
    if (notes === null) {
      return;
    }
    try {
      const updated = await applicationService.addEmployerNotes(application.id, notes);
      setApplications((prev) => prev.map((item) => (item.id === application.id ? updated : item)));
    } catch (error) {
      console.error("Failed to update notes:", error);
      alert("更新备注失败，请稍后再试。");
    }
  };

  const handleMessageApplicant = async (application: JobApplication) => {
    const receiverId = application.applicant?.id;
    if (!receiverId) {
      alert("无法获取申请人信息。");
      return;
    }
    const content = window.prompt("输入要发送的消息");
    if (!content) {
      return;
    }
    try {
      await messageService.sendMessage({
        receiverId,
        subject: application.job?.title || "招聘沟通",
        content
      });
      alert("消息已发送");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("发送失败，请稍后再试。");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">申请记录</h1>
        <div className="text-sm text-muted-foreground">
          总计: {applications.length} 条申请记录
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索申请人姓名或职位"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">所有状态</option>
          <option value="PENDING">待审核</option>
          <option value="REVIEWING">审核中</option>
          <option value="INTERVIEW">面试中</option>
          <option value="OFFERED">已发Offer</option>
          <option value="ACCEPTED">已录用</option>
          <option value="REJECTED">已拒绝</option>
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2"
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
        >
          <option value="all">所有职位</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">正在加载申请记录...</div>
      )}
      {errorMessage && (
        <div className="text-center text-sm text-red-500">{errorMessage}</div>
      )}

      <div className="grid gap-4">
        {filteredApplications.map((application) => {
          const status = application.status || "PENDING";
          const meta = statusMeta[status] || statusMeta.PENDING;
          return (
            <Card key={application.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{application.job?.title || "未知职位"}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {application.applicant?.fullName || application.applicant?.username || "未知申请人"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {application.job?.company?.name || "未知企业"}
                      </span>
                    </div>
                  </div>
                  <Badge className={meta.className}>{meta.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">申请时间</p>
                      <p className="text-sm font-medium">
                        {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">求职信</p>
                      <p className="text-sm font-medium">{application.coverLetter ? "已提交" : "未填写"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">简历链接</p>
                      <p className="text-sm font-medium">{application.resumeUrl ? "已提供" : "未提供"}</p>
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">求职信内容</p>
                      <p className="text-sm">{application.coverLetter}</p>
                    </div>
                  )}

                  {application.employerNotes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">雇主备注</p>
                      <p className="text-sm">{application.employerNotes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-2">
                    {(status === "PENDING" || status === "REVIEWING" || status === "SHORTLISTED") && (
                      <>
                        <Button variant="outline" className="gap-1" size="sm" onClick={() => updateStatus(application, "INTERVIEW")}
                        >
                          <CheckIcon className="h-4 w-4 text-green-600" />
                          安排面试
                        </Button>
                        <Button variant="outline" className="gap-1" size="sm" onClick={() => updateStatus(application, "REJECTED")}
                        >
                          <XIcon className="h-4 w-4 text-red-600" />
                          拒绝
                        </Button>
                      </>
                    )}
                    {(status === "INTERVIEW" || status === "OFFERED") && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => updateStatus(application, "ACCEPTED")}
                      >
                        <CheckIcon className="h-4 w-4 text-green-600" />
                        录用
                      </Button>
                    )}
                    <Button variant="outline" className="gap-1" size="sm" onClick={() => handleAddNote(application)}>
                      <FileTextIcon className="h-4 w-4" />
                      添加备注
                    </Button>
                    <Button variant="outline" className="gap-1" size="sm" onClick={() => handleMessageApplicant(application)}>
                      <MessageSquareIcon className="h-4 w-4" />
                      联系申请人
                    </Button>
                    {application.resumeUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.resumeUrl} target="_blank" rel="noreferrer">
                          查看简历
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loading && !errorMessage && filteredApplications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <UserIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground">没有找到符合条件的申请记录</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
