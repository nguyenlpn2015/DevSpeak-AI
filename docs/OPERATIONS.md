# Operations & Local Setup Guide: DevSpeak AI

This document provides step-by-step instructions for running, testing, and operating DevSpeak AI locally and in automated environments.

---

## 1. Prerequisites & Environment Detection

The host system has been audited and configured with the following verified baseline:

| Tool | Status on Host | Version Detected | Location / Notes |
| :--- | :--- | :--- | :--- |
| **Python** | Installed | `3.12.10` | `C:\Users\Nguyen\AppData\Local\Programs\Python\Python312\python.exe` |
| **Git** | Installed | `2.55.0.windows.5` | `C:\Program Files\Git\cmd\git.exe` |
| **Node.js** | Installed | `v24.20.0` | `C:\Program Files\nodejs\node.exe` |
| **npm** | Installed | `11.19.0` | `C:\Program Files\nodejs\npm.cmd` |
| **GitHub CLI** | Installed | `2.102.0` | `C:\Program Files\GitHub CLI\gh.exe` |
| **Docker** | Missing | Not installed | Deferred to Milestone 2/4; MVP runs natively |

> [!NOTE]
> On Windows, if commands like `python`, `git`, or `node` fail to resolve in a newly opened PowerShell shell, refresh your session PATH:
> ```powershell
> $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
> ```

---

## 2. Local Setup Steps

### 2.1 Backend (`apps/api`)
```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
cp .env.example .env
```

### 2.2 Database Initialization & Migrations (Alembic)
The local development database defaults to zero-cost, zero-configuration SQLite.
To apply schema migrations:
```powershell
cd apps/api
.\.venv\Scripts\Activate.ps1
# Run all pending migrations to head
python -m alembic upgrade head

# To revert the most recent migration (if needed):
python -m alembic downgrade -1
```

### 2.3 Running Backend Server Locally
```powershell
cd apps/api
.\.venv\Scripts\Activate.ps1
python -m uvicorn src.main:app --host 127.0.0.1 --port 8000
```
API Documentation will be interactively available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 2.4 Frontend (`apps/web`)
```powershell
cd apps/web
npm install
cp .env.example .env.local
```

### 2.5 Running Frontend Server Locally
```powershell
cd apps/web
npm run dev
```
The web application is accessible at: `http://localhost:3001`

---

## 3. Database Configuration & Backup Strategy

### 3.1 Database Drivers & Configurations
- **Local Development (Default)**:
  ```ini
  DATABASE_URL=sqlite+aiosqlite:///./devspeak.db
  DATABASE_ECHO=false
  ```
  Zero-cost, standalone, file-backed SQLite requiring no external database daemons or cloud accounts.
- **Production (Intended PostgreSQL)**:
  ```ini
  DATABASE_URL=postgresql+asyncpg://devspeak_user:<SECURE_PASSWORD>@db-host:5432/devspeak
  DATABASE_ECHO=false
  ```
  Compatible with PostgreSQL 15+ using high-performance `asyncpg` async driver.

### 3.2 SQLite Backup and Recovery (Local Development)
Because SQLite runs in Write-Ahead Logging (WAL) or standard journal mode, use safe online backup commands to avoid copying mid-transaction corrupted blocks:

- **Create a clean backup**:
  ```powershell
  # Using Python sqlite3 standard library (no sqlite3.exe binary required)
  python -c "import sqlite3; src = sqlite3.connect('devspeak.db'); bck = sqlite3.connect('devspeak_backup.db'); src.backup(bck); bck.close(); src.close(); print('Backup complete.')"
  ```
- **Restore from backup**:
  ```powershell
  Copy-Item -Path devspeak_backup.db -Destination devspeak.db -Force
  ```
- **Data Safety**:
  All `*.db`, `*.sqlite`, `*-wal`, and `*-shm` files are strictly excluded in `.gitignore` to prevent committing candidate practice transcripts or sensitive interview responses into version control.

---

## 4. Running in Deterministic Mock AI Mode (0-Cost & Offline)

DevSpeak AI is specifically engineered to run with zero external API dependencies or costs during local development and CI testing:

In `apps/api/.env`:
```ini
ENVIRONMENT=development
AI_PROVIDER=mock
PORT=8000
```

When `AI_PROVIDER=mock`:
- All interview questions use deterministic evaluation algorithms and rubric heuristics.
- No network requests are made to OpenAI, Anthropic, or Google.
- All automated tests (`pytest`, `vitest`) pass reliably in seconds.
- The web UI clearly indicates heuristic mock mode to candidates.

---

## 4.2 Configuring & Running Live AI Mode (Google Gemini)

To evaluate candidate interview responses with real generative AI, DevSpeak AI integrates **Google Gemini 2.0 Flash** via the `GeminiAIProvider` adapter.

### Consumer Subscription ($20/mo) vs Developer API Key
> [!IMPORTANT]
> The consumer **Gemini Advanced ($20/month Google One AI Premium)** subscription provides web UI access at [gemini.google.com](https://gemini.google.com), but does **NOT** grant developer API tokens.
> Programmatic API access requires an API key from **Google AI Studio** ([aistudio.google.com](https://aistudio.google.com)).
> - **Free Tier**: Google AI Studio provides a free quota for `gemini-2.0-flash` (15 RPM, 1,500 requests/day) without requiring a credit card.
> - **Pay-As-You-Go Tier**: If billed, `gemini-2.0-flash` charges ~$0.10 per 1M input tokens and ~$0.40 per 1M output tokens. A typical interview evaluation costs roughly **$0.000165** (over 6,000 evaluations per $1.00).

### Step-by-Step Activation
1. Navigate to [Google AI Studio](https://aistudio.google.com/) and sign in with your Google account.
2. Click **"Get API key"** -> **"Create API key in new project"** and copy the secret key string.
3. Open `apps/api/.env` (do NOT commit this file to Git):
   ```ini
   ENVIRONMENT=development
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy...YourActualSecretKeyHere...
   GEMINI_MODEL=gemini-2.0-flash
   AI_TIMEOUT_SECONDS=25
   AI_MAX_RETRIES=2
   ```
4. Start or restart the FastAPI backend:
   ```powershell
   cd apps/api
   .\.venv\Scripts\python.exe -m uvicorn src.main:app --reload
   ```
5. Confirm provider readiness:
   Query `GET http://127.0.0.1:8000/readyz`. The response will state `"ai_provider": "gemini"`.
6. To return to zero-cost offline development at any time, simply reset `AI_PROVIDER=mock` in `apps/api/.env`.

---

## 5. Verification & Testing Commands

### Backend Checks (`apps/api`)
Run from `apps/api/` with virtual environment active:

| Purpose | Exact Verified Command | Working Directory |
| :--- | :--- | :--- |
| Python Linting | `.\.venv\Scripts\ruff.exe check .` | `apps/api` |
| Python Formatting Check | `.\.venv\Scripts\ruff.exe format --check .` | `apps/api` |
| Full Automated Test Suite | `.\.venv\Scripts\python.exe -m pytest -v` | `apps/api` |
| Unit Tests (Questions, Heuristics, Repository) | `.\.venv\Scripts\python.exe -m pytest tests/unit -v` | `apps/api` |
| Integration Tests (API Endpoints, Migrations) | `.\.venv\Scripts\python.exe -m pytest tests/integration -v` | `apps/api` |
| Alembic Migration Verification | `.\.venv\Scripts\python.exe -m pytest tests/integration/test_migrations.py -v` | `apps/api` |

### Frontend Checks (`apps/web`)
Run from `apps/web/`:

| Purpose | Exact Verified Command | Working Directory |
| :--- | :--- | :--- |
| TypeScript Type-Check | `npm run type-check` | `apps/web` |
| ESLint Linting | `npm run lint` | `apps/web` |
| Vitest Unit & Component Tests | `npm test` | `apps/web` |
| Next.js Production Build | `npm run build` | `apps/web` |

### Repository Checks
| Purpose | Exact Command | Working Directory |
| :--- | :--- | :--- |
| Git Status Inspection | `git status -s` | Project root |

---

## 6. Endpoints Reference

When the API service is running on `127.0.0.1:8000`:
- **Health Check (Liveness)**: `GET http://127.0.0.1:8000/healthz`
- **Readiness Check**: `GET http://127.0.0.1:8000/readyz`
- **Question Catalog**: `GET http://127.0.0.1:8000/api/v1/questions`
- **Question Detail**: `GET http://127.0.0.1:8000/api/v1/questions/k8s-pod-crashloopbackoff`
- **Create Session**: `POST http://127.0.0.1:8000/api/v1/interviews/sessions`
- **List Sessions**: `GET http://127.0.0.1:8000/api/v1/interviews/sessions?limit=20&offset=0`
- **Get Session & Attempts**: `GET http://127.0.0.1:8000/api/v1/interviews/sessions/{session_id}`
- **Submit Attempt against Session**: `POST http://127.0.0.1:8000/api/v1/interviews/sessions/{session_id}/attempts`
- **Standalone Evaluation (Legacy)**: `POST http://127.0.0.1:8000/api/v1/interviews/evaluate`

---

## 7. Security Scanning & DevSecOps Commands

### Backend SAST & Audit Commands (`apps/api`)
```powershell
cd apps/api
# Run Bandit SAST scan on backend source code
.\.venv\Scripts\python.exe -m bandit -r src

# Run pip-audit vulnerability audit on declared dependencies
.\.venv\Scripts\python.exe -m pip_audit -r requirements.txt
```

### Frontend Security Audit (`apps/web`)
```powershell
cd apps/web
# Run npm dependency vulnerability audit
npm audit
```

### GitHub Actions CI Workflow Emulation
To run full quality and security checks locally before pushing to remote:
```powershell
# 1. Backend checks
cd apps/api
.\.venv\Scripts\python.exe -m ruff check .
.\.venv\Scripts\python.exe -m ruff format --check .
.\.venv\Scripts\python.exe -m bandit -r src
$env:AI_PROVIDER="mock"; .\.venv\Scripts\python.exe -m pytest -c pyproject.toml

# 2. Frontend checks
cd ../web
npm run type-check
npm run lint
npm test
npm run build
```

---

## 8. Docker Compose Operations (Task 07)

When Docker Desktop or a container engine is available, the entire stack can be launched via Docker Compose:

### 8.1 Starting the Multi-Container Stack
```bash
# 1. (Optional) Create local configuration from template
cp .env.docker.example .env.docker

# 2. Build and start all services in detached mode
docker compose up -d --build

# 3. View status of all services and healthchecks
docker compose ps

# 4. Follow application logs
docker compose logs -f api
docker compose logs -f web
```

### 8.2 Service Endpoints in Docker
- **Frontend Web UI**: `http://localhost:3001`
- **Backend API Docs**: `http://localhost:8000/docs`
- **Backend Healthcheck**: `http://localhost:8000/readyz`

### 8.3 Stopping and Cleaning Up
```bash
# Stop containers while preserving database volume
docker compose down

# Stop containers and remove persistent database volume
docker compose down -v
```
