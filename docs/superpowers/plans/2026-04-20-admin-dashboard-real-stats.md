# Admin Dashboard Real Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin dashboard's fake KPI numbers with real platform statistics, remove fake charts and fake monitoring blocks, and keep the fake recent activity section unchanged.

**Architecture:** Reuse existing admin-accessible list endpoints through the frontend service layer, fetch the datasets concurrently in the admin dashboard page, compute the required metrics locally, and render only real values. Keep the page scoped to dashboard changes only, with no new backend aggregate endpoint unless a required list wrapper is missing.

**Tech Stack:** React, TypeScript, Vite, existing frontend service layer, shadcn/ui cards

---

## File Structure

- Modify: `frontend/src/pages/admin/index.tsx`
  Replace placeholder metrics and fake visualization sections with real dashboard loading, stats calculation, and compact overview UI.
- Modify: `frontend/src/services/userService.ts`
  Add an admin-facing full-user-list wrapper for the existing `/api/users` endpoint if needed by the dashboard.
- Optionally modify: `frontend/src/services/jobService.ts`
  Add explicit typing to `getAllJobs()` if the dashboard benefits from typed calculations.

### Task 1: Expose the missing admin user list wrapper

**Files:**
- Modify: `frontend/src/services/userService.ts`

- [ ] **Step 1: Write the failing usage target**

```ts
const users = await userService.getAllUsers();
const studentCount = users.filter((user) => user.role === "STUDENT").length;
```

- [ ] **Step 2: Confirm the wrapper is currently missing**

Run: `sed -n '1,220p' frontend/src/services/userService.ts`
Expected: there is `getUsersByRole`, but no `getAllUsers`.

- [ ] **Step 3: Add the minimal `getAllUsers` wrapper**

```ts
const userService = {
  getAllUsers: async () => {
    const response = await api.get<UserProfile[]>('/api/users');
    return response.data;
  },
};
```

- [ ] **Step 4: Verify the service file contains the new wrapper**

Run: `sed -n '1,220p' frontend/src/services/userService.ts`
Expected: `getAllUsers` exists and returns `UserProfile[]`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/userService.ts
git commit -m "feat: add admin user list wrapper"
```

### Task 2: Normalize dashboard data inputs

**Files:**
- Modify: `frontend/src/services/jobService.ts`

- [ ] **Step 1: Write the typed dashboard usage target**

```ts
const jobs = await jobService.getAllJobs();
const activeJobs = jobs.filter((job) => job.active);
```

- [ ] **Step 2: Confirm `getAllJobs()` currently returns untyped data**

Run: `sed -n '1,220p' frontend/src/services/jobService.ts`
Expected: `getAllJobs()` does not currently return `Job[]` explicitly.

- [ ] **Step 3: Add the smallest type-safe return**

```ts
getAllJobs: async () => {
  const response = await api.get<Job[]>('/api/jobs');
  return response.data;
},
```

- [ ] **Step 4: Verify the change**

Run: `sed -n '1,120p' frontend/src/services/jobService.ts`
Expected: `getAllJobs()` now returns `Job[]`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/jobService.ts
git commit -m "refactor: type admin job list fetch"
```

### Task 3: Replace fake admin dashboard metrics with real stats

**Files:**
- Modify: `frontend/src/pages/admin/index.tsx`
- Modify: `frontend/src/services/userService.ts`
- Modify: `frontend/src/services/jobService.ts`

- [ ] **Step 1: Write the failing dashboard state shape**

```tsx
type DashboardStats = {
  totalStudents: number;
  totalCompanies: number;
  activeJobs: number;
  pendingApplications: number;
  pendingReviews: number;
  verifiedCompanies: number;
  totalApplications: number;
  totalReviews: number;
};

const [stats, setStats] = useState<DashboardStats | null>(null);
const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);
```

- [ ] **Step 2: Confirm the current dashboard is still placeholder-only**

Run: `sed -n '1,260p' frontend/src/pages/admin/index.tsx`
Expected: hard-coded counts, fake chart sections, fake system resource monitoring, and fake recent activities.

- [ ] **Step 3: Implement concurrent real-data loading and local aggregation**

```tsx
const loadDashboardStats = async () => {
  setLoading(true);
  setErrorMessage(null);
  try {
    const [users, companies, jobs, applications, reviews] = await Promise.all([
      userService.getAllUsers(),
      companyService.getAllCompaniesAuth(),
      jobService.getAllJobs(),
      applicationService.getAllApplications(),
      reviewService.getAllReviews(),
    ]);

    setStats({
      totalStudents: users.filter((user) => user.role === "STUDENT").length,
      totalCompanies: companies.length,
      activeJobs: jobs.filter((job) => job.active).length,
      pendingApplications: applications.filter((application) => application.status === "PENDING").length,
      pendingReviews: reviews.filter((review) => review.verified === false).length,
      verifiedCompanies: companies.filter((company) => company.verified ?? company.isVerified).length,
      totalApplications: applications.length,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Failed to load admin dashboard stats:", error);
    setErrorMessage("加载管理员仪表盘统计失败，请稍后再试。");
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 4: Replace the fake dashboard sections with real KPI cards and one real overview card**

```tsx
{loading && (
  <div className="text-sm text-muted-foreground">正在加载真实统计数据...</div>
)}

{errorMessage && (
  <div className="text-sm text-red-500">{errorMessage}</div>
)}

{stats && (
  <>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="总学生数" value={stats.totalStudents} description="当前平台注册学生" />
      <StatCard title="企业数量" value={stats.totalCompanies} description="当前平台企业数量" />
      <StatCard title="有效职位" value={stats.activeJobs} description="当前活跃中的职位" />
      <StatCard title="待处理申请" value={stats.pendingApplications} description="当前待审核申请" />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>审核概览</CardTitle>
        <CardDescription>来自当前平台真实业务数据</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric label="待审核评价" value={stats.pendingReviews} />
        <OverviewMetric label="已认证企业" value={stats.verifiedCompanies} />
        <OverviewMetric label="申请总数" value={stats.totalApplications} />
        <OverviewMetric label="评价总数" value={stats.totalReviews} />
      </CardContent>
    </Card>
  </>
)}
```

- [ ] **Step 5: Remove the fake chart and fake monitoring sections but keep `recentActivities`**

```tsx
// Delete:
// - 系统用户增长趋势 card
// - 用户类型分布 card
// - 系统状态 / 系统资源使用情况 card
//
// Keep:
// - recentActivities constant
// - 最近活动 rendering block
```

- [ ] **Step 6: Verify the rewritten page structure**

Run: `sed -n '1,320p' frontend/src/pages/admin/index.tsx`
Expected: the page fetches real stats, removes fake visualization/monitoring blocks, and still renders the fake recent activity section.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/index.tsx frontend/src/services/userService.ts frontend/src/services/jobService.ts
git commit -m "feat: use real stats on admin dashboard"
```

### Task 4: Verify the admin dashboard against real data

**Files:**
- Verify: `frontend/src/pages/admin/index.tsx`
- Verify: `frontend/src/services/userService.ts`
- Verify: `frontend/src/services/jobService.ts`

- [ ] **Step 1: Run the frontend build command**

Run: `cd frontend && bun run build`
Expected: either full success, or a failure report showing only pre-existing TypeScript issues outside the touched files.

- [ ] **Step 2: Run a Vite-only build if the repo still has unrelated `tsc` failures**

Run: `cd frontend && bunx vite build`
Expected: exit code `0` and successful production bundle generation.

- [ ] **Step 3: Manually verify the dashboard**

```text
1. Log in as admin
2. Open http://localhost:1420/admin
3. Confirm the top cards show real counts rather than placeholders
4. Confirm the fake chart sections are gone
5. Confirm the fake system monitoring block is gone
6. Confirm the recent activity block is still present
7. Cross-check the numbers against admin list pages or direct database inspection
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/admin/index.tsx frontend/src/services/userService.ts frontend/src/services/jobService.ts
git commit -m "chore: verify admin dashboard real stats flow"
```

## Self-Review

- Spec coverage:
  - Real KPI cards are implemented in Task 3.
  - Fake charts are removed in Task 3.
  - Fake monitoring is removed in Task 3.
  - Fake recent activity remains in Task 3.
  - Real secondary summary metrics are implemented in Task 3.
- Placeholder scan:
  - No TODO or TBD placeholders remain.
- Type consistency:
  - `DashboardStats`, `UserProfile`, `Job`, and service method names are consistent across the plan.