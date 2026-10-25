# Operational Troubleshooting & Diagnostics Playbook

## 1. Quick Diagnostic Cheat Sheet

```powershell
# 1. Run global non-destructive health probe across all 5 environments
pwsh deploy/gitops/scripts/smoke-test.ps1

# 2. Local Docker Compose Diagnostics
docker compose ps
docker compose logs --tail=50 api
docker compose logs --tail=50 web

# 3. Local kind Cluster Diagnostics
kubectl get nodes,pods,svc,ingress -A --context kind-devspeak-local
kubectl logs -l app.kubernetes.io/name=devspeak-api --context kind-devspeak-local

# 4. GKE Autopilot Production Diagnostics
kubectl get pods,ingress,managedcertificate -n devspeak --context gke_project-12679df0-893b-4260-924_asia-southeast1_devspeak-gke-portfolio
kubectl logs -l app.kubernetes.io/name=devspeak-api-gke -n devspeak --tail=50
```

---

## 2. Common Operational Issues & Diagnostic Solutions

### Issue 1: Port Conflict on Localhost (`8000`, `3001`, or `80`)
- **Symptom**: `docker compose up` or `kind create cluster` fails with `bind: address already in use`.
- **Diagnostic Command**:
  ```powershell
  Get-NetTCPConnection -LocalPort 8000,3001,80 | Select-Object LocalPort,OwningProcess
  ```
- **Solution**: Terminate the conflicting local process or adjust port mapping in `.env` / `docker-compose.yml`.

---

### Issue 2: GKE Pod Fails with `ImagePullBackOff` or `ErrImagePull`
- **Symptom**: GKE pods cannot pull container images from Artifact Registry (`403 Forbidden`).
- **Root Cause**: The Compute Engine default service account on GKE Autopilot nodes lacks read permissions to Artifact Registry.
- **Diagnostic Command**:
  ```powershell
  kubectl describe pod <POD_NAME> -n devspeak
  ```
- **Solution**: Grant `roles/artifactregistry.reader` to the node service account:
  ```bash
  gcloud artifacts repositories add-iam-policy-binding devspeak-docker \
    --location=asia-southeast1 \
    --member="serviceAccount:359194986638-compute@developer.gserviceaccount.com" \
    --role="roles/artifactregistry.reader"
  ```

---

### Issue 3: Google Managed SSL Certificate Stuck in `Provisioning`
- **Symptom**: `kubectl get managedcertificate -n devspeak` displays status `Provisioning` for hours.
- **Root Cause**:
  1. DNS target does not resolve to the External Load Balancer static IP (`35.201.109.36`).
  2. Ingress resource is missing or Target HTTPS Proxy has competing certificates attached.
- **Diagnostic Command**:
  ```powershell
  kubectl describe managedcertificate devspeak-endpoints-ssl -n devspeak
  nslookup devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog
  ```
- **Solution**:
  - Ensure DNS target resolves strictly to `35.201.109.36`.
  - Remove any legacy self-signed certificates from Ingress `spec.tls` so only the ManagedCertificate attaches to the Target HTTPS Proxy.

---

### Issue 4: Argo CD Sync Fails on `PreSync` Migration Hook
- **Symptom**: Argo CD reports `SyncFailed` and application status `Degraded`.
- **Root Cause**: Alembic database migration Job failed (e.g., database connection timeout or schema lock).
- **Diagnostic Command**:
  ```powershell
  kubectl get jobs -n devspeak
  kubectl logs -l app.kubernetes.io/component=migration-job -n devspeak --tail=50
  ```
- **Solution**: Resolve database lock or missing environment variable in `job-migration.yaml`, then retry sync in Argo CD.

---

### Issue 5: Web Speech API Voice Mode Inactive / Shows Warning
- **Symptom**: Microphone button indicates "Speech recognition is not supported in this browser".
- **Root Cause**: Active browser (e.g., Firefox) does not implement the standard Web Speech API, or site is not running over HTTPS/localhost.
- **Solution**:
  - Switch to Google Chrome, Microsoft Edge, or Safari.
  - Verify origin is `https://` or `http://localhost`.
