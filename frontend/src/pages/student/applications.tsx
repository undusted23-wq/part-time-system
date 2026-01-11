import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ClockIcon, MessageCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import applicationService, { JobApplication } from "@/services/applicationService";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Applications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<number | null>(null);

  const statusMeta: Record<string, { label: string; className: string }> = {
    PENDING: { label: "已申请", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    REVIEWING: { label: "审核中", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    SHORTLISTED: { label: "已入围", className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100" },
    INTERVIEW: { label: "面试中", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    OFFERED: { label: "已发Offer", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    ACCEPTED: { label: "已录用", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    REJECTED: { label: "已拒绝", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    WITHDRAWN: { label: "已撤回", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" }
  };

  const loadApplications = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await applicationService.getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
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

  const handleWithdraw = async (applicationId?: number) => {
    if (!applicationId) {
      return;
    }
    setApplicationToWithdraw(applicationId);
    setWithdrawDialogOpen(true);
  };

  const confirmWithdraw = async () => {
    if (!applicationToWithdraw) {
      return;
    }
    try {
      await applicationService.deleteApplication(applicationToWithdraw);
      setApplications((prev) => prev.filter((item) => item.id !== applicationToWithdraw));
      toast.success("申请已成功撤回");
    } catch (error) {
      console.error("Failed to withdraw application:", error);
      toast.error("撤回失败，请稍后再试。");
    } finally {
      setWithdrawDialogOpen(false);
      setApplicationToWithdraw(null);
    }
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">我的申请</h1>
      
      <div className="grid gap-4">
        {loading && (
          <div className="text-center text-sm text-muted-foreground">正在加载申请记录...</div>
        )}
        {errorMessage && (
          <div className="text-center text-sm text-red-500">{errorMessage}</div>
        )}
        {!loading && !errorMessage && applications.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">暂无申请记录</div>
        )}
        {applications.map((application) => {
          const status = application.status || "PENDING";
          const meta = statusMeta[status] || statusMeta.PENDING;
          return (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{application.job?.title || "未知职位"}</CardTitle>
                    <CardDescription className="mt-1">
                      {application.job?.company?.name || "未知企业"}
                    </CardDescription>
                  </div>
                  <Badge className={meta.className}>{meta.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ClockIcon className="mr-1 h-4 w-4" />
                    申请日期: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : "-"}
                  </div>
                  {application.coverLetter && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">求职信:</p>
                      <p className="text-sm text-muted-foreground">{application.coverLetter}</p>
                    </div>
                  )}
                  {application.employerNotes && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">雇主备注:</p>
                      <p className="text-sm text-muted-foreground">{application.employerNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {status !== "REJECTED" && status !== "ACCEPTED" && status !== "WITHDRAWN" && (
                  <Button variant="outline" onClick={() => handleWithdraw(application.id)}>撤回申请</Button>
                )}
                <Button className="gap-1" asChild>
                  <Link to="/student/messages">
                    <MessageCircleIcon className="h-4 w-4" />
                    去消息中心
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认撤回申请</AlertDialogTitle>
            <AlertDialogDescription>
              确认撤回该申请吗？撤回后您可以重新申请该职位。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmWithdraw}>确认撤回</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
