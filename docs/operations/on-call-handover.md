# On-Call Shift Handover & Operational Continuity Runbook

## 1. Purpose & Scope

This runbook defines the structured handover protocol between departing and incoming on-call engineers to ensure operational continuity, security posture preservation, and proactive incident awareness.

---

## 2. Shift Handover Checklist (Incoming Engineer)

Before accepting primary on-call responsibility:

- [ ] **Access Verification**:
  - [ ] GitHub repository access confirmed (`nguyenlpn2015/DevSpeak-AI`).
  - [ ] Google Cloud SDK authenticated: `gcloud auth list` confirms authorized account.
  - [ ] Kubernetes context verified for GKE Autopilot:
    ```powershell
    kubectl cluster-info --context gke_project-12679df0-893b-4260-924_asia-southeast1_devspeak-gke-portfolio
    ```
  - [ ] Local kind context verified:
    ```powershell
    kubectl cluster-info --context kind-devspeak-local
    ```
- [ ] **System Health Audit**:
  - [ ] Execute read-only smoke probe across all 5 environments:
    ```powershell
    pwsh deploy/gitops/scripts/smoke-test.ps1
    ```
  - [ ] Confirm all 15 endpoints return HTTP 200 OK.
- [ ] **Active Alert & Incident Review**:
  - [ ] Review Google Cloud Monitoring alert incident log.
  - [ ] Check open GitHub Issues tagged with `bug` or `incident`.
- [ ] **FinOps Budget Review**:
  - [ ] Check current month-to-date GCP expenditure against the 650,000 VND (~$26) budget limit.
- [ ] **Recent Deployments Review**:
  - [ ] Check last 5 commits on `main` via `git log -n 5 --oneline`.
  - [ ] Review Argo CD synchronization state (`https://localhost:8080`).

---

## 3. Shift Handover Report Template

```markdown
# On-Call Shift Handover: [YYYY-MM-DD]

## 1. Transition Details
- Departing Engineer:
- Incoming Engineer:
- Shift Handover Timestamp (UTC):

## 2. Environment Status
- Docker Compose (Local): [Healthy / Degraded / Offline]
- Cloud Run Staging: [Healthy / Degraded / Offline]
- Cloud Run Production: [Healthy / Degraded / Offline]
- Local kind Cluster: [Healthy / Degraded / Offline]
- GKE Autopilot (Prod): [Healthy / Degraded / Offline]
- Smoke Probe Pass Rate: [15/15 Passed]

## 3. Operational Notes & Ongoing Anomalies
- Any active P2/P3 defects currently under investigation:
- Any scheduled maintenance or planned deployments:

## 4. FinOps Status
- Current MTD Spend: [e.g., $14.20 USD / 650,000 VND Budget]
- Budget Alert Status: [Normal / 50% / 90%]

## 5. Formal Sign-Off
- Departing Engineer: "I have transferred operational context and confirmed all probes."
- Incoming Engineer: "I have verified access, health status, and accept on-call responsibility."
```
