# Rollback & Recovery Runbook

## 1. Overview & Rollback Principles

When a production defect, critical vulnerability, or outage occurs after a release, returning the system to a known-healthy state quickly and safely is the primary objective. 

### Critical Safety Principles
- **Fast Traffic Shifting**: Route user traffic away from the defective revision immediately before attempting root-cause debugging.
- **Database Schema Caution**: **Never attempt an automatic or blind database downgrade**. A code rollback is safe; a database schema rollback (`alembic downgrade`) can destroy newly written candidate attempts or users.
- **Immutable Artifacts**: Always roll back to a previously verified immutable container tag (`:git_sha`), never a mutable `:latest` tag.

---

## 2. Procedure 1: Instant Cloud Run Rollback (Track A)

Cloud Run maintains a complete history of immutable revisions. Traffic can be shifted back to the previous healthy revision in seconds with zero downtime.

### 2.1. Preconditions & Permissions
- IAM permissions: `roles/run.admin` or `roles/run.developer` on Google Cloud project `project-12679df0-893b-4260-924`.

### 2.2. Exact Steps to Roll Back Traffic

#### Step 1: List Previous Revisions
```bash
# List recent revisions for API service
gcloud run revisions list \
  --service=devspeak-api-prod \
  --region=asia-southeast1 \
  --format="table(name,active,traffic_percent,creation_timestamp)"

# List recent revisions for Web service
gcloud run revisions list \
  --service=devspeak-web-prod \
  --region=asia-southeast1 \
  --format="table(name,active,traffic_percent,creation_timestamp)"
```

#### Step 2: Route 100% Traffic to Known-Healthy Revision
```bash
# Shift API traffic immediately to the previous revision (replace with actual revision name)
gcloud run services update-traffic devspeak-api-prod \
  --region=asia-southeast1 \
  --to-revisions=<PREVIOUS_HEALTHY_API_REVISION>=100

# Shift Web traffic immediately to the previous revision
gcloud run services update-traffic devspeak-web-prod \
  --region=asia-southeast1 \
  --to-revisions=<PREVIOUS_HEALTHY_WEB_REVISION>=100
```

#### Step 3: Validate Rollback
```powershell
pwsh deploy/gitops/scripts/smoke-test.ps1 -TargetEnvironment "prod"
```

---

## 3. Procedure 2: GitOps Rollback via Argo CD (Track B / GKE Autopilot)

In a declarative GitOps architecture, **Git is the single source of truth**. Performing a rollback on GKE Autopilot must be executed via Git commit revert to avoid configuration drift.

### 3.1. Reverting the GitOps Commit in Git (Recommended)

1. Identify the bad commit in Git log:
   ```bash
   git log -n 5 --oneline deploy/gitops/environments/gke-portfolio/
   ```
2. Revert the commit that bumped the image tag:
   ```bash
   git revert <BAD_GITOPS_COMMIT_SHA> -m 1 --no-edit
   git push origin main
   ```
3. Argo CD automatically detects the revert commit on `main`, synchronizes the desired state, and performs a rolling update back to the previous container image.

### 3.2. Emergency Immediate Rollback via Argo CD UI / CLI (Emergency Override)

If waiting for Git synchronization is too slow during an active P0 incident:

1. Connect to Argo CD server via port-forward:
   ```powershell
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   ```
2. Log in with admin credentials at `https://localhost:8080`.
3. Select application `devspeak-api-gke` $\to$ Click **History and Rollback**.
4. Select the prior healthy revision number (e.g., Revision `2`) and click **Rollback**.
5. Repeat for `devspeak-web-gke`.
6. **Post-Incident Action**: Commit the corresponding Git revert to ensure Argo CD does not overwrite your rollback on the next automated Git poll.

---

## 4. Procedure 3: Local kind Cluster Rollback (Environment 4)

```powershell
# Check Helm release revision history
helm history devspeak-api
helm history devspeak-web

# Roll back to the preceding release revision (e.g., revision 1)
helm rollback devspeak-api 1
helm rollback devspeak-web 1

# Re-run smoke test to confirm recovery
pwsh deploy/gitops/scripts/smoke-test.ps1 -TargetEnvironment "kind"
```

---

## 5. Critical Database Rollback Warnings & Decision Matrix

> [!CAUTION]
> **DATABASE SCHEMA ROLLBACK WARNING:**
> When an application deployment fails after database migrations have run, **DO NOT run `alembic downgrade -1` automatically**.
> 
> A database downgrade typically executes `DROP COLUMN` or `DROP TABLE`, which permanently destroys data collected from candidates while the new release was active.

### Database Decision Flowchart

```
                 [ Application Deployment Failed ]
                                │
               Did the migration alter schema?
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                YES                            NO
                 │                             │
    Is the schema backwards-           Roll back application
    compatible with old code?          container image immediately.
                 │
        ┌────────┴────────┐
        │                 │
       YES                NO
        │                 │
    Roll back application  P0 Incident:
    container image only.  Keep forward-compatible code;
    Schema remains at head.Hotfix the application bug.
```

1. **Backwards-Compatible Schema Changes (Additive)**:
   - If the migration added a new nullable column or created a new table (e.g., `interview_messages`), **the old application code can run safely on the newer database schema**.
   - **Action**: Roll back only the application container. Leave the database schema at `head`.
2. **Breaking Schema Changes (Destructive)**:
   - If an incompatible migration occurred, perform a point-in-time recovery (PITR) from Cloud SQL automated backups to an isolated recovery instance.
