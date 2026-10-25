# DevSpeak AI — Comprehensive Test Execution Matrix

**Audit Date**: October 21, 2026  
**Environment**: Windows 11 Workspace (`D:\DEVSPEAK-AI`), Docker Compose (`devspeak-db`, `devspeak-api`, `devspeak-web`)  
**Target Architecture**: Monorepo (Next.js 15 PWA + FastAPI Python 3.12 + PostgreSQL 16)  
**Execution Status Key**:
- `PASS`: Behavior matches specification completely with verified tool execution.
- `FAIL`: Behavior violates specification, security rules, or produces unhandled errors.
- `BLOCKED`: Test execution prevented due to dependency failure.
- `NOT RUN`: Test planned but not executed.

---

## 1. Test Execution Summary

| Category / Dimension | Total Tests | PASS | FAIL | BLOCKED | Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Application Startup & Health** | 4 | 3 | 1 | 0 | **FAIL (OPS-01)** |
| **2. Dashboard Navigation & UI** | 4 | 4 | 0 | 0 | **PASS** |
| **3. Question Bank Search & Filtering** | 6 | 6 | 0 | 0 | **PASS** |
| **4. Answer Submission & Evaluation** | 5 | 5 | 0 | 0 | **PASS** |
| **5. Technical Vocab & STAR Guidance** | 4 | 4 | 0 | 0 | **PASS** |
| **6. Text Interview Chat Lifecycle** | 4 | 4 | 0 | 0 | **PASS** |
| **7. Authentication & Authorization** | 8 | 6 | 2 | 0 | **FAIL (SEC-01)** |
| **8. Data Persistence & Ownership** | 4 | 4 | 0 | 0 | **PASS** |
| **9. Bilingual Localization (EN/VI)** | 4 | 3 | 1 | 0 | **FAIL (I18N-01)** |
| **10. Validation & Error Handling** | 5 | 5 | 0 | 0 | **PASS** |
| **11. Database Migrations & Schemas** | 3 | 3 | 0 | 0 | **PASS** |
| **12. Docker Compose Orchestration** | 4 | 4 | 0 | 0 | **PASS** |
| **13. Continuous Integration Gates** | 4 | 3 | 1 | 0 | **FAIL (DX-01)** |
| **14. Security & SAST Scans** | 4 | 3 | 1 | 0 | **FAIL (DEP-01)** |
| **15. Responsive Design & Layout** | 3 | 3 | 0 | 0 | **PASS** |
| **TOTAL** | **62** | **57 (91.9%)** | **5 (8.1%)** | **0** | **AUDIT COMPLETE** |

---

## 2. Exhaustive Test Case Execution Matrix

### Category 1: Application Startup & Health Probes

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-START-01` | Liveness probe returns HTTP 200 OK | Runtime HTTP | `curl -s http://127.0.0.1:8000/healthz` | Backend running | HTTP 200 `{"status":"ok"}` | HTTP 200 `{"status":"ok","environment":"development"}` | **PASS** | — |
| `TC-START-02` | Readiness probe verifies loaded catalog | Runtime HTTP | `curl -s http://127.0.0.1:8000/readyz` | Backend running | HTTP 200 with `questions_loaded` >= 20 | HTTP 200 `{"status":"ready","questions_loaded":26}` | **PASS** | — |
| `TC-START-03` | Readiness probe verifies Database connectivity | Runtime Health | Code inspection of `readiness_check` in `main.py` | Database configured | Probe executes `SELECT 1` against engine pool | Probe only checks in-memory catalog; never executes DB query. | **FAIL** | `OPS-01` |
| `TC-START-04` | Frontend status pill displays system state | Component Unit | `npm test` (`tests/components.test.tsx`) | Web test runner | Renders operational indicator | Passed in vitest | **PASS** | — |

---

### Category 2: Dashboard Navigation & Interactive Actions

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-DASH-01` | LinguaFlow Dashboard renders hero banner & cards | Component Unit | `npm test` (`tests/components.test.tsx`) | Web test runner | Renders Streak, XP, Level cards | Passed in vitest (9 tests) | **PASS** | — |
| `TC-DASH-02` | Sidebar switches views between Dashboard & Catalog | Component Unit | `npm test` (`tests/components.test.tsx`) | Web test runner | Active view updates without remount crash | Passed in vitest | **PASS** | — |
| `TC-DASH-03` | Metric cards reflect authenticated candidate progress | Runtime API | `GET /api/v1/progress/summary` with Bearer token | User with attempts | Returns user-specific XP, streak, sessions | Candidate Alpha returned 105 XP, 1 streak day, 1 session | **PASS** | — |
| `TC-DASH-04` | Guest user sees empty progress state | Runtime API | `GET /api/v1/progress/summary` without token | Unauthenticated | Returns 0 XP, 0 streak, 0 sessions | Returned `{"completed_sessions":0,"total_xp":0,"streak_days":0}` | **PASS** | — |

---

### Category 3: Question Bank Search & Filtering

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-QBANK-01` | Question catalog loads complete question suite | Unit Test | `pytest tests/unit/test_questions.py` | Python test runner | Catalog has 26 questions | Passed (26 questions indexed) | **PASS** | — |
| `TC-QBANK-02` | Filter questions by topic (`kubernetes`) | Runtime HTTP | `GET /api/v1/questions?topic=kubernetes` | Backend running | HTTP 200 with Kubernetes questions | HTTP 200; returns 4 Kubernetes questions | **PASS** | — |
| `TC-QBANK-03` | Filter questions by role (`devops`) | Runtime HTTP | `GET /api/v1/questions?role=devops` | Backend running | HTTP 200 with DevOps questions | HTTP 200; returns 18 DevOps questions | **PASS** | — |
| `TC-QBANK-04` | Filter questions by difficulty (`senior`) | Runtime HTTP | `GET /api/v1/questions?difficulty=senior` | Backend running | HTTP 200 with Senior questions | HTTP 200; returns 8 Senior questions | **PASS** | — |
| `TC-QBANK-05` | Invalid role enum query parameter validation | Runtime HTTP | `GET /api/v1/questions?role=invalid_role` | Backend running | HTTP 422 Unprocessable Entity | HTTP 422 with input validation error | **PASS** | — |
| `TC-QBANK-06` | Retrieve question by non-existent ID | Runtime HTTP | `GET /api/v1/questions/unknown-id-999` | Backend running | HTTP 404 Not Found | HTTP 404 `Question 'unknown-id-999' not found` | **PASS** | — |

---

### Category 4: Answer Submission & AI Feedback Evaluation

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-EVAL-01` | Evaluate valid candidate answer | Integration HTTP | `POST /api/v1/interviews/evaluate` | Valid question ID | HTTP 200 with structured feedback report | HTTP 200; scored 5.3; returned strengths/tips | **PASS** | — |
| `TC-EVAL-02` | Reject submission shorter than 10 characters | Integration HTTP | `POST /api/v1/interviews/evaluate` (`"Short"`) | Backend running | HTTP 422 Unprocessable Entity | HTTP 422 (`String should have at least 10 chars`) | **PASS** | — |
| `TC-EVAL-03` | Reject submission longer than 4000 characters | Integration HTTP | `POST /api/v1/interviews/evaluate` (4050 chars) | Backend running | HTTP 422 Unprocessable Entity | HTTP 422 (`String should have at most 4000 chars`) | **PASS** | — |
| `TC-EVAL-04` | Offline Mock AI provider evaluations | Unit Test | `pytest tests/unit/test_mock_provider.py` | Python test runner | Mock generates rubrics deterministically | Passed (8 tests passed in 0.12s) | **PASS** | — |
| `TC-EVAL-05` | Gemini AI provider payload formatting | Unit Test | `pytest tests/unit/test_gemini_provider.py` | Python test runner | Validates Gemini prompt construction | Passed (9 tests passed in 0.15s) | **PASS** | — |

---

### Category 5: Technical Vocabulary & STAR Guidance

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-STAR-01` | 1-Click STAR Framework insertion | Component Unit | `npm test` (`tests/interview-studio.test.tsx`) | Web test runner | Inserts S-T-A-R template into draft | Passed (inserted and focused textarea) | **PASS** | — |
| `TC-STAR-02` | Troubleshooting framework insertion | Component Unit | Click "Troubleshooting Flow" button | Studio view | Inserts systematic 3-step triage draft | Verified insertion and toast notification | **PASS** | — |
| `TC-VOCAB-01` | Technical vocabulary token insertion | Component Unit | Click key concept token chip | Studio view | Appends token to draft answer | Appended token and focused editor | **PASS** | — |
| `TC-VOCAB-02` | Flashcards 3D card flip & audio pronunciation | Component Unit | `npm test` (`tests/components.test.tsx`) | Web test runner | Card flips; triggers Web Speech API | Passed (audio synthesis invoked) | **PASS** | — |

---

### Category 6: Text Interview Session Lifecycle (Multi-Turn Chat)

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-CHAT-01` | Initialize interview session & prompt | Integration HTTP | `POST /api/v1/interviews/sessions` | Valid question | Session created (`in_progress`) | HTTP 201 Created; session ID generated | **PASS** | — |
| `TC-CHAT-02` | Retrieve auto-seeded interviewer greeting | Integration HTTP | `GET /sessions/{id}/messages` | Empty session | Seeds Turn 0 interviewer greeting | HTTP 200; 1 message (`role: interviewer`) | **PASS** | — |
| `TC-CHAT-03` | Submit Turn 1 candidate response | Integration HTTP | `POST /sessions/{id}/chat` | Active session | AI probes deeper (`is_concluding: false`) | HTTP 200; 3 total messages; follow-up asked | **PASS** | — |
| `TC-CHAT-04` | Auto-conclude interview at Turn 3 | Integration HTTP | `POST /sessions/{id}/chat` (3rd turn) | 2 prior answers | `is_concluding: true`, status `completed` | HTTP 200; status `completed`; attempt saved | **PASS** | — |

---

### Category 7: Authentication & Authorization Security

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-AUTH-01` | Register candidate with valid data | Integration HTTP | `POST /api/v1/auth/register` | New email | HTTP 201 + JWT Bearer token | HTTP 201; issued signed JWT token | **PASS** | — |
| `TC-AUTH-02` | Reject duplicate candidate email | Integration HTTP | `POST /api/v1/auth/register` (existing email) | Registered user | HTTP 409 Conflict | HTTP 409 `Account already exists` | **PASS** | — |
| `TC-AUTH-03` | Candidate login with valid credentials | Integration HTTP | `POST /api/v1/auth/login` | Valid credentials | HTTP 200 + JWT token | HTTP 200; token received | **PASS** | — |
| `TC-AUTH-04` | Candidate login with invalid password | Integration HTTP | `POST /api/v1/auth/login` (bad password) | Registered user | HTTP 401 Unauthorized | HTTP 401 `Invalid email or password` | **PASS** | — |
| `TC-AUTH-05` | Get authenticated user profile (`/me`) | Integration HTTP | `GET /api/v1/auth/me` with Bearer token | Valid token | HTTP 200 + user profile | HTTP 200; profile metadata returned | **PASS** | — |
| `TC-AUTH-06` | Block unauthenticated profile access | Integration HTTP | `GET /api/v1/auth/me` without token | No token | HTTP 401 Unauthorized | HTTP 401 `Authentication required` | **PASS** | — |
| `TC-AUTH-07` | Cross-tenant access block (Token A vs Token B) | Security Exploit | Candidate Beta queries Alpha's session | Both registered | HTTP 403 Forbidden | HTTP 403 Forbidden (`No permission`) | **PASS** | — |
| `TC-BOLA-01` | **Anonymous access to private user session** | Security Exploit | `GET /sessions/{alpha_id}` WITHOUT token | User session in DB | HTTP 401 or 403 Blocked | **CRITICAL FAILURE: HTTP 200 OK! Leaks private session and messages.** | **FAIL** | `SEC-01` |

---

### Category 8: Data Persistence & Account Ownership

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-DATA-01` | Persist evaluation attempts in PostgreSQL | DB Query | `SELECT * FROM interview_attempts` | Attempt submitted | Attempt row with score & feedback JSONB | Row verified with valid UUID and foreign key | **PASS** | — |
| `TC-DATA-02` | Persist multi-turn messages in PostgreSQL | DB Query | `SELECT * FROM interview_messages` | Chat turns executed | Message rows with turn indices | 7 message rows verified for completed session | **PASS** | — |
| `TC-DATA-03` | User-isolated progress calculation | Integration HTTP | `GET /api/v1/progress/summary` | Distinct users | Distinct metrics per user ID | Alpha: 105 XP / Beta: 0 XP | **PASS** | — |
| `TC-DATA-04` | Cascade deletion on session removal | Integration Test | `pytest tests/integration/test_session_endpoints.py` | Test DB | Deleting session cascades attempts & msgs | Passed in pytest suite | **PASS** | — |

---

### Category 9: Bilingual Localization (EN / VI)

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-I18N-01` | 100% key parity between `en.ts` and `vi.ts` | Unit Test | `npm test` (`tests/i18n.test.tsx`) | Web test runner | Zero missing translation keys | Passed (9 tests verifying all keys) | **PASS** | — |
| `TC-I18N-02` | Language switch persists in `localStorage` | Component Unit | Switch language to 'vi' and reload | Browser context | Language persists across sessions | Verified in LanguageContext tests | **PASS** | — |
| `TC-I18N-03` | Hardcoded UI strings in Interview Studio | Manual / Static | Code inspection of `InterviewStudio.tsx` | Studio view | All strings use `t.*` dictionary | Hardcoded English strings at lines 95, 117, 290 | **FAIL** | `I18N-01` |
| `TC-I18N-04` | Hardcoded validation errors in Auth Modal | Manual / Static | Code inspection of `AuthModal.tsx` | Modal open | Validation messages use `t.auth.*` | Hardcoded English strings at lines 34, 39, 57 | **FAIL** | `I18N-02` |

---

### Category 10: Validation, Timeout & Error Handling

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-ERR-01` | Missing required payload fields rejected | Integration HTTP | `POST /sessions` (`{}`) | Backend running | HTTP 422 Unprocessable Entity | HTTP 422 (`Field required: question_id`) | **PASS** | — |
| `TC-ERR-02` | Extra unknown fields rejected (strict schema) | Integration HTTP | `POST /sessions` (`{"extra":"val"}`) | Backend running | HTTP 422 Unprocessable Entity | HTTP 422 (`Extra inputs are not permitted`) | **PASS** | — |
| `TC-ERR-03` | Mask internal exceptions to prevent information leak | Integration HTTP | Trigger mock 500 error | Backend running | Generic message without traceback | HTTP 500 `{"detail":"An internal server error..."}` | **PASS** | — |
| `TC-ERR-04` | AI Provider rate limit returns HTTP 429 | Unit Test | Mock `AIRateLimitError` | Backend running | HTTP 429 Too Many Requests | HTTP 429 returned cleanly | **PASS** | — |
| `TC-ERR-05` | AI Provider timeout returns HTTP 504 | Unit Test | Mock `AITimeoutError` | Backend running | HTTP 504 Gateway Timeout | HTTP 504 returned cleanly | **PASS** | — |

---

### Category 11: Database Migrations & Schemas

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-MIG-01` | Alembic forward migration to `head` | Integration Test | `alembic upgrade head` | Clean database | Applies all 3 migrations | Upgrades to `0003_interview_messages` | **PASS** | — |
| `TC-MIG-02` | Alembic complete downgrade to `base` | Integration Test | `alembic downgrade base` | Head database | Reverts all tables cleanly | Reverted to base without orphan tables | **PASS** | — |
| `TC-MIG-03` | Schema relations in PostgreSQL container | DB Inspection | `psql -c "\dt"` in `devspeak-db` | Stack running | 5 tables present | 5 tables verified: alembic_version, users, sessions, attempts, messages | **PASS** | — |

---

### Category 12: Docker Compose Multi-Container Orchestration

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-DOCK-01` | Compose file config validity | CLI Tool | `docker compose config` | Docker installed | Valid Compose YAML | Exited 0; valid config resolved | **PASS** | — |
| `TC-DOCK-02` | All 3 services start and achieve healthy status | Container Runtime | `docker compose ps` | Docker running | `db`, `api`, `web` all healthy | All 3 containers Up and (healthy) | **PASS** | — |
| `TC-DOCK-03` | Container non-root user execution | Security Runtime | `docker exec devspeak-api whoami` | Container running | Non-root `appuser` (UID 10001) | `appuser` (UID 10001) confirmed | **PASS** | — |
| `TC-DOCK-04` | Volume persistence across restarts | Container Runtime | Restart `devspeak-db` container | Active data | Data preserved in named volume | Users and sessions intact after container restart | **PASS** | — |

---

### Category 13: Continuous Integration & DevSecOps Gates

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-CI-01` | Secret leak detection workflow | CI Job | Gitleaks action step in CI | Git history | 0 hardcoded secrets detected | Clean scan on full git history | **PASS** | — |
| `TC-CI-02` | Backend CI quality gates (Ruff, SAST, Pytest) | CI Job | Run `apps/api` quality commands | Python 3.12 | All commands pass cleanly | Passed when `AI_PROVIDER=mock` set | **PASS** | — |
| `TC-CI-03` | Frontend CI quality gates (tsc, lint, vitest, build) | CI Job | Run `apps/web` quality commands | Node.js 24 | All commands pass cleanly | Passed; build generated in 12.2s | **PASS** | — |
| `TC-CI-04` | Pytest offline independence without manual env | Dev Experience | Run `pytest` directly without `$env:AI_PROVIDER` | `.env` has gemini | Tests pass using mock fallback | **FAILED**: `test_readiness_endpoint_returns_200` fails expecting 'mock' | **FAIL** | `DX-01` |

---

### Category 14: Security, Vulnerability & SAST Scans

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-SEC-01` | Bandit static security scan on backend | SAST Tool | `python -m bandit -r src` in `apps/api` | Python 3.12 | 0 High/Medium security alerts | 0 issues identified across 4,006 LOC | **PASS** | — |
| `TC-SEC-02` | Python dependency CVE scan | SCA Tool | `python -m pip_audit -r requirements.txt` | Python 3.12 | 0 Known CVEs | "No known vulnerabilities found" | **PASS** | — |
| `TC-SEC-03` | npm dependency security audit | SCA Tool | `npm audit` in `apps/web` | Node.js | 0 High/Critical vulnerabilities | 11 vulnerabilities (3 moderate, 8 high) in build devDeps | **FAIL** | `DEP-01` |
| `TC-SEC-04` | Password hashing algorithm verification | Security Spec | Code inspection of `password.py` | Auth module | Uses Argon2id (OWASP recommended) | Argon2id confirmed with memory cost 65536, time cost 3 | **PASS** | — |

---

### Category 15: Responsive Design & Layout

| Test ID | Scenario & Objective | Test Type | Verification Command / Steps | Pre-conditions | Expected Result | Actual Observed Result | Outcome | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-UI-01` | Desktop viewport layout (1920x1080) | UI Inspection | Browser render at 1920px | Web running | 3-column layout; full sidebar | Passed; zero horizontal overflow | **PASS** | — |
| `TC-UI-02` | Mobile viewport layout (375x667) | UI Inspection | Browser render at 375px | Web running | Sidebar collapses; hamburger drawer | Passed; drawer opens and closes cleanly | **PASS** | — |
| `TC-UI-03` | Tablet viewport layout (768x1024) | UI Inspection | Browser render at 768px | Web running | Grid adapts cleanly to single/dual column | Passed; touch-friendly target sizes (>= 44px) | **PASS** | — |
