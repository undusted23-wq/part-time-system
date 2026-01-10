import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3Icon, TrendingUpIcon, ActivityIcon, UsersIcon, AreaChartIcon, PieChartIcon } from "lucide-react";
import { format, subDays } from "date-fns";

// 引入Chart组件
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from "@/components/ui/chart";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

export default function Analytics() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">统计分析</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">简历查看率</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-muted-foreground">较上月提高了12%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">职位点击数</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">542</div>
            <p className="text-xs text-muted-foreground">过去30天总计</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">平均面试率</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.3%</div>
            <p className="text-xs text-muted-foreground">高于行业平均水平</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已招聘人数</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">今年累计</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>职位访问趋势</CardTitle>
            <CardDescription>最近30天访问量</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer 
              config={{
                views: { color: "#3b82f6" },
                applications: { color: "#10b981" }
              }}>
              <LineChart data={jobVisitTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), "MM-dd")}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ChartTooltip 
                  content={(
                    <ChartTooltipContent 
                      labelFormatter={(value) => format(new Date(value), "yyyy-MM-dd")}
                    />
                  )}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  name="浏览量" 
                  strokeWidth={2} 
                  stroke="#3b82f6"
                  activeDot={{ r: 6 }}  
                />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  name="申请数" 
                  strokeWidth={2} 
                  stroke="#10b981"
                  activeDot={{ r: 6 }} 
                />
                <ChartLegend
                  content={<ChartLegendContent />}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>申请来源分布</CardTitle>
            <CardDescription>简历来源渠道</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                "校园招聘": { color: "#3b82f6" },
                "官网": { color: "#10b981" },
                "招聘平台": { color: "#f59e0b" },
                "员工推荐": { color: "#6366f1" },
                "社交媒体": { color: "#ec4899" }
              }}
            >
              <PieChart>
                <Pie
                  data={applicationSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {applicationSources.map((_, index) => {
                    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];
                    return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                  })}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelKey="name" nameKey="name" />
                  }
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>职位申请对比</CardTitle>
              <CardDescription>各职位申请数据比较</CardDescription>
            </div>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                applications: { color: "#3b82f6" },
                interviews: { color: "#10b981" },
                hired: { color: "#f59e0b" }
              }}
            >
              <BarChart data={jobPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="title" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="applications" name="申请人数" fill="#3b82f6" />
                <Bar dataKey="interviews" name="面试人数" fill="#10b981" />
                <Bar dataKey="hired" name="录用人数" fill="#f59e0b" />
                <ChartLegend
                  content={<ChartLegendContent />}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>周申请趋势</CardTitle>
              <CardDescription>过去4周申请量变化</CardDescription>
            </div>
            <AreaChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                count: { color: "#3b82f6" }
              }}
            >
              <AreaChart data={weeklyApplications}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="week" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="申请数量" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2} 
                />
                <ChartLegend
                  content={<ChartLegendContent />}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
  
      <h2 className="text-xl font-semibold mt-2">职位表现</h2>
      <div className="grid gap-4">
        {jobPerformance.map(job => (
          <Card key={job.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>{job.title}</CardTitle>
                <span className="text-sm font-medium">{job.applications} 份申请</span>
              </div>
              <CardDescription>{job.department} · {job.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>浏览量</span>
                    <span>{job.views} 次</span>
                  </div>
                  <Progress value={(job.views / 200) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>申请转化率</span>
                    <span>{job.conversionRate}%</span>
                  </div>
                  <Progress value={job.conversionRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>候选人质量</span>
                    <span>{job.candidateQuality}/10</span>
                  </div>
                  <Progress value={job.candidateQuality * 10} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">平均响应时间</p>
                    <p className="font-medium">{job.responseTime}小时</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">面试邀请</p>
                    <p className="font-medium">{job.interviews}人</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">录取人数</p>
                    <p className="font-medium">{job.hired}人</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// 模拟数据 - 实际应用中应该从API获取
const jobPerformance = [
  {
    id: 1,
    title: "前端开发实习生",
    department: "技术部",
    type: "实习",
    views: 145,
    applications: 12,
    conversionRate: 8.3,
    candidateQuality: 7.5,
    responseTime: 24,
    interviews: 5,
    hired: 2
  },
  {
    id: 2,
    title: "市场推广专员",
    department: "市场部",
    type: "兼职",
    views: 98,
    applications: 8,
    conversionRate: 8.2,
    candidateQuality: 6.8,
    responseTime: 36,
    interviews: 3,
    hired: 1
  },
  {
    id: 3,
    title: "UI设计师",
    department: "设计部",
    type: "兼职",
    views: 210,
    applications: 15,
    conversionRate: 7.1,
    candidateQuality: 8.2,
    responseTime: 18,
    interviews: 6,
    hired: 3
  }
];

// 职位访问趋势数据
const jobVisitTrends = Array.from({ length: 30 }, (_, i) => {
  const date = subDays(new Date(), 29 - i);
  return {
    date: date.toISOString(),
    views: Math.floor(Math.random() * 30) + 20,
    applications: Math.floor(Math.random() * 5) + 1,
  };
});

// 申请来源分布数据
const applicationSources = [
  { name: "校园招聘", value: 35 },
  { name: "官网", value: 25 },
  { name: "招聘平台", value: 20 },
  { name: "员工推荐", value: 15 },
  { name: "社交媒体", value: 5 }
];

// 周申请趋势数据
const weeklyApplications = [
  { week: "第1周", count: 28 },
  { week: "第2周", count: 35 },
  { week: "第3周", count: 42 },
  { week: "第4周", count: 38 }
];

// 部门分布统计
const departmentStats = [
  { name: "技术部", value: 12 },
  { name: "市场部", value: 8 },
  { name: "设计部", value: 5 },
  { name: "人力资源", value: 3 },
  { name: "财务部", value: 2 }
];

// 工作类型统计
const jobTypeStats = [
  { name: "全职", value: 15 },
  { name: "兼职", value: 25 },
  { name: "实习", value: 35 },
  { name: "临时", value: 5 }
];

// 经验要求统计
const experienceStats = [
  { name: "无经验", value: 18 },
  { name: "1-3年", value: 24 },
  { name: "3-5年", value: 12 },
  { name: "5年以上", value: 6 }
];
