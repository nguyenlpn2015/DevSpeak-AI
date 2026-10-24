# DevSpeak AI — Project Technical Inventory

## 1. System Overview
- **System Name**: DevSpeak AI
- **Domain**: AI English Interview Coach for IT, SRE, and DevOps Professionals
- **Architecture**: Modular Monolith with Decoupled Frontend (Next.js 15 PWA) and Backend (FastAPI REST API)
- **Primary Repository Workspace**: `D:\DEVSPEAK-AI`
- **Execution Target**: Local-First / Docker Compose Orchestration

---

## 2. Directory Structure & Codebase Map

```
D:\DEVSPEAK-AI/
├── apps/
│   ├── api/                           # Backend Application (FastAPI, Python 3.12)
│   │   ├── alembic/                   # Database Migration Management
│   │   │   ├── versions/
│   │   │   │   └── 0001_initial_interview_persistence.py
│   │   │   └── env.py
│   │   ├── src/
│   │   │   ├── core/                  # Configuration & Environment Settings
│   │   │   │   ├── __init__.py
│   │   │   │   └── config.py          # Pydantic Settings (ENV, CORS, AI_PROVIDER)
│   │   │   ├── db/                    # Database Session & Engine Pool
│   │   │   │   ├── base.py            # DeclarativeBase, utc_now helper
│   │   │   │   └── session.py         # AsyncSession factory, engine pool
│   │   │   ├── modules/
│   │   │   │   ├── ai/                # AI Evaluation Provider Layer
│   │   │   │   │   ├── exceptions.py  # RateLimit, Timeout, Config, Provider errors
│   │   │   │   │   ├── factory.py     # AIProvider singleton factory
│   │   │   │   │   ├── gemini_provider.py # Google Gemini REST client (httpx)
│   │   │   │   │   ├── interface.py   # AIProviderInterface abstract contract
│   │   │   │   │   ├── mock_provider.py   # Deterministic 0-cost rule-based provider
│   │   │   │   │   └── schemas.py     # EvaluationRequest, FeedbackReport, ScoreBreakdown
│   │   │   │   ├── interviews/        # Interview Sessions & Attempt History
│   │   │   │   │   ├── models.py      # InterviewSession, InterviewAttempt ORM models
│   │   │   │   │   ├── repository.py  # Async CRUD operations
│   │   │   │   │   ├── schemas.py     # SessionCreateRequest, AttemptResponse, etc.
│   │   │   │   │   └── service.py     # Business logic & AI orchestration
│   │   │   │   └── questions/         # Question Bank
│   │   │   │       ├── catalog.py     # Seed question catalog (6 core questions)
│   │   │   │       └── schemas.py     # Question, Rubric, QuestionSummary schemas
│   │   │   └── main.py                # FastAPI factory, routes, exception handlers
│   │   ├── tests/
│   │   │   ├── integration/           # API and session integration tests (21 tests)
│   │   │   └── unit/                  # Unit tests: Gemini, Mock, Questions, Repo (29 tests)
│   │   ├── Dockerfile                 # Multi-stage python:3.12-slim-bookworm (non-root)
│   │   ├── entrypoint.sh              # Auto-migration runner & uvicorn startup
│   │   ├── pyproject.toml             # Pytest & Ruff configuration
│   │   ├── requirements.txt           # Runtime dependencies
│   │   └── requirements-dev.txt       # Dev & test dependencies (pytest, ruff, bandit, pip-audit)
│   │
│   └── web/                           # Frontend Application (Next.js 15, React 19)
│       ├── public/                    # Static icons, manifest, favicon
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css        # Tailwind styles & LinguaFlow neon colors
│       │   │   ├── layout.tsx         # Root HTML metadata & font definitions
│       │   │   └── page.tsx           # Entry page wrapping LanguageProvider & DevSpeakApp
│       │   ├── components/
│       │   │   ├── linguaflow/        # LinguaFlow Dark Neon Design System Components
│       │   │   │   ├── LinguaSidebar.tsx       # Desktop fixed sidebar & mobile drawer
│       │   │   │   ├── LinguaFlowDashboard.tsx # Flagship dashboard overview & track pills
│       │   │   │   ├── MetricCards.tsx         # 4 glowing metric cards (Streak, XP, Words, Level)
│       │   │   │   ├── WeeklyProgressChart.tsx # SVG Bezier spline area progress chart
│       │   │   │   ├── StreakCalendar.tsx      # 7-day flame bubble streak calendar
│       │   │   │   ├── ContinueLearningSection.tsx # 4 vivid learning action cards
│       │   │   │   ├── GoalsAndAchievements.tsx   # Today's goals & 4 unlocked SRE badges
│       │   │   │   └── FlashcardsView.tsx      # 3D interactive flashcards with speech audio
│       │   │   ├── studio/            # Flagship 3-Zone AI Interview Studio
│       │   │   │   ├── InterviewStudio.tsx     # 3-zone layout orchestrator
│       │   │   │   ├── SessionSidebar.tsx      # Question picker, metadata, difficulty
│       │   │   │   ├── AnswerWorkspace.tsx     # Answer draft textarea, char bounds, Ctrl+Enter
│       │   │   │   ├── FeedbackPanel.tsx       # AI evaluation scores & feedback tabs
│       │   │   │   ├── STARBuilder.tsx         # 4-stage STAR response builder
│       │   │   │   ├── VocabularyCoach.tsx     # Contextual keyword insertion pills
│       │   │   │   └── RubricPanel.tsx         # Canonical grading criteria & pitfalls
│       │   │   ├── DevSpeakApp.tsx    # Client root state orchestrator
│       │   │   ├── Header.tsx         # Top bar with backend status & language switcher
│       │   │   ├── LanguageSwitcher.tsx # EN/VI toggle button
│       │   │   ├── QuestionCatalog.tsx # Filterable question bank grid
│       │   │   ├── QuestionDetailView.tsx # Rubric inspection view
│       │   │   ├── PracticeStudio.tsx  # Proxy to InterviewStudio
│       │   │   └── FeedbackStudio.tsx  # Standalone feedback view
│       │   ├── i18n/
│       │   │   ├── LanguageContext.tsx# SSR-safe locale context
│       │   │   ├── types.ts           # Strictly typed bilingual translation schema
│       │   │   ├── en.ts              # English dictionary
│       │   │   └── vi.ts              # Vietnamese dictionary (100% key parity)
│       │   ├── lib/
│       │   │   └── api.ts             # Typed fetch API client with error handling
│       │   └── types/
│       │       └── index.ts           # Shared TypeScript interfaces
│       ├── tests/                     # Vitest test suites (36 tests)
│       ├── Dockerfile                 # Multi-stage node:22-alpine (non-root nextjs)
│       ├── package.json               # Dependencies & scripts
│       └── tailwind.config.ts         # LinguaFlow palette & typography
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # Gitleaks, Python SAST, Vitest, Next.js Build
├── docs/                              # Project Documentation Suite
├── docker-compose.yml                 # Multi-container orchestration (db, api, web)
├── .env.docker.example                # Template for containerized environment
├── GEMINI.md                          # Core engineering rules & context
└── README.md                          # Project overview
```

---

## 3. Route & API Endpoint Inventory

### Backend REST API (`http://127.0.0.1:8000`)

| Method | Path | Summary | Auth Required | DB Dependency | Current Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/healthz` | Liveness health probe | None | None | **IMPLEMENTED** (HTTP 200) |
| `GET` | `/readyz` | Readiness probe (checks AI provider & catalog count) | None | None | **IMPLEMENTED** (HTTP 200) |
| `GET` | `/api/v1/questions` | List and filter interview questions by role, topic, difficulty | None | In-memory catalog | **IMPLEMENTED** (HTTP 200, 6 questions) |
| `GET` | `/api/v1/questions/{id}` | Get full question specification, rubric, and sample answer | None | In-memory catalog | **IMPLEMENTED** (HTTP 200 / 404) |
| `POST` | `/api/v1/interviews/evaluate` | Standalone AI evaluation of candidate answer | None | Optional session persist | **IMPLEMENTED** (HTTP 200 / 422 / 404) |
| `POST` | `/api/v1/interviews/sessions` | Create a persistent interview session | None | `interview_sessions` table | **IMPLEMENTED** (HTTP 201) |
| `GET` | `/api/v1/interviews/sessions` | Paginated list of interview sessions | None | `interview_sessions` table | **IMPLEMENTED** (HTTP 200) |
| `GET` | `/api/v1/interviews/sessions/{id}` | Get session details and attempt history | None | `interview_sessions`, `attempts` | **IMPLEMENTED** (HTTP 200 / 404) |
| `POST` | `/api/v1/interviews/sessions/{id}/attempts` | Submit answer attempt against active session | None | `interview_attempts` table | **IMPLEMENTED** (HTTP 201) |
| `POST` | `/api/v1/auth/register` | User account registration | None | `users` table | **MISSING** (Not Implemented) |
| `POST` | `/api/v1/auth/login` | User login & token generation | None | `users` table | **MISSING** (Not Implemented) |
| `POST` | `/api/v1/auth/logout` | User session invalidation | Bearer/Cookie | `users` table | **MISSING** (Not Implemented) |
| `GET` | `/api/v1/auth/me` | Current authenticated user profile | Bearer/Cookie | `users` table | **MISSING** (Not Implemented) |
| `POST` | `/api/v1/interviews/chat` | Multi-turn conversational AI interview turn | User | Session messages | **MISSING** (Not Implemented) |
| `GET` | `/api/v1/progress/summary` | User-specific learning progress & streak calculation | User | Activity history | **MISSING** (Not Implemented) |

### Frontend Views & Client Routes (`http://localhost:3001`)

| View Identifier | Component Entry Point | Description | Status |
| :--- | :--- | :--- | :--- |
| `home` | `LinguaFlowDashboard.tsx` | Main dashboard with CEFR progression, metrics, wave chart, streak calendar | **VERIFIED** |
| `catalog` | `QuestionCatalog.tsx` | Question bank search, role/topic/difficulty filters, question list | **VERIFIED** |
| `detail` | `QuestionDetailView.tsx` | Question specification, key concepts, evaluation rubric, sample answer | **VERIFIED** |
| `practice` | `PracticeStudio.tsx` (`InterviewStudio.tsx`) | 3-zone interview studio with answer workspace, AI feedback, STAR builder | **VERIFIED** |
| `feedback` | `FeedbackStudio.tsx` | Standalone feedback inspection view | **VERIFIED** |
| `flashcards` | `FlashcardsView.tsx` | 3D interactive flashcards with Web Speech audio pronunciation | **VERIFIED** |
| `auth` | None | Registration, login, and user profile management | **MISSING** |
| `voice` | Partial (TTS audio in flashcards) | Speech-to-text recording, transcription, and conversational audio | **MISSING** |
| `chat` | None | Multi-turn chat interface with turn-based interviewer AI | **MISSING** |

---

## 4. Database Schema Inventory

- **Current Database Engine**: PostgreSQL 16 Alpine (in Docker Compose) / SQLite (in local unit/integration tests).
- **ORM Framework**: SQLAlchemy 2.0+ Async (`AsyncSession`, `DeclarativeBase`).
- **Migration Tool**: Alembic (version `0001_initial`).

### Existing Tables:
1. `interview_sessions`:
   - `id`: VARCHAR(36), PK
   - `question_id`: VARCHAR(100), INDEX
   - `status`: VARCHAR(30), default 'in_progress'
   - `session_metadata`: JSON
   - `created_at`: TIMESTAMP WITH TIME ZONE
   - `updated_at`: TIMESTAMP WITH TIME ZONE
   - *Missing*: `user_id` FK association.
2. `interview_attempts`:
   - `id`: VARCHAR(36), PK
   - `session_id`: VARCHAR(36), FK -> `interview_sessions.id` (ON DELETE CASCADE)
   - `user_answer`: TEXT
   - `feedback_snapshot`: JSON
   - `overall_score`: FLOAT, INDEX
   - `created_at`: TIMESTAMP WITH TIME ZONE

### Missing Tables for Full Product:
1. `users`:
   - `id`: VARCHAR(36), PK
   - `email`: VARCHAR(255), UNIQUE, INDEX
   - `hashed_password`: VARCHAR(255)
   - `full_name`: VARCHAR(100)
   - `target_role`: VARCHAR(50) (e.g. devops, sre, backend)
   - `target_level`: VARCHAR(10) (e.g. B2, C1)
   - `is_active`: BOOLEAN, default True
   - `created_at`: TIMESTAMP WITH TIME ZONE
   - `updated_at`: TIMESTAMP WITH TIME ZONE
2. `questions`:
   - Normalized database table for persistent, scalable question bank beyond hardcoded python dictionaries.
3. `chat_messages` / `interview_messages`:
   - Multi-turn conversation history for AI interviewer chatbot.

---

## 5. Security & Configuration Inventory

- **Environment Settings** (`src/core/config.py`):
  - `PROJECT_NAME`: "DevSpeak AI API"
  - `ENVIRONMENT`: "development" | "production" | "test"
  - `DEBUG`: Boolean
  - `AI_PROVIDER`: "mock" | "gemini"
  - `GEMINI_API_KEY`: Secret string (loaded from environment)
  - `GEMINI_MODEL`: "gemini-flash-lite-latest"
  - `DATABASE_URL`: Async SQLAlchemy connection string
  - `CORS_ORIGINS`: Allowed client origins
- **Security Scanners**:
  - `Bandit`: Passed (1989 lines scanned, 0 issues).
  - `Ruff`: Passed (0 lint or format violations).
  - `Gitleaks`: Configured in CI.
  - `npm audit`: 11 build-time vulnerabilities identified in Tailwind/PostCSS dependencies (to be upgraded safely).
