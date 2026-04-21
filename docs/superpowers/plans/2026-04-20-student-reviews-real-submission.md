# Student Reviews Real Submission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/student/reviews` into a real review submission page that writes to the existing backend and immediately refreshes the student's submitted review list.

**Architecture:** Extract the current review submission UI and logic into a shared React component, render that component at the top of `/student/reviews`, and reuse the same component inside `/student/write-review`. Keep persistence on the existing `/api/reviews` contract and refresh the list from `getMyReviews()` after successful submission.

**Tech Stack:** React, TypeScript, Vite, shadcn/ui components, Sonner toasts, existing frontend service layer

---

## File Structure

- Create: `frontend/src/components/review/ReviewForm.tsx`
  Own the review form state, application loading, client-side validation, and submission callback.
- Modify: `frontend/src/pages/student/reviews.tsx`
  Keep page-level review summary/list state and embed the shared form component above the list.
- Modify: `frontend/src/pages/student/write-review.tsx`
  Replace inline form logic with the shared form component so both pages use the same behavior.
- Modify: `frontend/src/services/reviewService.ts`
  Export the `Review` type consistently and add a small create payload type/helper if needed by the shared form.

### Task 1: Normalize review service types for shared form use

**Files:**
- Modify: `frontend/src/services/reviewService.ts`

- [ ] **Step 1: Write the failing type usage mentally against the target API**

```ts
import reviewService, { ReviewCreateInput } from "@/services/reviewService";

const payload: ReviewCreateInput = {
  title: "收获很多",
  content: "工作节奏紧凑，但团队愿意带新人。",
  rating: 4,
  anonymous: false,
  companyId: 1,
  jobId: 2,
  jobTitle: "前端兼职"
};

await reviewService.createReview(payload);
```

- [ ] **Step 2: Inspect `frontend/src/services/reviewService.ts` and confirm the type is missing**

Run: `sed -n '1,220p' frontend/src/services/reviewService.ts`
Expected: `Review` exists, but there is no dedicated exported create-input type for the shared form.

- [ ] **Step 3: Add the minimal type export and keep `createReview` payload mapping stable**

```ts
export interface ReviewCreateInput {
  title: string;
  content: string;
  rating: number;
  pros?: string;
  cons?: string;
  workPeriod?: string;
  jobTitle?: string;
  anonymous: boolean;
  companyId: number;
  jobId?: number;
}

const reviewService = {
  createReview: async (reviewData: ReviewCreateInput) => {
    const payload: any = { ...reviewData };
    payload.company = { id: reviewData.companyId };
    if (reviewData.jobId) {
      payload.job = { id: reviewData.jobId };
    }
    delete payload.companyId;
    delete payload.jobId;
    const response = await api.post<Review>('/api/reviews', payload);
    return response.data;
  }
};
```

- [ ] **Step 4: Verify the service file still matches existing API usage**

Run: `sed -n '1,240p' frontend/src/services/reviewService.ts`
Expected: `Review`, `ReviewCreateInput`, and `createReview` all use the same field names required by the backend payload.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/reviewService.ts
git commit -m "refactor: normalize review service types"
```

### Task 2: Create the shared review form component

**Files:**
- Create: `frontend/src/components/review/ReviewForm.tsx`
- Modify: `frontend/src/services/reviewService.ts`

- [ ] **Step 1: Write the failing component contract**

```tsx
<ReviewForm
  title="提交评价"
  description="分享你的兼职体验"
  submitLabel="提交评价"
  onSuccess={async () => {
    await loadReviews();
  }}
/>
```

- [ ] **Step 2: Confirm the component file does not exist yet**

Run: `test -f frontend/src/components/review/ReviewForm.tsx; echo $?`
Expected: `1`

- [ ] **Step 3: Implement the shared component with form state, filtered applications, validation, and submit flow**

```tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BuildingIcon, SaveIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import applicationService, { JobApplication } from "@/services/applicationService";
import reviewService, { ReviewCreateInput } from "@/services/reviewService";

type ReviewFormProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  onSuccess?: () => Promise<void> | void;
};

const isEligibleApplication = (application: JobApplication) =>
  Boolean(application.job?.id && application.job?.company?.id);

export default function ReviewForm({
  title = "提交评价",
  description,
  submitLabel = "提交评价",
  onSuccess
}: ReviewFormProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({
    title: "",
    content: "",
    pros: "",
    cons: "",
    workPeriod: "",
    anonymous: false
  });
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      setLoadingApplications(true);
      setApplicationError(null);
      try {
        const data = await applicationService.getMyApplications();
        const eligible = (Array.isArray(data) ? data : []).filter(isEligibleApplication);
        setApplications(eligible);
        setSelectedApplicationId(eligible[0]?.id ?? null);
      } catch (error) {
        console.error("Failed to load applications:", error);
        setApplicationError("加载申请记录失败，请稍后再试。");
      } finally {
        setLoadingApplications(false);
      }
    };

    loadApplications();
  }, []);

  const selectedApplication = useMemo(
    () => applications.find((item) => item.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId]
  );

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setForm({
      title: "",
      content: "",
      pros: "",
      cons: "",
      workPeriod: "",
      anonymous: false
    });
  };

  const handleSubmit = async () => {
    if (!selectedApplication?.job?.company?.id) {
      toast.error("请选择可评价的职位。");
      return;
    }
    if (!form.title.trim()) {
      toast.error("请填写评价标题。");
      return;
    }
    if (!form.content.trim()) {
      toast.error("请填写评价内容。");
      return;
    }
    if (form.content.trim().length < 10) {
      toast.error("评价内容至少需要 10 个字。");
      return;
    }
    if (rating <= 0) {
      toast.error("请为本次体验评分。");
      return;
    }

    const payload: ReviewCreateInput = {
      title: form.title.trim(),
      content: form.content.trim(),
      rating,
      pros: form.pros.trim() || undefined,
      cons: form.cons.trim() || undefined,
      workPeriod: form.workPeriod.trim() || undefined,
      jobTitle: selectedApplication.job?.title,
      anonymous: form.anonymous,
      companyId: selectedApplication.job.company.id,
      jobId: selectedApplication.job.id
    };

    setSubmitting(true);
    try {
      await reviewService.createReview(payload);
      toast.success("评价提交成功！");
      resetForm();
      await onSuccess?.();
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("提交失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  };
}
```

- [ ] **Step 4: Verify the component file exists and imports only current project dependencies**

Run: `sed -n '1,260p' frontend/src/components/review/ReviewForm.tsx`
Expected: the file exists, uses existing UI primitives, and imports `applicationService`, `reviewService`, and `toast`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/review/ReviewForm.tsx frontend/src/services/reviewService.ts
git commit -m "feat: add shared student review form"
```

### Task 3: Integrate the shared form into `/student/reviews`

**Files:**
- Modify: `frontend/src/pages/student/reviews.tsx`
- Create: `frontend/src/components/review/ReviewForm.tsx`

- [ ] **Step 1: Write the failing page shape**

```tsx
<div className="grid gap-6">
  <h1 className="text-2xl font-bold">我的评价</h1>
  <ReviewForm onSuccess={loadReviews} />
  <ReviewSummary />
  <ReviewList reviews={reviews} />
</div>
```

- [ ] **Step 2: Confirm the current page is still read-only**

Run: `sed -n '1,240p' frontend/src/pages/student/reviews.tsx`
Expected: the page renders only the summary card and the submitted review list.

- [ ] **Step 3: Refactor the page so it owns review loading and renders the shared form above the list**

```tsx
import { useEffect, useMemo, useState } from "react";
import { StarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReviewForm from "@/components/review/ReviewForm";
import reviewService, { Review } from "@/services/reviewService";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await reviewService.getMyReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setErrorMessage("加载评价失败，请稍后再试。");
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
        description="填写兼职体验并直接提交到系统。"
        submitLabel="提交评价"
        onSuccess={loadReviews}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify the page now renders the embedded form and preserves the existing list behavior**

Run: `sed -n '1,260p' frontend/src/pages/student/reviews.tsx`
Expected: the page includes `ReviewForm` above the summary/list and still computes average rating from `reviews`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/student/reviews.tsx frontend/src/components/review/ReviewForm.tsx
git commit -m "feat: embed review submission in student reviews"
```

### Task 4: Replace `/student/write-review` internals with the shared form

**Files:**
- Modify: `frontend/src/pages/student/write-review.tsx`
- Create: `frontend/src/components/review/ReviewForm.tsx`

- [ ] **Step 1: Write the failing target render**

```tsx
<div className="grid gap-6">
  <h1 className="text-2xl font-bold">提交评价</h1>
  <ReviewForm
    title="评价兼职体验"
    submitLabel="提交评价"
  />
</div>
```

- [ ] **Step 2: Confirm the page still contains duplicated local form logic**

Run: `sed -n '1,320p' frontend/src/pages/student/write-review.tsx`
Expected: the page owns its own application loading, validation, and submission code.

- [ ] **Step 3: Replace the duplicated logic with the shared component and keep the route available**

```tsx
import ReviewForm from "@/components/review/ReviewForm";

export default function WriteReview() {
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">提交评价</h1>
      </div>

      <ReviewForm
        title="评价兼职体验"
        description="分享你在岗位中的真实感受和建议。"
        submitLabel="提交评价"
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify the route page no longer duplicates the form implementation**

Run: `sed -n '1,220p' frontend/src/pages/student/write-review.tsx`
Expected: the page is now a thin wrapper around `ReviewForm`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/student/write-review.tsx frontend/src/components/review/ReviewForm.tsx
git commit -m "refactor: reuse shared review form page"
```

### Task 5: Verify the integrated flow

**Files:**
- Verify: `frontend/src/components/review/ReviewForm.tsx`
- Verify: `frontend/src/pages/student/reviews.tsx`
- Verify: `frontend/src/pages/student/write-review.tsx`
- Verify: `frontend/src/services/reviewService.ts`

- [ ] **Step 1: Run the frontend build**

Run: `cd frontend && bun run build`
Expected: exit code `0` and Vite production build output with no TypeScript errors.

- [ ] **Step 2: Sanity-check the final files**

Run: `sed -n '1,260p' frontend/src/components/review/ReviewForm.tsx && sed -n '1,260p' frontend/src/pages/student/reviews.tsx && sed -n '1,220p' frontend/src/pages/student/write-review.tsx`
Expected: one shared form implementation, `/student/reviews` embeds it, and `/student/write-review` reuses it.

- [ ] **Step 3: Manual verification checklist**

```text
1. Open http://localhost:1420/student/reviews
2. Confirm the form appears above the submitted review list
3. Select an eligible application and submit a valid review
4. Confirm success toast appears
5. Confirm the new review appears in "我提交的评价"
6. Submit another review for the same application
7. Confirm the second review is also accepted and listed
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/review/ReviewForm.tsx frontend/src/pages/student/reviews.tsx frontend/src/pages/student/write-review.tsx frontend/src/services/reviewService.ts
git commit -m "feat: wire student review submission flow"
```

## Self-Review

- Spec coverage:
  - Embedded `/student/reviews` form is covered by Task 3.
  - Shared form reuse in `/student/write-review` is covered by Task 4.
  - Existing backend persistence contract is preserved in Tasks 1 and 2.
  - Immediate list refresh after submit is covered by Tasks 2 and 3.
  - Repeated review submissions are allowed because no deduplication step is introduced.
- Placeholder scan:
  - No `TODO`, `TBD`, or "implement later" placeholders remain.
- Type consistency:
  - `ReviewCreateInput`, `Review`, and `ReviewForm` callback names are consistent across tasks.
