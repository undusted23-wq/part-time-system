import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import jobService from "@/services/jobService";
import { Briefcase, Search, MapPin, Calendar, ArrowLeft, Building2 } from "lucide-react";

export default function VisitorJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    setLoading(true);
    jobService.getActiveJobsPublic()
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("获取兼职信息失败:", error);
        setLoading(false);
      });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      loadJobs();
      return;
    }

    setLoading(true);
    jobService.searchJobsPublic(searchQuery)
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("搜索兼职失败:", error);
        setLoading(false);
      });
  };

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 */}
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <Link to="/visitor/home" className="flex items-center gap-2 text-blue-900 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
            <h1 className="text-2xl font-bold">浏览兼职信息</h1>
          </Link>
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
        {/* 搜索栏 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索职位关键词..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>搜索</Button>
              {searchQuery && (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  loadJobs();
                }}>
                  清除
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 兼职列表 */}
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无兼职信息</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{job.company?.name || "未知企业"}</span>
                        </div>
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.applicationDeadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>截止：{formatDate(job.applicationDeadline)}</span>
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="outline">{formatJobType(job.jobType)}</Badge>
                      <span className="text-lg font-semibold text-blue-600">
                        {formatSalary(job.salary, job.salaryPeriod)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {job.description}
                  </p>
                  {job.requirements && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">任职要求：</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{job.requirements}</p>
                    </div>
                  )}
                  {job.benefits && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">福利待遇：</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{job.benefits}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      {job.createdAt && `发布于 ${formatDate(job.createdAt)}`}
                    </span>
                    <Link to="/login">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        登录后申请
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 统计信息 */}
        {!loading && jobs.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            共找到 {jobs.length} 个兼职岗位
          </div>
        )}
      </main>
    </div>
  );
}

