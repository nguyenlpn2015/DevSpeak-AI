# DevSpeak AI — AI English Interview Coach for IT Professionals

[![GCP Cloud Run Production](https://img.shields.io/badge/GCP%20Cloud%20Run-Live%20Production-2563eb.svg)](https://devspeak-web-prod-ygz4gsol4q-as.a.run.app)
[![GCP GKE Autopilot HTTPS](https://img.shields.io/badge/GCP%20GKE%20Autopilot-HTTPS%20Live-10b981.svg)](https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/)
[![CI/CD DevSecOps](https://img.shields.io/badge/CI%2FCD-Keyless%20WIF%20Pipelines-10b981.svg)](https://github.com/nguyenlpn2015/DevSpeak-AI/actions)
[![Release](https://img.shields.io/badge/Release-v1.0.2-purple.svg)](https://github.com/nguyenlpn2015/DevSpeak-AI/releases/tag/v1.0.2)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg)](https://nextjs.org/)
[![Cloud SQL](https://img.shields.io/badge/Cloud%20SQL-PostgreSQL%2016-336791.svg)](https://cloud.google.com/sql)
[![GitOps](https://img.shields.io/badge/GitOps-Argo%20CD%20v3.5.6-orange.svg)](https://argo-cd.readthedocs.io/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC.svg)](https://www.terraform.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**DevSpeak AI** is an enterprise-grade, bilingual (English / Vietnamese) AI interview coaching studio and Google Cloud Platform (GCP) DevOps/DevSecOps showcase tailored for IT and DevOps professionals preparing for technical interviews, incident briefings, and system design discussions at global technology companies.

---

## 🌐 Live Operational Environments (5 Environments across 2 Tracks)

The application is deployed and verified across 5 distinct environments under 2 primary architectural tracks:

### Track A: Serverless & Containerized Architecture (Docker Compose + GCP Cloud Run)
| Environment | Service Component | Live Endpoint (URL) | Status |
| :--- | :--- | :--- | :--- |
| **1. Local Docker Compose** | Web Frontend (Port 3001)<br>FastAPI REST Engine (Port 8000) | Web: [http://localhost:3001](http://localhost:3001)<br>API: [http://localhost:8000](http://localhost:8000)<br>Probe: [http://localhost:8000/readyz](http://localhost:8000/readyz) | 🟢 Operational (Healthy) |
| **2. GCP Cloud Run Staging** | Web Frontend<br>FastAPI REST Engine | Web: [https://devspeak-web-staging-ygz4gsol4q-as.a.run.app](https://devspeak-web-staging-ygz4gsol4q-as.a.run.app)<br>API: [https://devspeak-api-staging-ygz4gsol4q-as.a.run.app](https://devspeak-api-staging-ygz4gsol4q-as.a.run.app)<br>Probe: [https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz](https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz) | 🟢 Operational (Healthy) |
| **3. GCP Cloud Run Production** | Web Frontend<br>FastAPI REST Engine | Web: [https://devspeak-web-prod-ygz4gsol4q-as.a.run.app](https://devspeak-web-prod-ygz4gsol4q-as.a.run.app)<br>API: [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app)<br>Probe: [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz) | 🟢 Operational (Healthy) |

### Track B: Kubernetes & GitOps Platform (kind + GKE Autopilot + Helm + Argo CD)
| Environment | Service Component | Live Endpoint (URL) | Status |
| :--- | :--- | :--- | :--- |
| **4. Local Kubernetes (kind)** | Helm + NGINX Ingress Controller | Web: [http://localhost/](http://localhost/)<br>API: [http://localhost/api/v1/questions](http://localhost/api/v1/questions)<br>Probe: [http://localhost/readyz](http://localhost/readyz) | 🟢 Operational (Healthy, Rev 2) |
| **5. GCP GKE Autopilot (Production)** | Helm + Argo CD + Google Managed SSL | Web: [https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/](https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/)<br>API: [https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/api/v1/questions](https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/api/v1/questions)<br>Probe: [https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/readyz](https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/readyz) | 🟢 Operational (HTTPS Active, Synced) |

> [!NOTE]
> **Deterministic Mock Evaluation & Privacy-Preserving Architecture:**
> To guarantee deterministic evaluation, zero external API costs, and candidate privacy (no user inputs transmitted to commercial third-party LLMs), all public showcase environments run using DevSpeak AI's **Deterministic Heuristic Mock Provider** by default. Live Google Gemini LLM evaluation can be enabled anytime in local or dedicated cloud deployments by setting `AI_PROVIDER=gemini` and supplying a valid `GEMINI_API_KEY`.

---

## 🌟 Key Product Features

- **Flagship LinguaFlow Learning Studio**: Dark-neon design system featuring continuous day streak tracking, XP milestones, target CEFR rank badges, and interactive 3D flashcards with native audio pronunciation.
- **Curated 26-Question IT & DevOps Catalog**: Production scenarios covering Kubernetes architecture (`CrashLoopBackOff`, `OOMKilled`), CI/CD DevSecOps, Linux SRE internals, AWS cloud infrastructure, Docker hardening, system design, and STAR behavioral leadership.
- **3-Zone AI Interview Studio**: Focused engineering workspace with bounded prompt specifications, live answer draft editor, 1-click technical vocabulary insertion, STAR framework generators, and expert benchmark model answers.
- **Stateful Multi-Turn Interview Dialogue Engine**: Complete conversational interview lifecycle where the AI interviewer introduces scenarios, probes operational edge cases across multiple turns, and issues a final holistic performance report.
- **Voice Mode (Speech-to-Text)**: Native browser Web Speech API integration allowing candidates to articulate answers via microphone with real-time transcription.
- **Multi-Dimensional AI Feedback**: Objective evaluation across Technical Accuracy (50%), Clarity & STAR Structure (30%), and English Grammar & Professional Tone (20%) on a 1.0–10.0 scale.
- **Bilingual UI (English / Vietnamese)**: Full interface localization with strict preservation of technical prompts, rubrics, and model answers in English for genuine interview immersion.
- **Local-First & Zero-Cost Privacy**: Operates 100% offline using a built-in deterministic Heuristic Mock AI provider or connects securely to Google Gemini APIs without storing credentials in the cloud.

---

## 🏗️ Cloud & DevOps Architecture (GCP & Kubernetes)

```
                            [ GitHub Actions (CI/CD) ]
                                        │
                         OIDC Token (Keyless WIF)
                                        ▼
    ┌───────────────────────── Google Cloud Platform ────────────────────────┐
    │                                                                        │
    │   [ Google Artifact Registry ] ──> Pushes container images (:git_sha)   │
    │                                                                        │
    │   [ Cloud Run Job ] ──────────────> Decoupled Alembic Database Migration│
    │                                                                        │
    │   [ Google Cloud Run ] (Track A)                                       │
    │   ├── devspeak-web-prod  (Next.js 15 Standalone PWA, non-root)         │
    │   └── devspeak-api-prod  (FastAPI / Python 3.12, non-root)             │
    │                │                                                       │
    │                ▼ (Unix Domain Socket via Cloud SQL Auth Proxy)          │
    │   [ Google Cloud SQL ]                                                 │
    │   └── PostgreSQL 16 (Automated Daily Backups & Point-in-Time Recovery) │
    │                                                                        │
    │   [ GKE Autopilot + Argo CD ] (Track B)                                │
    │   ├── External HTTP(S) Cloud LB + Google Managed SSL Certificate       │
    │   ├── Ingress NGINX / Gateway -> 2 Replicas Web & API (HPA)            │
    │   └── Argo CD GitOps Controller (Automated Reconciliation from Git)    │
    │                                                                        │
    │   [ Google Secret Manager ]                                            │
    │   └── Database credentials, JWT secrets, Gemini API keys (Least-Priv)  │
    └────────────────────────────────────────────────────────────────────────┘
```

- **Zero Static Keys (Keyless CI/CD)**: GitHub Actions authenticates to GCP strictly via **Workload Identity Federation (WIF)**. No service account JSON keys are generated or stored. Production deployment permissions are locked exclusively to the `main` branch.
- **Decoupled Database Migration Gate**: Alembic migrations run inside an isolated ephemeral Cloud Run Job with `--wait` before new application traffic is routed.
- **Automated Smoke Probes**: Every deployment automatically asserts 4 verification gates: `/readyz` 200 OK, question catalog count integrity (26 items), exact runtime API URL script injection match, and strict CORS policy enforcement (authorized origin reflection, OPTIONS preflight, attacker rejection).
- **Disaster Recovery & Data Protection**: Cloud SQL PostgreSQL 16 instance features automated daily backups, 7-day transaction log retention, Point-in-Time Recovery (PITR), and instance deletion protection.
- **Production Documentation Gating**: Swagger UI (`/docs`, `/redoc`, `/openapi.json`) is enabled in development/staging and automatically gated (HTTP 404) in production.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), Lucide Icons, Web Speech API |
| **Backend API** | [Python 3.12](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Pydantic v2](https://docs.pydantic.dev/), [Argon2id](https://github.com/P-H-C/phc-winner-argon2) Password Hashing, PyJWT |
| **Database & ORM** | [PostgreSQL 16 Alpine](https://hub.docker.com/_/postgres), [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (AsyncIO), [Alembic](https://alembic.sqlalchemy.org/) Migrations |
| **Kubernetes & GitOps** | [GKE Autopilot](https://cloud.google.com/kubernetes-engine), [kind](https://kind.sigs.k8s.io/), [Helm 3](https://helm.sh/), [Argo CD v3.5.6](https://argo-cd.readthedocs.io/), NGINX Ingress |
| **Cloud & IaC** | [Google Cloud Run](https://cloud.google.com/run), [Cloud SQL](https://cloud.google.com/sql), [Artifact Registry](https://cloud.google.com/artifact-registry), [Secret Manager](https://cloud.google.com/secret-manager), [Terraform](https://www.terraform.io/) |
| **DevSecOps & Testing** | [Vitest](https://vitest.dev/), [Pytest](https://docs.pytest.org/), [Ruff](https://astral.sh/ruff), [Bandit SAST](https://github.com/PyCQA/bandit), [pip-audit](https://pypi.org/project/pip-audit/), [Gitleaks](https://github.com/gitleaks/gitleaks), [Trivy](https://trivy.dev/) |

---

## 📖 Documentation Index

### 👤 Candidate & User Documentation
- 📘 **[Candidate User Guide](./docs/USER_GUIDE.md)**: Comprehensive manual for question browsing, Studio practice, voice mode usage, and reading AI feedback reports.

### 💻 Engineering, Architecture & Operations
- 🛠️ **[Developer Operations & Local Setup Guide](./docs/OPERATIONS.md)**: Local development setup, Docker Compose, Kubernetes kind cluster, and environment configuration.
- 📐 **[System Architecture & Data Flows](./docs/ARCHITECTURE.md)**: Monorepo layout, AsyncIO architecture, database schema, and API boundaries.
- ☁️ **[GCP Cloud Architecture](./docs/GCP_ARCHITECTURE.md)**: Cloud Run, GKE Autopilot, Cloud SQL, Secret Manager, and VPC networking design.
- 🛡️ **[Security Model & RBAC](./docs/SECURITY.md)**: Argon2id password hashing, JWT stateless authentication, least-privilege IAM, and CORS policy.
- 🎯 **[Threat Model & Mitigation](./docs/THREAT_MODEL.md)**: STRIDE threat analysis, BOLA/IDOR prevention, and defense-in-depth controls.
- 🧪 **[Comprehensive Test Matrix](./docs/TEST_MATRIX.md)**: Detailed test catalog covering unit, integration, security, and smoke tests.
- 📊 **[Cost Estimate & FinOps Plan](./docs/COST_ESTIMATE.md)**: Resource sizing, Free Tier optimization, and cloud spend control.
- 📋 **[Defect Backlog & Audit Report](./docs/DEFECT_BACKLOG.md)**: Issue tracking, vulnerability remediation, and engineering history.
- 🗺️ **[Product Roadmap](./docs/ROADMAP.md)**: Strategic milestones, feature backlog, and release planning.
- 🚀 **[Release Evidence & Audit Log](./docs/RELEASE_EVIDENCE.md)**: Formal verification reports, endpoint health records, and CI/CD audit trail.
- 📝 **[Project Worklog](./docs/WORKLOG.md)**: Chronological engineering log and architectural changes.
- 🤝 **[Session Handoff Runbook](./docs/SESSION_HANDOFF.md)**: Operational state, cluster credentials, port-forward commands, and teardown scripts.

---

## 🚀 Quick Start (Local Docker Compose)

```bash
# 1. Clone the repository
git clone https://github.com/nguyenlpn2015/DevSpeak-AI.git
cd DevSpeak-AI

# 2. Start the complete multi-container stack
docker compose up -d --build

# 3. Access the services
# Web Frontend (PWA):  http://localhost:3001
# FastAPI REST API:    http://127.0.0.1:8000
# API Swagger Docs:    http://127.0.0.1:8000/docs
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
