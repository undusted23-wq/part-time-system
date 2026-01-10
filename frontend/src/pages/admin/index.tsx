import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseIcon, BuildingIcon, UsersIcon, MessageSquareIcon, StarIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AdminDashboard() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">管理员仪表盘</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总学生数</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">较上月增加32名</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">企业数量</CardTitle>
            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">较上月增加5家</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">有效职位</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">昨日新增12个</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待处理举报</CardTitle>
            <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">较上周减少3个</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>系统用户增长趋势</CardTitle>
            <CardDescription>过去12个月用户增长情况</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">图表区域 - 实际应用中显示折线图</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>用户类型分布</CardTitle>
            <CardDescription>按角色划分</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">饼图区域 - 实际应用中显示用户类型分布</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-2">最近活动</h2>
      <div className="grid gap-4">
        {recentActivities.map((activity, index) => (
          <Card key={index}>
            <CardHeader className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === "学生注册" ? "bg-blue-100" :
                  activity.type === "企业注册" ? "bg-green-100" :
                  activity.type === "职位发布" ? "bg-purple-100" :
                  activity.type === "简历提交" ? "bg-yellow-100" :
                  "bg-gray-100"
                }`}>
                  {activity.type === "学生注册" && <UsersIcon className="h-5 w-5 text-blue-600" />}
                  {activity.type === "企业注册" && <BuildingIcon className="h-5 w-5 text-green-600" />}
                  {activity.type === "职位发布" && <BriefcaseIcon className="h-5 w-5 text-purple-600" />}
                  {activity.type === "简历提交" && <StarIcon className="h-5 w-5 text-yellow-600" />}
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-2">系统状态</h2>
      <Card>
        <CardHeader>
          <CardTitle>系统资源使用情况</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU 使用率</span>
                <span>28%</span>
              </div>
              <Progress value={28} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>内存使用率</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>存储使用率</span>
                <span>62%</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 模拟数据 - 实际应用中应该从API获取
const recentActivities = [
  {
    title: "新用户 张三 注册成功",
    time: "10分钟前",
    type: "学生注册"
  },
  {
    title: "科技有限公司发布了新职位：前端开发工程师",
    time: "30分钟前",
    type: "职位发布"
  },
  {
    title: "学生 李四 提交了新简历申请",
    time: "2小时前",
    type: "简历提交"
  },
  {
    title: "未来科技有限公司完成企业认证",
    time: "3小时前",
    type: "企业注册"
  },
  {
    title: "管理员处理了3个用户举报",
    time: "昨天",
    type: "系统维护"
  }
];
