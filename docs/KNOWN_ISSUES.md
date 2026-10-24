# Known Issues & Environmental Blockers: DevSpeak AI

This document tracks known defects, technical debt, environmental blockers, and workarounds.

---

## Active Issues

### 1. Docker / WSL Not Available on Host
- **Severity**: Low (MVP can use SQLite and local Node.js process)
- **Component**: Container & Platform Infrastructure
- **Description**: Docker Desktop and WSL are not installed on the host. Local containerization and local Kubernetes (KIND/k3d) will be deferred until Milestone 2/4 or when container virtualization is configured.
- **Workaround**:
  - Milestone 1 MVP is designed to run directly on the host using native processes and SQLite fallback (`aiosqlite`), with zero dependency on Docker.
- **Status**: Documented / Open.

### 2. PowerShell Subshell PATH Refresh
- **Severity**: Low
- **Component**: Developer Shell
- **Description**: Newly installed tools in Program Files (`Git`, `node`, `gh`, `python`) may not be immediately visible in non-interactive agent PowerShell child sessions unless refreshed from registry.
- **Workaround**: Commands needing these tools should refresh `$env:Path` or invoke via absolute path:
  ```powershell
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
  ```
- **Status**: Workaround verified.

### 3. SQLite Concurrency & File-Locking Scope
- **Severity**: Low (Applicable only to local single-user development)
- **Component**: Database Persistence
- **Description**: SQLite locks the database file during write transactions. If multiple uvicorn worker processes attempt simultaneous writes, SQLite can raise database locked warnings.
- **Mitigation / Production Path**:
  - For local development, single-process async uvicorn is used with connection pooling (`check_same_thread=False`).
  - Production deployments will switch `DATABASE_URL` to PostgreSQL (`postgresql+asyncpg://...`), providing row-level locking, connection pooling, and multi-tenant scaling.
- **Status**: Architecturally managed.

### 4. Consumer Gemini Advanced ($20/mo) vs Google AI Studio API Token
- **Severity**: Informational / Operational Awareness
- **Component**: AI Provider Integration
- **Description**: Users often assume a consumer Google One AI Premium ($20/month) subscription provides programmatic API tokens for external apps. However, programmatic API calls require a developer API key generated via **Google AI Studio** (`aistudio.google.com`).
- **Mitigation**:
  - DevSpeak AI documents this distinction in `docs/OPERATIONS.md`.
  - Default mode remains `AI_PROVIDER=mock`, allowing full offline zero-cost usage.
  - If `AI_PROVIDER=gemini` is selected without a key, the backend returns a clear HTTP 503 `AIConfigurationError` instead of crashing.
- **Status**: Documented & managed.

---

## Resolved Issues

### 1. Host Machine Python Runtime Missing
- **Resolution**: Python 3.12.10 installed successfully via `winget install --id Python.Python.3.12 --source winget`. Interpreter verified at `C:\Users\Nguyen\AppData\Local\Programs\Python\Python312\python.exe`.
- **Date Resolved**: 2026-10-19.

### 2. Windows System Environment Variable `DEBUG=release` Clash
- **Resolution**: Windows host had a pre-existing system variable `DEBUG=release`, which caused Pydantic Settings boolean parser to raise validation errors. Resolved by adding `parse_debug_value` validator in `Settings` to safely coerce strings like `release`, `prod`, `debug` into boolean values.
- **Date Resolved**: 2026-10-19.

### 3. Bandit SAST B110 Empty Except Block in Config Parser
- **Severity**: Low
- **Component**: Backend Config (`apps/api/src/core/config.py`)
- **Resolution**: Replaced `try: ... except Exception: pass` with explicit handling of `json.JSONDecodeError` returning cleaned origin list without an empty `pass` statement. Re-scanned with Bandit: 0 issues identified.
- **Date Resolved**: 2026-10-19.

### 4. Next.js 15 App Router Prerender React Client Manifest Bug
- **Severity**: Medium
- **Component**: Frontend Build (`apps/web/src/app/page.tsx`)
- **Resolution**: Next.js 15 App Router threw `Could not find the module ... in the React Client Manifest` when building statically if `page.tsx` directly contained `"use client";` while running concurrently with `next dev`. Refactored `apps/web/src/app/page.tsx` as a standard Server Component wrapping `DevSpeakApp` (client component) within `LanguageProvider`. Verified `next build` passes cleanly generating 4/4 static pages.
- **Date Resolved**: 2026-10-19.
