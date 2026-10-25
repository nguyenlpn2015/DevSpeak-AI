# Backup, Restore & Point-in-Time Recovery Runbook

## 1. Overview & Recovery Objectives

Data protection for DevSpeak AI focuses on safeguarding candidate user profiles, interview attempts, session message histories, and progress tracking records.

### Recovery Objectives
- **Recovery Point Objective (RPO)**: $< 5\text{ minutes}$ (guaranteed by Cloud SQL continuous Write-Ahead Log archiving).
- **Recovery Time Objective (RTO)**: $< 30\text{ minutes}$ (time required to provision an automated restore instance from backup).

---

## 2. Cloud SQL Automated Backup Configuration

The production Cloud SQL instance `devspeak-db-ef9683a6` in project `project-12679df0-893b-4260-924` is configured with:
- **Automated Daily Backups**: Enabled (daily snapshot scheduled during low-traffic window).
- **Transaction Log Retention**: **7 days** of continuous transaction logs (WAL).
- **Point-in-Time Recovery (PITR)**: **Active**. Allows restoring the database to any exact second within the 7-day retention window.
- **Deletion Protection**: Enabled (`deletion_protection = true`) in Terraform to prevent accidental destruction.

---

## 3. Step-by-Step Procedure: Point-in-Time Recovery (PITR)

> [!IMPORTANT]
> Cloud SQL does not restore a database in-place over a running instance. Instead, it provisions a **new independent instance** restored to the selected timestamp. This guarantees zero risk to the current instance while recovery is verified.

### 3.1. Preconditions & Permissions
- IAM permissions: `roles/cloudsql.admin` on project `project-12679df0-893b-4260-924`.

### 3.2. Execution Steps

#### Step 1: List Available Backups
```bash
gcloud sql backups list \
  --instance=devspeak-db-ef9683a6 \
  --project=project-12679df0-893b-4260-924
```

#### Step 2: Restore to a New Recovery Instance at Target Timestamp
```bash
# Define target recovery timestamp (RFC 3339 format in UTC)
TARGET_TIME="2026-10-25T14:30:00Z"

# Restore into a separate verification instance
gcloud sql instances clone devspeak-db-ef9683a6 devspeak-db-restored \
  --point-in-time="${TARGET_TIME}" \
  --project=project-12679df0-893b-4260-924
```

#### Step 3: Verify Data Integrity on Restored Instance
1. Connect via Cloud SQL Auth Proxy to the cloned instance:
   ```bash
   cloud-sql-proxy project-12679df0-893b-4260-924:asia-southeast1:devspeak-db-restored --port 5433
   ```
2. Verify row counts and integrity:
   ```sql
   SELECT count(*) FROM users;
   SELECT count(*) FROM interview_attempts;
   SELECT count(*) FROM question_catalog;
   ```

#### Step 4: Promote Restored Database to Production (If Necessary)
1. Update Google Secret Manager secret `devspeak-db-password` if a new password was provisioned.
2. Update Cloud Run service environment variables to point the Cloud SQL Auth Proxy connection string to `devspeak-db-restored`.
3. Re-deploy Cloud Run revisions and verify health via `/readyz`.

---

## 4. Local Environment Persistence (Docker Compose & kind)

### 4.1. Docker Compose Volume Persistence
- Data is stored in named volume `devspeak_postgres_data`.
- Persists across `docker compose down` and `docker compose up`.
- **Safe Backup Command (Local Dump)**:
  ```bash
  docker compose exec db pg_dump -U devspeak devspeak > local_backup_$(date +%F).sql
  ```
- **Safe Restore Command**:
  ```bash
  cat local_backup_*.sql | docker compose exec -T db psql -U devspeak devspeak
  ```

### 4.2. Local kind Cluster PVC
- Data is stored in Kubernetes PVC bound to `local-path-storage`.
- Persists as long as the kind cluster node container exists.
- Deleted only when `kind delete cluster --name devspeak-local` is explicitly executed.
