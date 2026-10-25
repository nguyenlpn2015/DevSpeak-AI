# Architecture & Environments Specification

## 1. Executive Summary

DevSpeak AI operates across **five operational environments** organized into two primary architectural tracks:
- **Track A (Serverless Architecture)**: Docker Compose locally, scaling into Google Cloud Run for Staging and Production, with Google Cloud SQL (PostgreSQL 16) and Google Secret Manager.
- **Track B (Cloud-Native Kubernetes & GitOps)**: Local kind cluster with Ingress-NGINX, scaling into Google Kubernetes Engine (GKE Autopilot) managed declaratively via Argo CD GitOps controllers and protected by Google Managed SSL certificates.

---

## 2. Infrastructure Topology Diagram

```
                            [ GitHub Actions (CI/CD) ]
                                        │
                         OIDC Token (Keyless WIF)
                                        ▼
    ┌───────────────────────── Google Cloud Platform ────────────────────────┐
    │  Region: asia-southeast1 (Singapore)                                   │
    │                                                                        │
    │   [ Google Artifact Registry ] ──> Immutable Container Images (:git_sha)│
    │                                                                        │
    │   Track A: Serverless Architecture                                     │
    │   ├── Cloud Run Staging: devspeak-web-staging & devspeak-api-staging   │
    │   ├── Cloud Run Production: devspeak-web-prod & devspeak-api-prod      │
    │   ├── Cloud Run Job: devspeak-migration-prod (Decoupled Alembic Gate)  │
    │   ├── Cloud SQL: PostgreSQL 16 (devspeak-db-ef9683a6, Unix Socket)    │
    │   └── Secret Manager: DB creds, JWT secret, Gemini API key             │
    │                                                                        │
    │   Track B: Kubernetes & GitOps Architecture                            │
    │   ├── External HTTP(S) Cloud Load Balancer (Static IP: 35.201.109.36)   │
    │   ├── Google Managed Certificate: devspeak-endpoints-ssl (TLS 1.3)     │
    │   ├── Cloud Endpoints DNS: devspeak.endpoints.project-*.cloud.goog     │
    │   ├── GKE Autopilot Cluster: devspeak-gke-portfolio                    │
    │   │   ├── Namespace 'argocd': Argo CD v3.5.6 core controllers          │
    │   │   └── Namespace 'devspeak': 2x Web, 2x API (HPA), Ephemeral Postgres│
    │   └── Local kind Cluster: kind-devspeak-local (Ingress-NGINX on :80)   │
    └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The Five Operational Environments Matrix

| Environment | Purpose | Hosting Model | Public URL / Host | API URL / Probe | Database Engine |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Local Docker Compose** | Developer local testing | Docker Compose | `http://localhost:3001` | `http://localhost:8000/readyz` | PostgreSQL 16 Alpine container |
| **2. Cloud Run Staging** | Integration & PR pre-release | Serverless Cloud Run | `https://devspeak-web-staging-ygz4gsol4q-as.a.run.app` | `https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz` | Cloud SQL PostgreSQL 16 |
| **3. Cloud Run Production** | Production high-availability | Serverless Cloud Run | `https://devspeak-web-prod-ygz4gsol4q-as.a.run.app` | `https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz` | Cloud SQL PostgreSQL 16 (PITR active) |
| **4. Local kind Cluster** | Local GitOps / Helm testing | kind Kubernetes | `http://localhost/` | `http://localhost/readyz` | `postgres-dev` pod on PVC |
| **5. GKE Autopilot (Prod)** | Production GitOps showcase | GKE Autopilot | `https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/` | `.../readyz` | `postgres-dev` pod on dynamic disk |

---

## 4. Network Flows & Port Mappings

### 4.1. Local Docker Compose Network Topology
- **Network**: `devspeak-internal-network` (bridge driver)
- **Web Service**: Container port `3000` mapped to host port `3001`
- **API Service**: Container port `8000` mapped to host port `8000`
- **DB Service**: Container port `5432` internal to `devspeak-net` (not exposed to host for security)
- **API Communication**: Web connects internally to API via DNS `http://api:8000` or externally via `http://localhost:8000` from the candidate's browser.

### 4.2. Cloud Run (Track A) Network Topology
- **Web Frontend**: Fully managed public HTTPS endpoint terminating TLS 1.3 at Google Edge.
- **REST API**: Fully managed public HTTPS endpoint terminating TLS 1.3 at Google Edge.
- **Database Connectivity**: API container communicates with Cloud SQL via local Unix domain socket using Cloud SQL Auth Proxy (`/cloudsql/<PROJECT_ID>:<REGION>:<INSTANCE_NAME>`).
- **CORS Policy**: Restricts origin reflection exclusively to authorized web domains (`https://devspeak-web-prod-*.a.run.app`).

### 4.3. Local kind Kubernetes (Track B) Network Topology
- **Cluster**: `devspeak-local` with control-plane extraPortMappings: host port `80` $\to$ node container port `80`, host port `443` $\to$ node container port `443`.
- **Ingress Controller**: Ingress-NGINX with `node-labels: "ingress-ready=true"`.
- **Routing Rules**:
  - Path `/` $\to$ `devspeak-web` service on port `3000`.
  - Path `/api/v1` $\to$ `devspeak-api` service on port `8000`.
  - Path `/readyz` $\to$ `devspeak-api` service on port `8000`.

### 4.4. GKE Autopilot (Track B) Network Topology
- **External Load Balancer**: Regional HTTP(S) Cloud Load Balancer with static public IP `35.201.109.36`.
- **DNS**: Google Cloud Endpoints target:
  ```text
  devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog -> 35.201.109.36
  ```
- **SSL Certificate**: Google Managed Certificate `devspeak-endpoints-ssl` issued by Google Trust Services CA WR3, auto-renewed, active through January 2027.
- **Ingress Resource**: GKE Ingress controller terminating HTTPS on port 443 and routing to backend services:
  - `/*` $\to$ `devspeak-web-gke:3000` (2 replicas with HPA)
  - `/api/v1/*` $\to$ `devspeak-api-gke:8000` (2 replicas with HPA)
  - `/readyz` $\to$ `devspeak-api-gke:8000`

---

## 5. Storage & Persistence Specifications

| Environment | Storage Type | Volume / Mount Path | Backup / Disaster Recovery |
| :--- | :--- | :--- | :--- |
| **Docker Compose** | Named Docker Volume | `postgres_data:/var/lib/postgresql/data` | Persists across container restarts; removed only with `-v`. |
| **Cloud Run Staging** | Managed Cloud SQL | Cloud SQL Auth Proxy Unix Socket | Daily automated backups; 7-day retention. |
| **Cloud Run Production** | Managed Cloud SQL | Cloud SQL Auth Proxy Unix Socket | Daily automated backups; Point-in-Time Recovery (PITR); deletion protection. |
| **Local kind** | PersistentVolumeClaim | Local path storage provisioner | Ephemeral local disk volume. |
| **GKE Autopilot** | PersistentVolumeClaim | GKE standard persistent disk (`pd-standard`) | Ephemeral cluster database for showcase workloads. |

---

## 6. Runtime Security & Privilege Isolation

- **Non-Root Container Execution**:
  - API Container runs as user `appuser` (UID `10001`).
  - Web Container runs as user `nextjs` (UID `1001`).
- **Security Contexts (Kubernetes)**:
  - `allowPrivilegeEscalation: false`
  - `readOnlyRootFilesystem: false` (writable `/tmp` for temporary buffers)
  - `capabilities.drop: ["ALL"]`
- **Least-Privilege Secret Injection**:
  - Cloud Run injects secrets directly from Google Secret Manager as environment variables at revision launch time.
  - Kubernetes injects secrets via sealed K8s Secrets mapped to environment variables.
