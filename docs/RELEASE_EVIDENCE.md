# DevSpeak AI — Release Evidence & Baseline Verification

**Document Version**: 1.0.0  
**Phase**: Phase 0 — Audit & Baseline  
**Auditor**: Principal Cloud Architect & DevSecOps Lead  
**Audit Date**: October 23, 2026  
**Repository**: `https://github.com/nguyenlpn2015/DevSpeak-AI.git` (Branch: `main`)  

---

## 1. Executive Baseline Summary

| Verification Dimension | Target Standard | Observed Tool Output | Status |
| :--- | :--- | :--- | :--- |
| **Git Working Tree** | Clean, remote tracking `main` | `On branch main, Your branch is up to date with 'origin/main', nothing to commit, working tree clean` | **PASS** |
| **Backend Unit & Integration Tests** | 100% Pass rate | **65 passed in 5.54s** (`pytest -c pyproject.toml`) | **PASS** |
| **Frontend Unit & Component Tests** | 100% Pass rate | **44 passed in 49.33s** (`vitest run`) | **PASS** |
| **Frontend TypeScript Type Check** | 0 errors | **0 errors** (`tsc --noEmit`) | **PASS** |
| **Frontend ESLint Code Quality** | 0 warnings / errors | **0 errors** (`eslint .`) | **PASS** |
| **Backend Code Linting (Ruff)** | 0 PEP violations | **All checks passed!** (`ruff check .`) | **PASS** |
| **Backend Static Security (Bandit)** | 0 High / Medium alerts | **0 issues identified** (4,006 lines of code scanned) | **PASS** |
| **Python Dependency SCA (pip-audit)** | 0 Known CVEs | **No known vulnerabilities found** | **PASS** |
| **Docker Compose Readiness** | Dockerfiles valid, non-root users | `appuser:10001` (API), `nextjs:1001` (Web) verified | **PASS** |
| **Documentation Security** | 0 Markdown files on remote repo | Verified: `*.md`, `docs/`, `study/` excluded from Git tree | **PASS** |

---

## 2. Detailed Verification Evidence Logs

### 2.1 Backend Automated Test Suite (Pytest)
```
Command: cd apps/api; $env:AI_PROVIDER="mock"; .\.venv\Scripts\python.exe -m pytest -c pyproject.toml
Exit Code: 0
Duration: 5.54 seconds

============================= test session starts =============================
platform win32 -- Python 3.12.10, pytest-9.1.1, pluggy-1.7.0
rootdir: D:\DEVSPEAK-AI\apps\api
configfile: pyproject.toml
testpaths: tests
plugins: anyio-4.15.1, platformdirs-4.13.5, asyncio-1.4.0
asyncio: mode=Mode.AUTO, debug=False
collected 65 items

tests\integration\test_api_endpoints.py .................                [ 26%]
tests\integration\test_auth_endpoints.py ......                          [ 35%]
tests\integration\test_chat_endpoints.py ...                             [ 40%]
tests\integration\test_migrations.py .                                   [ 41%]
tests\integration\test_progress_endpoints.py ..                          [ 44%]
tests\integration\test_session_endpoints.py .......                      [ 55%]
tests\unit\test_gemini_provider.py .........                             [ 69%]
tests\unit\test_mock_provider.py ........                                [ 81%]
tests\unit\test_questions.py ......                                      [ 90%]
tests\unit\test_repository.py ......                                     [100%]

============================= 65 passed in 5.54s ==============================
```

### 2.2 Frontend Automated Test Suite (Vitest)
```
Command: cd apps/web; npm test
Exit Code: 0
Duration: 49.33 seconds

 RUN  v5.0.5 D:/DEVSPEAK-AI/apps/web

 ✓ tests/api-extensions.test.ts (3 tests) 5ms
 ✓ tests/api.test.ts (10 tests) 10ms
 ✓ tests/auth.test.tsx (3 tests) 182ms
 ✓ tests/voice-input.test.tsx (2 tests) 200ms
 ✓ tests/i18n.test.tsx (9 tests) 218ms
 ✓ tests/components.test.tsx (9 tests) 551ms
 ✓ tests/interview-studio.test.tsx (8 tests) 969ms

 Test Files  7 passed (7)
      Tests  44 passed (44)
```

### 2.3 Backend Static Application Security Testing (Bandit SAST)
```
Command: cd apps/api; .\.venv\Scripts\python.exe -m bandit -r src
Exit Code: 0

[main]	INFO	profile include tests: None
[main]	INFO	running on Python 3.12.10

Test results:
	No issues identified.

Code scanned:
	Total lines of code: 4006
	Total lines skipped (#nosec): 0
	Total issues (by severity): Undefined: 0, Low: 0, Medium: 0, High: 0
```

---

## 3. Environment Variable Inventory (By Name Only)

All environment variables have been audited across the codebase. No secret values or credentials are listed:

### Backend Variables (`apps/api`)
- `ENVIRONMENT` (development | test | production)
- `DEBUG` (boolean)
- `PROJECT_NAME` (string)
- `API_V1_STR` (string)
- `HOST` (string)
- `PORT` (integer, dynamically provided by Cloud Run)
- `DATABASE_URL` (PostgreSQL asyncpg connection string)
- `DATABASE_ECHO` (boolean)
- `AI_PROVIDER` (mock | gemini | openai | anthropic)
- `GEMINI_API_KEY` (secret string)
- `GEMINI_MODEL` (string)
- `AI_TIMEOUT_SECONDS` (integer)
- `AI_MAX_RETRIES` (integer)
- `AI_TEMPERATURE` (float)
- `CORS_ORIGINS` (comma-separated origins or JSON array)
- `DAILY_QUESTION_QUOTA` (integer)
- `MAX_ANSWER_LENGTH` (integer)
- `JWT_SECRET_KEY` (secret string)
- `JWT_ALGORITHM` (string)
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (integer)

### Frontend Variables (`apps/web`)
- `NEXT_PUBLIC_API_URL` (public HTTPS endpoint of backend API)
- `API_INTERNAL_URL` (optional internal proxy rewrite target)
- `PORT` (integer, dynamically provided by Cloud Run)
- `NEXT_TELEMETRY_DISABLED` (set to 1)
- `NODE_ENV` (production)

---

## 4. Production Breakage Risks & Remediation Plan

The Phase 0 audit identified three critical deployment risks that would cause production failure if not handled in the Terraform / Cloud Run configuration:

| Identified Risk | Location | Production Impact | Required Cloud Remediation |
| :--- | :--- | :--- | :--- |
| **Hardcoded Localhost API URL** | `apps/web/src/lib/api.ts` line 17 | Next.js defaults to `http://127.0.0.1:8000`. In Cloud Run, client browsers would attempt to call their local PC instead of the Cloud Run API. | Terraform provisions `devspeak-api` first, captures its generated URL, and injects `NEXT_PUBLIC_API_URL=https://devspeak-api-...a.run.app` into the `devspeak-web` deployment. |
| **Localhost CORS Restriction** | `apps/api/src/core/config.py` line 57 | Backend only accepts origins from `localhost:3000` and `localhost:3001`. Browser requests from the public frontend URL will be blocked by CORS. | Inject `CORS_ORIGINS=["https://devspeak-web-...a.run.app"]` into `devspeak-api` container environment via Terraform. |
| **Multi-Instance Migration Race Condition** | `apps/api/entrypoint.sh` line 5 | Cloud Run scaling out multiple instances will cause all instances to execute `alembic upgrade head` simultaneously, risking DB lock contention. | Separate migrations into a controlled release job (e.g., Cloud Run Job or pre-deploy GitHub Actions step) before routing traffic to the new revision. |

---

## 5. Host Tooling Audit for GCP Deployment

| Tool | Status on Host | Version Detected | Action Required for Phase 1+ |
| :--- | :--- | :--- | :--- |
| **Python** | Installed | `3.12.10` | None (Ready) |
| **Node.js** | Installed | `v24.20.0` | None (Ready) |
| **Docker** | Installed | `27.x` | None (Ready for local container validation) |
| **Git** | Installed | `2.55.0` | None (Ready) |
| **GitHub CLI (`gh`)** | Installed | `2.102.0` | Ready for repository secrets/WIF inspection |
| **Google Cloud SDK (`gcloud`)** | **Missing** | Not in PATH | **Must be installed** via `winget install Google.CloudSDK` |
| **HashiCorp Terraform** | **Missing** | Not in PATH | **Must be installed** via `winget install Hashicorp.Terraform` |

---

## 6. Phase 0 Audit Sign-off

- **Audit Completion**: All 10 discovery checklist items executed and verified.
- **Architectural Specifications**: Authored and committed locally:
  - `docs/GCP_ARCHITECTURE.md`
  - `docs/COST_ESTIMATE.md`
  - `docs/THREAT_MODEL.md`
  - `docs/GCP_IMPLEMENTATION_PLAN.md`
  - `docs/RELEASE_EVIDENCE.md`
- **Cost & Billable Resources**: **$0.00 spent. Zero GCP resources provisioned.**
- **Verdict**: **PHASE 0 PASSED. SYSTEM IS READY FOR USER APPROVAL TO BEGIN PHASE 1.**
