# Database Operations & Schema Migration Runbook

## 1. Overview & Architecture

DevSpeak AI uses **PostgreSQL 16** in production (Cloud SQL) and for local multi-container development (Docker Compose), with support for **SQLite** during offline unit testing. Schema versioning is managed strictly via **Alembic** using asynchronous SQLAlchemy 2.0.

---

## 2. Migration Execution Lifecycle Across Environments

| Environment | When Executed | Execution Mechanism | Isolation & Concurrency Control |
| :--- | :--- | :--- | :--- |
| **Local Compose** | Container startup | Executed inside `apps/api/entrypoint.sh` | Single-container local run. |
| **Cloud Run Staging** | Pre-traffic gate | Dedicated Cloud Run Job (`devspeak-migration-staging`) | Executed with `--wait` before traffic switch. |
| **Cloud Run Production** | Pre-traffic gate | Dedicated Cloud Run Job (`devspeak-migration-prod`) | Executed with `--wait` before traffic switch. |
| **Local kind** | Helm install | Kubernetes Job template `job-migration.yaml` | Helm pre-install / pre-upgrade hook. |
| **GKE Autopilot** | GitOps sync | Kubernetes Job with Argo CD `PreSync` hook | Executed before web/api deployment rollout. |

---

## 3. Developing New Schema Migrations

### 3.1. Golden Rules for Production Schema Evolution
1. **Always Additive First**: Add new columns as `nullable=True` or with a non-blocking `server_default`. Never drop a column or rename a table in the same release that application code starts using it.
2. **Batch Alter Table**: Always use `op.batch_alter_table()` in Alembic scripts to maintain cross-compatibility between SQLite (unit tests) and PostgreSQL (production).
3. **No Long-Lived Locks**: Avoid `ALTER TABLE ... ADD COLUMN ... DEFAULT (expensive_function())` without testing table lock duration.

### 3.2. Step-by-Step Command to Generate a Migration
```bash
# Navigate to API directory
cd apps/api

# Create a new revision script with autogenerate
.venv/Scripts/python -m alembic revision --autogenerate -m "add_user_preferences_table"

# Inspect the generated file under apps/api/alembic/versions/
# Review and prune any unintended schema drift before committing!
```

---

## 4. Connection Pooling & Resource Sizing

DevSpeak AI connects to PostgreSQL using the high-performance asynchronous driver `asyncpg`:
- **Pool Size**: `pool_size=10` (per container replica)
- **Max Overflow**: `max_overflow=20`
- **Pool Timeout**: `pool_timeout=30` seconds
- **Pool Recycle**: `pool_recycle=1800` seconds (30 minutes) to avoid stale sockets closed by cloud firewalls.

### Sizing Calculation (Cloud Run Autoscaling)
- Max Cloud Run API Replicas: `5`
- Max connections per replica: $10 + 20 = 30$
- Theoretical maximum database connection demand: $5 \times 30 = 150$ connections.
- Cloud SQL `db-f1-micro` / `db-custom-1-3840` max connection capacity is set to `200+`, ensuring safe headroom.

---

## 5. Migration Failure Triage & Recovery

If an automated migration job fails during deployment:
1. **Pipeline Reaction**: The CI/CD deployment pipeline or Argo CD PreSync hook halts immediately. **Zero traffic is routed to the new application revision.**
2. **Diagnosis**:
   ```bash
   # Inspect Cloud Run Job execution logs
   gcloud logging read 'resource.type="cloud_run_job" AND resource.labels.job_name="devspeak-migration-prod"' \
     --limit=25 --format="table(timestamp,textPayload)"
   ```
3. **Resolution**:
   - Fix syntax or lock contention error in migration script.
   - If a migration was recorded in `alembic_version` table erroneously:
     ```sql
     -- Inspect current version hash
     SELECT version_num FROM alembic_version;
     ```
   - Re-run corrected migration job before resuming deployment.
