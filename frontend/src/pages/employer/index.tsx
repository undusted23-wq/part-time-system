import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseIcon, UsersIcon, BarChart3Icon, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function EmployerDashboard() {
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [applications, setApplications] = useState(recentApplications);

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedApplication) return;
    setApplications(prev => prev.map(a => a.id === selectedApplication.id ? { ...a, status: "已通过" } : a));
    setSelectedApplication({ ...selectedApplication, status: "已通过" });
  };

  const handleReject = () => {
    if (!selectedApplication) return;
    setApplications(prev => prev.map(a => a.id === selectedApplication.id ? { ...a, status: "已拒绝" } : a));
    setSelectedApplication({ ...selectedApplication, status: "已拒绝" });
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">欢迎回来，企业用户</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">有效职位</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">较上月增加2个</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">收到申请</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">近7天新增8个</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">简历浏览率</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">高于平台平均水平</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">企业评分</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">基于16个评价</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-4 text-xl font-semibold">最近收到的申请</h2>
      <div className="grid gap-4">
        {applications.map(application => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>{application.jobTitle}</CardTitle>
                  <CardDescription className="mt-1">申请人: {application.applicant} · 申请时间: {application.appliedAt}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${application.status === "待审核"
                    ? "bg-yellow-100 text-yellow-800"
                    : application.status === "已通过"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                    {application.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">学历: {application.education} · 相关经验: {application.experience}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>匹配度</span>
                      <span>{application.matchRate}%</span>
                    </div>
                    <Progress value={application.matchRate} className="h-2" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(application)}
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-4 text-xl font-semibold">近期数据统计</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>职位点击量</CardTitle>
            <CardDescription>最近7天数据</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobClicksData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#3b82f6" name="点击量" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>申请转化率</CardTitle>
            <CardDescription>浏览到申请的转化</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">图表区域 - 实际应用中显示饼图</p>
          </CardContent>
        </Card>
      </div>

      {/* 申请详情 Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>申请详情</DialogTitle>
            <DialogDescription>
              查看完整的申请信息和候选人资料
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">职位名称</p>
                    <p className="text-base font-semibold">{selectedApplication.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">申请人</p>
                    <p className="text-base font-semibold">{selectedApplication.applicant}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">申请时间</p>
                    <p className="text-base">{selectedApplication.appliedAt}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">状态</p>
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${selectedApplication.status === "待审核"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedApplication.status === "已通过"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">学历</p>
                    <p className="text-base">{selectedApplication.education}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">相关经验</p>
                    <p className="text-base">{selectedApplication.experience}</p>
                  </div>
                </div>

                {/* 匹配度 */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">匹配度评分</span>
                    <span className="font-semibold">{selectedApplication.matchRate}%</span>
                  </div>
                  <Progress value={selectedApplication.matchRate} className="h-3" />
                </div>

                {/* 详细信息 */}
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium mb-1">联系方式</p>
                    <p className="text-sm text-muted-foreground">邮箱: {selectedApplication.applicant.toLowerCase().replace(/[\u4e00-\u9fa5]/g, '')}@example.com</p>
                    <p className="text-sm text-muted-foreground">电话: 138****5678</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">求职信</p>
                    <p className="text-sm text-muted-foreground">
                      尊敬的招聘负责人，我对贵公司的{selectedApplication.jobTitle}职位非常感兴趣。
                      我具有{selectedApplication.experience}的相关经验，相信能够胜任该职位的要求。
                      期待能有机会为贵公司贡献我的专业技能。
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">技能标签</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["JavaScript", "React", "TypeScript", "Node.js", "Git"].map((skill, i) => (
                        <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>关闭</Button>
                <Button variant="destructive" onClick={handleReject}>拒绝</Button>
                <Button onClick={handleApprove}>通过</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 模拟数据 - 实际应用中应该从API获取
const recentApplications = [
  {
    id: 1,
    jobTitle: "前端开发实习生",
    applicant: "张三",
    appliedAt: "2025-04-12",
    status: "待审核",
    education: "本科在读",
    experience: "1年",
    matchRate: 85
  },
  {
    id: 2,
    jobTitle: "UI设计师",
    applicant: "李四",
    appliedAt: "2025-04-11",
    status: "已通过",
    education: "本科",
    experience: "2年",
    matchRate: 92
  },
  {
    id: 3,
    jobTitle: "市场推广专员",
    applicant: "王五",
    appliedAt: "2025-04-10",
    status: "已拒绝",
    education: "硕士",
    experience: "无经验",
    matchRate: 65
  },
  {
    id: 4,
    jobTitle: "产品经理助理",
    applicant: "赵六",
    appliedAt: "2025-04-09",
    status: "待审核",
    education: "本科在读",
    experience: "无经验",
    matchRate: 75
  }
];

// 职位点击量数据
const jobClicksData = [
  { day: "周一", clicks: 42 },
  { day: "周二", clicks: 58 },
  { day: "周三", clicks: 65 },
  { day: "周四", clicks: 52 },
  { day: "周五", clicks: 78 },
  { day: "周六", clicks: 35 },
  { day: "周日", clicks: 28 }
];
