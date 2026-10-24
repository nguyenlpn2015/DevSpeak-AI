# Session Handoff: DevSpeak AI — GCP DevOps & DevSecOps Portfolio Evolution

## 1. Current State Summary
- **Active Project**: Evolving DevSpeak AI into an enterprise-grade, cost-controlled, observable GCP DevOps & DevSecOps portfolio showcase deployed on Google Cloud Platform.
- **Completed Milestones**:
  - **Phase 0 (Audit & Baseline)**: 100% COMPLETE.
  - **Phase 1 (GCP Foundation & Budget Controls)**: 100% COMPLETE (Project: `project-12679df0-893b-4260-924`, Budget alert: 650,000 VND/mo, Region: `asia-southeast1`).
  - **Phase 2 (Terraform IaC & Multi-Environment Architecture)**: 100% COMPLETE.
  - **Phase 3 (Production Container Hardening)**: 100% COMPLETE & RUNTIME VERIFIED.
  - **Phase 4 (Artifact Registry & WIF)**: 100% COMPLETE & VERIFIED.
  - **Phase 5 (Cloud SQL & Staging Infrastructure)**: 100% COMPLETE & HARDENED.
  - **Phase 6 (Automated CI/CD with GitHub Actions & Keyless WIF)**: 100% COMPLETE & VERIFIED.
  - **Phase 7 (Production CD & High Availability Deployment)**: 100% COMPLETE & LIVE VERIFIED.
  - **Phase 8 (Public Launch Readiness Audit & v1.0.1 Hardening Release)**: 100% COMPLETE (Zero leaks, P0 fixes verified, CI/CD passed).
  - **Track B — Milestone B1 & B2 (Local GitOps, Helm, kind & Argo CD)**: 100% COMPLETE (kind cluster `devspeak-local` with Ingress-NGINX and local PostgreSQL).
  - **Track B — Milestone B3 (Ephemeral GKE IaC & GitOps CI Automation)**: 100% COMPLETE (Terraform IaC, WIF SA, CI pipeline `.github/workflows/gitops-ci.yml`).
  - **Track B — Milestone B4 (Live GKE Autopilot Provisioning, Argo CD GitOps Sync & Workload Verification)**: 100% COMPLETE:
    - GKE Autopilot cluster `devspeak-gke-portfolio` provisioned in `asia-southeast1`.
    - Local client tooling configured with `gke-gcloud-auth-plugin`.
    - Argo CD v3.5.6 installed (all 7 core pods 1/1 Running).
    - Node Artifact Registry IAM permissions bound (`roles/artifactregistry.reader`).
    - Ephemeral PostgreSQL deployed and running.
    - Alembic PreSync migration hook executed successfully, populating 26 scenarios.
    - `devspeak-api-gke` (2 replicas) & `devspeak-web-gke` (2 replicas) deployed with active HPA.
    - All 3 Argo CD applications reporting `SYNC STATUS: Synced` and `HEALTH STATUS: Healthy`.

## 2. Infrastructure Inventory & Live Access Details

### A. Ephemeral GKE Portfolio Environment (Track B — LIVE)
- **Cluster**: `devspeak-gke-portfolio` (Region: `asia-southeast1`, Mode: Autopilot, Control Plane: `34.142.190.245`)
- **Namespaces**: `argocd`, `devspeak`
- **Argo CD Dashboard Access**:
  - Run port-forward:
    ```powershell
    kubectl port-forward svc/argocd-server -n argocd 8080:443
    ```
  - Open URL: `https://localhost:8080`
  - Username: `admin`
  - Password: see `deploy/gitops/.argocd-admin-password.txt` (securely gitignored)
- **DevSpeak Web App Access**:
  - Run port-forward:
    ```powershell
    kubectl port-forward svc/devspeak-web-gke -n devspeak 3000:3000
    ```
  - Open URL: `http://localhost:3000`
- **DevSpeak Backend API Access**:
  - Run port-forward:
    ```powershell
    kubectl port-forward svc/devspeak-api-gke -n devspeak 8000:8000
    ```
  - Readiness probe: `http://localhost:8000/readyz`
  - Questions API: `http://localhost:8000/api/v1/questions`
  - Swagger Docs: `http://localhost:8000/docs`
- **GKE Teardown Command (To prevent cloud spend)**:
  ```powershell
  pwsh deploy/gitops/scripts/teardown-gke.ps1
  ```

### B. Long-Term Production Cloud Run Environment (Track A — LIVE & UNTOUCHED)
- Frontend Web UI: `https://devspeak-web-prod-ygz4gsol4q-as.a.run.app`
- Backend API: `https://devspeak-api-prod-ygz4gsol4q-as.a.run.app`
- Readiness Probe: `https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz`
- Question Catalog: `https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/api/v1/questions`

### C. Staging Cloud Run Environment
- Backend API: `https://devspeak-api-staging-ygz4gsol4q-as.a.run.app`
- Swagger Docs: `https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/docs`
- Frontend Web: `https://devspeak-web-staging-ygz4gsol4q-as.a.run.app`

### D. Local GitOps Environment (kind cluster: devspeak-local)
- Web UI: `http://localhost/`
- Backend API: `http://localhost/api/v1/questions`
- Backend Readiness Probe: `http://localhost/readyz`

### E. GCP Shared Foundation
- Project: `project-12679df0-893b-4260-924`
- Cloud SQL Instance: `devspeak-db-ef9683a6`
- Artifact Registry: `asia-southeast1-docker.pkg.dev/project-12679df0-893b-4260-924/devspeak-docker`
- WIF Pool: `projects/359194986638/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider`
- GKE Workload Identity Service Account: `devspeak-gke-sa@project-12679df0-893b-4260-924.iam.gserviceaccount.com`
