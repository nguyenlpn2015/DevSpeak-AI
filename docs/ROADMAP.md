# Development Roadmap: DevSpeak AI

This roadmap defines the engineering progression of DevSpeak AI from initial discovery to an enterprise-grade DevOps/DevSecOps portfolio and real software product. Every milestone requires verified evidence before being marked complete.

---

## Milestone 0: Discovery & Repository Foundation
- **Goal**: Audit development environment, establish architectural standards, create persistent documentation, and set up safe monorepo structure.
- **Status**: **IN PROGRESS**
- **Acceptance Criteria**:
  - [x] Comprehensive workspace and environment audit conducted without unreviewed commands.
  - [x] Initialized Git repository with strict `.gitignore` preventing secret leaks.
  - [x] Created context documents: `GEMINI.md`, `README.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/SECURITY.md`, `docs/OPERATIONS.md`, `docs/WORKLOG.md`, `docs/KNOWN_ISSUES.md`, `docs/SESSION_HANDOFF.md`.
  - [x] Initial Architecture Decision Record (ADR-0001) recorded.
  - [ ] Environment prerequisites clarified (Python installation, local DB strategy).
- **Deliverables**: Verified documentation system, clean baseline commit.

---

## Milestone 1: Working MVP (Core Learning Loop)
- **Goal**: Build an end-to-end working web application where an IT professional can practice answering DevOps/IT interview questions and receive structured AI and non-AI feedback.
- **Status**: **IN PROGRESS**
- **Acceptance Criteria**:
  - [x] **Deterministic AI Mock Provider**: Unit and integration test suite runnable in CI without external API keys or cost (26 tests passing in 0.5s).
  - [x] **Backend API Foundation (FastAPI)**:
    - `GET /healthz` (liveness).
    - `GET /readyz` (readiness).
    - `GET /api/v1/questions` (filtering by role, difficulty, topic).
    - `GET /api/v1/questions/{id}` (detail with rubric and sample answer).
    - `POST /api/v1/interviews/evaluate` (deterministic mock evaluation).
  - [x] **AI Evaluation Engine (Mock)**: Generates scores (1-10) and targeted feedback for Grammar, Technical Precision, and Communication Structure (STAR), with heuristic mock disclaimer.
  - [x] **Question Bank Foundation**: 6 production-grade questions covering Kubernetes, CI/CD canary rollback, AWS multi-AZ cost optimization, Linux iowait, STAR behavioral, and Docker multi-stage builds.
  - [x] **Automated Tests**: Unit tests for schemas and feedback logic; API integration tests with mock provider (26/26 passing).
  - [x] **Database Persistence & Session History**:
    - SQLAlchemy 2.x async ORM with `InterviewSession` and `InterviewAttempt` models.
    - Alembic migrations (`0001_initial_interview_persistence.py`).
    - Session endpoints: `POST /api/v1/interviews/sessions`, `GET /api/v1/interviews/sessions`, `GET /api/v1/interviews/sessions/{id}`, `POST /api/v1/interviews/sessions/{id}/attempts`.
    - Cross-restart persistence verified across Uvicorn process restarts.
  - [x] **Live AI Provider Integration (Google Gemini)**:
    - `GeminiAIProvider` adapter implementing `AIProviderInterface` via `httpx.AsyncClient`.
    - Native Structured Outputs using `responseSchema` enforcing `FeedbackReport` contract.
    - Strict prompt injection containment inside `<candidate_response>` XML blocks with system non-override directives.
    - Resilience: exponential backoff retries on transient errors and gateway timeout protections.
    - Error masking: custom HTTP status mappings (429, 502, 503, 504) without stack trace or key leaks.
    - Offline safety: `AI_PROVIDER=mock` remains default; all tests execute 100% offline.
  - [x] **Web Interface (Next.js 15)**: Clean, accessible, responsive UI with question selector, live character/word counters, evaluation rubric, real-time feedback presentation, benchmark model answers, and follow-up probes.
  - [x] **Bilingual Internationalization (i18n)**: English/Vietnamese language switcher with local storage persistence, SSR hydration safety, and strict preservation of technical English commands and prompts.
  - [ ] **Question Bank Expansion**: Expand to 30+ categorized IT questions (scheduled for incremental content expansion).
- **Verification Evidence**: Automated test suite (`pytest` 50/50 passing 100%), Vitest test report (`vitest` 28/28 passing 100%), live cross-restart HTTP persistence verified, `npm run build` and `npm run type-check` passing with zero errors.

---

## Milestone 2: Secure Delivery & Continuous Integration
- **Goal**: Establish continuous integration, automated quality gates, security scanning, and containerized packaging.
- **Status**: **IN PROGRESS**
- **Acceptance Criteria**:
  - [x] GitHub Actions workflow running on pull requests (`.github/workflows/ci.yml`).
  - [x] Python linting & formatting (`ruff check`, `ruff format`).
  - [x] Frontend linting & type checks (`eslint`, `tsc`).
  - [x] Dependency vulnerability scanning (`pip-audit`, `npm audit`).
  - [x] SAST scanning (`bandit -r src` - 0 issues).
  - [x] Secret leak detection (`gitleaks` in CI).
  - [x] Zero-cost offline test suite enforcement in CI.
  - [x] Multi-stage Dockerfiles for backend and frontend (`apps/api/Dockerfile`, `apps/web/Dockerfile`).
  - [x] Docker Compose orchestration for local multi-container development (`docker-compose.yml`).
  - [x] Non-root execution (`appuser:10001`, `nextjs:1001`) and minimal attack surface base images.
  - [ ] Container image build & scanning in CI (`trivy` with zero critical vulnerabilities).
- **Verification Evidence**: Validated Dockerfiles, PyYAML syntax verified for `docker-compose.yml`, zero-dependency stdlib healthchecks.

---

## Milestone 3: Cloud Foundations & Cost-Governed Infrastructure
- **Goal**: Provision secure, cost-controlled cloud infrastructure using Terraform with scale-to-zero / free-tier safety.
- **Status**: **PLANNED**
- **Acceptance Criteria**:
  - [ ] Terraform modules for target infrastructure (AWS or Supabase/Cloudflare).
  - [ ] GitHub Actions OIDC integration (zero long-lived AWS keys in repo).
  - [ ] Documented cost breakdown and teardown script verified locally.
  - [ ] IaC security scanning (`tfsec` / `trivy config`).
  - [ ] Explicit human approval step before any cloud execution.
- **Verification Evidence**: `terraform plan` output reviewed and verified against cost safety limits.

---

## Milestone 4: Local Kubernetes & GitOps Platform
- **Goal**: Package application for Kubernetes and manage deployment declaratively via GitOps.
- **Status**: **PLANNED**
- **Acceptance Criteria**:
  - [ ] Reproducible local cluster setup using KIND or k3d.
  - [ ] Parameterized Helm charts for DevSpeak AI web and api services.
  - [ ] Security configurations: non-root users, read-only root filesystems, resource limits, NetworkPolicies.
  - [ ] Argo CD setup reconciling git state to local cluster.
  - [ ] Demonstrated automated drift detection and recovery.
- **Verification Evidence**: Cluster inspection logs showing healthy pods, synced Argo CD applications, and enforced security policies.

---

## Milestone 5: Observability, SRE & Incident Simulation
- **Goal**: Implement production observability, actionable alerts, and operational runbooks.
- **Status**: **PLANNED**
- **Acceptance Criteria**:
  - [ ] Structured JSON logging with request correlation IDs across services.
  - [ ] Prometheus metrics (HTTP latency, status codes, AI provider latency and error rate).
  - [ ] Grafana dashboards visualizing golden signals and interview session metrics.
  - [ ] Documented incident response runbook and chaos simulation (e.g. AI provider timeout injection).
- **Verification Evidence**: Live dashboard snapshots, metric scrape logs, and completed postmortem report for simulated failure.

---

## Milestone 6: Interactive Speaking Practice & Product Expansion
- **Goal**: Expand into audio-based speech-to-text (STT) and text-to-speech (TTS) interview simulation.
- **Status**: **PLANNED**
- **Acceptance Criteria**:
  - [ ] Client-side microphone audio recording with Web Audio API.
  - [ ] Server-side STT integration with local fallback (Whisper API / Web Speech API).
  - [ ] Speech pacing, filler-word detection (e.g., "um", "like", "you know"), and pronunciation tips.
  - [ ] Audio response streaming via TTS.
  - [ ] Quota management and rate limiting to prevent high audio processing costs.
- **Verification Evidence**: Audio interaction test results and latency measurement benchmarks.

---

## Milestone 7: Portfolio, Documentation & Commercial Readiness
- **Goal**: Polish product for public demonstration, showcase DevOps/DevSecOps engineering credentials, and establish production readiness.
- **Status**: **PLANNED**
- **Acceptance Criteria**:
  - [ ] Complete architectural documentation with interactive diagrams.
  - [ ] Recorded end-to-end video walkthrough.
  - [ ] Published security whitepaper / DevSecOps audit summary.
  - [ ] Single-command reproducible demo environment.

