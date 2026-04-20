import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReviewForm from "@/components/review/ReviewForm";
import reviewService, { Review } from "@/services/reviewService";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [authored, received] = await Promise.all([
        reviewService.getMyReviews(),
        reviewService.getMyReceivedReviews()
      ]);
      setReviews(Array.isArray(authored) ? authored : []);
      setReceivedReviews(Array.isArray(received) ? received : []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setErrorMessage(error instanceof Error ? error.message : "加载评价失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }
    return reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;
  }, [reviews]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">我的评价</h1>

      <ReviewForm
        title="提交评价"
        description="填写兼职体验并直接提交到系统，成功后会立即更新下方历史记录。"
        submitLabel="提交评价"
        onSuccess={loadReviews}
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>我提交的评价</CardTitle>
            <CardDescription>基于已提交的工作评价</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold">{averageRating ? averageRating.toFixed(1) : "-"}</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon 
                    key={star} 
                    className={`h-6 w-6 ${star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"}`} 
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                基于 {reviews.length} 次评价
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center text-sm text-muted-foreground">正在加载评价...</div>
        )}

        {errorMessage && (
          <div className="text-center text-sm text-red-500">{errorMessage}</div>
        )}

        {!loading && !errorMessage && reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{review.jobTitle || review.job?.title || "兼职评价"}</CardTitle>
                  <CardDescription>
                    {review.company?.name || "未知企业"} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}
                  </CardDescription>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                      key={star} 
                      className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} 
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{review.content}</p>
              {review.pros && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">优点:</p>
                  <p className="text-sm text-muted-foreground">{review.pros}</p>
                </div>
              )}
              {review.cons && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">不足:</p>
                  <p className="text-sm text-muted-foreground">{review.cons}</p>
                </div>
              )}
              {review.verified !== undefined && (
                <div className="mt-4 text-xs text-muted-foreground">
                  {review.verified ? "已审核" : "待审核"}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {!loading && !errorMessage && reviews.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <StarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">您还没有提交任何评价</p>
              <p className="text-center text-muted-foreground text-sm mt-1">完成工作后可以提交评价</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>企业给我的评价</CardTitle>
            <CardDescription>来自企业端的信用反馈</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {receivedReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无企业评价</p>
            ) : (
              receivedReviews.map((review) => (
                <Card key={`received-${review.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{review.jobTitle || review.job?.title || "企业评价"}</CardTitle>
                        <CardDescription>
                          {review.company?.name || "未知企业"} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}
                        </CardDescription>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                    {review.verified !== undefined && (
                      <div className="mt-4 text-xs text-muted-foreground">
                        {review.verified ? "已审核" : "待审核"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
