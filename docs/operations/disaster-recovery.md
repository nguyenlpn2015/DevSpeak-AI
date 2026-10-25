# Disaster Recovery (DR) & Regional Resilience Runbook

## 1. Overview & Disaster Scenarios

This runbook defines the procedures for recovering DevSpeak AI from catastrophic events, including regional cloud outages, accidental infrastructure deletion, or corrupt deployments.

### Disaster Scenarios Addressed
1. **Scenario 1: Accidental Resource Deletion (Infrastructure Loss)**: Terraform modules rebuild all services.
2. **Scenario 2: Data Corruption / Ransomware**: Cloud SQL Point-in-Time Recovery restores state.
3. **Scenario 3: Regional Cloud Outage (`asia-southeast1`)**: Failover to an alternate region (e.g., `us-central1`).

---

## 2. Recovery Objectives

| Metric | Target | Rationale & Mechanism |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | **$\le 5$ minutes** | Continuous transaction log (WAL) archiving in Cloud SQL enables point-in-time rollback to minutes before corruption. |
| **Recovery Time Objective (RTO)** | **$\le 30$ minutes** | Declarative Terraform modules and automated Helm/Argo CD manifests allow re-provisioning the complete stack in under 30 minutes. |

---

## 3. Disaster Recovery Plan: Rebuilding Infrastructure from Scratch

If all cloud resources in `project-12679df0-893b-4260-924` are lost or deleted:

### Step 1: Re-apply Shared Infrastructure (WIF & Artifact Registry)
```bash
cd infra/terraform/environments/shared
terraform init
terraform apply -auto-approve
```
*Outputs: WIF Provider name, Artifact Registry repository URL, deployer service account.*

### Step 2: Restore Database & Secrets
```bash
cd ../prod
terraform init
# If recovering from existing Cloud SQL backup, update instance name in main.tf
terraform apply -target=module.secret_manager -auto-approve
terraform apply -target=module.cloud_sql_instance -target=module.cloud_sql_database -auto-approve
```

### Step 3: Run Database Migrations
```bash
# Execute Alembic migration from administrative workstation or ephemeral Cloud Run Job
cd ../../../apps/api
alembic upgrade head
```

### Step 4: Re-deploy Serverless Workloads (Track A)
```bash
cd ../../infra/terraform/environments/prod
terraform apply -auto-approve
```

### Step 5: Re-provision Kubernetes GitOps Cluster (Track B)
```powershell
# Run automated provisioning script
pwsh deploy/gitops/scripts/deploy-gke.ps1 -AutoApprove
```

### Step 6: Verify System Health
```powershell
pwsh deploy/gitops/scripts/smoke-test.ps1 -TargetEnvironment "all"
```
