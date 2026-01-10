import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import jobService from "@/services/jobService";
import { Building2, Briefcase, Star, ArrowRight } from "lucide-react";

export default function VisitorHome() {
  const [hotJobs, setHotJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取热门兼职推荐（活跃的岗位，取前6个）
    jobService.getActiveJobsPublic()
      .then((jobs: any[]) => {
        const activeJobs = jobs.slice(0, 6);
        setHotJobs(activeJobs);
        setLoading(false);
      })
      .catch((error) => {
        console.error("获取兼职信息失败:", error);
        setLoading(false);
      });
  }, []);

  const formatSalary = (salary: number, salaryPeriod: string) => {
    if (!salary) return "面议";
    const periodMap: { [key: string]: string } = {
      HOURLY: "小时",
      DAILY: "天",
      WEEKLY: "周",
      MONTHLY: "月",
      ANNUALLY: "年",
      PROJECT_BASED: "项目"
    };
    return `¥${salary}/${periodMap[salaryPeriod] || "小时"}`;
  };

  const formatJobType = (jobType: string) => {
    const typeMap: { [key: string]: string } = {
      PART_TIME: "兼职",
      FULL_TIME: "全职",
      INTERNSHIP: "实习",
      CONTRACT: "合同",
      TEMPORARY: "临时",
      FREELANCE: "自由职业"
    };
    return typeMap[jobType] || jobType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 */}
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-900">大学生兼职服务管理系统</h1>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline">登录</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">注册</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto py-12">
        {/* 欢迎区域 */}
        <section className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-blue-900">欢迎来到兼职服务平台</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            在这里，您可以浏览企业信息、查找兼职岗位、查看真实评价
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/visitor/companies">
              <Button size="lg" variant="outline" className="gap-2">
                <Building2 className="h-5 w-5" />
                浏览企业
              </Button>
            </Link>
            <Link to="/visitor/jobs">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Briefcase className="h-5 w-5" />
                浏览兼职
              </Button>
            </Link>
            <Link to="/visitor/reviews">
              <Button size="lg" variant="outline" className="gap-2">
                <Star className="h-5 w-5" />
                查看评价
              </Button>
            </Link>
          </div>
        </section>

        {/* 快速导航卡片 */}
        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-3">
            <Link to="/visitor/companies">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Building2 className="h-12 w-12 text-blue-600 mb-2" />
                  <CardTitle>浏览企业信息</CardTitle>
                  <CardDescription>查看已认证的企业详情，了解企业文化和发展</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-blue-600 font-medium">
                    查看详情 <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/visitor/jobs">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Briefcase className="h-12 w-12 text-blue-600 mb-2" />
                  <CardTitle>浏览兼职信息</CardTitle>
                  <CardDescription>发现适合的兼职岗位，找到理想的工作机会</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-blue-600 font-medium">
                    查看详情 <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/visitor/reviews">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Star className="h-12 w-12 text-blue-600 mb-2" />
                  <CardTitle>浏览兼职评价</CardTitle>
                  <CardDescription>查看真实的工作评价，了解企业口碑</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-blue-600 font-medium">
                    查看详情 <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* 热门兼职推荐 */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-semibold text-blue-900">热门兼职推荐</h3>
            <Link to="/visitor/jobs">
              <Button variant="outline" className="gap-2">
                查看全部 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : hotJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无热门兼职推荐</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hotJobs.map((job: any) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <Badge variant="outline">{formatJobType(job.jobType)}</Badge>
                    </div>
                    <CardDescription>
                      {job.company?.name || "未知企业"} · {job.location || "未指定地点"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-blue-600">
                        {formatSalary(job.salary, job.salaryPeriod)}
                      </span>
                      <Link to={`/visitor/jobs`}>
                        <Button size="sm" variant="outline">查看详情</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-50 py-12 mt-16">
        <div className="container mx-auto text-center text-sm text-gray-600">
          © {new Date().getFullYear()} 大学生兼职服务管理系统。保留所有权利。
        </div>
      </footer>
    </div>
  );
}
