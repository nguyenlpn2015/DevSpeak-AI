# Project Context: DevSpeak AI

## 1. Product Vision
DevSpeak AI is a specialized learning platform designed to help Information Technology (IT) and DevOps/Cloud engineers overcome the language and communication barriers that hinder their careers in global teams and international interviews.

Instead of generic English learning (like Duolingo or general ESL courses), DevSpeak AI focuses directly on:
- Technical articulation (explaining architecture, troubleshooting incidents, code review communication).
- IT interviews (scenario-based DevOps/SRE questions, system design walkthroughs, behavioral STAR stories).
- Pragmatic communication (conciseness, technical precision, confidence, professional tone).

## 2. Target Personas
1. **DevOps / Cloud / SRE Engineer**: Needs to explain CI/CD pipelines, Kubernetes failure recovery, AWS/GCP architecture trade-offs, and incident post-mortems in fluent, structured English.
2. **Software Developer (Backend / Frontend / Full-Stack)**: Needs to communicate technical design, articulate algorithmic complexity, answer system design prompts, and collaborate smoothly in agile ceremonies.
3. **Junior / Early Career Engineer**: Struggles with interview anxiety and needs structured practice with high-frequency behavioral (STAR method) and foundational technical questions.

## 3. Scope Definition

### Milestone 1: MVP Scope (Current Goal)
- **Question Bank Module**:
  - Filter by role (`devops`, `cloud`, `backend`, `general_it`), topic (`docker`, `k8s`, `cicd`, `system_design`, `behavioral`), and difficulty (`junior`, `mid`, `senior`).
  - Pre-seeded deterministic question set (30+ production-grade questions).
- **Practice & Mock Interview Session**:
  - Single-question practice & multi-turn mock interview simulation.
  - Text-based input with instant response streaming.
- **AI Feedback Engine**:
  - Structured evaluation: Grammar/Spelling, Technical Vocabulary & Fluency, Clarity & Structure (e.g. STAR check), Technical Accuracy.
  - Model Answer / Improved Answer generation.
  - Recommended follow-up probe questions.
- **Deterministic Offline / Non-AI Mode**:
  - Available when AI API is unavailable, quotas run out, or in self-study offline mode.
  - Displays rubric self-assessment and canonical sample answers.
- **Identity & Data Isolation**:
  - User registration, login, and session history isolation.
- **Cost & Quota Controls**:
  - Per-user daily question limits to avoid denial-of-wallet risks.

### Future Scope (Milestones 2+)
- Speech-to-text (STT) and Text-to-speech (TTS) real-time interactive audio calls.
- Kubernetes deployment with Argo CD and progressive rollouts.
- Comprehensive observability (Prometheus/Grafana/OpenTelemetry).
- Multi-tenancy and enterprise team training dashboards.

## 4. Current State (Milestone 1 Core Loop Complete)
- **Status as of October 2026**:
  - **Backend (`apps/api`)**: FastAPI Modular Monolith fully functional with DeterministicMockAIProvider, 6 IT/DevOps seed questions, health/readiness probes, and 26/26 passing pytest tests.
  - **Frontend (`apps/web`)**: Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS. Implemented Question Bank Catalog with filtering, Practice Studio with live character/word limits & rubric aids, and Feedback Studio with score breakdown, granular analysis, benchmark model answers, and interviewer follow-up questions.
  - **Resilience**: Client seamlessly connects to FastAPI backend (`http://127.0.0.1:8000`) and falls back to local deterministic evaluation if offline.
  - **Quality Gates**: `tsc --noEmit` passing, `eslint` passing, `next build` static export passing (17.6 kB initial JS).
  - **Planned Next**: Database persistence (PostgreSQL/SQLite session state machine) and multi-turn practice history.

## 5. Non-Negotiable Constraints
- **Security**: Zero secret exposure, parameterized SQL, strict schema validation at API boundary, sanitized logs without PII or tokens.
- **Cost Efficiency**: Must run completely free in local development (using Docker / local mock providers). Cloud resources must only be created after explicit user approval and transparent cost estimation.
- **Reliability**: Graceful fallback when AI providers experience rate limits, latency spikes, or outages.
- **Evidence-Based Development**: Every milestone requires concrete test and verification outputs before being marked complete.

## 6. Domain Glossary
- **Session**: A continuous interview practice instance containing one or more Q&A turns.
- **Turn**: A single interaction comprising: System Question -> User Answer -> AI Feedback & Follow-up.
- **STAR Method**: Situation, Task, Action, Result framework used for behavioral interview evaluation.
- **Mock AI Provider**: A deterministic, local test double simulating LLM responses for CI pipelines and automated testing without incurring cost or network dependencies.

