# DevSpeak AI — Google Cloud Platform Cost Estimate & Budget Plan

**Target Budget**: $300 Google Cloud Free Trial Credit  
**Target Environment**: Production-Minded Portfolio Showcase  
**Recommended Region**: `asia-southeast1` (Singapore) or `us-central1` (Iowa)  
**Cost Governance Policy**: Scale-to-Zero Compute, Minimal Footprint Database, Zero Persistent Idle Overhead  

---

## 1. Executive Summary & Budget Verdict

The user possesses a **$300 Free Trial credit**. This credit is a finite resource that must be safeguarded. Uncontrolled provisioning (such as standard GKE clusters, high-availability multi-zone databases, or Cloud NAT gateways) can exhaust $300 in less than 30 days.

By adopting **Cloud Run scale-to-zero compute** combined with a **micro-tier Cloud SQL instance (`db-f1-micro`)**, the total monthly operating cost for DevSpeak AI is estimated at **$10.50 – $15.00 per month**.

```
Total Available Credit:      $300.00
Estimated Monthly Burn:       ~$12.50 / month
Projected Operational Runway: 20+ Months (well beyond the 90-day trial period)
Percentage of Credit Used:    < 5% per month
```

---

## 2. Resource-by-Resource Monthly Cost Analysis

| GCP Service | Resource & Configuration | Free Tier Allowance | Unit Pricing | Estimated Monthly Cost | Cost Category |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloud Run (Frontend)** | `devspeak-web` (1 vCPU, 512MB RAM, `min_instances=0`, `max_instances=2`) | First 2M requests/mo, 360,000 vCPU-sec, 180,000 GiB-sec free | $0.00002400 / vCPU-sec, $0.00000250 / GiB-sec | **$0.00** (Within Free Tier for portfolio traffic) | Usage-Based (Scale-to-zero) |
| **Cloud Run (Backend)** | `devspeak-api` (1 vCPU, 512MB RAM, `min_instances=0`, `max_instances=3`) | Covered under shared 2M requests/mo Cloud Run free tier | $0.00002400 / vCPU-sec, $0.00000250 / GiB-sec | **$0.00 – $1.00** | Usage-Based (Scale-to-zero) |
| **Cloud SQL for PostgreSQL** | Instance: `db-f1-micro` (1 shared vCPU, 0.6 GB RAM, 10 GB SSD, Single-zone, NO HA) | No Free Tier for Cloud SQL instances | ~$0.0130 / hour compute + $0.17 / GB-mo storage | **$10.50** (~$9.36 compute + $1.14 storage) | **Persistent** |
| **Artifact Registry** | Standard Docker repository (`devspeak-docker`) with cleanup policy (keep last 3 tags) | 0.5 GB storage free / mo | $0.10 / GB-month | **$0.05 – $0.10** | Usage-Based |
| **Secret Manager** | 4 Secrets (JWT, Gemini, DB password, DB URL), 6 active versions | 6 active secret versions & 10,000 access ops free / mo | $0.06 / secret version / mo | **$0.00** (Within Free Tier) | Usage-Based |
| **Cloud Storage** | GCS bucket for Terraform remote state (`devspeak-tf-state`), 1 bucket, ~5 MB state | 5 GB-mo Regional storage free in select US regions | $0.020 / GB-mo | **$0.01** | Persistent |
| **Network Egress** | Outbound traffic from Cloud Run to clients and Google AI Studio | First 1 GB / mo free to internet worldwide | $0.12 / GB thereafter | **$0.20 – $0.50** | Usage-Based |
| **Cloud Logging & Monitoring** | Structured JSON container logs & operational metrics | First 50 GB logs free / mo; First 150 MB metrics free | $0.50 / GB thereafter | **$0.00** (Within Free Tier) | Usage-Based |
| **Google Gemini API** | Model: `gemini-2.0-flash` (via Google AI Studio) | 15 RPM, 1,500 requests / day free | $0.10 / 1M input tokens, $0.40 / 1M output tokens | **$0.00** (Within Google AI Studio free tier) | Usage-Based |
| **TOTAL ESTIMATED COST** | — | — | — | **$10.76 – $12.11 / month** | **Safe & Controlled** |

---

## 3. Database Machine Tier Evaluation: `db-f1-micro` vs `db-custom-1-3840`

| Criteria | Option A: `db-f1-micro` (Recommended) | Option B: `db-custom-1-3840` (Production Dedicated) |
| :--- | :--- | :--- |
| **vCPU & RAM** | Shared vCPU, 0.6 GB RAM | 1 Dedicated vCPU, 3.75 GB RAM |
| **Monthly Cost** | **~$9.36 / month** | **~$52.50 / month** |
| **Impact on $300 Credit** | Uses ~3.1% of credit per month | Uses ~17.5% of credit per month |
| **Connection Capacity** | Up to 25 concurrent connections | Up to 100 concurrent connections |
| **Suitability for DevSpeak** | **Ideal for Portfolio & Demo**: Easily supports candidate sessions, attempts, and multi-turn messages with SQLAlchemy connection pool (`pool_size=5`). | Over-provisioned for a portfolio showcase; burns budget unnecessarily. |
| **Recommendation** | **ADOPT OPTION A**. Maintain `db-f1-micro` with 10 GB SSD storage. | Reject for initial deployment. Revisit only if load tests prove memory exhaustion. |

---

## 4. Prohibited Resources & Anti-Patterns (What We Will NEVER Deploy)

To guarantee zero surprise bills, the following resource types are strictly prohibited from the Terraform manifests:

1. ❌ **Google Kubernetes Engine (GKE) Cluster**:
   - GKE imposes a flat **$74.40 / month** cluster management fee, plus at least 2 compute nodes ($60+/mo), instantly consuming over 45% of the total trial credit in month 1 alone.
   - *Policy*: Deferred to an optional, approval-gated learning lab in Phase 12.
2. ❌ **Cloud NAT & Compute Engine VMs**:
   - Cloud NAT charges ~$32.00 / month flat gateway fee even when zero bytes are transferred.
   - *Policy*: Use direct serverless egress and Cloud Run built-in connector.
3. ❌ **Global External HTTP(S) Load Balancer Forwarding Rules**:
   - Charges ~$18.00 / month minimum for forwarding rules.
   - *Policy*: Use Cloud Run's native HTTPS service URLs (`*.a.run.app`) which include free Google-managed TLS certificates and DDoS protection.
4. ❌ **Cloud SQL High Availability (HA) Failover Replicas**:
   - Doubles database compute and storage costs (adds ~$10–$50/mo).
   - *Policy*: Single-zone deployment with daily automated backups.
5. ❌ **GPU Workloads**:
   - Charges $0.50 – $3.50+ per hour ($350 – $2,500/mo).
   - *Policy*: All AI evaluation is delegated to external serverless Gemini API or local Mock. Zero GPUs.

---

## 5. Budget Alerts & Threshold Recommendations

While Google Cloud budget alerts do **not** automatically terminate resources (they notify, not kill), they provide critical early warning signals.

We recommend setting an aggressive internal budget cap in Google Cloud Console:
- **Budget Target**: **$25.00 / month**
- **Alert Triggers**:
  - `50% ($12.50)`: Informational notification (indicates expected normal monthly burn).
  - `75% ($18.75)`: Early warning notification.
  - `90% ($22.50)`: Urgent investigation required.
  - `100% ($25.00)`: Immediate intervention required to verify no rogue resource was created.

---

## 6. Safe Teardown & Data Preservation Playbook

When the portfolio demonstration period concludes, or if the user chooses to pause operations:

### Step 1: Export Database Backup (Zero Data Loss)
```bash
# Export PostgreSQL database to a GCS bucket before destroying Cloud SQL
gcloud sql export sql devspeak-db gs://devspeak-tf-state/backups/devspeak_backup_$(date +%Y%m%d).sql \
    --database=devspeak
```

### Step 2: Scale Cloud Run to Zero
```bash
# Ensure Cloud Run instances are at 0 to incur zero compute charges
gcloud run services update devspeak-api --min-instances=0 --max-instances=0 --region=asia-southeast1
gcloud run services update devspeak-web --min-instances=0 --max-instances=0 --region=asia-southeast1
```

### Step 3: Terraform Controlled Teardown
```bash
cd infra/terraform/environments/prod
terraform destroy -target=module.cloud_run -target=module.cloud_sql
```
> [!CAUTION]
> Never delete the Terraform state bucket or Secret Manager secrets until database dumps are verified on local disk.
