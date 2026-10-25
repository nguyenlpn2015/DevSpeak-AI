# DevSpeak AI — Production Operations Handbook

Welcome to the **DevSpeak AI Production Operations Handbook**. This comprehensive manual provides SREs, DevOps engineers, platform operators, and software maintainers with actionable runbooks, architectural specifications, incident response playbooks, and disaster recovery procedures for running DevSpeak AI across all five operational environments.

---

## 📚 Handbook Navigation Directory

| Document | Purpose & Scope | Target Audience |
| :--- | :--- | :--- |
| 🌐 **[Architecture & Environments](./architecture-and-environments.md)** | Infrastructure topology, network flows, port mappings, and dual-track environment specifications. | SREs, Cloud Architects |
| 🚀 **[CI/CD Runbooks](./cicd-runbooks.md)** | GitHub Actions pipeline mechanics, Workload Identity Federation (WIF), permissions matrix, and artifact promotion. | DevOps Engineers |
| 📦 **[Deployment Runbook](./deployment-runbook.md)** | Step-by-step procedures for deploying changes to all 5 environments (Compose, Staging, Prod, kind, GKE). | Release Engineers |
| ⏪ **[Rollback & Recovery](./rollback-and-recovery.md)** | Fast, reliable rollbacks for Cloud Run revisions, GKE workloads via GitOps revert, and database migration caveats. | On-Call Engineers |
| 📊 **[Monitoring & Alerting](./monitoring-and-alerting.md)** | Cloud Monitoring dashboards, log queries, synthetic health probes, and budget alert configurations. | SREs, Operations |
| 🚨 **[Incident Response](./incident-response.md)** | Severity definitions (P0–P3), triage runbooks, root-cause diagnostics, and post-mortem retrospective processes. | On-Call Responders |
| 🛡️ **[Security & Access Management](./security-and-access.md)** | Keyless WIF security, least-privilege IAM, Argon2id password hashing, non-root containers, and Secret Manager. | DevSecOps, Security Leads |
| 💾 **[Backup & Restore](./backup-and-restore.md)** | Cloud SQL automated backups, Point-in-Time Recovery (PITR), retention schedules, and local volume persistence. | Database Engineers |
| 🗄️ **[Database Operations](./database-operations.md)** | Alembic migrations, connection pooling, schema evolution, and migration failure recovery. | Backend Engineers |
| 💰 **[FinOps & Cost Management](./cost-management.md)** | Resource sizing, Free Tier optimization, cost attribution, scale-to-zero mechanics, and teardown runbooks. | FinOps, Tech Leads |
| 🌋 **[Disaster Recovery](./disaster-recovery.md)** | RTO/RPO targets, regional failover strategies, and complete cluster re-provisioning via Terraform. | SRE Leads |
| 🔍 **[Troubleshooting Playbook](./troubleshooting.md)** | Quick diagnostic commands, common failure symptoms across local and cloud environments, and solutions. | All Developers & SREs |
| ✅ **[Release Checklist](./release-checklist.md)** | Pre-flight quality gates, version tagging, post-deploy smoke verification, and communication checklist. | Release Managers |
| 🤝 **[On-Call Handover](./on-call-handover.md)** | Shift transition runbook, system access verification, active incident handover, and operational posture review. | On-Call Team |

---

## 🌐 The Five Environments at a Glance

DevSpeak AI is architected across two distinct paths to demonstrate both serverless container operations and cloud-native Kubernetes GitOps:

```
                            [ GitHub Actions (CI/CD) ]
                                        │
                         OIDC Token (Keyless WIF)
                                        ▼
    ┌───────────────────────── Google Cloud Platform ────────────────────────┐
    │                                                                        │
    │   [ Google Artifact Registry ] ──> Immutable Container Images (:git_sha)│
    │                                                                        │
    │   Track A (Serverless)              Track B (Kubernetes & GitOps)      │
    │   ├── Cloud Run Staging             ├── Local kind Cluster             │
    │   ├── Cloud Run Production          └── GKE Autopilot (Argo CD Sync)   │
    │   └── Cloud SQL (PostgreSQL 16)         └── Google Managed SSL Ingress │
    └────────────────────────────────────────────────────────────────────────┘
```

| # | Environment | Track | Hosting Model | Primary URL | Health Probe (`/readyz`) |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Local Docker Compose** | A | Multi-container Local Stack | `http://localhost:3001` | `http://localhost:8000/readyz` |
| **2** | **Cloud Run Staging** | A | Serverless Pre-Release Container | `https://devspeak-web-staging-ygz4gsol4q-as.a.run.app` | `https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz` |
| **3** | **Cloud Run Production** | A | Serverless High Availability | `https://devspeak-web-prod-ygz4gsol4q-as.a.run.app` | `https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz` |
| **4** | **Local kind Kubernetes** | B | Local Kubernetes (kind) + Ingress | `http://localhost/` | `http://localhost/readyz` |
| **5** | **GKE Autopilot (Prod)** | B | Managed Kubernetes + Argo CD | `https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/` | `https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/readyz` |

---

## ⚡ Standard Procedure Format

All operational procedures in this handbook follow a strict 10-point standard:
1. **Purpose & Scope**: What the procedure accomplishes and when to run it.
2. **Preconditions & Permissions**: Required tools, authentication, and IAM roles.
3. **Impact & Risk Level**: Potential service interruption or latency (Low / Medium / High / Critical).
4. **Exact Commands / UI Steps**: Copy-pasteable, verified commands.
5. **Expected Output & Success Criteria**: Exact terminal output indicating success.
6. **Verification & Post-Checks**: Probes to run after completion.
7. **Failure Symptoms & Triage**: What can go wrong and initial diagnostics.
8. **Rollback & Recovery**: Immediate steps to restore service if the operation fails.
9. **Escalation Path**: When and how to escalate.
10. **Safety Warnings**: Explicit warnings regarding destructive actions (e.g., volume removal, database drops).

---

## 🛠️ Quick Operational Commands

```powershell
# Probe health across all 5 environments (read-only, non-destructive)
pwsh deploy/gitops/scripts/smoke-test.ps1

# Run local Markdown documentation link validator
python scripts/verify-markdown-links.py

# Check local Docker Compose container statuses
docker compose ps

# Check local kind pods and ingress status
kubectl get pods,svc,ingress -A --context kind-devspeak-local

# Check GKE Autopilot production workloads
kubectl get pods,ingress,hpa -n devspeak --context gke_project-12679df0-893b-4260-924_asia-southeast1_devspeak-gke-portfolio
```
