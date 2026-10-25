# Session Handoff: DevSpeak AI — GCP DevOps & DevSecOps Portfolio Evolution

## 1. Current State Summary
- **Active Project**: Enterprise-grade, cost-controlled, observable GCP DevOps & DevSecOps portfolio showcase deployed on Google Cloud Platform.
- **Application Release**: **v1.0.2** (AI Conversation Studio UI/UX Refinement, WIF Security Hardening, and HTTPS GKE Autopilot Showcase).
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
  - **Phase 9 (Release v1.0.2 — Studio UI Refinement & SSL Production Ingress)**: 100% COMPLETE:
    - AI Conversation & Practice Studio redesigned with 3 balanced columns, independent custom scrollbars, and pinned response controls.
    - Workload Identity Federation IAM binding hardened to restrict production deployment triggers strictly to `refs/heads/main`.
    - Ingress on GKE Autopilot configured with Google Managed Certificate (`devspeak-endpoints-ssl`), providing official public HTTPS via `devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog`.
    - All 15 endpoints across 5 operational environments actively probed and verified healthy.

---

## 2. Infrastructure Inventory & Live Access Details (5 Operational Environments)

### Environment 1: Local Docker Compose (Track A — Local Baseline)
- **Web Frontend (PWA)**: [http://localhost:3001](http://localhost:3001)
- **FastAPI REST API**: [http://localhost:8000](http://localhost:8000)
- **Readiness Health Probe**: [http://localhost:8000/readyz](http://localhost:8000/readyz)
- **Question Catalog**: [http://localhost:8000/api/v1/questions](http://localhost:8000/api/v1/questions)
- **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Environment 2: GCP Cloud Run Staging (Track A — Serverless Pre-Release)
- **Web Frontend (PWA)**: [https://devspeak-web-staging-ygz4gsol4q-as.a.run.app](https://devspeak-web-staging-ygz4gsol4q-as.a.run.app)
- **FastAPI REST API**: [https://devspeak-api-staging-ygz4gsol4q-as.a.run.app](https://devspeak-api-staging-ygz4gsol4q-as.a.run.app)
- **Readiness Health Probe**: [https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz](https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz)
- **Question Catalog**: [https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/api/v1/questions](https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/api/v1/questions)
- **Swagger Documentation**: [https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/docs](https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/docs)

### Environment 3: GCP Cloud Run Production (Track A — Serverless High Availability)
- **Web Frontend (PWA)**: [https://devspeak-web-prod-ygz4gsol4q-as.a.run.app](https://devspeak-web-prod-ygz4gsol4q-as.a.run.app)
- **FastAPI REST API**: [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app)
- **Readiness Health Probe**: [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz)
- **Question Catalog**: [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/api/v1/questions](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/api/v1/questions)
- **Security Posture**: Production documentation endpoints (`/docs`, `/redoc`, `/openapi.json`) are automatically disabled (HTTP 404).

### Environment 4: Local Kubernetes kind Cluster (Track B — Local GitOps)
- **Cluster Name**: `devspeak-local`
- **Ingress Controller**: Ingress-NGINX on port 80
- **Web Frontend (PWA)**: [http://localhost/](http://localhost/)
- **FastAPI REST API Probe**: [http://localhost/readyz](http://localhost/readyz)
- **Question Catalog**: [http://localhost/api/v1/questions](http://localhost/api/v1/questions)

### Environment 5: GCP GKE Autopilot (Track B — Kubernetes & GitOps Showcase)
- **Public Domain (Google Managed SSL)**: [https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/](https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/)
- **API Questions Endpoint**: [https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/api/v1/questions](https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/api/v1/questions)
- **Readiness Health Probe**: [https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/readyz](https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/readyz)
- **Cluster Details**:
  - Cluster: `devspeak-gke-portfolio` (Region: `asia-southeast1`, Mode: Autopilot, Control Plane: `34.142.190.245`)
  - Namespaces: `argocd`, `devspeak`
  - Replicas: 2 Web pods, 2 API pods (with active HPA)
- **Argo CD Dashboard (Local Port-Forward)**:
  ```powershell
  kubectl port-forward svc/argocd-server -n argocd 8080:443
  ```
  URL: `https://localhost:8080` (Username: `admin`, Password in `deploy/gitops/.argocd-admin-password.txt`)
- **Cost Protection Teardown Command**:
  ```powershell
  pwsh deploy/gitops/scripts/teardown-gke.ps1
  ```

---

## 3. Shared GCP Infrastructure Foundation
- **Project ID**: `project-12679df0-893b-4260-924`
- **Region**: `asia-southeast1` (Singapore)
- **Cloud SQL Instance**: `devspeak-db-ef9683a6` (PostgreSQL 16, automated backups & PITR active)
- **Artifact Registry**: `asia-southeast1-docker.pkg.dev/project-12679df0-893b-4260-924/devspeak-docker`
- **Workload Identity Pool**: `projects/359194986638/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider`
- **GKE Workload Identity SA**: `devspeak-gke-sa@project-12679df0-893b-4260-924.iam.gserviceaccount.com`
- **Google Cloud Endpoints Domain**: `devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog`
