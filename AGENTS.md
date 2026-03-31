# Repository Guidelines

## Project Structure & Module Organization
This repo is split into `frontend/` and `backend/`. The frontend is a Vite + React + TypeScript app; routes live in `frontend/src/pages/`, shared UI in `frontend/src/components/`, API clients in `frontend/src/services/`, and static assets in `frontend/public/`. Desktop packaging lives in `frontend/src-tauri/`. The backend is a Spring Boot service with controllers, services, repositories, models, and DTOs under `backend/src/main/java/com/example/backend/`. Runtime config is in `backend/src/main/resources/application.properties`, and tests live in `backend/src/test/java/`.

## Build, Test, and Development Commands
- `cd frontend && bun install`: install UI dependencies.
- `cd frontend && bun run dev`: start the Vite dev server.
- `cd frontend && bun run build`: run TypeScript checks and build production assets.
- `cd frontend && bun run tauri dev`: run the desktop shell against the frontend.
- `cd backend && ./mvnw spring:run`: start the API on `http://localhost:8080`.
- `cd backend && ./mvnw test`: run JUnit tests.

## Coding Style & Naming Conventions
Frontend TypeScript runs in `strict` mode and supports the `@/` import alias. Follow the surrounding file style, keep components in PascalCase, page files lowercase by route (`pages/student/resume.tsx`), and service modules camelCase with `*Service.ts`. Keep reusable shadcn UI primitives in `frontend/src/components/ui/`. Backend Java uses 4-space indentation, lowercase packages, and PascalCase class names; keep Spring layers separated by responsibility and name DTOs with `Request`, `Response`, or `DTO` suffixes.

## Testing Guidelines
Backend testing uses Spring Boot + JUnit. Add tests under mirrored packages in `backend/src/test/java/` and name them `*Tests`. The current suite is minimal, so new backend behavior should ship with targeted service or controller coverage. The frontend has no test runner configured yet; at minimum, run `bun run build` before opening a PR.

## Commit & Pull Request Guidelines
Recent history follows short conventional prefixes such as `feat:`, `fix:`, `docs:`, and `chore:`. Keep commit subjects brief and imperative, in English or Chinese. PRs should include a concise summary, manual verification steps, linked issues when applicable, and screenshots for UI changes.

## Configuration & Security Notes
Do not commit real secrets. `backend/src/main/resources/application.properties` currently contains local SQLite and JWT settings; prefer local-only overrides when changing them. Keep `frontend/src/services/api.ts` aligned with the backend base URL and port.
