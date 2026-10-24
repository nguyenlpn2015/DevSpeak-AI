# ADR-0001: Monorepo Structure & Core Technology Stack

## Status
**ACCEPTED** (2026-10-19)

---

## Context
We are starting DevSpeak AI, an AI English Interview Coach for IT and DevOps professionals. The project has two parallel objectives:
1. Deliver a functional, secure, reliable, and cost-effective learning product for real users.
2. Serve as a reference-quality DevOps and DevSecOps engineering portfolio showcasing modern engineering rigor.

We must choose an initial repository structure, frontend framework, backend framework, and persistence strategy that balance development velocity, testability, local-first cost efficiency, and future platform scalability.

---

## Decision
1. **Repository Layout**:
   - We adopt a **modular monorepo** (`apps/web`, `apps/api`, `packages/`, `infra/`, `docs/`).
   - Rationale: Single version-controlled source of truth for frontend, backend, CI/CD, Terraform, and documentation simplifies atomic changes, cross-service schema synchronization, and unified security scanning.

2. **Frontend Framework**:
   - We adopt **Next.js 15 (App Router)** with **TypeScript** and **Tailwind CSS**.
   - Rationale: Excellent PWA support, server-side rendering for interview question catalog SEO, fast client-side navigation for interactive interview practice, and widespread industry adoption.

3. **Backend Framework**:
   - We adopt **Python 3.12+** with **FastAPI** and **Pydantic v2**.
   - Rationale: FastAPI provides native async support, strict schema validation, automatic OpenAPI generation, and first-class integration with Python AI/LLM evaluation tooling.

4. **AI Layer Architecture**:
   - We implement a provider-agnostic **AI Adapter Interface** featuring:
     - Deterministic Mock Provider for 100% offline, zero-cost CI testing.
     - Rule-based Non-AI Provider for guaranteed graceful degradation.
     - Pluggable live LLM providers (OpenAI / Anthropic / Google Gemini).

5. **Persistence**:
   - PostgreSQL (using async SQLAlchemy 2.0 and Alembic for versioned migrations).
   - In local development without Docker, SQLite (via `aiosqlite`) is supported as a zero-setup development fallback.

---

## Alternatives Considered
- **All-TypeScript Stack (Next.js + NestJS / Express)**:
  - *Rejected*: While unified TypeScript is appealing, Python is the de facto standard for AI evaluation, text analysis, audio processing (Whisper), and SRE/DevOps tooling.
- **Microservices Architecture from Day 1**:
  - *Rejected*: Violates core principle "Prefer a modular monolith before introducing microservices". Premature microservices would introduce distributed tracing and network overhead before proving the product core loop.
- **Direct Client-to-LLM Calls**:
  - *Rejected*: Insecure. Leaks API tokens to browser bundles, prevents usage quotas, bypasses server-side audit logs, and exposes users to denial-of-wallet risks.

---

## Consequences
- **Positive**:
  - Clear separation of concerns between presentation and business logic.
  - Zero-cost, deterministic local testing via Mock AI Provider.
  - Single pull request can change backend schema, frontend component, and API documentation atomically.
- **Negative / Trade-offs**:
  - Dual runtime requirement: Node.js (v24) for frontend and Python (3.12) for backend.
  - Need to maintain monorepo tooling as the codebase expands.

