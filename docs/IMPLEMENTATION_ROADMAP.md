# DevSpeak AI — Master Implementation Roadmap (Phases 1 — 13)

## 1. Roadmap Architecture & Guiding Principles

This roadmap establishes the execution sequence to turn DevSpeak AI from an initial prototype into a fully verified, secure, and production-ready AI interview coach.

### Non-Negotiable Operational Constraints:
- **Local-First & Zero-Cost**: 100% offline mock provider supported; no paid external dependencies required.
- **Data Integrity & Non-Destructive**: Use incremental Alembic migrations; never drop tables or delete persistent volumes.
- **Evidence-Based Delivery**: Every phase must conclude with automated test execution, linting, type-checking, and runtime verification.
- **Bilingual Parity**: 100% key parity maintained between `en.ts` and `vi.ts`.

---

## 2. Phased Execution Plan

```
Phase 0: Discovery, Baseline Tests & Inventory [COMPLETED]
   │
Phase 1: Complete Functional Verification of Existing Capabilities
   │
Phase 2: Backend Repair, DB Health & Readiness Hardening
   │
Phase 3: Question Bank Expansion (25+ Normalized IT/DevOps Questions)
   │
Phase 4: User Registration, Argon2id Authentication & Account Isolation
   │
Phase 5: Stateful AI Interview Chatbot through Text (Multi-Turn Session)
   │
Phase 6: Voice Interview MVP (Speech-to-Text & Text-to-Speech)
   │
Phase 7: Real Progress Calculation, Streak Aggregation & User History
   │
Phase 8: Frontend Integration & LinguaFlow UX Polish
   │
Phase 9: DevSecOps, SAST & Safe Dependency Audit
   │
Phase 10: Docker Compose, Healthchecks & CI Workflow Verification
   │
Phase 11: Traceable End-to-End Test Matrix (Journeys A - T)
   │
Phase 12: Comprehensive Documentation (User Guide in VI, Technical Docs in EN)
   │
Phase 13: Final Release Readiness Review & Executive Sign-off
```

---

## 3. Detailed Phase Breakdown & Acceptance Gates

### Phase 1: Complete Functional Verification of Existing Capabilities
- **Scope**: Author comprehensive automated tests for edge cases across the existing Question Bank, 3-Zone Studio, STAR Builder, and Persistent Session endpoints.
- **Deliverables**:
  - Edge-case backend tests for invalid IDs, boundary submissions, and session pagination.
  - Edge-case frontend tests for network failures, empty catalogs, and submission retries.
- **Verification Gate**: 100% pass rate on expanded test suites.

### Phase 2: Backend Repair & Data Integrity Hardening
- **Scope**:
  - Harden SQLAlchemy session lifecycle and error handling.
  - Add active database engine connectivity probe to `/readyz` endpoint.
  - Ensure transactions cleanly roll back on AI evaluation failure.
- **Verification Gate**: `/readyz` accurately reports DB connection health; zero connection pool leaks under load.

### Phase 3: Question Bank Expansion (Normalized & High-Quality)
- **Scope**:
  - Expand from 6 seed questions to 25+ production-grade questions across 8 major domains:
    1. Kubernetes & Container Orchestration (CrashLoopBackOff, Ingress/DNS, CNI, Resource Limits)
    2. CI/CD & Delivery Pipelines (Canary, Blue-Green, GitOps, Artifact Caching)
    3. Linux SRE & Performance Triage (iowait, OOMKilled, Load vs CPU, Network Saturation)
    4. AWS & Cloud Architecture (Multi-AZ, Cost Optimization, IAM Least Privilege, VPC Peering)
    5. Docker & Container Security (Multi-stage builds, Distroless images, Non-root execution)
    6. Git & Version Control (Git rebase vs merge, Submodules, Large file handling)
    7. DevSecOps & Security (Secrets management, SAST/DAST in CI, Container scanning)
    8. Behavioral Interviews (STAR method for incident management, technical disagreements, executive communication)
  - Ensure each question has rich rubrics, common pitfalls, sample senior answers, and follow-up probes.
- **Verification Gate**: Idempotent seeding mechanism; all 25+ questions browseable and filterable.

### Phase 4: User Registration, Authentication & Account Isolation
- **Scope**:
  - Implement `User` model (`users` table) via Alembic migration `0002_user_authentication`.
  - Password hashing with modern Argon2id (`passlib[argon2]`).
  - Auth schemas (`UserCreate`, `UserLogin`, `TokenResponse`, `UserResponse`).
  - Authentication endpoints:
    - `POST /api/v1/auth/register`
    - `POST /api/v1/auth/login`
    - `POST /api/v1/auth/logout`
    - `GET /api/v1/auth/me`
  - FastAPI auth dependency `get_current_active_user` (Bearer JWT token with expiration).
  - Associate `InterviewSession` with `user_id` (nullable for guest mode, strictly isolated for authenticated users).
  - Frontend: `AuthContext.tsx`, Login/Register modal, authenticated header state, protected history access.
- **Verification Gate**: Automated auth tests (registration, login, invalid password, duplicate email, JWT verification, cross-user data isolation).

### Phase 5: Stateful AI Interview Chatbot through Text
- **Scope**:
  - Implement multi-turn conversational interview sessions.
  - Database model `InterviewMessage` (`role: "interviewer" | "candidate"`, `content`, `feedback_snapshot`, `turn_index`).
  - Endpoint `POST /api/v1/interviews/sessions/{id}/chat` orchestrating multi-turn turns.
  - AI prompt template structuring the AI as a Senior Staff Interviewer asking probing follow-ups based on previous responses.
  - Frontend: Interactive Chat Interview view (`ChatStudio.tsx`) with message bubbles, typing indicators, and turn controls.
- **Verification Gate**: AI interviewer asks initial question, evaluates candidate reply, asks relevant follow-up, and summarizes at session conclusion.

### Phase 6: Voice Interview MVP
- **Scope**:
  - Browser Speech Recognition (Web Speech API `webkitSpeechRecognition` / `SpeechRecognition`) with explicit microphone permission UX.
  - Recording state indicators (idle, listening, processing).
  - Transcript preview allowing candidate to inspect and edit text before submission.
  - Read-aloud response synthesis (`speechSynthesis`) with play/pause/stop controls.
  - Graceful fallback to text mode when speech APIs are unavailable.
- **Verification Gate**: Tested in supported browsers; automated unit tests with mocked Web Speech APIs.

### Phase 7: Real Progress Calculation & History Views
- **Scope**:
  - Implement real progress calculation query in backend (`GET /api/v1/progress/summary`).
  - Aggregate completed sessions, total words answered, average overall scores, and actual continuous day streak based on attempt timestamps.
  - Frontend: Replace hardcoded demo values in `LinguaFlowDashboard` with live user stats.
  - Build dedicated `SessionHistoryView.tsx` allowing users to review previous interview scores and AI feedback.
- **Verification Gate**: Real streak increments when practicing on consecutive dates; historical attempts viewable only by session owner.

### Phase 8: Frontend Integration & LinguaFlow UX Polish
- **Scope**:
  - Connect all new views (Auth, Chat Studio, Voice Controls, History) seamlessly into the fixed desktop sidebar and mobile drawer.
  - Preserve the LinguaFlow Dark Neon aesthetic (`#05040F`, `#080613`, `#8B20F5`, `#A855F7`, `#315BFF`, `#EC007A`, `#009F83`, `#FF7A00`).
  - Maintain 100% key parity in `en.ts` and `vi.ts`.
- **Verification Gate**: Clean Next.js build, 0 hydration errors, 0 broken layouts.

### Phase 9: DevSecOps, SAST & Safe Dependency Audit
- **Scope**:
  - Run Ruff, Bandit, and pip-audit on backend.
  - Upgrade affected build-time packages in `apps/web` safely to mitigate PostCSS/Tailwind advisories without breaking Next.js 15.
  - Review Gitleaks scan configuration in GitHub Actions.
- **Verification Gate**: Clean security scans with documented risk assessments.

### Phase 10: Docker Compose & Runtime Verification
- **Scope**:
  - Rebuild and start multi-container stack (`devspeak-db`, `devspeak-api`, `devspeak-web`).
  - Verify auto-migrations run on startup (`alembic upgrade head`).
  - Verify container healthchecks and internal network communication.
- **Verification Gate**: All 3 containers report `healthy`; curl probes return HTTP 200.

### Phase 11: Traceable End-to-End Test Matrix
- **Scope**: Execute and document verification evidence across all 20 required user journeys (A through T).
- **Verification Gate**: Documented test evidence for every user journey.

### Phase 12: Comprehensive Documentation Suite
- **Scope**:
  - End-User Guide: `docs/USER_GUIDE.md` (written in Vietnamese with preserved English UI terms).
  - Developer & Operations Guide: Update `README.md`, `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, `docs/ENVIRONMENT_VARIABLES.md`.
- **Verification Gate**: Complete documentation matching actual working code without fabricated features.

### Phase 13: Release Readiness Review
- **Scope**: Final executive review, test metrics summary, known limitations, and release sign-off.
- **Verification Gate**: Final formal release report.
