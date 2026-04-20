# Admin Dashboard Real Stats Design

Date: 2026-04-20

## Context

The current admin dashboard page at `/admin` is populated with hard-coded placeholder numbers and fake visualizations.

Current problems:

- Top-level KPI cards show fake counts.
- The chart blocks are placeholder text rather than real platform data.
- The "system status" section shows fake CPU, memory, and storage usage.
- The "recent activities" list is also fake, but the user explicitly wants to keep that section as-is for now.

The user-approved scope is:

- Replace fake admin dashboard KPI numbers with real platform statistics.
- Remove chart sections that do not have real monitoring behind them.
- Remove the fake system resource monitoring section.
- Keep the recent activity section as fake data for now.

## Goals

- Show real admin-level platform counts on the dashboard.
- Remove misleading fake chart and monitoring content.
- Keep the admin dashboard useful without requiring new observability infrastructure.

## Non-Goals

- No real monitoring integration.
- No real admin activity feed.
- No historical growth, week-over-week, or month-over-month comparisons unless the current backend already supports them in a trustworthy way.
- No redesign of other admin pages beyond what supports dashboard statistics.

## Approach Options

### Option A: Build dashboard stats from existing frontend service calls

Load existing lists for users, companies, jobs, applications, and reviews in the admin dashboard page and compute totals client-side.

Pros:

- Smallest implementation scope.
- Reuses current backend APIs.
- Fastest route to replacing fake numbers with real values.

Cons:

- Dashboard page makes multiple requests and performs local aggregation.
- Less scalable than a dedicated aggregate endpoint.

### Option B: Add a dedicated admin dashboard summary endpoint

Create a new backend endpoint that returns all dashboard metrics in one response.

Pros:

- Cleanest long-term architecture.
- Best performance and smallest frontend surface area.

Cons:

- Larger implementation scope.
- Requires backend contract design, testing, and frontend integration.

### Option C: Hybrid implementation

Structure the frontend so it can consume an aggregate object later, but initially populate it from existing service calls.

Pros:

- Good short-term speed.
- Easier future migration to a backend summary endpoint.

Cons:

- Slightly more abstraction than the minimal version.

## Decision

Choose Option C, implemented initially with existing frontend service calls.

This satisfies the current request with the smallest reliable change while leaving the dashboard code easy to migrate later if a dedicated admin summary endpoint is added.

## Real Metrics To Show

The dashboard should show real values for these metrics:

### Top KPI cards

1. Total students
2. Total companies
3. Active jobs
4. Pending applications

### Secondary overview card

Show a compact real-data summary including:

- Pending reviews
- Verified companies
- Total applications
- Total reviews

These values are enough to make the dashboard meaningfully real without inventing new analytics.

## Data Sources

Use existing frontend service methods where available.

### Total students

Source:

- Full user list filtered by `role === "STUDENT"`

### Total companies

Source:

- Full company list count

### Active jobs

Source:

- Full job list filtered by `active === true`

### Pending applications

Source:

- Full application list filtered by `status === "PENDING"`

### Pending reviews

Source:

- Full review list filtered by `verified === false`

### Verified companies

Source:

- Full company list filtered by `verified === true`

### Total applications

Source:

- Full application list count

### Total reviews

Source:

- Full review list count

## UI Changes

### Keep

- Page title
- Recent activity section

### Replace

- Replace hard-coded KPI numbers with real computed values
- Replace fake comparison copy such as "较上月增加32名" with present-tense factual descriptions

Examples of safer copy:

- "当前注册学生总数"
- "当前企业总数"
- "当前活跃中的职位"
- "当前待处理申请"

### Remove

- The fake "system user growth trend" chart
- The fake "user type distribution" chart
- The entire "system status" resource usage section

### Add

- A real "platform overview" or "审核概览" card containing the secondary summary metrics

## Loading and Error Handling

The dashboard should load all required data concurrently on mount.

Behavior:

- Show a loading state while metrics are being fetched.
- If the requests fail, show a clear error message instead of fake values.
- If successful, render only real computed numbers.

This task does not require partial-success rendering logic. A single dashboard-level loading and error state is acceptable for the first implementation.

## Service Layer Expectations

Preferred existing services:

- `userService`
- `companyService`
- `jobService`
- `applicationService`
- `reviewService`

If one of these services does not already expose the required admin-level list method:

- First add the missing frontend service wrapper if the backend endpoint already exists.
- Only add a backend endpoint if the backend does not currently provide a way to retrieve the required dataset.

## Copy Rules

Do not continue showing fake trend language.

Avoid:

- "较上月增加"
- "昨日新增"
- "较上周减少"

Use present-state labels instead:

- "当前平台注册学生"
- "当前平台企业数量"
- "当前可投递职位"
- "当前待处理申请"

## Files Expected To Change

- `frontend/src/pages/admin/index.tsx`
- `frontend/src/services/userService.ts` if the dashboard needs a missing list wrapper
- `frontend/src/services/companyService.ts` if the dashboard needs a missing list wrapper
- `frontend/src/services/jobService.ts` if the dashboard needs a missing list wrapper
- `frontend/src/services/applicationService.ts` if the dashboard needs a missing list wrapper
- `frontend/src/services/reviewService.ts` if the dashboard needs a missing list wrapper

Potential backend changes only if absolutely required:

- related admin list controllers or service methods

## Testing Strategy

Verification should include:

1. Open `/admin` and confirm the KPI cards show real values rather than placeholders.
2. Confirm chart placeholders and fake system monitoring blocks are removed.
3. Confirm the recent activity section remains visible.
4. Cross-check the real counts against underlying data sources such as list pages or direct database inspection.
5. Run frontend build verification after code changes.
6. If backend code changes are required, run backend verification as well.

## Risks

### Risk: Missing admin list endpoints for one of the datasets

Mitigation:

- Reuse existing endpoints first.
- Add only the smallest missing service/API surface if blocked.

### Risk: Dashboard becomes dependent on multiple requests

Mitigation:

- Use concurrent loading.
- Keep metric computation simple and deterministic.

### Risk: Existing service responses use slightly inconsistent property names

Mitigation:

- Normalize at the dashboard calculation layer rather than broad refactors outside current scope.

## Acceptance Criteria

- The admin dashboard top KPI cards display real values.
- The dashboard no longer shows fake charts.
- The dashboard no longer shows fake CPU, memory, or storage monitoring.
- The recent activity section remains visible.
- The dashboard includes a real secondary summary area using actual platform counts.
- No fake growth or trend copy remains in the real statistics area.
