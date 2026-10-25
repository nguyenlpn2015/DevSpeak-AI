# Deployment Runbook Across Five Environments

## 1. Overview & Scope

This runbook outlines the exact operational procedures for deploying DevSpeak AI to all five target environments. Each procedure includes preconditions, exact commands, verification steps, failure troubleshooting, and rollback guidelines.

---

## 2. Deployment Procedure 1: Local Docker Compose (Environment 1)

### 2.1. Purpose & Scope
Launches the full three-tier application stack (Next.js Web, FastAPI REST, PostgreSQL 16) on a local development workstation.

### 2.2. Preconditions & Permissions
- Host requirements: Docker Engine v24+, Docker Compose v2.20+, 4GB available RAM.
- Configuration: Verify `.env.example` has been copied to root `.env` or defaults are accepted.

### 2.3. Impact & Risk Level
- **Risk**: Low (isolated local workstation).
- **Service Disruption**: None to external environments.

### 2.4. Exact Commands
```powershell
# Navigate to repository root
cd D:\DEVSPEAK-AI

# Build images and start all multi-stage containers in background
docker compose up -d --build

# Inspect running container status
docker compose ps
```

### 2.5. Expected Output & Success Criteria
```text
NAME           IMAGE               STATUS                  PORTS
devspeak-api   devspeak-api        Up (healthy)            0.0.0.0:8000->8000/tcp
devspeak-db    postgres:16-alpine  Up (healthy)            5432/tcp
devspeak-web   devspeak-web        Up (healthy)            0.0.0.0:3001->3001/tcp
```

### 2.6. Verification & Post-Checks
```powershell
# Verify API readiness probe
Invoke-RestMethod -Uri "http://localhost:8000/readyz"
# Expected: @{status="ready"; questions_loaded=26}

# Verify Web frontend
(Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing).StatusCode
# Expected: 200
```

### 2.7. Failure Symptoms & Troubleshooting
- **Symptom: `devspeak-api` restarting in CrashLoop**: Database not yet healthy. Check logs: `docker compose logs api`.
- **Symptom: Port 8000 or 3001 already in use**: Identify occupying process via `Get-NetTCPConnection -LocalPort 8000` and terminate or adjust mapping.

### 2.8. Rollback & Shutdown
```powershell
# Safe shutdown (preserves database state in Docker volume)
docker compose down

# DO NOT append '-v' unless you explicitly want to wipe local test database!
```

---

## 3. Deployment Procedure 2: Cloud Run Staging (Environment 2)

### 3.1. Purpose & Scope
Deploys candidate releases to the isolated Google Cloud Run staging environment for integration and QA validation.

### 3.2. Preconditions & Permissions
- GitHub repository branch: `staging`
- IAM permissions: Service account `devspeak-ci-deployer-sa` with `roles/run.developer` and `roles/artifactregistry.writer`.

### 3.3. Impact & Risk Level
- **Risk**: Low (isolated staging project/service).
- **Service Disruption**: Staging traffic only.

### 3.4. Exact Execution Steps
1. Create a release candidate PR targeted at the `staging` branch.
2. Ensure all quality gates in `.github/workflows/cd-staging.yml` pass.
3. Merge the PR or trigger the workflow manually:
   - Navigate to GitHub Actions $\to$ `DevSpeak AI - Staging Continuous Deployment`.
   - Click **Run workflow** $\to$ Select branch `staging`.

### 3.5. Expected Output & Success Criteria
- GitHub Actions logs indicate:
  - Container images built and tagged with commit SHA.
  - Trivy container security scan: 0 critical vulnerabilities.
  - Cloud Run services updated:
    - Web: `https://devspeak-web-staging-ygz4gsol4q-as.a.run.app`
    - API: `https://devspeak-api-staging-ygz4gsol4q-as.a.run.app`
  - Automated smoke test passes with HTTP 200.

### 3.6. Verification & Post-Checks
```powershell
pwsh deploy/gitops/scripts/smoke-test.ps1 -TargetEnvironment "staging"
```

---

## 4. Deployment Procedure 3: Cloud Run Production (Environment 3)

### 4.1. Purpose & Scope
Deploys verified release candidates to the live, high-availability production Cloud Run environment with automated database migrations and 4-gate verification.

### 4.2. Preconditions & Permissions
- Branch requirement: **Strictly `refs/heads/main`** (enforced by Google Cloud IAM WIF binding).
- Service account: `devspeak-prod-deployer-sa`.
- All automated CI checks in `ci.yml` must be passing.

### 4.3. Impact & Risk Level
- **Risk**: High (Production user-facing system).
- **Service Disruption**: Zero downtime (traffic switching via Cloud Run revisions).

### 4.4. Exact Execution Steps
1. Open a PR from your feature branch to `main`.
2. Wait for all 6 quality gates in `ci.yml` to complete with green checkmarks.
3. Obtain peer review and merge PR into `main`.
4. GitHub Actions automatically triggers `.github/workflows/cd-production.yml`:
   - Step 1: Quality gates and SAST verification.
   - Step 2: Container hardening and Trivy vulnerability scan.
   - Step 3: WIF authentication via OIDC token.
   - Step 4: Ephemeral Cloud Run Job runs `alembic upgrade head` on Cloud SQL.
   - Step 5: Deploys `devspeak-api-prod` and `devspeak-web-prod`.
   - Step 6: Executes 4-gate smoke validation.

### 4.5. Expected Output & Success Criteria
- Deployment completes with green checkmarks across all steps.
- Cloud Run routes 100% of production traffic to the new revision.
- 4-Gate smoke tests confirm:
  - `/readyz` returns HTTP 200.
  - Question count = 26.
  - CORS authorized origin reflected; attacker origin rejected.
  - Swagger documentation is gated (HTTP 404).

### 4.6. Verification & Post-Checks
```powershell
pwsh deploy/gitops/scripts/smoke-test.ps1 -TargetEnvironment "prod"
```

---

## 5. Deployment Procedure 4: Local kind Kubernetes (Environment 4)

### 5.1. Purpose & Scope
Provisions a local Kubernetes cluster using `kind`, configures Ingress-NGINX on port 80, and installs DevSpeak AI via Helm charts.

### 5.2. Preconditions & Permissions
- Tools: `kind`, `kubectl`, `helm`, `docker`.

### 5.3. Exact Execution Steps
```powershell
# 1. Run automated cluster setup script
pwsh deploy/gitops/scripts/setup-local.ps1

# 2. Build local container images
docker build -t devspeak-api:local apps/api
docker build -t devspeak-web:local --build-arg NEXT_PUBLIC_API_URL=http://localhost/ apps/web

# 3. Load images into kind cluster
kind load docker-image devspeak-api:local --name devspeak-local
kind load docker-image devspeak-web:local --name devspeak-local

# 4. Deploy via Helm
helm upgrade --install devspeak-api deploy/gitops/charts/devspeak-api `
  -f deploy/gitops/environments/local-kind/values-api.yaml `
  --set image.repository=devspeak-api,image.tag=local,image.pullPolicy=Never

helm upgrade --install devspeak-web deploy/gitops/charts/devspeak-web `
  -f deploy/gitops/environments/local-kind/values-web.yaml `
  --set image.repository=devspeak-web,image.tag=local,image.pullPolicy=Never

# 5. Apply Ingress routing
kubectl apply -f deploy/gitops/environments/local-kind/ingress-local.yaml
```

### 5.4. Verification & Post-Checks
```powershell
pwsh deploy/gitops/scripts/smoke-test.ps1 -TargetEnvironment "kind"
```

---

## 6. Deployment Procedure 5: GKE Autopilot via GitOps & Argo CD (Environment 5)

### 6.1. Purpose & Scope
Deploys and updates the flagship Kubernetes production showcase environment on GKE Autopilot using declarative GitOps managed by Argo CD.

### 6.2. Preconditions & Permissions
- Cluster: `devspeak-gke-portfolio` in `asia-southeast1`.
- Argo CD: Core controllers running in namespace `argocd`.

### 6.3. Exact Execution Steps
1. Push approved code changes to `main`.
2. `.github/workflows/gitops-ci.yml` builds immutable container images (`:${{ github.sha }}`) and pushes to Artifact Registry.
3. The workflow automatically updates `values-api.yaml` and `values-web.yaml` under `deploy/gitops/environments/gke-portfolio/` with the new tag.
4. The workflow commits and pushes the updated desired state to `main` with `[skip ci]`.
5. Argo CD detects the commit, initiates reconciliation, runs the Alembic `PreSync` migration hook, and performs a rolling update of the API and Web deployments.

### 6.4. Verification & Post-Checks
```powershell
# Verify public HTTPS endpoint
Invoke-RestMethod -Uri "https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/readyz"
# Expected: @{status="ready"; questions_loaded=26}

# Check Argo CD sync status via port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Navigate to https://localhost:8080 (Status: Synced & Healthy)
```
