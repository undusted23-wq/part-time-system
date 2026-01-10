import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import reviewService from "@/services/reviewService";
import { Star, ArrowLeft, Building2, Briefcase, User } from "lucide-react";

export default function VisitorReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    setLoading(true);
    reviewService.getAllReviewsPublic()
      .then((data) => {
        // 按创建时间倒序排列
        const sortedData = data.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setReviews(sortedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("获取评价信息失败:", error);
        setLoading(false);
      });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 */}
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <Link to="/visitor/home" className="flex items-center gap-2 text-blue-900 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
            <h1 className="text-2xl font-bold">浏览兼职评价</h1>
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
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无评价信息</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review: any) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{review.title}</CardTitle>
                      <div className="flex items-center gap-4 flex-wrap mb-2">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>
                        {review.verified && (
                          <Badge variant="default">已认证</Badge>
                        )}
                        {review.anonymous && (
                          <Badge variant="outline">匿名评价</Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{review.company?.name || "未知企业"}</span>
                        </div>
                        {review.job && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{review.job.title || review.jobTitle}</span>
                          </div>
                        )}
                        {!review.anonymous && review.student && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{review.student.username || "匿名用户"}</span>
                          </div>
                        )}
                        {review.createdAt && (
                          <span className="text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {review.content}
                  </p>
                  
                  {review.pros && (
                    <div className="mb-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">优点：</p>
                      <p className="text-sm text-green-700">{review.pros}</p>
                    </div>
                  )}
                  
                  {review.cons && (
                    <div className="mb-3 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-800 mb-1">缺点：</p>
                      <p className="text-sm text-orange-700">{review.cons}</p>
                    </div>
                  )}
                  
                  {review.workPeriod && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">工作时间：</span>
                      {review.workPeriod}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 统计信息 */}
        {!loading && reviews.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            共找到 {reviews.length} 条评价
          </div>
        )}

        {/* 提示信息 */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                想要发表评价？请先登录或注册账号
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/login">
                  <Button variant="outline">登录</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">注册</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
