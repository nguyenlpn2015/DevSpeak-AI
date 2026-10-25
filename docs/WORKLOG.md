# Engineering Worklog: DevSpeak AI

This file maintains an append-only, concise record of completed engineering milestones, diagnostic checks, failures investigated, and decisions made.

---

---

## 2026-10-21: Master Project — Audit, Complete, Secure, Test, and Document (Phases 0–13)

### Actions Taken:
1. **Phase 0 — Discovery, Functional Audit & Roadmap**:
   - Conducted deep filesystem and code audit of backend, frontend, infrastructure, and CI.
   - Authored `docs/PROJECT_INVENTORY.md`, `docs/FUNCTIONAL_AUDIT.md`, and `docs/IMPLEMENTATION_ROADMAP.md`.
2. **Phase 1 & 2 — Backend Integrity & Functional Hardening**:
   - Added edge-case integration tests verifying invalid enums, boundary conditions (4000+ chars), whitespace validation, and path traversal / SQLi injection defense.
   - Verified transactional rollback semantics on session creation and attempt submission.
3. **Phase 3 — Question Bank Expansion**:
   - Expanded question catalog from 6 seed items to **26 production-grade interview scenarios** spanning 7 critical IT domains: Kubernetes, CI/CD DevSecOps, Linux SRE Diagnostics, AWS Cloud, Docker Security, System Design, and STAR Behavioral Leadership.
   - Updated unit tests validating rubrics, competencies, sample answers, and probing follow-ups.
4. **Phase 4 — User Registration & Authentication**:
   - Installed and configured `argon2-cffi` and `pyjwt`.
   - Implemented OWASP-compliant Argon2id password hashing and verification.
   - Implemented HS256 stateless JWT generation, decoding, and expiration tracking.
   - Implemented `User` entity, `UserRepository`, and `AuthService` with dual dependency injection (`get_current_user` and `get_optional_user`).
   - Created Alembic migration `0002_user_authentication.py` using `batch_alter_table` for SQLite & PostgreSQL compatibility.
   - Implemented auth endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`.
   - Enforced tenant data isolation: Candidate A cannot view or submit attempts to Candidate B's sessions.
5. **Phase 5 — Stateful Multi-Turn AI Interview Chatbot**:
   - Implemented `InterviewMessage` model and schemas (`role: 'interviewer' | 'candidate'`, `turn_index`, `feedback_snapshot`).
   - Created Alembic migration `0003_interview_messages.py`.
   - Added `conduct_chat_turn` to `AIProviderInterface`, `DeterministicMockAIProvider`, and `GeminiAIProvider`.
   - Implemented multi-turn dialogue orchestration: Turn 1 (initial greeting & problem) -> Turn 2 (operational probe) -> Turn 3 (concluding edge-case & full structured FeedbackReport).
   - Added endpoints `GET /api/v1/interviews/sessions/{id}/messages` and `POST /api/v1/interviews/sessions/{id}/chat`.
6. **Phase 6 — Voice Interview MVP (Frontend)**:
   - Implemented `VoiceInput.tsx` wrapping Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
   - Continuous English recognition with real-time interim speech preview, recording pulse animation, mic permission handling, and editable transcription.
7. **Phase 7 — Real Progress Analytics & History**:
   - Implemented `ProgressService` calculating real completed sessions, attempt counts, mean overall score, topic mastery breakdown, UTC active streak days, and XP earned.
   - Added endpoint `GET /api/v1/progress/summary`.
8. **Phase 8 — Frontend Authentication & LinguaFlow Parity**:
   - Implemented `AuthContext.tsx` with persistent localStorage JWT tokens and automatic guest fallback.
   - Implemented `AuthModal.tsx` matching LinguaFlow dark neon glassmorphism aesthetics.
   - Updated `Header.tsx` with user profile pill and login/logout controls.
   - Connected real streak days, user level, and XP bar in `LinguaSidebar.tsx` and `LinguaFlowDashboard.tsx`.
   - Maintained 100% translation key parity across English (`en.ts`) and Vietnamese (`vi.ts`).
9. **Phase 9 — DevSecOps Code Quality & Security Audits**:
   - Executed Bandit SAST scan on backend: 4,006 lines scanned, 0 issues identified (0 Low, 0 Medium, 0 High).
   - Executed Ruff check: 0 errors across all files.
   - Executed ESLint and TypeScript checks: 0 warnings, 0 errors.
10. **Phase 10 — Docker Compose Verification**:
    - Rebuilt all multi-stage containers via `docker compose up -d --build`.
    - Verified all 3 containers are healthy (`devspeak-api`, `devspeak-db`, `devspeak-web`).
    - Verified migrations `0002_user_authentication` and `0003_interview_messages` ran cleanly on PostgreSQL.
11. **Phase 11 — End-to-End Test Matrix**:
    - Backend Pytest: **65 passed in 5.60s** (100% pass rate).
    - Frontend Vitest: **44 passed across 7 test suites** (100% pass rate).
    - Next.js Production Build: **Compiled successfully in 12.2s**; all static routes optimized.
12. **Phase 12 & 13 — Vietnamese User Guide & Documentation Update**:
    - Created comprehensive Vietnamese user guide: `docs/USER_GUIDE.md`.
    - Updated `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, and `docs/SESSION_HANDOFF.md`.

### Verification Results:
- Backend checks: `ruff check .` -> PASSED, `bandit -r src` -> PASSED (0 issues), `pytest` -> 65/65 passed.
- Frontend checks: `tsc --noEmit` -> PASSED, `eslint .` -> PASSED, `vitest run` -> 44/44 passed, `next build` -> PASSED.
- Runtime: Docker Compose all services healthy; live API `/readyz` returns 26 questions; live registration and JWT verified.


### Actions Taken:
1. **Workspace Discovery**:
   - Inspected `d:\DEVSPEAK-AI`. Verified that the directory was empty.
   - Audited local host tooling:
     - `Git` installed at `C:\Program Files\Git\cmd\git.exe` (`git version 2.55.0.windows.5`).
     - `Node.js` installed at `C:\Program Files\nodejs\node.exe` (`v24.20.0`).
     - `npm` installed (`11.19.0`).
     - `GitHub CLI` installed at `C:\Program Files\GitHub CLI\gh.exe` (`2.102.0`).
     - Identified missing prerequisites: Python 3.12, Docker Desktop / WSL.
2. **Git Baseline**:
   - Initialized Git repository (`git init -b main`).
   - Configured comprehensive `.gitignore` covering secrets, Node.js artifacts, Python venv, and Terraform files.
3. **Core Documentation Suite**:
   - Created `GEMINI.md` as durable instructions for agentic workflow.
   - Created `README.md` introducing the project vision and tech stack.
   - Created `docs/PROJECT_CONTEXT.md` defining target personas, MVP scope, and constraints.
   - Created `docs/ARCHITECTURE.md` defining modular monolith design, AI adapter interface, and ER diagrams.
   - Created `docs/ROADMAP.md` establishing Milestones 0-7 with strict acceptance gates.
   - Created `docs/SECURITY.md` establishing threat model, prompt injection defenses, and secret management.
   - Created `docs/OPERATIONS.md` detailing local setup, mock AI mode, and health check conventions.
   - Created `docs/DECISIONS/ADR-0001-project-foundation-and-tech-stack.md` recording stack decisions.
   - Created `docs/KNOWN_ISSUES.md` and `docs/SESSION_HANDOFF.md`.

### Verification Results:
- Git repository successfully initialized: `.git/` created.
- File integrity verified across all created documents.
- `git status` inspected; zero unintended files or secrets tracked.

---

## 2026-10-19: Task 02 — Backend Foundation Implementation & Verification (Milestone 1 Slice)

### Actions Taken:
1. **Python 3.12 Setup**:
   - Installed `Python.Python.3.12` (v3.12.10) via `winget`. Verified at `C:\Users\Nguyen\AppData\Local\Programs\Python\Python312\python.exe`.
   - Created dedicated virtual environment at `apps/api/.venv`.
   - Installed declared runtime and dev dependencies (`fastapi 0.146.0`, `uvicorn 0.54.0`, `pydantic 2.14.1`, `pytest 9.1.1`, `ruff 0.17.1`, `httpx 0.28.1`).
2. **Modular Monolith Implementation (`apps/api`)**:
   - `core/config.py`: Implemented `Settings` with `parse_debug_value` validator resolving host OS `DEBUG=release` string clash.
   - `modules/questions/`: Implemented `Question`, `QuestionRubric`, and `QuestionCatalog` with 6 seed IT/DevOps questions covering Kubernetes, CI/CD canary rollback, AWS multi-AZ cost optimization, Linux iowait, STAR behavioral, and Docker multi-stage builds.
   - `modules/ai/`: Implemented `AIProviderInterface` and `DeterministicMockAIProvider` with heuristic rubric scoring, follow-up probe generation, and explicit transparency disclaimer.
   - `main.py`: Configured FastAPI app with `/healthz`, `/readyz`, `/api/v1/questions`, `/api/v1/questions/{id}`, `/api/v1/interviews/evaluate`, and global exception handlers preventing stack trace leakage.
3. **Automated Testing & Quality Gates**:
   - Authored unit test suites (`tests/unit/test_questions.py`, `tests/unit/test_mock_provider.py`) covering catalog integrity, STAR scoring, boundary constraints, and input validation.
   - Authored integration test suite (`tests/integration/test_api_endpoints.py`) using `httpx.AsyncClient`.
   - Formatted code and verified 0 lint errors with Ruff.
4. **Live Smoke Testing**:
   - Started local Uvicorn process on port 8000. Verified HTTP 200 responses, schema validity, and 422 input rejection.

### Verification Results:
- `pytest`: 26 passed in 0.51s (100% pass rate).
- `ruff check .`: 0 errors.
- `ruff format --check .`: 16 files formatted cleanly.

---

## 2026-10-19: Task 03 — Frontend MVP Implementation & Verification (Next.js 15 App Router)

### Actions Taken:
1. **Frontend Architecture & Scaffolding (`apps/web`)**:
   - Configured Next.js 15.1.7 (App Router), React 19, TypeScript (strict mode), and Tailwind CSS 3.4.
   - Fixed `.gitignore` unanchored `lib/` pattern to ensure `apps/web/src/lib/` is properly versioned.
   - Set up Vitest testing framework with `jsdom`, `@vitejs/plugin-react`, and clean `vitest.config.mts`.
2. **Implementation of 5 User Journeys**:
   - **Journey 1: Home / Dashboard (`DashboardHome.tsx`)**:
     - Product vision introduction for IT and DevOps professionals.
     - 6 interactive practice category cards (Kubernetes, CI/CD, AWS, Linux SRE, Behavioral STAR, Docker).
     - Direct CTA to explore the full question bank.
   - **Journey 2: Question Bank Catalog (`QuestionCatalog.tsx`)**:
     - Dynamic queries to `GET /api/v1/questions` with role, topic, and difficulty filters.
     - Pulsing skeleton loading state during data fetching.
     - Filter empty state with "Reset All Filters" button.
     - Strict backend error state with "Retry Backend Connection" button (strictly avoiding silent mock substitution).
     - Dual card actions: "Rubric & Details" and "Start Practice".
   - **Journey 3: Question Detail View (`QuestionDetailView.tsx`)**:
     - Fetches full question specification from `GET /api/v1/questions/{id}`.
     - Renders prompt, competencies tags, expected technical keywords, evaluation criteria, and common interview pitfalls.
     - Renders benchmark canonical answer safely as plain text (no raw HTML injection) with copy-to-clipboard.
     - Lists interviewer follow-up probing questions.
     - "Start Mock Interview" CTA transitioning into practice mode.
   - **Journey 4: Mock Interview Practice Studio (`PracticeStudio.tsx`)**:
     - Text-based interview practice room with live character/word counters.
     - Client-side validation: enforces 10 to 4000 character boundaries, disabling submit when invalid.
     - Duplicate submission prevention: disables textarea and submit button while submission is pending.
     - Collapsible rubric guide and quick narrative insertion chips (`+ STAR Framework`, `+ Chronological Steps`).
     - Submits payload to `POST /api/v1/interviews/evaluate` adhering strictly to backend request schema.
     - Non-AI reference mode: "Study Model Answer (0-AI Mode)" displaying canonical benchmark answer without external API.
   - **Feedback Studio (`FeedbackStudio.tsx`)**:
     - Visual score card displaying 1-10 overall score and 3 dimension bars (Technical Coverage, Grammar, STAR Clarity).
     - Categorized feedback tabs (Technical Insights, Grammar & Tone, Structure & STAR).
     - Displays benchmark answer, interviewer probe questions, and heuristic disclaimer.
   - **Journey 5: Mobile-Friendly & Accessible**:
     - Fully responsive layout across desktop and mobile viewports.
     - Semantic HTML, focus rings, high contrast ratios, touch-friendly tap targets.
3. **Automated Testing Suite**:
   - Authored API client unit tests (`tests/api.test.ts` - 10 tests): verified query param formatting, successful response mapping, 422 validation handling, and error throwing on backend failure without fake data fallback.
   - Authored component interaction tests (`tests/components.test.tsx` - 9 tests): verified skeleton loading, error retry button, filter reset, character count validation, duplicate submission guard, and question detail safe text rendering.
4. **Live End-to-End Verification**:
   - Started FastAPI backend locally with Uvicorn on `http://127.0.0.1:8000`.
   - Executed live REST calls to `/healthz`, `/readyz`, `/api/v1/questions`, `/api/v1/questions/k8s-pod-crashloopbackoff`, and `/api/v1/interviews/evaluate`.
   - Verified that frontend client types, routes, and responses match the live backend with 100% fidelity.

### Verification Results:
- `vitest run`: 19 passed in 2.06s (100% pass rate across 2 test files).
- `tsc --noEmit`: Exited with code 0.
- `eslint .`: Exited with code 0.
- `next build`: Exited with code 0 (Optimized production build generated: Route `/`: 15.4 kB, 118 kB First Load JS).
- Live Backend Integration: Verified HTTP 200 responses, scores, and evaluation response shapes.

### Next Immediate Action:
- Task 04: Implement Database Persistence (SQLAlchemy 2.0 async, Alembic migrations, session history).

---

## 2026-10-19: Task 04 — Database Persistence & Session History Implementation (Milestone 1)

### Actions Taken:
1. **Database Stack & Dependencies (`apps/api`)**:
   - Integrated SQLAlchemy 2.1.5, Alembic 1.20.0, aiosqlite 0.22.1, and greenlet 3.5.6.
   - Configured `DATABASE_URL` (defaulting to zero-cost local SQLite `sqlite+aiosqlite:///./devspeak.db` with PostgreSQL readiness for production).
   - Configured `.gitignore` to strictly exclude `*.db`, `*.db-journal`, `*.sqlite`, `*.sqlite3`, `*-wal`, `*-shm`, and `*.sql.gz`.
2. **Data Modeling & Architecture**:
   - `src/modules/interviews/models.py`: Created `InterviewSession` and `InterviewAttempt` ORM models with explicit relationships, timezone-aware UTC timestamps, JSON metadata, indexed scores, and `ondelete="CASCADE"`.
   - Maintained clean separation: Question content remains in version-controlled catalog (`QuestionCatalog`), while sessions and attempts are stored in relational storage.
3. **Repository & Service Layer**:
   - `src/modules/interviews/repository.py`: Created async repository with session creation, attempt recording, eager-loading (`selectinload`), filtering, and bounded pagination.
   - `src/modules/interviews/service.py`: Orchestrated question catalog validation, transaction management, AI provider evaluation, and domain model mapping.
4. **Database Migrations (Alembic)**:
   - Configured `alembic.ini`, `alembic/env.py` (with thread-safe execution supporting both CLI and pytest environments), and `alembic/script.py.mako`.
   - Created revision `0001_initial_interview_persistence.py` and executed `python -m alembic upgrade head` successfully.
5. **API Evolution & Endpoints**:
   - `POST /api/v1/interviews/sessions`: Initialize a new candidate practice session (validates `question_id` against catalog, returning 404 if missing).
   - `GET /api/v1/interviews/sessions`: Paginated session listing with bounded limit validation (`limit <= 100`).
   - `GET /api/v1/interviews/sessions/{session_id}`: Retrieve session detail and attempt history.
   - `POST /api/v1/interviews/sessions/{session_id}/attempts`: Submit answer, run AI evaluation, and persist attempt history.
   - Maintained full backward compatibility for `POST /api/v1/interviews/evaluate` with optional `session_id`.
6. **Testing & Quality Assurance**:
   - Authored repository unit tests (`tests/unit/test_repository.py` - 6 tests) covering session creation, attempts, pagination, filtering, rollback, and cascade deletion.
   - Authored API endpoint integration tests (`tests/integration/test_session_endpoints.py` - 7 tests) covering success, 404, 422 input constraints, bounded pagination, and repeated attempts.
   - Authored Alembic migration tests (`tests/integration/test_migrations.py` - 1 test) verifying upgrade and downgrade lifecycle on isolated temporary databases.
   - Executed live cross-restart persistence verification across two distinct Uvicorn server processes.
7. **Frontend Alignment**:
   - Added `InterviewSession`, `InterviewAttempt`, and `InterviewSessionDetail` interfaces in `apps/web/src/types/index.ts`.
   - Added typed methods (`createSession`, `getSessionDetail`, `listSessions`, `submitSessionAttempt`) in `apps/web/src/lib/api.ts`.
   - Verified 0 regressions: 19/19 Vitest tests passed, `type-check`, `lint`, and `build` passed.

### Verification Results:
- `pytest`: 40 passed in 1.88s (100% pass rate across 5 test suites).
- `ruff check .`: 0 errors.
- `ruff format --check .`: All 28 files formatted cleanly.
- `alembic upgrade head`: Applied revision `0001_initial` cleanly.
- Live Cross-Restart Test: Created session `f0112884-34f8-4c54-9d78-c972ff50614b`, recorded attempt, terminated process, started second instance, and verified session/attempt retrieved intact.
- Frontend Verification: 19/19 Vitest tests passing, `tsc --noEmit` 0 errors, `eslint .` 0 errors, `next build` 0 errors.

### Next Immediate Action:
- Task 05: Live AI Provider Integration (Google Gemini structured outputs, prompt injection defenses, retry/timeout resilience).

---

## 2026-10-19: Task 05 — Live AI Provider Integration (Google Gemini Structured Evaluation)

### Actions Taken:
1. **Provider Discovery & SDK Architecture Decision**:
   - Evaluated `google-genai` SDK vs native `httpx.AsyncClient` REST integration.
   - Discovered that `google-genai 2.31.0` requires `websockets<17.0,>=13.0.0`, which would force a downgrade of `websockets 17.2` required by `uvicorn[standard]`.
   - Selected direct REST integration via existing `httpx.AsyncClient` with zero additional dependencies, zero version conflicts, and native connection pooling.
2. **AI Provider Exception Hierarchy (`src/modules/ai/exceptions.py`)**:
   - Implemented `AIProviderError` base exception and specialized subclasses:
     - `AIConfigurationError` (HTTP 503)
     - `AIRateLimitError` (HTTP 429)
     - `AITimeoutError` (HTTP 504)
     - `AIResponseValidationError` (HTTP 502)
   - Registered FastAPI global exception handlers in `src/main.py` masking internal traces while returning safe client-facing JSON messages.
3. **Structured Gemini Provider Implementation (`src/modules/ai/gemini_provider.py`)**:
   - Built `GeminiAIProvider` implementing `AIProviderInterface`.
   - Native Structured Outputs using `responseMimeType: "application/json"` and strict `responseSchema` enforcing the `FeedbackReport` JSON contract.
   - Prompt Injection Defense: Candidate answers strictly isolated inside `<candidate_response>` XML blocks with explicit system directives prohibiting override of grading rubrics or persona changes.
   - Resilience & Reliability: Exponential backoff retries on transient errors (HTTP 429 rate limits, HTTP 503 unavailable, read timeouts) up to `AI_MAX_RETRIES=2`.
   - Dependency injection for `http_client` enabling 100% offline unit testing via `httpx.MockTransport`.
4. **Factory Integration & Defaults (`src/modules/ai/factory.py`)**:
   - Maintained `AI_PROVIDER=mock` as the zero-cost default for offline development and CI.
   - Dynamic resolution of `gemini` when configured, raising `AIConfigurationError` for unconfigured or unsupported providers.
   - Added `reset_ai_provider()` helper for isolated test teardowns.
5. **Testing & Verification Suite**:
   - Authored unit test suite (`tests/unit/test_gemini_provider.py` - 9 tests) covering API key enforcement, factory resolution, structured JSON response parsing, rate limit backoff, timeout handling, and prompt injection containment (100% offline, zero paid API calls).
   - Added integration test cases (`tests/integration/test_api_endpoints.py` - 4 tests) verifying HTTP 429, 502, 503, and 504 exception mapping.
   - Fixed `populate_by_name=True` on Pydantic schemas and resolved relative path resolution in `test_migrations.py`.
   - Total backend test count increased to 50/50 passing tests.
7. **Live Key Activation & Production Model Alignment**:
   - Securely configured user API key into local gitignored `apps/api/.env`.
   - Queried Google AI Studio models endpoint: verified deprecation of `gemini-2.0-flash` and transient 503 high demand on `gemini-flash-latest`.
   - Selected `gemini-flash-lite-latest` providing ultra-fast latency (< 3s), 100% availability, and perfect JSON schema compliance.
   - Executed live E2E evaluation request against `POST /api/v1/interviews/evaluate`: verified structured `FeedbackReport` generation with real AI scores and actionable feedback.

### Verification Results:
- `pytest`: 50 passed in 2.13s (100% pass rate across 6 test suites).
- `ruff check apps/api`: All checks passed (0 lint errors).
- `vitest run`: 19 passed in 3.03s (100% pass rate).
- `tsc --noEmit` & `eslint .`: 0 errors.
- `next build`: Optimized production build passed cleanly.
- Live API evaluation: **HTTP 200 OK** (Returned valid `FeedbackReport` from `gemini-flash-lite-latest`).

### Next Immediate Action:
- Phase 2 / Milestone 2: Continuous Integration, Quality Gates, and DevSecOps Pipeline (GitHub Actions, multi-stage Dockerfiles, Trivy & Semgrep scanning).


---

## 2026-10-19: Task 06 — DevSecOps CI Hardening & Bilingual English/Vietnamese UX/UI

### Actions Taken:
1. **CI Pipeline & DevSecOps Hardening (`.github/workflows/ci.yml`)**:
   - Implemented least-privilege permissions: top-level `permissions: contents: read`.
   - Workflow concurrency controls: `group: ${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`.
   - Pinned actions to commit SHAs with semantic version comments (`actions/checkout@v4.2.2`, `actions/setup-python@v5.4.0`, `actions/setup-node@v4.2.0`, `gitleaks/gitleaks-action@v2.3.8`).
   - Job timeouts explicitly defined (5-10 minutes) to eliminate hanging runner costs.
   - Secret Scan Job: Configured Gitleaks to enforce zero-secret commitments.
   - Backend Quality Job: Enforced Ruff lint, format check, Bandit SAST (`bandit -r src`), pip-audit dependency CVE scanner, Alembic migration verification, and 100% offline Pytest execution with `AI_PROVIDER: "mock"`.
   - Frontend Quality Job: Enforced clean `npm ci`, `tsc --noEmit`, `eslint .`, Vitest suite, and `next build`.
2. **SAST & Vulnerability Remediation**:
   - Executed Bandit SAST on `apps/api`: identified low severity B110 (`try-except-pass`) in `src/core/config.py`. Refactored `parse_cors_origins` to explicitly handle `json.JSONDecodeError` without empty `pass`. Re-scan verified **0 issues identified** across 1,989 LOC. Added `bandit>=1.8.0` to `requirements-dev.txt`.
   - Executed `pip-audit`: verified **0 known vulnerabilities** (0 CVEs) in Python dependencies. Added `pip-audit>=2.7.0` to `requirements-dev.txt`.
   - Executed `npm audit`: audited 383 frontend packages; analyzed transitive advisories in dev dependencies without breaking Next 15 / Tailwind 3 compatibility.
   - Confirmed `apps/api/.env` is gitignored (`git check-ignore apps/api/.env`).
3. **Bilingual i18n Architecture (`apps/web/src/i18n/`)**:
   - `types.ts`: Defined strict TypeScript `Translations` interface covering all 5 user journeys (`nav`, `dashboard`, `catalog`, `detail`, `practice`, `feedback`, `footer`).
   - `en.ts`: Authored comprehensive English translation dictionary maintaining backward-compatible labels with existing tests.
   - `vi.ts`: Authored natural Vietnamese translations tailored for Vietnamese IT and DevOps professionals.
   - `LanguageContext.tsx`: Built `LanguageProvider` and `useLanguage` hook managing `locale`, `setLanguage`, `toggleLanguage`, and `t`.
   - SSR Hydration Safety & Persistence: Defaulted state to `'en'` for identical server/client initial render, syncing client preference from `localStorage.getItem('devspeak_locale')` on mount without hydration mismatch.
   - `LanguageSwitcher.tsx`: Built accessible, keyboard-navigable language switcher component with `Globe` icon and `aria-label`.
4. **Component Localization & Next.js Architecture Refactoring**:
   - Refactored `apps/web/src/app/page.tsx` as a clean Server Component wrapping `DevSpeakApp` in `LanguageProvider`, resolving the Next.js 15 App Router client manifest prerender bug during `next build`.
   - Integrated `useLanguage()` into `Header.tsx`, `DashboardHome.tsx`, `QuestionCatalog.tsx`, `QuestionDetailView.tsx`, `PracticeStudio.tsx`, `FeedbackStudio.tsx`, and `DevSpeakApp.tsx`.
   - **Interview Learning Integrity**: Preserved technical interview questions, diagnostic commands (`kubectl describe pod`, `CrashLoopBackOff`, `vmstat`, `NAT Gateway`), evaluation rubrics, and benchmark model answers strictly in **English**, so candidates practice native IT English while navigating comfortably in Vietnamese.
5. **Testing & Verification Suite**:
   - Authored `apps/web/tests/i18n.test.tsx` (9 tests) verifying dictionary key parity, non-empty values, default English, Vietnamese switching, localStorage persistence, invalid data fallback, and technical English preservation.
   - Re-verified existing frontend tests: all 28 Vitest tests passed.
   - Re-verified backend tests: all 50 Pytest tests passed offline in 2.15s.
   - Verified live endpoints: Backend `readyz` returned 200, Frontend port 3001 returned 200.

### Verification Results:
- `pytest`: 50 passed in 2.15s (100% offline, zero live API calls).
- `ruff check .`: All checks passed (0 errors).
- `ruff format --check .`: 31 files cleanly formatted.
- `bandit -r src`: 0 issues identified across 1,989 lines of code.
- `pip-audit`: 0 known CVEs.
- `npm test`: 28 passed in 1.79s (100% pass rate across 3 test suites).
- `tsc --noEmit`: 0 errors.
- `eslint .`: 0 errors.
- `next build`: Optimized production build passed cleanly (`Generating static pages (4/4)`).
- Live API probe: Backend `readyz` HTTP 200 (`{"status":"ready","ai_provider":"gemini","questions_loaded":6}`), Frontend port 3001 HTTP 200.

### Next Immediate Action:
- Task 07: Containerization & Local Orchestration (Multi-stage Dockerfiles, Docker Compose with non-root security profiles, healthcheck integration).

---

## 2026-10-19: Task 07 — Containerization & Multi-Container Local Orchestration

### Actions Taken:
1. **Production Dependency Manifest Alignment**:
   - Added `httpx>=0.27.0` (required for Gemini REST provider) and `asyncpg>=0.30.0` (required for PostgreSQL async driver in container) to `apps/api/requirements.txt` and `apps/api/pyproject.toml`.
   - Re-verified dependency security with `pip-audit`: **0 known vulnerabilities**.
2. **Backend Multi-Stage Dockerfile (`apps/api/Dockerfile`)**:
   - Multi-stage build based on `python:3.12-slim-bookworm`.
   - Builder stage: installs runtime wheels into isolated `/opt/venv`, keeping compiler toolchains out of the final image.
   - Runner stage: creates non-root system group `appgroup` (GID 10001) and user `appuser` (UID 10001).
   - Zero-dependency healthcheck probe using Python stdlib `urllib.request` against `/readyz` on port 8000.
   - Entrypoint script (`entrypoint.sh`): automatically applies pending Alembic migrations (`python -m alembic upgrade head`) before executing Uvicorn as PID 1 (`exec python -m uvicorn ...`).
   - Created `.dockerignore` for `apps/api` ignoring virtual environments, caches, test files, local SQLite databases, and `.env` files.
3. **Frontend Multi-Stage Dockerfile (`apps/web/Dockerfile`)**:
   - Multi-stage build based on `node:22-alpine` with `libc6-compat`.
   - Stage 1 (`deps`): installs exact locked dependencies via `npm ci`.
   - Stage 2 (`builder`): builds production bundle with `npm run build`.
   - Stage 3 (`runner`): runs on minimal Alpine Linux under non-root system user `nextjs` (UID 1001) and group `nodejs` (GID 1001).
   - Zero-dependency healthcheck probe using Node.js stdlib `http` module against port 3000.
   - Created `.dockerignore` for `apps/web` ignoring node_modules, `.next`, test files, and local env files.
4. **Local Multi-Container Orchestration (`docker-compose.yml`)**:
   - Service `db`: `postgres:16-alpine`, persistent named volume `postgres_data`, healthcheck using `pg_isready -U devspeak`, and `security_opt: [no-new-privileges:true]`.
   - Service `api`: builds `apps/api`, depends on `db` with `condition: service_healthy`, connected to internal bridge network `devspeak-net`, with port 8000 exposed.
   - Service `web`: builds `apps/web`, depends on `api` with `condition: service_healthy`, mapping host port 3001 to container port 3000 (resolving host port 3000 conflicts).
   - Created template `.env.docker.example` for environment variable injection without committing secrets.
   - Validated YAML syntax with PyYAML parser: **YAML is valid**.
5. **Quality Gates & Regression Verification**:
   - Backend: `ruff check .` (0 errors), `ruff format --check .` (31 files cleanly formatted), `bandit -r src` (0 issues across 1,989 LOC), `pip-audit` (0 CVEs), `pytest` (50/50 passing in 2.08s).
   - Frontend: `npm test` (28/28 passing in 1.88s), `type-check` (0 errors), `lint` (0 errors), `next build` (4/4 static pages generated).
   - Live endpoints: Backend `readyz` HTTP 200, Frontend port 3001 HTTP 200.

### Verification Results:
- `docker-compose.yml`: PyYAML parse verified valid.
- `apps/api/Dockerfile`: Multi-stage, non-root `appuser:10001`, Python stdlib healthcheck.
- `apps/web/Dockerfile`: Multi-stage, non-root `nextjs:1001`, Node.js stdlib healthcheck.
- `pip-audit`: 0 known CVEs.
- `pytest`: 50 passed in 2.08s.
- `npm test`: 28 passed in 1.88s.
- `next build`: Optimized production build passed cleanly.
- `git status -s`: Clean, zero secrets staged.

### Next Immediate Action:
- Execute and verify Docker Compose runtime on local Docker Engine.

---

## 2026-10-20: Task 07 — Docker Desktop Runtime Verification & End-to-End Container Health

### Actions Taken:
1. **Host Environment & Docker Engine Audit**:
   - Docker Desktop 4.96.0 (Engine 29.9.1 on linux/amd64) and Docker Compose v5.6.0 verified running and responsive.
   - Host ports 3001 and 8000 verified completely free.
2. **Comprehensive Local Quality Gates Execution**:
   - Backend:
     - `ruff check .`: PASS (0 errors).
     - `ruff format --check .`: PASS (31 files formatted).
     - `bandit -r src`: PASS (0 issues across 1,989 LOC).
     - `pytest -c pyproject.toml` (`AI_PROVIDER=mock`): PASS (50/50 passed in 2.60s, zero live API calls).
   - Frontend:
     - `npm test`: PASS (28/28 passed in 3.73s across 3 test files).
     - `npm run type-check`: PASS (0 TypeScript errors).
     - `npm run lint`: PASS (0 ESLint errors).
     - `npm run build`: PASS (compiled in 2.4s, 4/4 static pages generated).
3. **Docker Compose Build & Container Hardening**:
   - Created missing `apps/web/public/.gitkeep` ensuring Next.js static asset directory copying succeeds in multi-stage Docker build.
   - Standardized frontend container port to 3001: aligned `apps/web/Dockerfile` (`PORT=3001`, `EXPOSE 3001`, healthcheck probe) and `docker-compose.yml` (`3001:3001`) with Next.js start script (`next start -H 0.0.0.0 -p 3001`).
   - Updated `.gitignore` with `!.env*.example` to keep `.env.docker.example` tracked while strictly ignoring all real secret `.env` files.
   - Built and launched stack via `docker compose up -d --build`.
4. **End-to-End Runtime & Persistence Verification**:
   - Container status (`docker compose ps`):
     - `devspeak-db`: Up and **Healthy** (PostgreSQL 16 Alpine, port 5432 internal to bridge).
     - `devspeak-api`: Up and **Healthy** (FastAPI, port 8000 mapped).
     - `devspeak-web`: Up and **Healthy** (Next.js 15 PWA, port 3001 mapped).
   - Automatic DB Migration: verified `alembic upgrade head` executed via `entrypoint.sh` applying `0001_initial` schema on container boot.
   - Non-root user validation (`docker exec id`):
     - API container runs as `uid=10001(appuser) gid=10001(appgroup)`.
     - Web container runs as `uid=1001(nextjs) gid=1001(nodejs)`.
   - Endpoint verification:
     - Frontend `http://localhost:3001`: HTTP 200 OK.
     - Backend Readiness `http://127.0.0.1:8000/readyz`: HTTP 200 OK (`{"status":"ready","ai_provider":"mock","questions_loaded":6}`).
     - Swagger UI `http://127.0.0.1:8000/docs`: HTTP 200 OK.
     - Question catalog `http://127.0.0.1:8000/api/v1/questions`: HTTP 200 OK (6 questions returned).
     - Mock AI evaluation `POST /api/v1/interviews/evaluate`: HTTP 200 OK (grammar, technical, STAR scores, feedback, canonical answer).
     - PostgreSQL session & attempt lifecycle:
       - `POST /api/v1/interviews/sessions`: HTTP 200 (created session UUID in PostgreSQL).
       - `POST /api/v1/interviews/sessions/{id}/attempts`: HTTP 200 (stored attempt & feedback in PostgreSQL).
       - `GET /api/v1/interviews/sessions/{id}`: HTTP 200 (retrieved session and attempt history from PostgreSQL).

### Verification Results:
- `docker compose ps`: 3/3 services Up & Healthy (`devspeak-db`, `devspeak-api`, `devspeak-web`).
- Backend Quality Checks: 100% PASS (ruff, bandit, 50/50 pytest offline).
- Frontend Quality Checks: 100% PASS (28/28 vitest, tsc, eslint, build).
- End-to-end integration: 100% PASS across HTTP, DB, and Mock AI evaluation.
- Non-root security: 100% verified (`appuser:10001`, `nextjs:1001`).

### Next Immediate Action:
- Redesign and implement the flagship AI Interview Studio experience.

---

## 2026-10-20: Feature — Flagship AI Interview Studio Redesign & Implementation

### Actions Taken:
1. **Three-Zone Workspace Architecture**:
   - Implemented responsive three-zone architecture in `apps/web/src/components/studio/InterviewStudio.tsx`:
     - **Left Zone (`SessionSidebar.tsx`)**: Displays session identity, progress bar, collapsible sidebar on desktop, and question navigation list with status indicators (`Current`, `Evaluated`, `Pending`).
     - **Center Zone**: Prominent question card with focus competencies, spacious answer textarea with real-time word/character count (10-4000 bounds), quick helper chips (`+ STAR Framework`, `+ Chronological Steps`, `Clear Draft`), `Ctrl + Enter` keyboard shortcut submission, and action bar (`Submit for AI Coaching & Score`, `Study Model Answer`).
     - **Right Zone (Contextual Coaching Panel)**: 4-tab panel featuring AI Feedback, Vocabulary Coach, STAR Builder, and Rubric & Traps.
2. **Technical Vocabulary Coach (`VocabularyCoach.tsx`)**:
   - Maps rubric `key_concepts` and `competencies` to domain definitions, IT usage contexts, and example sentences.
   - Provides 1-click "Copy Term" and "Insert into Answer" actions.
   - Preserves complete honesty with an explicit transparency badge noting terms are extracted from the question rubric and industry standards.
3. **STAR Answer Builder (`STARBuilder.tsx`)**:
   - Interactive 4-step framework (Situation, Task, Action, Result) with distinct accent colors (cyan, indigo, violet, emerald) and visual progress connectors.
   - Provides native IT English sentence starters and 1-click step/template insertion into the user's answer draft.
   - Contextual recommendation banner identifying whether STAR is specifically recommended for the question.
4. **AI Feedback Panel (`FeedbackPanel.tsx`)**:
   - Overall score card with tier badge (Strong, Solid, Developing) and 3 dimension progress bars (Technical Accuracy, Grammar & Professional Tone, STAR Clarity).
   - Categorized feedback tabs (Technical, Grammar, Structure) and benchmark canonical answer with 1-click copy.
   - Probing follow-up questions from hiring committees with quick practice actions.
   - Learning actions: "Refine Answer", "Practice Again", and "Next Question".
5. **Bilingual Localization (100% Key Parity)**:
   - Added comprehensive `studio` translations in `apps/web/src/i18n/types.ts`, `en.ts`, and `vi.ts`.
   - Adhered strictly to the Interview Learning Integrity Rule: UI labels, navigation, and instructions are localized in Vietnamese, while technical terms, diagnostic commands, and model answers remain in English.
6. **Automated Testing & Production Verification**:
   - Authored `apps/web/tests/interview-studio.test.tsx` (8 new tests covering 3-zone layout, question switching, collapse toggle, vocabulary insertion, STAR builder, Ctrl+Enter submission, feedback rendering, and draft clearing).
   - Vitest suite: **36/36 tests passing** (4/4 test files).
   - TypeScript: `tsc --noEmit` passed with 0 errors.
   - ESLint: `eslint .` passed with 0 errors.
   - Next.js: `npm run build` compiled cleanly in 10.3s (4/4 static pages).
   - Backend regression: `pytest` passed 50/50 offline.
   - Docker Compose: rebuilt and updated container `devspeak-web` at `http://localhost:3001` (HTTP 200 OK, Healthy).

### Verification Results:
- `npm test`: 36 passed in 3.45s (100% pass rate across 4 test suites).
- `npm run type-check`: 0 errors.
- `npm run lint`: 0 errors.
- `npm run build`: Compiled successfully in 10.3s.
- `docker compose ps`: 3/3 services Up & Healthy (`devspeak-db`, `devspeak-api`, `devspeak-web`).
- Frontend runtime: `http://localhost:3001` returning HTTP 200.

### Next Immediate Action:
- LinguaFlow-Inspired UI/UX Redesign & Gamified English Learning Studio.

---

## 2026-10-20: LinguaFlow-Inspired UI/UX Redesign & Gamified English Learning Experience

### Actions Taken:
1. **Design System & Visual Language Alignment**:
   - Recreated the high-contrast dark neon aesthetic of the LinguaFlow reference (`#05040F` canvas, `#080613` sidebar, `#0D0920` card surfaces, `#120C26` elevated cards, `#1F1538` borders).
   - Configured full neon accent palette in `apps/web/tailwind.config.ts`: `#8B20F5` (primary purple), `#A855F7` (bright purple), `#315BFF` (electric blue), `#EC007A` (vivid pink), `#009F83` (emerald teal), `#FF7A00` (flame amber).
   - Customized typography hierarchy with `#F5F3FF` primary headers, `#9286C7` lavender subtitles, and glowing scrollbar/subtle radial neon backdrops in `globals.css`.
2. **Component Architecture (`apps/web/src/components/linguaflow/`)**:
   - `LinguaSidebar.tsx`: Fixed desktop sidebar & mobile drawer with brand mark, streak progress widget (`12 day streak`, `B2 Lv. 6`, XP bar), `LEARN` section (Dashboard, Question Bank, Flashcards, Technical Vocab, Shadowing, Mock Studio, STAR Method), and B2 Tip of the Day card.
   - `MetricCards.tsx`: 4 high-contrast metric cards (Day Streak with flame, Total XP with sparkles, Words Learned with book, Level with trophy/crown).
   - `WeeklyProgressChart.tsx`: Lightweight SVG Bezier wave chart with glowing purple stroke, area gradient fill, interactive target indicator, and `+24% this week` trend badge.
   - `StreakCalendar.tsx`: Weekday bubbles with glowing fire badges, big hero `🔥 12 days in a row`, and XP goal progress bar.
   - `ContinueLearningSection.tsx`: 4 colorful activity cards (`Review Cards` in purple, `Shadow Practice` in pink, `Talk with AI` in blue, `Do Exercises` in teal) with hover micro-interactions.
   - `GoalsAndAchievements.tsx`: 2-column bottom layout for Today's Goals (Daily XP, Flashcards, AI Session progress bars) and Achievements (Speed Demon, Streak Master, SRE Communicator, Architecture Pro badges).
   - `FlashcardsView.tsx`: Interactive 3D flip card study studio with Web Speech API audio pronunciation (`speechSynthesis`), category tags, technical definitions, SRE interview tips, mastery toggle, and "Practice in Studio" deep-linking.
   - `LinguaFlowDashboard.tsx`: Top-level composition assembling header greeting banner, CEFR level progression (`A1 A2 B1 [B2] C1 C2`), metric row, middle charts, continue learning row, and goals/achievements.
3. **Application Integration (`DevSpeakApp.tsx` & `Header.tsx`)**:
   - Integrated `LinguaSidebar` on the left with `lg:pl-64` layout offset.
   - Preserved all existing routes and modal flows: Question Catalog, Question Detail View, 3-zone flagship AI Interview Studio, and Feedback Studio.
   - Connected LinguaFlow actions to actual application flows (e.g., clicking "Talk with AI" or "Shadow Practice" loads the selected question into Practice Studio; clicking "Review Cards" opens the interactive Flashcards studio).
4. **Bilingual Localization (100% Key Parity)**:
   - Added comprehensive `linguaSidebar` and `flowDashboard` dictionaries in `apps/web/src/i18n/types.ts`, `en.ts`, and `vi.ts`.
   - Verified 100% key parity with `tests/i18n.test.tsx` (9/9 passed).
5. **Quality Verification**:
   - Frontend tests: `npm test` -> **36/36 passed** across 4 test files.
   - TypeScript: `npm run type-check` -> 0 errors.
   - ESLint: `npm run lint` -> 0 errors.
   - Production build: `npm run build` -> compiled successfully (4/4 static pages).
   - Backend tests: `pytest` -> **50/50 passed**.
   - Docker Compose: rebuilt `devspeak-web` container and verified healthy status at `http://localhost:3001` (HTTP 200 OK).

### Verification Results:
- `npm test`: 36 passed in 2.63s.
- `npm run type-check`: 0 errors.
- `npm run lint`: 0 errors.
- `npm run build`: Compiled in 10.1s.
- `pytest`: 50 passed in 2.36s.
- Docker Compose: 3/3 services healthy (`devspeak-db`, `devspeak-api`, `devspeak-web`).
- Endpoint `http://localhost:3001`: HTTP 200 OK serving LinguaFlow layout.
- Endpoint `http://127.0.0.1:8000/readyz`: HTTP 200 OK (`status: ready, ai_provider: mock, questions_loaded: 6`).

### Next Immediate Action:
- UX/UI Layout Optimization: Eliminated Desktop Sidebar Offset Gap & Enhanced Visual Icon System.

---

## 2026-10-20: UX/UI Layout Optimization & Visual Icon System Enhancement

### Actions Taken:
1. **Layout Gap Elimination**:
   - Diagnosed root cause of the empty black gap between the left sidebar and main content: `DevSpeakApp.tsx` had an redundant `lg:pl-64` applied to the content wrapper while `LinguaSidebar` was already taking sticky in-flow width `w-64 lg:w-72 shrink-0`, compounded by `max-w-7xl mx-auto`.
   - Removed `lg:pl-64` and standardized content flow on `flex-1 flex flex-col min-w-0 bg-[#05040F]`.
   - Unified padding across Header, Main Viewport, and Footer to `w-full px-4 sm:px-6 xl:px-8`, eliminating the orphan gap entirely and allowing cards and charts to stretch proportionally across the screen.
2. **Visual Hierarchy & Header Streamlining (`Header.tsx`)**:
   - Streamlined Header on desktop: Replaced duplicate brand logo with a sleek studio badge (`AI Interview Studio • IT & DevOps Track`), avoiding competing navigation with the left sidebar.
   - Enhanced live status badge with an animated pulsating green radar ping (`animate-ping`) when connected to FastAPI backend.
   - Preserved mobile responsiveness with compact logo and drawer trigger (`lg:hidden`).
3. **Visual Icon System & Micro-Interactions**:
   - `MetricCards.tsx`: Added rich glowing icon badges with radial gradient backdrops and contextual tags (`12d Active`, `Top 5% SRE`, `+14 tuần này`, `B2 Master`).
   - `LinguaFlowDashboard.tsx`: Added an interactive **Lối tắt chủ đề phỏng vấn** (Quick Track Shortcuts) bar with colored tech icons (Kubernetes ⎈, CI/CD ⚡, Linux SRE 🐧, AWS Cloud ☁️, STAR Method ⭐).
   - `ContinueLearningSection.tsx`: Elevated the 4 learning cards with 3D-styled icon badges, status micro-tags, hover lift effects (`hover:-translate-y-1.5`), and arrow transitions.
   - `GoalsAndAchievements.tsx`: Enriched daily goals with distinctive icons and animated gradient progress bars; upgraded achievements with collectible badge styling and emerald unlock checkmarks.
4. **End-to-End Verification**:
   - Frontend tests: `npm test` -> **36/36 passed** across 4 test suites.
   - Type check: `npm run type-check` -> 0 errors.
   - Linting: `npm run lint` -> 0 errors.
   - Production build: `npm run build` -> compiled successfully (38.4 kB, 4/4 static pages).
   - Backend tests: `pytest` -> **50/50 passed** in 2.38s.
   - Docker Compose: Container `devspeak-web` rebuilt and healthy at `http://localhost:3001` (HTTP 200 OK).

### Verification Results:
- `npm test`: 36 passed in 5.01s.
- `npm run type-check`: 0 errors.
- `npm run lint`: 0 errors.
- `npm run build`: Compiled in 4.8s.
- `pytest`: 50 passed in 2.38s.
- Docker Compose: All 3 containers (`devspeak-db`, `devspeak-api`, `devspeak-web`) Up & Healthy.
- Port 3001: Verified `lg:pl-64` eliminated, new layout and icon system rendered cleanly.

### Next Immediate Action:
- Milestone 3 / Task 08: Kubernetes Manifests & Local Cluster Deployment (KIND/k3d, K8s Deployments, Services, ConfigMaps, Secrets, Ingress, NetworkPolicies).






---

## 2026-10-23: GCP DevOps & DevSecOps Portfolio Evolution — Phase 0: Audit & Baseline Complete

### Objective:
Conduct deep filesystem, container, and test baseline audit for Google Cloud Platform deployment. Establish strict cost controls tailored to the $300 Free Trial budget, define zero-trust threat models, and author architectural and implementation plans.

### Actions Taken:
1. **Repository Synchronization & Git Hygiene**:
   - Configured remote tracking: `origin -> https://github.com/nguyenlpn2015/DevSpeak-AI.git`.
   - Committed clean baseline codebase to `main`: commit `c44b747` (`114 files changed, 25297 insertions(+)`).
   - Strictly enforced documentation privacy: `.gitignore` ignores all markdown files (`*.md`, `docs/`, `study/`). Verified 0 markdown files exist on GitHub.
2. **Local Baseline Testing & Quality Gates**:
   - Backend Pytest: **65/65 passed in 5.54s** (`pytest -c pyproject.toml`, `AI_PROVIDER=mock`).
   - Frontend Vitest: **44/44 passed across 7 suites in 49.33s** (`vitest run`).
   - TypeScript Type Check: **0 errors** (`tsc --noEmit`).
   - Frontend ESLint: **0 errors / 0 warnings** (`eslint .`).
   - Backend Ruff: **All checks passed** (`ruff check .`).
   - Backend Bandit SAST: **0 issues across 4,006 lines of code** (`bandit -r src`).
   - SCA Audit: **No known vulnerabilities found** (`pip-audit -r requirements.txt`).
3. **Architectural & Governance Deliverables**:
   - Authored `docs/GCP_ARCHITECTURE.md`: Cloud Run scale-to-zero, Cloud SQL PostgreSQL (`db-f1-micro`), Secret Manager, Workload Identity Federation (WIF).
   - Authored `docs/COST_ESTIMATE.md`: Projected burn ~$10.76–$12.11/month (>20 months runway on $300 credit), $25/mo budget alert, teardown playbook.
   - Authored `docs/THREAT_MODEL.md`: STRIDE analysis, OWASP Top 10 + LLM Top 10, prompt injection isolation, non-root containers.
   - Authored `docs/GCP_IMPLEMENTATION_PLAN.md`: 14-phase roadmap (Phases 0–13), gate criteria, and approval boundaries.
   - Authored `docs/RELEASE_EVIDENCE.md`: Verifiable test outputs, environment inventory, and identified production breakage risks.
4. **Bilingual Parity (`study/`)**:
   - Created Vietnamese versions for all Phase 0 documents: `study/GCP_ARCHITECTURE.md`, `study/COST_ESTIMATE.md`, `study/THREAT_MODEL.md`, `study/GCP_IMPLEMENTATION_PLAN.md`, and `study/RELEASE_EVIDENCE.md`.
5. **Identified Production Breakage Risks**:
   - Hardcoded `http://127.0.0.1:8000` in `apps/web/src/lib/api.ts` -> Terraform will inject public Cloud Run API URL into Next.js.
   - Localhost CORS restriction in `apps/api/src/core/config.py` -> Backend environment will inject frontend Cloud Run domain.
   - Container startup DB migration race condition in `apps/api/entrypoint.sh` -> Migrations separated into pre-deploy Cloud Run job.

### Verification Results:
- Git: Clean working tree, remote synchronized.
- Zero GCP billable resources created.
- Phase 0 passed with 100% verification evidence.


---

## 2026-10-23: GCP DevOps Portfolio — Phase 1 & Phase 2 Execution Completed

### Actions Taken:
1. **Host Environment Tooling Verification**:
   - Installed `HashiCorp Terraform v1.16.6` and `Google Cloud SDK v590.0.0` via winget.
   - Verified active authentication for account `nguyenlpn2015@gmail.com`.
2. **Phase 1: Project Foundation & Cost Governance**:
   - Updated GCP Project display name from `My First Project` to **DevSpeak-AI** (`project-12679df0-893b-4260-924`).
   - Enabled all 10 core GCP Service APIs: `run`, `sqladmin`, `secretmanager`, `artifactregistry`, `iam`, `cloudresourcemanager`, `iamcredentials`, `logging`, `monitoring`, `billingbudgets`.
   - Created monthly Cloud Billing Budget Alert for 650,000 VND (~$25 USD) on billing account `0116A6-18995D-4E4BD1` with notifications at 50%, 75%, 90%, and 100% spend.
   - Selected target region: `asia-southeast1` (Singapore) for low network latency to Vietnam.
3. **Phase 2: Modular Terraform IaC & GCS Remote State**:
   - Created GCS Remote State bucket: `gs://devspeak-tf-state-359194986638` in `asia-southeast1` with Uniform Bucket-Level Access and Object Versioning enabled.
   - Authored 6 production Terraform modules under `infra/terraform/modules/`:
     - `artifact_registry`: Docker repo with 7-day untagged deletion and 3-tag retention policies.
     - `service_accounts`: Least-privilege SAs for API, Web, CI Deployer, plus Workload Identity Federation (WIF) OIDC binding.
     - `secret_manager`: Random password generators and secret stores for JWT secret, DB password, and Gemini API key.
     - `cloud_sql`: Single-zone PostgreSQL 16 on `db-f1-micro` with 10GB SSD and automated daily backups.
     - `cloud_run`: Scale-to-zero frontend and backend services with Cloud SQL Auth Proxy socket and public invocation.
     - `monitoring`: Cloud Run 5xx server error rate alert policy.
   - Authored root environment manifests under `infra/terraform/environments/prod/` (`backend.tf`, `main.tf`, `variables.tf`, `outputs.tf`, `terraform.tfvars.example`).
   - Executed `terraform fmt` and `terraform init`: Connected to GCS remote state backend, locked provider versions (`google ~> 6.50.0`, `random ~> 3.9.1`).
   - Executed `terraform validate`: Configuration is valid (0 errors).
   - Executed `terraform plan`: Dry-run successfully generated plan: **33 to add, 0 to change, 0 to destroy**.
   - Committed and pushed IaC to GitHub `main` (commit `e3acee4`). Zero secrets or markdown files pushed.


---

## 2026-10-23: Multi-Environment (Dev, Staging, Prod) Architecture & Git Workflow Implementation

### Objective:
Implement enterprise-grade multi-environment architecture (Option A: Local Dev + Staging & Prod sharing 1 Cloud SQL instance with isolated databases/users) and configure Git branch promotion workflow (`feature/*` -> `staging` -> `main`).

### Actions Taken:
1. **Git Branching Strategy**:
   - Created and pushed remote tracking branch `staging` to GitHub: `https://github.com/nguyenlpn2015/DevSpeak-AI.git`.
   - Established promotion flow: local development on `feature/*` -> Pull Request to `staging` (automated CI, SAST, container scan, Staging deploy) -> Pull Request to `main` (Production release gate).
2. **Terraform Multi-Environment Modularization**:
   - Factored out shared foundation into `infra/terraform/environments/shared/`:
     - Artifact Registry (`devspeak-docker` repository).
     - Workload Identity Federation (WIF pool `github-actions-pool`, provider `github-actions-provider`, deployer SA).
     - Cloud SQL Instance (`db-f1-micro` single-zone PostgreSQL 16 instance `devspeak-db`).
     - Backend remote state: `terraform/state/shared`.
   - Created `infra/terraform/environments/staging/`:
     - Staging runtime service accounts (`devspeak-api-staging-sa`, `devspeak-web-staging-sa`).
     - Staging database (`devspeak_staging`) and user (`devspeak_staging_user`) on the shared instance via `data.terraform_remote_state.shared`.
     - Staging secrets (`devspeak-*-staging`).
     - Staging Cloud Run scale-to-zero services (`devspeak-api-staging`, `devspeak-web-staging`).
     - Staging monitoring alert policies.
     - Backend remote state: `terraform/state/staging`.
   - Updated `infra/terraform/environments/prod/`:
     - Production runtime service accounts (`devspeak-api-prod-sa`, `devspeak-web-prod-sa`).
     - Production database (`devspeak_prod`) and user (`devspeak_prod_user`).
     - Production secrets (`devspeak-*-prod`).
     - Production Cloud Run scale-to-zero services (`devspeak-api-prod`, `devspeak-web-prod`).
     - Production monitoring alert policies.
     - Backend remote state: `terraform/state/prod`.
3. **Verification & Delivery**:
   - Ran `terraform fmt` across all modules and environments.
   - Initialized and validated `shared` (`terraform validate` passed).
   - Initialized and validated `staging` (`terraform validate` passed).
   - Initialized and validated `prod` (`terraform validate` passed).
   - Verified `shared` execution plan: **9 to add, 0 to change, 0 to destroy**.
   - Committed and pushed to `main` and fast-forward merged to `staging` (commit `9ca9639`).
   - Verified 0 markdown files and 0 secrets present on GitHub.


---

## 2026-10-23: Phase 3 — Production Container Hardening Completed

### Objective:
Harden frontend and backend container images for reproducible builds, non-root execution, dynamic `$PORT` ingress on Cloud Run, signal forwarding, and migration isolation while preserving 100% local Docker Compose compatibility.

### Actions Taken:
1. **Frontend Hardening (`apps/web`)**:
   - `apps/web/next.config.ts`: Enabled `output: "standalone"` while preserving API rewrite rules.
   - `apps/web/Dockerfile`:
     - Refactored runner to consume `.next/standalone`, `.next/static`, and `public`.
     - Replaced post-copy `RUN chown -R` with direct `COPY --chown=nextjs:nodejs` to eliminate layer duplication.
     - Replaced `CMD ["npm", "start"]` with `CMD ["node", "server.js"]` (Node as PID 1 for clean SIGTERM signal propagation).
     - Injected `HOSTNAME="0.0.0.0"` to ensure Next.js binds to all interfaces (avoiding loopback ECONNREFUSED on healthchecks).
     - Standardized zero-dependency Node.js healthcheck on `process.env.PORT || 3000`.
     - Effective runtime user: `nextjs:1001` (group `nodejs:1001`).
     - Image content size reduced from ~600MB down to **78.6 MB**.
   - `apps/web/.dockerignore`: Excluded IDE configs, OS artifacts, tests, coverage, and `.env*`.
2. **Backend Hardening (`apps/api`)**:
   - `apps/api/entrypoint.sh`:
     - Added custom command bypass: if a command like `id` or `python` is passed to `docker run`, it executes directly via `exec "$@"`.
     - Added `AUTO_MIGRATE` switch: defaults to `true` for local Docker Compose development; allows setting `AUTO_MIGRATE=false` for Cloud Run multi-instance scale-out to prevent migration race conditions.
     - Preserved `exec python -m uvicorn ...` for SIGTERM signal handling.
   - `apps/api/Dockerfile`:
     - Replaced `RUN chown -R` with direct `COPY --chown=appuser:appgroup` across `alembic.ini`, `alembic/`, `src/`, `entrypoint.sh`.
     - Preserved Python 3.12-slim-bookworm multi-stage build, non-root user `appuser:10001` (group `10001`), and `/readyz` healthcheck.
     - Image content size: **77.9 MB**.
   - `apps/api/.dockerignore`: Excluded IDE configs, OS artifacts, tests, dev requirements, and `.env*`.
3. **Verification Matrix**:
   - Backend tests: **65/65 passed in 5.55s** (`pytest -c pyproject.toml`).
   - Frontend tests: **44/44 passed in 2.90s** (`vitest run`).
   - Frontend type-check & lint: **0 errors** (`tsc --noEmit`, `eslint .`).
   - Non-root users: verified `nextjs:1001` (Web) and `appuser:10001` (API).
   - Dynamic port override: verified both containers listen and respond with HTTP 200 on `PORT=8888`.
   - Migration switch: verified `AUTO_MIGRATE=false` successfully skips Alembic migrations.
   - Compose stack integration: all 3 containers (`devspeak-api`, `devspeak-db`, `devspeak-web`) running and **healthy**.
   - Secrets audit: verified 0 secrets or credentials baked into image layers.
    - Git promotion: committed on `feature/phase3-container-hardening` (`2d2b84b`), merged into `staging` (`1529353`), and pushed to `origin/staging`.


---

## 2026-10-23: Phase 4 — Artifact Registry & Workload Identity Federation (WIF) Completed

### Objective:
Provision shared cloud infrastructure for container lifecycle management (GCP Artifact Registry with automated cleanup policies) and secure, keyless GitHub Actions CI/CD authentication via Workload Identity Federation (OIDC). Push baseline hardened container images to Google Cloud.

### Actions Taken:
1. **Infrastructure Provisioning via Terraform (`infra/terraform/environments/shared`)**:
   - Targeted modules: `module.artifact_registry` and `module.wif`.
   - Executed `terraform apply -auto-approve`: **7 added, 0 changed, 0 destroyed**.
   - Created private Docker repository: `devspeak-docker` in `asia-southeast1` (Singapore) with automated lifecycle cleanup policies:
     - `keep-minimum-versions`: Retains 3 most recent tagged versions.
     - `delete-untagged-old-images`: Automatically purges untagged images older than 7 days (prevents storage bloat).
   - Created Workload Identity Pool: `github-actions-pool` (`projects/359194986638/locations/global/workloadIdentityPools/github-actions-pool`).
   - Created Workload Identity Provider: `github-actions-provider` mapped to GitHub OIDC issuer (`https://token.actions.githubusercontent.com`) with strict condition `assertion.repository == 'nguyenlpn2015/DevSpeak-AI'`.
   - Created dedicated CI Deployer Service Account: `devspeak-ci-deployer-sa@project-12679df0-893b-4260-924.iam.gserviceaccount.com`.
   - Assigned least-privilege IAM roles:
     - `roles/artifactregistry.writer`: Allows pushing Docker images.
     - `roles/run.admin`: Allows deploying Cloud Run services.
     - `roles/iam.workloadIdentityUser`: Binds GitHub repository identity to the service account.
2. **Container Registry Authentication & Baseline Image Push**:
   - Configured Docker client authentication for `asia-southeast1-docker.pkg.dev` using OAuth2 access token.
   - Tagged and pushed `devspeak-api:baseline`:
     - Image URL: `asia-southeast1-docker.pkg.dev/project-12679df0-893b-4260-924/devspeak-docker/devspeak-api:baseline`
     - Digest: `sha256:f155cabf5e25e945211e33a22c540567292e94b86f3ede6963ff53f0f29a7450`
     - Remote size: 77,855,100 bytes (~77.8 MB).
   - Tagged and pushed `devspeak-web:baseline`:
     - Image URL: `asia-southeast1-docker.pkg.dev/project-12679df0-893b-4260-924/devspeak-docker/devspeak-web:baseline`
     - Digest: `sha256:ded80abdf25ed184e91abd34cba113ec27e4f84a7390d7162d258396d1099e19`
     - Remote size: 78,597,199 bytes (~78.6 MB).
3. **Verification Matrix**:
   - `gcloud artifacts docker images list`: Confirmed both images present in Singapore registry.
   - `gcloud artifacts docker tags list`: Confirmed `baseline` tag assigned to both images.
   - `gcloud iam workload-identity-pools describe`: State is `ACTIVE`.
   - `gcloud iam workload-identity-pools providers describe`: State is `ACTIVE`, attribute condition verified.
   - Cost impact: $0.00 / 0 VND (within GCP Free Tier 0.5 GB/month).


---

## 2026-10-23: Phase 5 — Cloud SQL & Staging Infrastructure Provisioning Completed

### Objective:
Provision the shared PostgreSQL 16 database instance (`db-f1-micro`) on GCP and deploy the full Staging environment (IAM Service Accounts, Secret Manager, database, users, Cloud Run scale-to-zero compute services, and Cloud Monitoring alert policies). Verify live end-to-end functionality over public HTTPS.

### Actions Taken:
1. **Cloud SQL Shared Instance (`infra/terraform/environments/shared`)**:
   - Resolved Terraform Google Provider v6 issue: explicit `edition = "ENTERPRISE"` added to support `tier = "db-f1-micro"`.
   - Provisioned PostgreSQL 16 instance: `devspeak-db-ef9683a6` in `asia-southeast1` (Singapore) with single-zone placement (`ZONAL`), 10 GB SSD, daily automated backups, and Cloud SQL Auth Proxy socket integration.
   - Resource applied: `1 added, 0 changed, 0 destroyed`. Connection name: `project-12679df0-893b-4260-924:asia-southeast1:devspeak-db-ef9683a6`.
2. **Staging Environment Deployment (`infra/terraform/environments/staging`)**:
   - `service_accounts`: Created least-privilege `devspeak-api-staging-sa` (with `roles/cloudsql.client`) and `devspeak-web-staging-sa`.
   - `secret_manager`: Created secrets for `devspeak-jwt-secret-staging`, `devspeak-db-password-staging` (high entropy 24-character random password), and `devspeak-gemini-api-key-staging`.
   - `cloud_sql_database`: Created logical database `devspeak_staging` and dedicated user `devspeak_staging_user`.
   - `cloud_run`:
     - Configured `devspeak-api-staging`: Scale-to-zero (0–2 instances), 1 vCPU, 512Mi RAM, `/cloudsql` socket mount, and `PGPASSWORD` secret injection.
     - Configured `devspeak-web-staging`: Scale-to-zero (0–1 instances), 1 vCPU, 512Mi RAM, injected `NEXT_PUBLIC_API_URL` pointing to backend Cloud Run HTTPS URL.
     - Resolved `deletion_protection = false` to enable seamless continuous delivery updates.
   - `monitoring`: Created Cloud Monitoring alert policy for Cloud Run HTTP 5xx error rate > 5%.
   - Resources applied: **26 total managed resources across shared and staging**.
3. **Smoke Testing & Live Cloud Verification**:
   - **Backend Readiness Probe**: `GET https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz` -> `HTTP 200 OK` (`{"status":"ready","ai_provider":"mock","questions_loaded":26}`).
   - **Interactive API Documentation**: `GET https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/docs` -> `HTTP 200 OK` (FastAPI Swagger UI).
   - **Question Catalog**: `GET https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/api/v1/questions` -> `HTTP 200 OK` (Loaded all 26 DevOps/Backend interview questions).
   - **Database Persistence & Migrations**: `POST https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/api/v1/auth/register` with test payload -> `HTTP 200 OK`. Successfully verified that Alembic migrations created all PostgreSQL tables on Cloud SQL and persistent user record was written.
   - **Frontend UI Delivery**: `GET https://devspeak-web-staging-ygz4gsol4q-as.a.run.app` -> `HTTP 200 OK` (Serving Next.js 15 Standalone dark theme landing page with preloaded CSS and Webpack chunks).
    - Root Cause Analysis & Fix: Resolved Next.js build-time inlining of `NEXT_PUBLIC_API_URL` by implementing dynamic runtime injection via server component `RootLayout` and `force-dynamic`, resolved Backend FastAPI CORS by adding `CORS_ORIGIN_REGEX` for `*.run.app`, and normalized `entrypoint.sh` line endings to LF with `.gitattributes`.
    - Git Branch & Commit: Committed on branch `feature/phase5-staging-cloud-sql` (commit `521f08a`).

4. **Phase 5 Hardening & Branch Merge (`1173d4a` & `0390d31`)**:
   - Narrowed `CORS_ORIGIN_REGEX` in `apps/api/src/core/config.py` to specifically match `^https:\/\/devspeak-web-[a-z0-9-]+(\.[a-z0-9-]+)*\.run\.app$`.
   - Capped database connection pool in `apps/api/src/db/session.py` (`pool_size = 3, max_overflow = 2, pool_recycle = 1800`) to guarantee `db-f1-micro` instance safety under concurrent multi-instance scale.
   - Disabled automatic multi-instance runtime database migrations (`AUTO_MIGRATE = "false"`) in `infra/terraform/modules/cloud_run/main.tf` to prevent race conditions during horizontal scale-up.
   - Executed full test suite: Pytest (65/65 passed with `AI_PROVIDER=mock`), Ruff check (clean), Vitest (44/44 passed across 7 test files), TypeScript `tsc --noEmit` (clean).
   - Committed hardening fixes (`1173d4a`) and pushed feature branch `feature/phase5-staging-cloud-sql` to GitHub remote.
   - Merged `feature/phase5-staging-cloud-sql` into `staging` branch (merge commit `0390d31`) and pushed `staging` to remote `origin/staging`.


---

## 2026-10-23: Phase 6 — Automated Staging CI/CD Pipeline with Keyless WIF Implemented

### Objective:
Implement automated GitHub Actions Continuous Deployment pipeline to Cloud Run Staging triggered on pull requests and pushes to `staging`. Integrate keyless GCP authentication via Workload Identity Federation (WIF), Trivy container scanning, decoupled Alembic database migration gate, and post-deployment smoke verification.

### Actions Taken:
1. **Pipeline Authoring (`.github/workflows/cd-staging.yml`)**:
   - Job 1: `quality-gates`: Gitleaks secret leak detection, Python 3.12 checks (Ruff lint/format, Bandit SAST, pip-audit, Alembic migration test, Pytest with offline mock AI), Node.js 24 checks (npm ci, TypeScript `tsc --noEmit`, ESLint, Vitest, Next.js build).
   - Job 2: `container-build-scan`: Docker Buildx local container builds for `devspeak-api` and `devspeak-web`, followed by Trivy container security scans (`aquasecurity/trivy-action`) for CRITICAL and HIGH vulnerabilities.
   - Job 3: `deploy-staging` (conditional on push to `staging`):
     - Authenticates to GCP using keyless Workload Identity Federation (`google-github-actions/auth@v2`) via `github-actions-provider` and `devspeak-ci-deployer-sa`. Zero static keys or credentials stored.
     - Pushes Docker images to Google Artifact Registry tagged with `${{ github.sha }}` and `:staging`.
     - Executes decoupled Alembic migration gate via Cloud Run Job (`devspeak-migration-staging`) with `--wait` to ensure database schema is up-to-date before updating revision traffic.
     - Deploys rolling revisions to Cloud Run `devspeak-api-staging` and `devspeak-web-staging`.
     - Executes automated post-deployment health and smoke probes verifying `/readyz` (200 OK), `/api/v1/questions` (26 questions loaded), and frontend UI delivery.
2. **Infrastructure-as-Code Hardening**:
   - Added Cloud Run Job resource `google_cloud_run_v2_job.migration` in `infra/terraform/modules/cloud_run/main.tf` and exported `migration_job_name` output in module and staging environment.
   - Normalized `ENVIRONMENT = var.environment` in Cloud Run service to distinguish staging from production.
3. **Application Security Hardening**:
   - Gated Swagger UI (`/docs`, `/redoc`, `/openapi.json`) in `apps/api/src/main.py` so documentation is enabled in development/staging/test and automatically disabled in production.
   - Added unit test `apps/api/tests/unit/test_docs_gating.py` (2 tests, verified across all environment states).
   - Backend tests: 67/67 Pytest passing, 0 Ruff errors.
   - Frontend tests: 44/44 Vitest passing, 0 TypeScript errors.
4. **Git Branch & Push**:
   - Committed changes on branch `feature/phase6-ci-cd-wif` (commit `086c860`).
   - Pushed branch to remote `origin/feature/phase6-ci-cd-wif`.

---

## 2026-10-24: Phase 7 - Production Deployment & Continuous Delivery Live Verification

### Objective:
Merge the production infrastructure, branch-locked Workload Identity Federation (WIF), decoupled Alembic database migration pipeline, and automated GitHub Actions CD release workflow into `main`, achieving full zero-downtime production deployment and live health verification on GCP.

### Actions Taken:
1. **Gate 1 to Gate 4 Audits & Remediations**:
   - Resolved findings CI-01 (strict `refs/heads/main` deployment condition for push and workflow_dispatch) and URL-01 (standardized canonical hash-based Cloud Run URLs `ygz4gsol4q-as.a.run.app`).
   - Hardened Frontend Runtime Smoke Probe to strictly verify `window.__NEXT_PUBLIC_API_URL` literal injection.
   - Enhanced CORS Security verification with 3 sub-probes (exact allowed origin match, preflight OPTIONS on authenticated route, and unauthorized origin rejection).
2. **Pull Request & Merge to `main`**:
   - Created Pull Request #1: `feat(phase7): production deployment, least-privilege WIF, and high availability release`.
   - Merged PR #1 into `main` (Merge Commit SHA: `fd551649ec3856e68c406bdb9f6bf9611ff4ae75`).
3. **Automated Production CD Pipeline Execution (Run ID: `40055597933`)**:
   - Job 1 (`Quality Gates & SAST`): PASSED (Ruff, Pytest 67/67 passed, TypeScript, Gitleaks, Pip-Audit).
   - Job 2 (`Container Build & Vulnerability Scan`): PASSED (Multi-stage Docker Buildx builds for Backend and Frontend, Trivy container scanning with zero blocking vulnerabilities).
   - Job 3 (`Deploy to Cloud Run Production`):
     - Workload Identity Federation authentication via `github-actions-provider` and `devspeak-prod-deployer-sa`.
     - Pushed immutable production images to Google Artifact Registry: `asia-southeast1-docker.pkg.dev/project-12679df0-893b-4260-924/devspeak-docker`.
     - Executed Decoupled Alembic Database Migration Gate via Cloud Run Job `devspeak-migration-prod` with `--wait`.
     - Deployed rolling revisions to Cloud Run: `devspeak-api-prod` and `devspeak-web-prod`.
     - Executed 4 automated live post-deployment smoke probes:
       - Probe 1: Backend `/readyz` readiness probe -> **PASSED (200 OK)**
       - Probe 2: Question catalog `/api/v1/questions` count assertion -> **PASSED (26 questions verified)**
       - Probe 3: Frontend Web UI & runtime config injection probe -> **PASSED (Exact URL match verified)**
       - Probe 4: CORS security probe (exact origin, preflight OPTIONS, unauthorized rejection) -> **PASSED**
4. **Live Production Endpoints**:
   - Frontend UI: `https://devspeak-web-prod-ygz4gsol4q-as.a.run.app`
   - Backend API: `https://devspeak-api-prod-ygz4gsol4q-as.a.run.app`
   - Readiness Endpoint: `https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz`

---

## 2026-10-24: Phase 8 — Public Launch Readiness Audit & v1.0.1 Hardening Release

### Objective:
Conduct a comprehensive, evidence-based public launch readiness audit across repository integrity, application security, cloud infra & reliability, user experience, and documentation. Remediate all critical P0 launch blockers, verify automated CI/CD pipelines, tag `v1.0.1`, and confirm live production health.

### Actions Taken:
1. **Pre-Release Audit & Secret Scanning**:
   - Performed zero-leak secret scan across all 25 Git commits across all branches using Gitleaks: 0 secrets leaked.
   - Audited application security, API gating, and public exposure:
     - Discovered `docs/` folder was previously ignored in `.gitignore`, causing all documentation links in `README.md` to return HTTP 404 on GitHub.
     - Identified BOLA/IDOR vulnerability in interview session endpoints (unauthenticated requests with `user_id = None` were bypassing tenant boundary checks).
     - Identified brute-force exposure on auth endpoints (`/register`, `/login`) lacking IP-based rate limiting.
     - Identified mock practice attempts in Web UI not persisting to Cloud SQL for authenticated users.
2. **P0 Remediations Executed**:
   - **SEC-01 (BOLA/IDOR Fix)**: Modified `apps/api/src/modules/interviews/service.py` to enforce strict ownership verification `if session.user_id is not None and session.user_id != user_id: raise HTTPException(403)`. Added 4 automated integration tests in `test_auth_endpoints.py`.
   - **SEC-02 (Rate Limiting)**: Built `InMemoryRateLimiter` (`apps/api/src/core/rate_limit.py`) with Cloud Run `x-forwarded-for` proxy IP resolution. Applied 10 req/min limit to `/register` and 15 req/min to `/login`. Added 3 unit tests.
   - **FUN-01 (Session Persistence)**: Connected `submitSessionAttempt` in `DevSpeakApp.tsx` and `api.ts`, ensuring live session creation, attempt submission to Cloud SQL, and instant XP/progress dashboard synchronization.
   - **DOC-01 (Documentation Restored)**: Updated `.gitignore` to un-ignore `docs/` and all markdown files. Tracked and verified 20 architectural and technical documentation files.
   - **README & CI Harmonization**: Transparently documented mock vs Gemini AI providers; fixed clone path casing; aligned `pip-audit` in `ci.yml` with `cd-production.yml`.
3. **Automated Verification & Release**:
   - Backend checks: 70/70 Pytest tests passing, 0 Ruff lint/format errors, Bandit SAST 0 issues.
   - Frontend checks: 44/44 Vitest tests passing, 0 TypeScript errors, 0 ESLint errors.
   - GitHub Actions CI (Run `40064607752`): Quality Gates & SAST, Secret Leak Detection, and Frontend CI all PASSED.
   - GitHub Actions CD (Run `40064607541`): Quality Gates, Container Build & Trivy Scan, and Cloud Run Production Deployment all PASSED.
   - Live Smoke Probes: Verified 4/4 live production checks on GCP Cloud Run (`/readyz` 200 OK, `/api/v1/questions` 26 items, Web UI dynamic injection, and CORS policy verification).
   - Remote Tag: `v1.0.1` successfully created, tagged at commit `205e972`, and pushed to GitHub.

---

## 2026-10-24: Track B (Lesson 1 & 2) — GitOps Architecture, Local kind & Argo CD (Milestones B1 & B2)

### Objective:
Establish a production-grade, local GitOps baseline using Kubernetes-in-Docker (`kind`), Helm charts, NGINX Ingress Controller, decoupled Alembic database migration hooks, and Argo CD GitOps engine—verifying end-to-end workload delivery on `localhost` at zero cloud cost.

### Actions Taken:
1. **Tooling & Storage Optimization (Milestone B1)**:
   - Configured devops CLI tools: `helm v4.3.1`, `kind v0.33.0`, and downloaded official `kubectl v1.31.0` to `D:\DEVSPEAK-AI\.bin\kubectl.exe`.
   - Diagnosed host storage exhaustion on `C:` (0 MB free), purged user temp files to recover 21.75 GB, and configured `D:` drive (102 GB free) as primary persistence partition.
   - Updated `.gitignore` to protect against committing local binaries (`.bin/`).
2. **Production-Grade Helm Charts Authored**:
   - `charts/devspeak-api`: Configured multi-probe health (`startupProbe`, `livenessProbe`, `readinessProbe`), non-root securityContext (UID 10001), HPA autoscaling, ConfigMap/Secret decoupling, and pre-install/pre-upgrade Alembic migration hook job.
   - `charts/devspeak-web`: Configured Next.js standalone runner, non-root (UID 1001), and dynamic `NEXT_PUBLIC_API_URL` runtime injection.
   - Verified `helm lint` on both charts with 0 errors, and validated template rendering across 381 lines of manifests.
3. **Local Infrastructure Deployment (Milestone B2)**:
   - Created `devspeak-local` kind cluster with host port mappings (80, 443).
   - Deployed official NGINX Ingress Controller for kind (`ingress-nginx-controller` 1/1 Running).
   - Deployed ephemeral PostgreSQL container (`postgres-dev` 1/1 Running).
   - Loaded container images into kind node containerd store.
   - Deployed `devspeak-api` and `devspeak-web` Helm releases. The Alembic migration hook successfully migrated PostgreSQL tables before pod deployment.
   - Configured Ingress routing `/api/v1` and `/readyz` to API, and `/` to Web.
4. **Live Verification (100% Green)**:
   - `http://localhost/readyz` -> `HTTP 200 OK` (`status: ready`, `questions_loaded: 26`).
   - `http://localhost/api/v1/questions` -> `HTTP 200 OK` (26 questions loaded).
   - `http://localhost/` -> `HTTP 200 OK` (Web UI delivered, `window.__NEXT_PUBLIC_API_URL = "http://localhost/api/v1"` verified).
5. **Argo CD GitOps Controller Installed**:
   - Deployed Argo CD via server-side apply in `argocd` namespace (all 7 pods running: `application-controller`, `server`, `repo-server`, `redis`, `dex-server`, `notifications`, `applicationset`).
   - Authored GitOps Application CRDs: `devspeak-api-app.yaml`, `devspeak-web-app.yaml`, and `root-application.yaml` (App-of-Apps pattern).

---

## 2026-10-24: Track B (Lesson 3) — Ephemeral GKE Cluster IaC & GitOps CI Automation (Milestone B3)

### Objective:
Author cost-controlled Terraform Infrastructure-as-Code for an ephemeral GKE cluster (GKE Autopilot with Workload Identity Federation), GKE-targeted Helm values with HPA autoscaling, and automated GitHub Actions GitOps CI pipeline for image build, push, and desired-state manifest promotion.

### Actions Taken:
1. **Multi-Environment Health Audit**:
   - Audited all 3 tiers with live probes: Local kind (100% healthy, 11/11 pods running, HTTP 200 OK on `/`, `/readyz`, `/api/v1/questions`), GCP Staging (Cloud Run healthy, 26 questions verified), GCP Production (Public release v1.0.1 live, Swagger UI securely 404).
2. **Ephemeral GKE Cluster Terraform Module & Environment**:
   - Created `infra/terraform/modules/gke/`: Configured GKE Autopilot (`enable_autopilot = true`), `deletion_protection = false` for safe teardown, release channel `REGULAR`, and VPC-native IP allocation.
   - Configured GKE Workload Identity: Created `devspeak-gke-sa` GCP service account, bound to K8s service account `devspeak/devspeak-gke-sa` via `roles/iam.workloadIdentityUser`.
   - Granted least-privilege roles: `roles/artifactregistry.reader` (pull images) and `roles/secretmanager.secretAccessor` (read secrets).
   - Created `infra/terraform/environments/gke/`: Wired GCS remote backend (`terraform/state/gke`) and remote state reference to shared infrastructure.
3. **GKE Target Helm Environment Configuration**:
   - Created `deploy/gitops/environments/gke-portfolio/values-api.yaml`: Configured 2 replicas, Workload Identity annotation, HPA (min 2, max 4), and staging database connection.
   - Created `deploy/gitops/environments/gke-portfolio/values-web.yaml`: Configured 2 replicas, HPA, and dynamic Ingress path mapping.
   - Created `deploy/gitops/environments/gke-portfolio/ingress-gke.yaml`: Standard Google Cloud HTTP Load Balancer ingress rules.
   - Tested and verified template rendering on both charts: 288 lines for API, 169 lines for Web.
4. **Automated GitOps CI Pipeline**:
   - Created `.github/workflows/gitops-ci.yml`: Keyless authentication via WIF, Docker Buildx image builds, pushes immutable tag `${{ github.sha }}` to Artifact Registry, automatically updates GitOps Helm values, and commits back to Git with `[skip ci]`.
5. **Cost Protection & Automated Teardown Scripts**:
   - Created `deploy/gitops/scripts/deploy-gke.ps1` for automated cluster spin-up.
   - Created `deploy/gitops/scripts/teardown-gke.ps1` enforcing 4-step teardown (LB removal, `terraform destroy`, orphan disk scan, static IP release).



---

## 2026-10-24: Track B (Lesson 4) — Live GKE Autopilot Provisioning, Argo CD GitOps Sync & Workload Verification (Milestone B4)

### Objective:
Provision the ephemeral GKE Autopilot cluster on GCP via Terraform, configure client authentication and Workload Identity, deploy Argo CD v3.5.6 on GKE, configure GitOps applications for `gke-portfolio`, execute Alembic pre-sync database migration hook, and verify live high-availability workloads and HPA autoscaling.

### Actions Taken:
1. **GKE Autopilot Provisioning via Terraform**:
   - Enabled `container.googleapis.com` API on GCP project `project-12679df0-893b-4260-924`.
   - Applied Terraform in `infra/terraform/environments/gke`: Successfully provisioned regional cluster `devspeak-gke-portfolio` in `asia-southeast1`.
   - Control plane endpoint: `34.142.190.245`.
   - Bound Workload Identity: `devspeak-gke-sa@project-12679df0-893b-4260-924.iam.gserviceaccount.com` to K8s SA `devspeak/devspeak-gke-sa`.
2. **Client Authentication Tooling**:
   - Installed `gke-auth-plugin` v0.6.3 in `D:\DEVSPEAK-AI\.bin\gke-gcloud-auth-plugin.exe` and registered in Windows User PATH.
   - Updated `~/.kube/config` to resolve authentication without requiring local admin rights for gcloud component installation.
3. **Argo CD Controller on GKE Autopilot**:
   - Applied official Argo CD v3.5.6 manifests using server-side apply (`--server-side --force-conflicts`).
   - Autopilot dynamic node auto-provisioning automatically scaled out nodes (`gk3-devspeak-gke-portfol-nap-*`).
   - Verified all 7 Argo CD core pods reaching 1/1 Running state (`application-controller`, `applicationset-controller`, `dex-server`, `notifications-controller`, `redis`, `repo-server`, `argocd-server`).
4. **Node Artifact Registry IAM Hardening**:
   - Diagnosed initial 403 Forbidden on image pull for GKE nodes.
   - Resolved by granting `roles/artifactregistry.reader` to default Compute Engine service account `359194986638-compute@developer.gserviceaccount.com`.
5. **GitOps Applications & Workload Deployment**:
   - Deployed ephemeral PostgreSQL container in namespace `devspeak`.
   - Created GitOps applications in `deploy/gitops/apps/gke-portfolio/`: `devspeak-api-app.yaml`, `devspeak-web-app.yaml`, and `root-application.yaml`.
   - Argo CD executed `PreSync` Alembic migration hook (`devspeak-api-gke-migration-*`), successfully migrating database schema and seeding 26 questions into PostgreSQL.
   - Deployed 2 replicas of `devspeak-api` and 2 replicas of `devspeak-web` with HPA autoscaling enabled.
6. **Live End-to-End Verification (100% Green)**:
   - Argo CD Applications: `devspeak-api-gke`, `devspeak-web-gke`, `devspeak-gke-root` all report **`SYNC STATUS: Synced`**, **`HEALTH STATUS: Healthy`**.
   - API Pods: 2/2 Running, probes passed. Curl to `/readyz` -> `{"status":"ready","ai_provider":"mock","questions_loaded":26}`.
   - Web Pods: 2/2 Running, probes passed. Curl to `/` -> `HTTP/1.1 200 OK`.
   - HPA: Active and collecting live CPU and memory metrics (`devspeak-api` at 2% CPU / 25% Memory, `devspeak-web` active).
7. **Security & Teardown Readiness**:
   - Argo CD initial admin password retrieved and securely stored in `deploy/gitops/.argocd-admin-password.txt` (strictly gitignored).
   - Validated teardown workflow `deploy/gitops/scripts/teardown-gke.ps1` to ensure zero unexpected costs when decommissioning.

---

## 2026-10-25 & 2026-10-26: Release v1.0.2 — AI Studio UI/UX Refinement, WIF Security Hardening & GKE Production HTTPS Showcase

### Objectives:
1. Fix AI Interview Studio UI layout issues: 26-question scrollability, 3-column width balance, pinned bottom response actions, and eliminate double nested scrollbars.
2. Restrict GitHub Actions production Workload Identity Federation (WIF) IAM binding strictly to refs/heads/main.
3. Normalize API endpoint prefix routing across local and cloud environments.
4. Secure GKE Autopilot production ingress with an official Google Managed SSL certificate on Cloud Endpoints domain devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog.
5. Organize documentation: archive Vietnamese study materials in local study/ directory (ignored by Git) and restore comprehensive English portfolio documentation.

### Actions Taken:
1. **AI Conversation / Practice Studio Layout Refinement**:
   - SessionSidebar.tsx: Constrained question catalog to flex-1 min-h-0 overflow-y-auto studio-custom-scrollbar, pinned header counter and exit button with shrink-0, and applied line-clamp-2 to question titles.
   - InterviewStudio.tsx: Bounded scenario prompt card (max-h-36 sm:max-h-40 overflow-y-auto), balanced 3-column layout distribution, pinned bottom action buttons (Study Model Answer & Submit Answer) with shrink-0.
   - VocabularyCoach.tsx: Removed nested scroll container (max-h-[460px]) to eliminate competing scrollbars with the outer rubric panel.
   - DevSpeakApp.tsx: Applied viewport-height lock (h-screen max-h-screen overflow-hidden) exclusively when activeTab === 'practice', preserving standard natural document scrolling across all other tabs.
   - globals.css: Enhanced .studio-custom-scrollbar with brand-purple glowing thumb and hover states.
2. **DevSecOps Security Hardening**:
   - Updated Terraform WIF configuration: Added assertion.ref == 'refs/heads/main' constraint to production service account binding, preventing unauthorized branch triggers.
   - Normalized API prefix routing in apps/api/src/api/routes.py and apps/web/src/lib/api-client.ts.
3. **GKE Autopilot Production Ingress & Google Managed SSL**:
   - Configured Google Cloud Endpoints DNS target pointing to GKE External Load Balancer static IP 35.201.109.36.
   - Provisioned Google Managed Certificate devspeak-endpoints-ssl and attached to GKE Ingress.
   - Validated active TLS certificate issued by Google Trust Services CA WR3, valid through January 2027.
4. **Comprehensive Test Suite & Live Endpoint Verification**:
   - Frontend: 58/58 Vitest tests passed, 0 TypeScript errors, production build compiled in 4.6s.
   - Backend: 70/70 Pytest tests passed across 12 suites.
   - Verified 15/15 live endpoints across all 5 environments (Local Docker Compose, Cloud Run Staging, Cloud Run Production, Local kind, and GKE Autopilot HTTPS) returning HTTP 200 OK.
5. **Documentation Lifecycle & Git Hygiene**:
   - Moved all Vietnamese reference materials and study guides into local study/ directory.
   - Verified study/ is strictly ignored by .gitignore and untracked by Git.
   - Restored and updated English technical documentation and root README.md for international portfolio showcase.
