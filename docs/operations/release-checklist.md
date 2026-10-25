# Production Release Checklist

## 1. Pre-Flight Quality Gates (PR $\to$ `main`)

Before any release candidate can be merged into `main`, verify:

- [ ] **Secret Scan (Gitleaks)**: Passed cleanly with 0 exposed secrets or credentials.
- [ ] **Backend Unit & Integration Tests (Pytest)**: 70/70 tests passed (`apps/api/.venv/Scripts/python -m pytest apps/api/tests`).
- [ ] **Backend Linter & Formatter (Ruff)**: `ruff check apps/api` passes with 0 errors.
- [ ] **Backend Security Scan (Bandit SAST)**: 0 High, Medium, or Low alerts (`bandit -r apps/api/src`).
- [ ] **Frontend Tests (Vitest)**: 58/58 tests passed (`npm --prefix apps/web test`).
- [ ] **Frontend TypeScript Check**: `tsc --noEmit` passes with 0 type errors.
- [ ] **Frontend Linter (ESLint)**: `eslint .` passes with 0 warnings or errors.
- [ ] **Next.js Production Build**: `npm --prefix apps/web run build` compiles standalone production build without errors.
- [ ] **IaC & Helm Validation**: `terraform fmt -check` passes; `helm lint` on both charts passes with 0 errors.
- [ ] **Documentation Link Integrity**: `python scripts/verify-markdown-links.py` verifies 100% valid relative links.

---

## 2. Staging Deployment Verification Checklist

- [ ] Merge release candidate PR to `staging` branch.
- [ ] Verify GitHub Actions workflow `.github/workflows/cd-staging.yml` completes green.
- [ ] Verify Trivy container scan: 0 critical vulnerabilities.
- [ ] Execute staging health probe:
  ```powershell
  pwsh deploy/gitops/scripts/smoke-test.ps1 -TargetEnvironment "staging"
  ```
- [ ] Perform manual sanity check on staging web app (`https://devspeak-web-staging-...a.run.app`).

---

## 3. Production Deployment & Verification Checklist

- [ ] Merge release candidate PR to `main` branch.
- [ ] GitHub Actions executes `.github/workflows/cd-production.yml`:
  - [ ] WIF OIDC token authentication succeeded.
  - [ ] Decoupled Cloud Run Job executed `alembic upgrade head` cleanly.
  - [ ] Cloud Run revisions deployed with immutable commit SHA tags.
- [ ] Automated 4-Gate smoke tests confirmed:
  - [ ] Gate 1: `/readyz` returned HTTP 200 with 26 questions loaded.
  - [ ] Gate 2: `/api/v1/questions` catalog count is 26.
  - [ ] Gate 3: Frontend injected API URL matches active backend.
  - [ ] Gate 4: Authorized CORS origin reflected; unauthorized origin rejected.
  - [ ] Gate 5: Production Swagger UI (`/docs`, `/redoc`) returns HTTP 404 (Gated).
- [ ] GitOps automated promotion (`gitops-ci.yml`) updated Helm manifests in `deploy/gitops/environments/gke-portfolio/`.
- [ ] Argo CD reconciled workloads on GKE Autopilot (Sync Status: `Synced`, Health: `Healthy`).
- [ ] Execute full 5-environment smoke verification:
  ```powershell
  pwsh deploy/gitops/scripts/smoke-test.ps1 -TargetEnvironment "all"
  ```

---

## 4. Git Tagging & Release Documentation

- [ ] Create annotated Git release tag pointing to the release commit:
  ```bash
  git tag -a v1.0.X -m "Release v1.0.X: [Summary of changes]"
  git push origin v1.0.X
  ```
- [ ] Update `docs/WORKLOG.md` and `docs/SESSION_HANDOFF.md` with release commit SHA and deployment timestamp.
- [ ] Publish GitHub Release notes linking tag and changelog.
