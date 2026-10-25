# Monitoring, Observability & Alerting Runbook

## 1. Overview & Observability Stack

DevSpeak AI employs a layered observability framework combining Google Cloud Monitoring, Google Cloud Logging, synthetic readiness probes, and proactive budget anomaly alerting.

---

## 2. Key Service Level Indicators (SLIs)

| Metric | Target Standard | Metric Filter in Cloud Monitoring |
| :--- | :--- | :--- |
| **API Availability** | $\ge 99.5\%$ | `run.googleapis.com/request_count` grouped by `response_code_class` |
| **API Latency (p95)** | $\le 800\text{ ms}$ (Mock AI) | `run.googleapis.com/request_latencies` (percentile 95) |
| **Readiness Health** | 100% OK 200 | Synthetic probe polling `/readyz` |
| **Container Memory** | $\le 80\%$ utilization | `container.googleapis.com/container/memory/used_bytes` |
| **Database Connections** | $\le 80\%$ pool capacity | `cloudsql.googleapis.com/database/postgresql/num_backends` |

---

## 3. Essential Google Cloud Logging Queries (Logs Explorer)

Use these pre-tested queries in Google Cloud Logs Explorer to quickly diagnose operational issues:

### 3.1. Filter API Errors (HTTP 5xx Server Errors)
```sql
resource.type="cloud_run_revision"
resource.labels.service_name="devspeak-api-prod"
httpRequest.status >= 500
```

### 3.2. Filter Database Connection & Timeout Errors
```sql
resource.type="cloud_run_revision"
resource.labels.service_name="devspeak-api-prod"
textPayload =~ "(connection refused|timeout|pool timeout|OperationalError)"
```

### 3.3. Filter AI Provider Rate Limits & Exceptions
```sql
resource.type="cloud_run_revision"
resource.labels.service_name="devspeak-api-prod"
jsonPayload.message =~ "AI rate limit exceeded" OR jsonPayload.message =~ "AIRateLimitError"
```

### 3.4. Filter GKE Ingress & Controller Logs
```sql
resource.type="k8s_container"
resource.labels.namespace_name="devspeak"
resource.labels.container_name="devspeak-api"
severity >= WARNING
```

---

## 4. Synthetic Health Probes (`/readyz`)

The `/readyz` endpoint provides a comprehensive readiness probe:
```json
{
  "status": "ready",
  "ai_provider": "mock",
  "questions_loaded": 26
}
```
- **Probing Logic**:
  1. Verifies that the internal question catalog singleton is loaded with exactly 26 items.
  2. Verifies that the configured AI provider engine is instantiated and responding.
  3. Verifies that the database connection pool is healthy.

---

## 5. Budget Alerts & FinOps Anomaly Monitoring

- **Active GCP Budget**: Project `project-12679df0-893b-4260-924` is monitored under Cloud Billing budget `devspeak-budget-control`.
- **Monthly Limit**: **650,000 VND (~$26.00 USD)**.
- **Alerting Thresholds**:
  - `50%` of budget reached (325,000 VND) $\to$ Informational email notification.
  - `90%` of budget reached (585,000 VND) $\to$ Urgent warning notification.
  - `100%` of budget reached (650,000 VND) $\to$ Critical escalation; review GKE cluster teardown.
- **Operator Action on 90%+ Alert**:
  - Execute `deploy/gitops/scripts/teardown-gke.ps1` to stop GKE cluster billing while preserving Track A (Cloud Run scale-to-zero).
