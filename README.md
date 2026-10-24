# DevSpeak AI — AI English Interview Coach for IT Professionals

[![GCP Production Live](https://img.shields.io/badge/GCP%20Cloud%20Run-Live%20Production-2563eb.svg)](https://devspeak-web-prod-ygz4gsol4q-as.a.run.app)
[![CI/CD DevSecOps](https://img.shields.io/badge/CI%2FCD-Keyless%20WIF%20Pipelines-10b981.svg)](https://github.com/nguyenlpn2015/DevSpeak-AI/actions)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg)](https://nextjs.org/)
[![Cloud SQL](https://img.shields.io/badge/Cloud%20SQL-PostgreSQL%2016-336791.svg)](https://cloud.google.com/sql)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC.svg)](https://www.terraform.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**DevSpeak AI** is an enterprise-grade, bilingual (English / Vietnamese) AI interview coaching studio and Google Cloud Platform (GCP) DevOps/DevSecOps showcase tailored for IT and DevOps professionals preparing for technical interviews, incident briefings, and system design discussions at global technology companies.

---

## 🌐 Live Production Deployment (Google Cloud Platform)

The application is deployed live in the `asia-southeast1` (Singapore) region using serverless containers and managed database infrastructure:

| Component | Service | Live Endpoint (HTTPS) |
| :--- | :--- | :--- |
| **Web Frontend (PWA)** | Google Cloud Run | [https://devspeak-web-prod-ygz4gsol4q-as.a.run.app](https://devspeak-web-prod-ygz4gsol4q-as.a.run.app) |
| **REST API Engine** | Google Cloud Run | [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app) |
| **Readiness Health Probe** | Observability Probe | [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz) |
| **Curated Question Catalog**| Business API Endpoint | [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/api/v1/questions](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/api/v1/questions) |

> [!NOTE]
> **Public Showcase Architecture & AI Engine:**
> To guarantee deterministic evaluation, zero external API costs, and candidate privacy (no user inputs transmitted to commercial third-party LLMs), the public production showcase runs using DevSpeak AI's **Deterministic Heuristic Mock Provider** by default. Live Google Gemini LLM evaluation can be enabled anytime in local or dedicated cloud deployments by setting `AI_PROVIDER=gemini` and providing a `GEMINI_API_KEY`.

---

## 🌟 Key Product Features

- **Flagship LinguaFlow Learning Studio**: Modern dark-neon learning dashboard with real-time day streak tracking, XP progression, target CEFR level milestones, and interactive 3D flashcards with audio pronunciation.
- **Curated 26-Question IT & DevOps Catalog**: Comprehensive scenarios spanning Kubernetes architecture, CI/CD DevSecOps pipelines, Linux SRE internals, AWS cloud infrastructure, Docker containerization, system design, and STAR behavioral leadership.
- **3-Zone AI Interview Studio**: Integrated workspace featuring prompt specifications, live answer draft editor, 1-click technical vocabulary insertion, STAR framework generators, and expert benchmark model answers.
- **Stateful Multi-Turn Interview Dialogue Engine**: Complete conversational interview lifecycle where the AI interviewer introduces scenarios, probes operational edge cases across multiple turns, and issues a final holistic performance report (Engine REST API & Client SDK active; Web Chat UI component scheduled for v1.1.0).
- **Voice Mode (Speech-to-Text)**: Native browser Web Speech API integration allowing candidates to articulate answers via microphone with real-time transcription.
- **Multi-Dimensional AI Feedback**: Objective evaluation across Technical Accuracy, Clarity & STAR Structure, and English Grammar & Professional Tone (1.0–10.0 scale).
- **Local-First & Zero-Cost Privacy**: Operates 100% offline using a built-in deterministic Heuristic Mock AI provider or connects securely to Google Gemini APIs without storing credentials in the cloud.

---

## 🏗️ Cloud & DevOps Architecture (GCP & DevSecOps)

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
    │   [ Google Cloud Run ]                                                 │
    │   ├── devspeak-web-prod  (Next.js 15 Standalone PWA, non-root)         │
    │   └── devspeak-api-prod  (FastAPI / Python 3.12, non-root)             │
    │                │                                                       │
    │                ▼ (Unix Domain Socket via Cloud SQL Auth Proxy)          │
    │   [ Google Cloud SQL ]                                                 │
    │   └── PostgreSQL 16 (Automated Daily Backups & Point-in-Time Recovery) │
    │                                                                        │
    │   [ Google Secret Manager ]                                            │
    │   └── Database credentials, JWT secrets, Gemini API keys (Least-Priv)  │
    └────────────────────────────────────────────────────────────────────────┘
```

- **Zero Static Keys (Keyless CI/CD)**: GitHub Actions authenticates to GCP strictly via **Workload Identity Federation (WIF)**. No service account JSON keys are generated or stored.
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
| **Cloud & IaC** | [Google Cloud Run](https://cloud.google.com/run), [Cloud SQL](https://cloud.google.com/sql), [Artifact Registry](https://cloud.google.com/artifact-registry), [Secret Manager](https://cloud.google.com/secret-manager), [Terraform](https://www.terraform.io/) |
| **DevSecOps & Testing** | [Vitest](https://vitest.dev/), [Pytest](https://docs.pytest.org/), [Ruff](https://astral.sh/ruff), [Bandit SAST](https://github.com/PyCQA/bandit), [pip-audit](https://pypi.org/project/pip-audit/), [Gitleaks](https://github.com/gitleaks/gitleaks), [Trivy](https://trivy.dev/) |

---

## 📖 Quick Links & Documentation

### 👤 For End Users & Candidates
- 👉 **[Sổ Tay Hướng Dẫn Sử Dụng (Candidate User Guide)](./docs/USER_GUIDE.md)**: Hướng dẫn chi tiết bằng tiếng Việt về cách đăng ký, duyệt câu hỏi, sử dụng phòng Studio, luyện nói qua Micro và đọc báo cáo đánh giá AI.

### 💻 For Developers & DevOps Engineers
- 🛠️ **[Developer Operations & Local Setup Guide](./docs/OPERATIONS.md)**: Hướng dẫn thiết lập môi trường lập trình local, chạy Docker Compose, quản lý database migration và cấu hình biến môi trường.
- 📐 **[System Architecture & Data Flows](./docs/ARCHITECTURE.md)**: Cấu trúc Monorepo, sơ đồ luồng dữ liệu và thiết kế module.
- 🛡️ **[Security & Threat Model](./docs/SECURITY.md)**: Mô hình bảo mật, cơ chế mã hóa Argon2id, RBAC và quản lý khóa bí mật.
- 🧪 **[Comprehensive Test Matrix](./docs/TEST_MATRIX.md)**: Danh mục 62 ca kiểm thử trên toàn bộ 15 chiều tính năng.
- 🔍 **[Functional Audit Report](./docs/FUNCTIONAL_AUDIT.md)**: Báo cáo kiểm định độc lập về hiện trạng ứng dụng.
- 📋 **[Defect Backlog & Security Report](./docs/DEFECT_BACKLOG.md)**: Danh sách lỗi kỹ thuật và lộ trình vá lỗi ưu tiên.
- 🗺️ **[Product Roadmap](./docs/ROADMAP.md)**: Lộ trình phát triển các phiên bản tiếp theo.

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
