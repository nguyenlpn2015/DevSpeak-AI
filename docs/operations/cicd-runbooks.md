# CI/CD Pipelines & DevSecOps Runbook

## 1. Overview & Pipeline Philosophy

DevSpeak AI enforces a strict separation between **Continuous Integration (Quality & Security Gates)** and **Continuous Deployment (Release Promotion)**. All delivery pipelines are executed via GitHub Actions with zero static service account keys, authenticating to Google Cloud Platform strictly through **Workload Identity Federation (WIF)**.

---

## 2. Pipeline Inventory

| Workflow File | Purpose | Trigger Conditions | Deployment Target | Authentication |
| :--- | :--- | :--- | :--- | :--- |
| **`.github/workflows/ci.yml`** | Universal CI, SAST, Linters, Unit Tests, Helm, Docker Build | Push to `main`, `dev`; PR to `main`, `dev` | None (Test Runner) | GitHub Token |
| **`.github/workflows/ci-dev.yml`** | Development CI/CD, Local Docker Stack & kind Simulation | Push to `dev`, PR to `dev`, Dispatch | Local Docker Stack & kind | GitHub Token |
| **`.github/workflows/cd-staging.yml`** | Staging CD, Container Scan, Migration, Smoke Probes | Push to `staging`, PR to `staging`, Dispatch | Cloud Run Staging | WIF (`devspeak-ci-deployer-sa`) |
| **`.github/workflows/cd-production.yml`** | Production CD, Decoupled Migration, 4-Gate Smoke Probes | Push to `main` (Branch-Locked), Dispatch | Cloud Run Production | WIF (`devspeak-prod-deployer-sa`) |
| **`.github/workflows/gitops-ci.yml`** | GitOps Image Promotion, Manifest Tag Update | Push to `main` (`apps/**`, `deploy/**`), Dispatch | GKE Autopilot (Argo CD) | WIF (`devspeak-prod-deployer-sa`) |
| **`.github/workflows/kind-ci.yml`** | Disposable kind Cluster E2E Helm Deployment Test | Push/PR to `main`, `dev` (`deploy/**`, `apps/**`), Dispatch | Disposable kind Cluster | GitHub Token |

---

## 3. Git Branching Strategy & Environment Mapping

DevSpeak AI enforces a strict 3-tier branch-to-environment topology:

```
[ Feature / Bugfix Branches ]
             │ (PR)
             ▼
      [ 'dev' Branch ] ──────────> CI/CD for Local Development
                                   • Local Docker Compose validation
                                   • Local kind cluster simulation & Ingress
             │ (PR)
             ▼
    [ 'staging' Branch ] ────────> CD for Cloud Run Staging
                                   • Pre-release verification & integration testing
                                   • Deterministic mock AI provider
             │ (PR / Release)
             ▼
     [ 'main' Branch ] ──────────> CD for Production Environments
                                   • Track A: Cloud Run Production (Branch-locked WIF)
                                   • Track B: GKE Autopilot GitOps (Argo CD continuous reconciliation)
```

---

## 3. Shared CI Architecture (`ci.yml`)

Every Pull Request and Push to `main` automatically runs six parallelized quality gates:

```
[ Push / PR to main ]
          │
          ├──> Job 1: Secret Leak Detection (Gitleaks)
          │
          ├──> Job 2: Backend Quality (Python 3.12, Ruff, Bandit SAST, pip-audit, Pytest)
          │
          ├──> Job 3: Frontend Quality (Node 24, npm ci, tsc, ESLint, Vitest, next build)
          │
          ├──> Job 4: IaC & Helm Validation (Terraform fmt, Helm lint, Helm template)
          │
          ├──> Job 5: Container Build Test (Docker Buildx local build validation)
          │
          └──> Job 6: Documentation Integrity (verify-markdown-links.py)
```

- **Execution Constraint**: If any job fails, the Pull Request is blocked from merging.
- **Offline Guarantee**: Backend and frontend tests execute 100% offline using the Deterministic Heuristic Mock AI Provider (`AI_PROVIDER=mock`), requiring zero external network calls or commercial API tokens.

---

## 4. Keyless Authentication via Workload Identity Federation (WIF)

Static GCP service account JSON keys are strictly prohibited in DevSpeak AI. GitHub Actions authenticates dynamically via OIDC token exchange:

```
[ GitHub Actions Job ]
        │
  (1) Requests OIDC Token with Audience:
      "https://iam.googleapis.com/projects/359194986638/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider"
        │
        ▼
[ Google Security Token Service (STS) ]
        │
  (2) Validates JWT signature from https://token.actions.githubusercontent.com
  (3) Asserts claims (repository, ref, issuer)
        │
        ▼
[ IAM Service Account Impersonation ]
        │
  (4) Mints short-lived OAuth 2.0 access token (valid 1 hour)
```

### Production IAM Branch-Lock Protection
In `infra/terraform/environments/prod/main.tf`, the IAM binding restricts token minting strictly to the `main` branch:
```hcl
member = "principal://iam.googleapis.com/${split("/providers/", data.terraform_remote_state.shared.outputs.wif_provider_name)[0]}/subject/repo:nguyenlpn2015/DevSpeak-AI:ref:refs/heads/main"
```
Any job attempting to impersonate `devspeak-prod-deployer-sa` from a branch other than `refs/heads/main` or a fork is immediately rejected with HTTP 403 Forbidden.

---

## 5. Artifact Promotion & Immutable Tagging Strategy

1. **Build Once, Promote Everywhere**:
   - Container images are built using Docker Buildx and tagged with the immutable commit SHA:
     - `asia-southeast1-docker.pkg.dev/project-12679df0-893b-4260-924/devspeak-docker/devspeak-api:${{ github.sha }}`
     - `asia-southeast1-docker.pkg.dev/project-12679df0-893b-4260-924/devspeak-docker/devspeak-web:${{ github.sha }}`
2. **GitOps Manifest Update (`gitops-ci.yml`)**:
   - When new container images are pushed, the workflow updates the declarative Helm values files:
     - `deploy/gitops/environments/gke-portfolio/values-api.yaml`: `tag: "${{ github.sha }}"`
     - `deploy/gitops/environments/gke-portfolio/values-web.yaml`: `tag: "${{ github.sha }}"`
   - It commits the change with `[skip ci]` to prevent recursive triggering and pushes back to `main`.
3. **Argo CD Automated Reconciliation**:
   - Argo CD detects the updated Git commit on `main`, initiates an automated sync, executes the `PreSync` Alembic database migration hook, and rolls out the new pod revision with zero downtime.

---

## 6. Required GitHub Variables & Secrets Inventory

| Variable / Secret | Type | Purpose | Required For |
| :--- | :--- | :--- | :--- |
| `GITHUB_TOKEN` | Built-in Secret | Secret scanning with Gitleaks; committing GitOps values. | `ci.yml`, `gitops-ci.yml` |
| `GCP_PROJECT_ID` | Workflow Env | `project-12679df0-893b-4260-924` | `cd-staging.yml`, `cd-production.yml` |
| `GCP_REGION` | Workflow Env | `asia-southeast1` | All CD pipelines |
| `WIF_PROVIDER` | Workflow Env | Full resource path of WIF Provider pool | All CD pipelines |
| `WIF_SERVICE_ACCOUNT` | Workflow Env | `devspeak-prod-deployer-sa` or `devspeak-ci-deployer-sa` | All CD pipelines |
| `ARTIFACT_REGISTRY` | Workflow Env | Docker repository path in Artifact Registry | All CD pipelines |

---

## 7. Decoupled Database Migration Gate

To prevent database race conditions when multiple container replicas scale up simultaneously, migrations are completely decoupled from application container startup:

```
[ Deploy Workflow ]
        │
        ▼
[ Step 1: Update Migration Job ] ──> Updates Cloud Run Job with new image (:git_sha)
        │
        ▼
[ Step 2: Execute Job with --wait ] ──> Runs 'alembic upgrade head' on Cloud SQL
        │
   ┌────┴────────────────────────┐
   │ Was migration successful?   │
   └────┬────────────────────────┘
        ├─ YES ──> [ Step 3: Deploy Cloud Run API ] ──> Routes 100% traffic
        │
        └─ NO  ──> [ PIPELINE HALTS IMMEDIATELY ] ──> Zero traffic routed to bad version
```

---

## 8. Automated 4-Gate Deployment Smoke Probes

Every production deployment automatically executes four independent verification gates before marking the release successful:

1. **Gate 1 (Readiness Probe)**: Queries `/readyz` and asserts HTTP 200 with `status: ready`.
2. **Gate 2 (Question Catalog Integrity)**: Queries `/api/v1/questions` and asserts exactly 26 curated questions are returned in the JSON payload.
3. **Gate 3 (Runtime Script Injection)**: Inspects the frontend HTML response to verify `__NEXT_PUBLIC_API_URL` correctly matches the active backend URL.
4. **Gate 4 (Strict CORS Policy Enforcement)**:
   - Validates authorized origin reflection (`Origin: https://devspeak-web-prod-...`).
   - Asserts `HTTP 204/200` on OPTIONS preflight request.
   - Asserts rejection (`Access-Control-Allow-Origin` absent) on unauthorized attacker origin (`https://evil-attacker.com`).
