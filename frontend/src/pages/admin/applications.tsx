import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  CheckIcon, 
  ClipboardIcon, 
  FileTextIcon, 
  SearchIcon, 
  TrashIcon,
  UserIcon 
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import applicationService, { JobApplication } from "@/services/applicationService";

export default function ApplicationManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await applicationService.getAllApplications();
        setApplications(data);
      } catch (error) {
        console.error("Failed to load applications:", error);
        setErrorMessage("加载申请记录失败，请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const statusLabel = (status?: string) => {
    switch (status) {
      case "PENDING":
        return "待处理";
      case "REVIEWING":
        return "审核中";
      case "SHORTLISTED":
        return "已入围";
      case "INTERVIEW":
        return "面试中";
      case "OFFERED":
        return "已发offer";
      case "ACCEPTED":
        return "已录用";
      case "REJECTED":
        return "已拒绝";
      case "WITHDRAWN":
        return "已撤回";
      default:
        return status || "-";
    }
  };

  const statusBadgeClass = (status?: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWING":
      case "SHORTLISTED":
        return "bg-blue-100 text-blue-800";
      case "INTERVIEW":
        return "bg-indigo-100 text-indigo-800";
      case "OFFERED":
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
      case "WITHDRAWN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // 前端过滤，服务端已返回全量申请数据
  const filteredApplications = applications.filter(application => {
    // 状态筛选
    if (statusFilter !== "all" && application.status !== statusFilter) {
      return false;
    }
    
    // 搜索查询
    if (
      searchQuery &&
      !getApplicantName(application).includes(searchQuery) &&
      !(application.job?.title || "").includes(searchQuery) &&
      !(application.job?.company?.name || "").includes(searchQuery)
    ) {
      return false;
    }
    
    return true;
  });

  const handleStatusChange = async (application: JobApplication, nextStatus: string) => {
    if (!application.id) {
      return;
    }
    try {
      const updated = await applicationService.updateApplicationStatus(application.id, nextStatus);
      setApplications((prev) =>
        prev.map((item) => (item.id === application.id ? updated : item))
      );
    } catch (error) {
      console.error("Failed to update application status:", error);
      setErrorMessage("更新申请状态失败，请稍后再试。");
    }
  };

  const handleDeleteApplication = async (application: JobApplication) => {
    if (!application.id) {
      return;
    }
    const confirmed = window.confirm("确认删除该申请记录吗？");
    if (!confirmed) {
      return;
    }
    try {
      await applicationService.deleteApplication(application.id);
      setApplications((prev) => prev.filter((item) => item.id !== application.id));
    } catch (error) {
      console.error("Failed to delete application:", error);
      setErrorMessage("删除申请记录失败，请稍后再试。");
    }
  };

  const getApplicantName = (application: JobApplication) => {
    return application.applicant?.fullName || application.applicant?.username || "未知学生";
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "PENDING").length;
    const interview = applications.filter((a) => a.status === "INTERVIEW").length;
    const accepted = applications.filter((a) => a.status === "ACCEPTED").length;
    const completed = applications.filter((a) => a.status === "WITHDRAWN").length;
    const interviewRate = total ? Math.round(((interview + accepted) / total) * 100) : 0;
    const offerRate = total ? Math.round((accepted / total) * 100) : 0;
    return {
      total,
      pending,
      interviewRate,
      offerRate,
      completed
    };
  }, [applications]);

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">学生应聘管理</h1>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="搜索学生、职位或企业..." 
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
          <option value="SHORTLISTED">已入围</option>
          <option value="INTERVIEW">面试中</option>
          <option value="OFFERED">已发offer</option>
          <option value="ACCEPTED">已录用</option>
          <option value="REJECTED">已拒绝</option>
          <option value="WITHDRAWN">已撤回</option>
        </select>
      </div>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle>应聘记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">申请ID</th>
                  <th className="p-2 text-left font-medium">学生</th>
                  <th className="p-2 text-left font-medium">申请职位</th>
                  <th className="p-2 text-left font-medium">企业</th>
                  <th className="p-2 text-left font-medium">申请时间</th>
                  <th className="p-2 text-left font-medium">状态</th>
                  <th className="p-2 text-left font-medium">最近更新</th>
                  <th className="p-2 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="border-b">
                    <td className="p-2">{application.id}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        {getApplicantName(application)}
                      </div>
                    </td>
                    <td className="p-2">{application.job?.title || "-"}</td>
                    <td className="p-2">{application.job?.company?.name || "-"}</td>
                    <td className="p-2">{application.appliedAt ? new Date(application.appliedAt).toLocaleString() : "-"}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusBadgeClass(application.status)
                      }`}>
                        {statusLabel(application.status)}
                      </span>
                    </td>
                    <td className="p-2">{application.updatedAt ? new Date(application.updatedAt).toLocaleString() : "-"}</td>
                    <td className="p-2">
                      <div className="flex justify-center gap-1">
                        <select
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          value={application.status}
                          onChange={(e) => handleStatusChange(application, e.target.value)}
                        >
                          <option value="PENDING">待处理</option>
                          <option value="REVIEWING">审核中</option>
                          <option value="SHORTLISTED">已入围</option>
                          <option value="INTERVIEW">面试中</option>
                          <option value="OFFERED">已发offer</option>
                          <option value="ACCEPTED">已录用</option>
                          <option value="REJECTED">已拒绝</option>
                          <option value="WITHDRAWN">已撤回</option>
                        </select>
                        {application.resumeUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(application.resumeUrl, "_blank")}
                          >
                            <FileTextIcon className="h-4 w-4" />
                            <span className="sr-only">查看简历</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDeleteApplication(application)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">删除记录</span>
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
              <p className="text-center text-muted-foreground">正在加载申请记录...</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-red-500">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredApplications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">没有找到符合条件的申请记录</p>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示 {filteredApplications.length} 条记录，共 {applications.length} 条
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">总申请数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">当前系统申请总量</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">待处理申请</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">待处理数量</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">面试转化率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.interviewRate}%
            </div>
            <p className="text-xs text-muted-foreground">申请到面试的比例</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">录用率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.offerRate}%
            </div>
            <p className="text-xs text-muted-foreground">申请到录用的比例</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近申请</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {applications
              .sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime())
              .slice(0, 5)
              .map(application => (
                <div key={application.id} className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <ClipboardIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getApplicantName(application)} 申请了 {application.job?.title || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {application.job?.company?.name || "-"} · {application.appliedAt ? new Date(application.appliedAt).toLocaleString() : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {application.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleStatusChange(application, "REVIEWING")}
                      >
                        <CheckIcon className="h-3 w-3" />
                        审核
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
