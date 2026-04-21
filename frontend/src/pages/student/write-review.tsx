import ReviewForm from "@/components/review/ReviewForm";

export default function WriteReview() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">提交评价</h1>
      </div>

      <ReviewForm
        title="评价兼职体验"
        description="分享你在岗位中的真实感受、收获和建议。"
        submitLabel="提交评价"
      />
    </div>
  );
}
