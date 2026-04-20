# Student Reviews Real Submission Design

Date: 2026-04-20

## Context

The current student review flow is split across two pages:

- `/student/reviews` shows the current student's submitted reviews and aggregate rating, but it is read-only.
- `/student/write-review` contains a working form that submits to `POST /api/reviews`.

The backend already persists reviews through the existing `Review` entity and `ReviewController#createReview`. The missing piece is making `/student/reviews` itself a real input-and-submit page that writes to the database and immediately reflects the new record in the student's review history.

The user-approved direction is:

- `/student/reviews` becomes a single integrated page with an embedded submission form at the top and the submitted review list below.
- The review form logic is shared between `/student/reviews` and `/student/write-review`.
- Repeated reviews for the same application are allowed. Later submissions are treated as supplementary records, not updates.

## Goals

- Let students submit reviews directly from `/student/reviews`.
- Persist each submission to the existing backend review table through the current API contract.
- Refresh the student's review list after a successful submission so the new review appears immediately.
- Eliminate duplicated form logic between `/student/reviews` and `/student/write-review`.

## Non-Goals

- No database schema changes.
- No new backend rule that enforces one review per application.
- No removal of the `/student/write-review` route.
- No admin moderation workflow changes beyond the existing `verified = false` behavior.

## Approach Options

### Option A: Duplicate the existing form into `/student/reviews`

Copy the current `/student/write-review` form implementation into `/student/reviews` and refresh the list after submission.

Pros:

- Fastest path.

Cons:

- Creates two independent form implementations.
- Future fixes to validation or submission behavior can drift between the two pages.

### Option B: Extract a shared review form component

Move the review form behavior into a reusable component and embed it in `/student/reviews`, while also updating `/student/write-review` to use the same component.

Pros:

- One form implementation and one submission flow.
- Lower maintenance cost when fields or validation change.
- Keeps both routes functional and behaviorally consistent.

Cons:

- Slightly more refactor work than Option A.

### Option C: Replace `/student/write-review` with redirects

Make `/student/reviews` the only real submission experience and turn `/student/write-review` into a redirect or thin wrapper.

Pros:

- Simplifies product surface area.

Cons:

- More route behavior change than needed for the current request.
- Higher risk of breaking existing navigation expectations.

## Decision

Choose Option B.

This satisfies the user request while keeping the codebase maintainable. The page becomes truly interactive where requested, and the existing dedicated write route remains available without splitting the behavior into two implementations.

## UI Design

### `/student/reviews`

The page will be organized in this order:

1. Page title.
2. Embedded "submit review" card.
3. Existing review summary card showing average rating and count.
4. Existing submitted review list.

The embedded form will include:

- Application selector
- Review title
- Work period
- Star rating
- Review content
- Pros
- Cons
- Anonymous toggle
- Submit action

On successful submission:

- Show a success toast.
- Reset the form fields to their initial state.
- Re-fetch the student's reviews from the backend.
- Keep the user on the same page.

### `/student/write-review`

The page remains available, but its form content will be replaced by the shared form component so its behavior matches `/student/reviews`.

## Component Design

Create a shared component:

- `frontend/src/components/review/ReviewForm.tsx`

Responsibilities:

- Load the current student's application list through `applicationService.getMyApplications()`.
- Filter out invalid applications that do not have both `job.id` and `job.company.id`.
- Render the full form UI.
- Run client-side validation before submission.
- Submit through `reviewService.createReview()`.
- Invoke a parent-provided success callback after a successful submit.

Recommended props:

- `title?: string` for page-specific card title text.
- `description?: string` for supporting text.
- `onSuccess?: () => Promise<void> | void` so hosting pages can refresh review data.
- `submitLabel?: string` to keep the button text flexible if needed.

The shared component owns form state and application-loading state. Page-level review list state remains inside `/student/reviews`.

## Data Flow

### Application data

Source:

- `applicationService.getMyApplications()`

Use:

- Populate the selectable positions in the review form.

Filtering rule:

- Only applications with `application.job.id` and `application.job.company.id` are eligible for selection.

Reason:

- The review creation payload depends on both identifiers.
- Filtering invalid records prevents avoidable backend failures.

### Review submission

Source of truth:

- `reviewService.createReview()`

Payload fields:

- `title`
- `content`
- `rating`
- `pros`
- `cons`
- `workPeriod`
- `jobTitle`
- `anonymous`
- `company: { id }`
- `job: { id }`

Behavior:

- No client-side uniqueness guard for repeated submissions.
- No server-side uniqueness rule added in this change.
- Every submission creates a new `Review` row.

### Review list refresh

Source:

- `reviewService.getMyReviews()`

Behavior:

- `/student/reviews` fetches the student's reviews on initial load.
- After a successful submit, `/student/reviews` re-fetches the list instead of inserting a synthetic local item.

Reason:

- Avoids client-side divergence from the actual backend response shape.

## Validation and Error Handling

Client-side validation inside the shared form:

- A valid application must be selected.
- `title` is required.
- `content` is required.
- `content` must be at least 10 characters.
- `rating` must be greater than 0.

Submission behavior:

- Disable the submit button while submitting.
- Show a failure toast if the API call fails.
- Preserve user-entered form data on failure.

Application-loading behavior:

- Show a loading state while fetching applications.
- Show an inline error message if applications fail to load.
- Show a clear empty state when there are no eligible applications to review.

## Backend Impact

No backend behavior change is planned for the first implementation.

The existing backend already:

- Accepts student-authenticated review creation through `POST /api/reviews`
- Resolves the current student from the authenticated principal
- Sets `verified` to `false` for new submissions
- Persists the new review entity

Fallback plan:

- If frontend-backend integration exposes request-shape fragility caused by binding directly to the `Review` entity, introduce a dedicated create-request DTO in a follow-up patch inside the same task.
- That DTO fallback is not part of the primary implementation path.

## Files Expected To Change

- `frontend/src/components/review/ReviewForm.tsx` (new)
- `frontend/src/pages/student/reviews.tsx`
- `frontend/src/pages/student/write-review.tsx`
- `frontend/src/services/reviewService.ts` (only if type or helper cleanup is needed)

## Testing Strategy

Given the current repo state, use the smallest verification set that proves the change:

- Run `cd frontend && bun run build` after the frontend changes.
- If any backend code changes become necessary, run `cd backend && ./mvnw test`.
- Manually verify that submitting a review from `/student/reviews` writes to the database-backed list and that the new review appears after refresh.

No new frontend test framework will be introduced in this task.

## Risks

### Risk: Inconsistent application data

Some application records may not include enough nested job/company information for review creation.

Mitigation:

- Filter invalid applications before rendering the selector.
- Provide a clear empty state when nothing is eligible.

### Risk: Shared-form refactor breaks existing `/student/write-review`

Mitigation:

- Keep the shared component interface narrow.
- Reuse the same form logic in both pages rather than trying to compose partially duplicated behaviors.

### Risk: Entity-based backend binding is brittle

Mitigation:

- Keep the current request shape aligned with the existing backend contract.
- Add a DTO only if integration proves it is necessary.

## Acceptance Criteria

- Visiting `http://localhost:1420/student/reviews` shows a real review submission form above the student's submitted review list.
- A student can choose an eligible application, fill the form, and submit successfully.
- Successful submission creates a new persisted review record through the existing backend API.
- After submission, the new review appears in the list on `/student/reviews`.
- Repeated submissions for the same application are allowed and stored as separate review records.
- `/student/write-review` continues to work and uses the same underlying submission behavior.
