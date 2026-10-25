# Security & Access Management Runbook

## 1. Overview & Security Model

DevSpeak AI enforces an enterprise **DevSecOps** and **Security-First** baseline. Security controls are implemented in code, validated automatically in CI/CD, and hardened at the cloud platform level.

---

## 2. Keyless Workload Identity Federation (WIF) Architecture

DevSpeak AI eliminates static long-lived credentials (such as service account JSON keys) from GitHub Actions repositories.

### 2.1. Trust Relationship Configuration
- **WIF Pool**: `projects/359194986638/locations/global/workloadIdentityPools/github-actions-pool`
- **WIF Provider**: `.../providers/github-actions-provider`
- **Issuer**: `https://token.actions.githubusercontent.com`
- **Attribute Mapping**:
  ```text
  google.subject = assertion.sub
  attribute.actor = assertion.actor
  attribute.repository = assertion.repository
  attribute.ref = assertion.ref
  ```

### 2.2. Production Service Account Hardening & Branch Protection
Production deployment security enforces a multi-layered boundary:
- **Workload Identity Binding**: Service account `devspeak-prod-deployer-sa` is bound to the repository identity (`attribute.repository/nguyenlpn2015/DevSpeak-AI`). Any unauthorized fork or external caller is rejected by Google STS.
- **Workflow Branch Guard**: The production deployment workflow (`.github/workflows/cd-production.yml`) strictly gates `deploy-production` to `refs/heads/main`. Pull requests from forks or feature branches are evaluated only by offline `quality-gates` and `container-build-scan` without deploying.
- **Least-Privilege Roles**: The production deployer possesses `roles/run.admin` and `roles/artifactregistry.writer` strictly bounded to production resources.

---

## 3. Secret Management & Rotation Procedures

### 3.1. Google Secret Manager Inventory

| Secret Name | Secret ID in GCP | Injected Into | Rotation Frequency |
| :--- | :--- | :--- | :--- |
| **Database Password** | `devspeak-db-password` | Cloud Run API, Cloud Run Migration Job | 90 days |
| **JWT Secret Key** | `devspeak-jwt-secret` | Cloud Run API | 180 days |
| **Gemini API Key (Optional)** | `devspeak-gemini-api-key` | Cloud Run API | Annual or on compromise |

### 3.2. Step-by-Step Secret Rotation Procedure
1. Add a new version of the secret in Google Secret Manager:
   ```bash
   echo -n "<NEW_SECRET_VALUE>" | gcloud secrets versions add devspeak-jwt-secret \
     --project=project-12679df0-893b-4260-924 \
     --data-file=-
   ```
2. Cloud Run automatically picks up the latest version on the next revision launch.
3. Trigger a configuration refresh or deployment to spin up new container instances binding the new secret.
4. Verify application health via `/readyz`.
5. Destroy the old secret version once all instances have drained:
   ```bash
   gcloud secrets versions destroy <OLD_VERSION_NUMBER> \
     --secret=devspeak-jwt-secret \
     --project=project-12679df0-893b-4260-924
   ```

---

## 4. Application Cryptography & Authentication

### 4.1. Password Hashing (Argon2id)
- Passwords are salted and hashed using **Argon2id** (OWASP recommended algorithm for memory-hard password protection):
  - `time_cost`: 3 iterations
  - `memory_cost`: 65,536 KiB (64 MiB)
  - `parallelism`: 4 threads
  - `salt_len`: 16 bytes
  - `hash_len`: 32 bytes
- Provides cryptographic resistance against high-speed GPU and ASIC brute-force attacks.

### 4.2. Stateless JWT Authentication
- Algorithm: `HS256`
- Token lifespan: 1,440 minutes (24 hours)
- Payload claims: `sub` (User UUID), `exp` (expiration timestamp), `iat` (issued-at timestamp).
- Stateless verification: Signed tokens allow horizontal autoscaling across Cloud Run without shared session storage.

---

## 5. Container Image Hardening

Both production Dockerfiles follow the principle of least privilege:
- **Multi-Stage Builds**: Final runtime images contain zero compilers, build tools, or source code management binaries.
- **Non-Root Execution**:
  - `apps/api/Dockerfile`: Runs as user `appuser` (UID `10001`).
  - `apps/web/Dockerfile`: Runs as user `nextjs` (UID `1001`).
- **Minimal Base Images**:
  - API: `python:3.12-slim` (minimal Debian bookworm runtime).
  - Web: `node:24-alpine` (minimal Alpine Linux runtime).
- **Vulnerability Scanning**: Automated Trivy scans in CI fail on unpatched `CRITICAL` vulnerabilities.
