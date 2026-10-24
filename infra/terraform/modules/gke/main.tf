# ==============================================================================
# DevSpeak AI - Ephemeral GKE Cluster Module (Autopilot / Cost-Controlled)
# ==============================================================================

# 1. Ephemeral GKE Autopilot Cluster
resource "google_container_cluster" "gke" {
  project  = var.project_id
  name     = var.cluster_name
  location = var.region

  enable_autopilot    = var.enable_autopilot
  deletion_protection = false # Must be false to allow clean automated teardown

  release_channel {
    channel = "REGULAR"
  }

  ip_allocation_policy {}

  # Workload Identity is natively enabled in Autopilot
  # Network tags and labels for cost-tracking
  resource_labels = {
    app         = "devspeak-ai"
    track       = "track-b-gitops"
    environment = "portfolio-ephemeral"
    managed_by  = "terraform"
  }
}

# 2. Dedicated GCP Service Account for GKE Workloads
resource "google_service_account" "gke_workload_sa" {
  project      = var.project_id
  account_id   = "devspeak-gke-sa"
  display_name = "DevSpeak GKE Workload Identity SA"
  description  = "Assumed by GKE Pods via Workload Identity for least-privilege cloud access"
}

# 3. Workload Identity Federation Binding (KSA -> GSA)
resource "google_service_account_iam_member" "gke_workload_identity_binding" {
  service_account_id = google_service_account.gke_workload_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[${var.k8s_namespace}/${var.k8s_service_account}]"

  depends_on = [google_container_cluster.gke]
}

# 4. Least-Privilege IAM Grants
# 4a. Artifact Registry Reader (Pull container images)
resource "google_project_iam_member" "gke_ar_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.gke_workload_sa.email}"
}

# 4b. Secret Manager Secret Accessor (Read runtime secrets)
resource "google_project_iam_member" "gke_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.gke_workload_sa.email}"
}
