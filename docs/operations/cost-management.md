# FinOps & Cloud Cost Management Runbook

## 1. Overview & FinOps Philosophy

DevSpeak AI is architected under strict **FinOps (Cloud Financial Operations)** principles. The system demonstrates how a multi-cloud, high-availability architecture can operate sustainably within a minimal monthly budget ($20–$25 USD) without accidental cost overruns.

---

## 2. Monthly Infrastructure Cost Attribution (Estimates vs Reality)

| Component | Architecture Track | Monthly Base Cost | Cost Model | FinOps Optimization Implemented |
| :--- | :-: | :--- | :--- | :--- |
| **Cloud Run API & Web** | Track A | **$0.00 / month** | Serverless Pay-per-use | Configured with `min_instances = 0` (scales to 0 when idle); stays within GCP Free Tier (2M requests/mo). |
| **Cloud SQL PostgreSQL 16** | Track A | **~$7.50 / month** | Shared vCPU (`db-f1-micro`) | Automated daily backups, 10GB auto-increasing SSD storage. |
| **Artifact Registry** | Shared | **~$0.10 / month** | Storage ($0.10/GB/mo) | Standard container repository storing immutable SHA tags. |
| **Secret Manager** | Shared | **$0.00 / month** | API Operations | Under 6 active secrets; 10,000 operations free per month. |
| **GKE Autopilot Management** | Track B | **~$7.30 / month** | Cluster Management Fee | GKE Autopilot charges $0.10/hour minus $74.40 monthly cluster credit for one zonal/regional cluster. |
| **External Cloud Load Balancer** | Track B | **~$18.00 / month** | Forwarding Rules + Ingress | 1 global/regional forwarding rule ($0.025/hour = ~$18/mo). |
| **Static External IP** | Track B | **$0.00 / month** | In-Use Static IP | In-use external IP is free; unused IP incurs $0.01/hour. |
| **Estimated Total (Track A only)**| Track A | **~$7.60 / month** | Serverless Baseline | Extremely lean; ideal for permanent portfolio presence. |
| **Estimated Total (Track A + B)** | Both | **~$25–$28 / month** | Dual-Track Showcase | Active during live hiring/portfolio review cycles. |

---

## 3. Cost Control Mechanisms & Budget Alerts

### 3.1. Active Monthly Budget Thresholds
- **Budget ID**: `devspeak-budget-control`
- **Monitored Scope**: GCP Project `project-12679df0-893b-4260-924`
- **Monthly Limit**: **650,000 VND (~$26.00 USD)**
- **Automated Alerts**:
  - `50%` (325,000 VND) $\to$ Operator notification email.
  - `90%` (585,000 VND) $\to$ Urgent notification email.
  - `100%` (650,000 VND) $\to$ Critical escalation; review cluster teardown.

### 3.2. Reviewing Live Costs in Google Cloud Console
```bash
# Check current billing accounts and status
gcloud billing accounts list

# View project billing status
gcloud billing projects describe project-12679df0-893b-4260-924
```
Operator can also navigate to: `Google Cloud Console` $\to$ **Billing** $\to$ **Reports** $\to$ Group by **Service**.

---

## 4. Operator Runbook: Safe Cluster Teardown (Protecting Credits)

When active hiring interviews or portfolio reviews are not taking place for several weeks, an operator can temporarily tear down the GKE Autopilot cluster to stop the ~$18/month load balancer fee while keeping Track A (Cloud Run + Cloud SQL) 100% operational.

### 4.1. Preconditions & Warnings
> [!WARNING]
> This procedure destroys the ephemeral GKE cluster, the Load Balancer, and the GKE database pod.
> **It DOES NOT touch Track A (Cloud Run, Cloud SQL, or candidate accounts in production)**.
> When re-needed, the cluster can be spun back up in ~8 minutes via `deploy/gitops/scripts/deploy-gke.ps1`.

### 4.2. Exact Teardown Command
```powershell
# Navigate to repository root
cd D:\DEVSPEAK-AI

# Execute clean teardown script (prompts for confirmation)
pwsh deploy/gitops/scripts/teardown-gke.ps1
```

### 4.3. Post-Teardown Verification
- Verify Load Balancer is deleted:
  ```bash
  gcloud compute forwarding-rules list --regions=asia-southeast1
  ```
- Verify GKE cluster is destroyed:
  ```bash
  gcloud container clusters list --region=asia-southeast1
  ```
- Verify Track A remains healthy:
  ```powershell
  pwsh deploy/gitops/scripts/smoke-test.ps1 -TargetEnvironment "prod"
  ```
