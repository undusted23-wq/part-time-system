# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: Vite + React + TypeScript UI (Tailwind, Radix UI). Page entry points live under `frontend/src/pages/`; shared APIs under `frontend/src/services/`.
- `backend/`: Spring Boot REST API. Main code in `backend/src/main/java/`, config in `backend/src/main/resources/`.
- `ai_service/`: Standalone Flask service (`ai_service/app.py`) that runs model-based recommendations.
- `backend/src/test/` exists but currently has no tests.

## Build, Test, and Development Commands
- Frontend dev server (hot reload): `cd frontend && bun run dev`
- Frontend production build: `cd frontend && bun run build`
- Backend dev server: `cd backend && ./mvnw spring:run`
- Backend tests (if/when added): `cd backend && ./mvnw test`
- AI service: `cd ai_service && python app.py`

## Coding Style & Naming Conventions
- Frontend: 2-space indentation, TypeScript + React, hooks prefixed with `use`, components in PascalCase (e.g., `StudentDashboard.tsx`), utilities in camelCase. Prefer `frontend/src/services/` for API calls.
- Backend: 4-space indentation, Java classes in PascalCase, packages in lowercase (`com.example.backend.*`), Spring annotations per controller/service conventions.
- Python (AI service): snake_case for functions/variables.

## Testing Guidelines
- No automated tests are present yet. Add tests alongside new logic:
  - Backend: place JUnit tests in `backend/src/test/java/...`.
  - Frontend: introduce a test framework before adding UI tests.
- Run `./mvnw test` after adding backend tests.

## Commit & Pull Request Guidelines
- Git history shows short, informal messages (e.g., `update: ...`, `save: ...`, and Chinese summaries). Keep commits concise; a short prefix is acceptable but not required.
- PRs should include: a clear description, steps to verify, and UI screenshots/gifs when visual changes are made.

## Configuration & Secrets
- Frontend environment variables live in `frontend/.env` (see `frontend/.env.example` for `VITE_API_KEY` and model settings).
- Backend configuration is in `backend/src/main/resources/application.properties` (ports, DB path, JWT secrets).
