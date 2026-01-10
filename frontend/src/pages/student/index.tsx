import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
// 👇 1. 引入了 RefreshCw 图标
import { BriefcaseIcon, BookmarkIcon, FileTextIcon, StarIcon, Sparkles, RefreshCw } from "lucide-react"; 
import { Link } from "react-router-dom";
import jobService, { Job } from "@/services/jobService";
import applicationService from "@/services/applicationService";
import savedJobService from "@/services/savedJobService";
import reviewService from "@/services/reviewService";
import resumeService from "@/services/resumeService";
// 👇 2. 引入 Button 组件 (如果你报错说找不到这个，请看代码下方的提示)
import { Button } from "@/components/ui/button"; 

export default function StudentDashboard() {
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  // 👇 3. 新增状态：控制刷新按钮是否在旋转
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    applications: 0,
    saved: 0,
    resumeCompletion: 0,
    reviewAverage: 0,
    reviewCount: 0
  });

  // 👇 4. 把获取数据的逻辑提取出来，方便重复调用
  const fetchRecommendations = async () => {
    try {
      setRefreshing(true); // 开始旋转图标
      // 如果不是第一次加载，就不显示全屏 loading，只转图标
      if (recommendedJobs.length === 0) setLoading(true);

      console.log("🚀 [前端] 正在刷新 AI 推荐...");
      
      const data = await jobService.getRecommendedJobs();
      
      console.log("✅ [前端] 获取到数据:", data);

      if (data && data.length > 0) {
         setRecommendedJobs(data);
      } else {
         setRecommendedJobs([]); // 没数据就清空
      }

    } catch (error) {
      console.error("❌ 请求失败:", error);
      // 如果报错，保留之前的列表或者显示空，这里不再强制塞假数据了，因为数据库已经修好了
    } finally {
      setLoading(false);
      // 强制让图标至少转 500ms，给用户一种“刷好了”的感觉
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // 页面加载时自动调一次
  useEffect(() => {
    fetchRecommendations();
    const fetchStats = async () => {
      try {
        const [applications, savedJobs, reviews, defaultResume] = await Promise.all([
          applicationService.getMyApplications(),
          savedJobService.getMySavedJobs(),
          reviewService.getMyReviews(),
          resumeService.getMyDefaultResume().catch(() => null)
        ]);

        const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
        const reviewAverage = reviewCount > 0
          ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount
          : 0;

        let resumeCompletion = 0;
        if (defaultResume) {
          const checks = [
            Boolean(defaultResume.title),
            Boolean(defaultResume.summary),
            Boolean(defaultResume.skills),
            Boolean(defaultResume.resumeFilePath),
            Array.isArray(defaultResume.educationList) && defaultResume.educationList.length > 0,
            Array.isArray(defaultResume.workExperienceList) && defaultResume.workExperienceList.length > 0
          ];
          const completed = checks.filter(Boolean).length;
          resumeCompletion = Math.round((completed / checks.length) * 100);
        }

        setStats({
          applications: Array.isArray(applications) ? applications.length : 0,
          saved: Array.isArray(savedJobs) ? savedJobs.length : 0,
          resumeCompletion,
          reviewAverage,
          reviewCount
        });
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

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
    return `¥${salary}/${periodMap[period || ""] || "薪资"}`;
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">欢迎回来，同学</h1>
        <div className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
           <Sparkles className="w-4 h-4" />
           <span>智能推荐引擎已就绪</span>
        </div>
      </div>
      
      {/* 顶部统计卡片 (保持不变) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">我的申请</CardTitle><BriefcaseIcon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.applications}</div><p className="text-xs text-muted-foreground">已提交的申请数量</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">收藏的职位</CardTitle><BookmarkIcon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.saved}</div><p className="text-xs text-muted-foreground">保存以后查看</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">简历完整度</CardTitle><FileTextIcon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.resumeCompletion}%</div><p className="text-xs text-muted-foreground">提高竞争力</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">我的评价</CardTitle><StarIcon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.reviewAverage ? stats.reviewAverage.toFixed(1) : "-"}</div><p className="text-xs text-muted-foreground">基于 {stats.reviewCount} 次评价</p></CardContent></Card>
      </div>

      <div className="mt-6">
        {/* 👇 5. 修改了这里的标题栏，放入了刷新按钮 */}
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="text-purple-600 w-5 h-5" />
              为您推荐的职位 (AI Powered)
            </h2>
            
            <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchRecommendations} // 点击触发刷新
                disabled={refreshing}          // 刷新时禁止重复点击
                className="gap-2"
            >
                {/* 如果 refreshing 为 true，添加 animate-spin 类让它旋转 */}
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                刷新推荐
            </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500">正在根据您的简历分析匹配职位...</div>
        ) : recommendedJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            暂无推荐，请完善您的技能标签或等待更多职位发布。
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recommendedJobs.map(job => (
              <Card key={job.id} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {job.company?.name || "未知公司"} · {job.location || "未标注地点"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">AI 推荐</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-green-600">{formatSalary(job.salary, job.salaryPeriod)}</div>
                    <Link 
                      to="/student/search"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      查看详情 →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
