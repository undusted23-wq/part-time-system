import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  CheckIcon, 
  FlagIcon, 
  SearchIcon, 
  StarIcon, 
  TrashIcon 
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import reviewService, { Review } from "@/services/reviewService";

export default function ReviewManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await reviewService.getAllReviews();
        setReviews(data);
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setErrorMessage("加载评价列表失败，请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const getReviewStatus = (review: Review) => (review.verified ? "published" : "pending");

  const getStudentName = (review: Review) => {
    if (review.anonymous) {
      return "匿名用户";
    }
    return review.student?.fullName || review.student?.username || "未知学生";
  };

  const getJobTitle = (review: Review) => review.job?.title || review.jobTitle || "-";

  const getCompanyName = (review: Review) => review.company?.name || "-";

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);
  
  // 前端过滤，服务端已返回全量评价数据
  const filteredReviews = reviews.filter(review => {
    const status = getReviewStatus(review);
    // 状态筛选
    if (statusFilter !== "all" && status !== statusFilter) {
      return false;
    }
    
    // 评分筛选
    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter);
      if (review.rating !== rating) {
        return false;
      }
    }
    
    // 搜索查询
    if (
      searchQuery &&
      !getStudentName(review).includes(searchQuery) && 
      !getJobTitle(review).includes(searchQuery) && 
      !getCompanyName(review).includes(searchQuery)
    ) {
      return false;
    }
    
    return true;
  });

  const handleVerifyReview = async (review: Review) => {
    if (!review.id) {
      return;
    }
    try {
      await reviewService.verifyReview(review.id);
      setReviews((prev) =>
        prev.map((item) => (item.id === review.id ? { ...item, verified: true } : item))
      );
    } catch (error) {
      console.error("Failed to verify review:", error);
      setErrorMessage("审核评价失败，请稍后再试。");
    }
  };

  const handleDeleteReview = async (review: Review) => {
    if (!review.id) {
      return;
    }
    const confirmed = window.confirm("确认删除该评价吗？");
    if (!confirmed) {
      return;
    }
    try {
      await reviewService.deleteReview(review.id);
      setReviews((prev) => prev.filter((item) => item.id !== review.id));
    } catch (error) {
      console.error("Failed to delete review:", error);
      setErrorMessage("删除评价失败，请稍后再试。");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">兼职评价管理</h1>
      </div>
      
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
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
          <option value="published">已发布</option>
          <option value="pending">待审核</option>
        </select>
        <select 
          className="h-10 rounded-md border border-input bg-background px-3 py-1"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="all">所有评分</option>
          <option value="5">5星</option>
          <option value="4">4星</option>
          <option value="3">3星</option>
          <option value="2">2星</option>
          <option value="1">1星</option>
        </select>
      </div>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle>评价列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {getStudentName(review)} 评价了 {getJobTitle(review)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getCompanyName(review)} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon 
                                key={star} 
                                className={`h-4 w-4 ${
                                  star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                                }`} 
                              />
                            ))}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getReviewStatus(review) === "published" ? "bg-green-100 text-green-800" : 
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {getReviewStatus(review) === "published" ? "已发布" : "待审核"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm">{review.content}</p>
                      </div>
                      
                      {(review.pros || review.cons) && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                          {review.pros && (
                            <span className="flex items-center gap-1">
                              <FlagIcon className="h-4 w-4 text-green-500" />
                              优点: {review.pros}
                            </span>
                          )}
                          {review.cons && (
                            <span className="flex items-center gap-1">
                              <FlagIcon className="h-4 w-4 text-red-500" />
                              缺点: {review.cons}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex md:flex-col justify-end gap-2">
                      {!review.verified && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-green-600"
                          onClick={() => handleVerifyReview(review)}
                        >
                          <CheckIcon className="h-4 w-4" />
                          通过
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-red-600"
                        onClick={() => handleDeleteReview(review)}
                      >
                        <TrashIcon className="h-4 w-4" />
                        删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">正在加载评价列表...</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-red-500">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredReviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">没有找到符合条件的评价</p>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示 {filteredReviews.length} 条记录，共 {reviews.length} 条
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
            <CardTitle className="text-sm">总评价数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">当前评价总数</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">平均评分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold mr-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex">
                <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">基于 {reviews.length} 条评价</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">待审核评价</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reviews.filter(r => !r.verified).length}
            </div>
            <p className="text-xs text-muted-foreground">待审核数量</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">已发布评价</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.verified).length}
            </div>
            <p className="text-xs text-muted-foreground">已通过审核</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>评分分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center w-8">
                    <span>{rating}</span>
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-1" />
                  </div>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                  <div className="w-10 text-right text-sm text-muted-foreground">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
