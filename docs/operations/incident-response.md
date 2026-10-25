# Incident Response Playbook

## 1. Incident Severity Classification

| Severity Level | Definition | Target MTTA | Target MTTR | Examples |
| :--- | :--- | :--- | :--- | :--- |
| **P0 (Critical)** | Complete production outage affecting all candidates; data corruption; exposed production secrets. | $< 15\text{ min}$ | $< 1\text{ hour}$ | Cloud Run Prod unreachable; Database down; Google SSL expired; Secret leaked on GitHub. |
| **P1 (High)** | Major functional degradation; significant subset of candidates blocked from practicing; staging down. | $< 30\text{ min}$ | $< 4\text{ hours}$ | AI scoring engine failing 500; GKE Ingress routing error; candidate registration failing. |
| **P2 (Medium)** | Minor feature failure; workaround available; performance degradation. | $< 2\text{ hours}$ | $< 24\text{ hours}$ | Audio voice synthesis failing on Safari; character counter mismatch; slow API responses. |
| **P3 (Low)** | Cosmetic UI glitch; minor documentation discrepancy; non-blocking bug. | Next business day | Next sprint release | Typo in question catalog; minor padding inconsistency in responsive view. |

---

## 2. Standard Triage Workflow

```
[ Alert / Incident Trigger ]
            │
            ▼
    1. Acknowledge & Assess Severity (P0, P1, P2, P3)
            │
            ▼
    2. Mitigate Immediately (Rollback to known-good revision / Failover)
            │
            ▼
    3. Investigate Root Cause (Logs Explorer, Probes, Pod Events)
            │
            ▼
    4. Implement Permanent Fix & Add Regression Test
            │
            ▼
    5. Conduct Post-Mortem Retrospective & Update Runbooks
```

---

## 3. Incident Playbooks

### Playbook 1: API Returns HTTP 500 / 502 / 503
1. **Initial Probe**:
   ```bash
   curl -sv https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz
   ```
2. **Log Inspection**:
   - Query Cloud Run Logs for HTTP 500 errors (see [monitoring-and-alerting.md](./monitoring-and-alerting.md#31-filter-api-errors-http-5xx-server-errors)).
3. **Common Root Causes**:
   - Database connection timeout $\to$ verify Cloud SQL instance state.
   - Unhandled exception in evaluation endpoint $\to$ check payload schema.
4. **Immediate Mitigation**:
   - Shift traffic back to previous Cloud Run revision via [rollback-and-recovery.md](./rollback-and-recovery.md#2-procedure-1-instant-cloud-run-rollback-track-a).

### Playbook 2: Frontend Cannot Reach Backend (CORS Blocked)
1. **Symptom**: Browser console shows `Access to fetch at ... has been blocked by CORS policy`.
2. **Diagnosis**:
   - Query backend `/readyz` directly to ensure backend is running.
   - Inspect backend CORS settings in `apps/api/src/core/config.py` and Cloud Run environment variable `CORS_ORIGINS`.
3. **Resolution**:
   - Update `CORS_ORIGINS` in Terraform or Cloud Run revision to include the exact frontend domain (including protocol and port without trailing slash).

### Playbook 3: Kubernetes Pods in `CrashLoopBackOff` or `OOMKilled` (Track B)
1. **Diagnosis**:
   ```powershell
   # Inspect pod status and exit code
   kubectl describe pod -l app.kubernetes.io/name=devspeak-api -n devspeak

   # Check previous container termination logs
   kubectl logs -l app.kubernetes.io/name=devspeak-api -n devspeak --previous --tail=50
   ```
2. **Analysis**:
   - **Exit Code 137**: Indicates `OOMKilled` (container exceeded cgroup memory limit).
     - *Action*: Increase `resources.limits.memory` in `deploy/gitops/environments/gke-portfolio/values-api.yaml`.
   - **Exit Code 1**: Application crash on startup.
     - *Action*: Inspect stack trace; verify database credentials or migration status.

### Playbook 4: Argo CD Application Status `Degraded` or `OutOfSync`
1. **Diagnosis**:
   ```powershell
   kubectl get applications -n argocd
   ```
2. **Triage**:
   - Run port-forward and open Argo CD dashboard (`https://localhost:8080`).
   - Check sync error message (e.g., manifest parsing error, immutable field update blocked).
3. **Resolution**:
   - If `PreSync` migration hook failed: check migration pod logs `kubectl logs -n devspeak job/devspeak-api-gke-migration-...`.
   - Resolve database lock or migration error, then click **Sync** in Argo CD.

### Playbook 5: Suspected Secret Leakage
1. **Immediate Revocation**:
   - If Google Cloud Service Account key or token leaked: immediately disable the service account in Cloud IAM console or delete the key.
2. **Rotate Secrets in Google Secret Manager**:
   - Add a new version of the secret (`gcloud secrets versions add ...`).
   - Re-deploy Cloud Run revisions to bind the new secret version.
3. **Git History Scrubbing**:
   - If committed to Git, use `git-filter-repo` or BFG Repo-Cleaner to scrub the commit from history and force-push sanitized branch with approval.

---

## 4. Post-Mortem Retrospective Template

Every P0 or P1 incident requires an blameless post-mortem retrospective within 48 hours:

```markdown
# Incident Retrospective: [YYYY-MM-DD Title]

## Executive Summary
- Incident Lead:
- Duration: [Start UTC - Resolution UTC]
- Severity: [P0 / P1]
- Customer Impact:

## Root Cause Analysis (5 Whys)
1. Why did the outage occur?
2. Why was that condition present?
3. Why did automated tests not detect it?
4. Why did monitoring not alert sooner?
5. Why was the system vulnerable?

## Timeline of Events (UTC)
- HH:MM - Anomaly detected / alert fired
- HH:MM - Triage initiated
- HH:MM - Mitigation applied (traffic rolled back)
- HH:MM - Full recovery verified

## Remediation Action Items
- [ ] Action 1: Add automated regression test (Owner / Due Date)
- [ ] Action 2: Update monitoring alert threshold (Owner / Due Date)
- [ ] Action 3: Revise runbook documentation (Owner / Due Date)
```
