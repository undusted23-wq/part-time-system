import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EyeIcon, SearchIcon, StarIcon, UserIcon } from "lucide-react";
import reviewService, { Review } from "@/services/reviewService";
import companyService from "@/services/companyService";

export default function EmployerReviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const companies = await companyService.getEmployerCompanies();
        const responses = await Promise.all(
          (companies || []).map((company) => reviewService.getCompanyReviews(company.id))
        );
        const allReviews = responses.flatMap((response) => response.reviews || []);
        setReviews(allReviews);
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setErrorMessage("加载评价失败，请稍后再试。");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }
    return reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const positiveRate = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }
    return Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100);
  }, [reviews]);

  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter !== "all") {
      const rating = Number(ratingFilter);
      if (review.rating !== rating) {
        return false;
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const studentName = review.anonymous
        ? "匿名用户"
        : review.student?.fullName || review.student?.username || "";
      const jobTitle = review.job?.title || review.jobTitle || "";
      const content = review.content || "";

      if (
        !studentName.toLowerCase().includes(query) &&
        !jobTitle.toLowerCase().includes(query) &&
        !content.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">评价管理</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">总评价数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">已收录评价数量</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">平均评分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold mr-2">
                {averageRating ? averageRating.toFixed(1) : "-"}
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
            <CardTitle className="text-sm">好评率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reviews.length ? `${positiveRate}%` : "-"}
            </div>
            <p className="text-xs text-muted-foreground">4-5星占比</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">评价来源</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">按公司维度汇总</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索学生、职位或评价内容..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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

      {loading && (
        <div className="text-center text-sm text-muted-foreground">正在加载评价...</div>
      )}
      {errorMessage && (
        <div className="text-center text-sm text-red-500">{errorMessage}</div>
      )}

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {review.anonymous
                            ? "匿名用户"
                            : review.student?.fullName || review.student?.username || "未知用户"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {review.job?.title || review.jobTitle || "兼职体验"} · {review.workPeriod || "未填写"}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm">{review.content}</p>
                  </div>

                  {(review.pros || review.cons) && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      {review.pros && <p>优点: {review.pros}</p>}
                      {review.cons && <p>缺点: {review.cons}</p>}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end gap-2">
                  <div className="text-sm text-muted-foreground">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <EyeIcon className="h-4 w-4" />
                    查看详情
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && !errorMessage && filteredReviews.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">没有找到符合条件的评价</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
