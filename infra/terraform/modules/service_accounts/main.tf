# Service Account for devspeak-api (Backend)
resource "google_service_account" "api_sa" {
  project      = var.project_id
  account_id   = "devspeak-api-sa"
  display_name = "DevSpeak API Cloud Run Service Account"
  description  = "Least-privilege runtime service account for the FastAPI backend"
}

# Service Account for devspeak-web (Frontend)
resource "google_service_account" "web_sa" {
  project      = var.project_id
  account_id   = "devspeak-web-sa"
  display_name = "DevSpeak Web Cloud Run Service Account"
  description  = "Least-privilege runtime service account for the Next.js frontend"
}

# Service Account for GitHub Actions CI/CD Deployer
resource "google_service_account" "ci_deployer_sa" {
  project      = var.project_id
  account_id   = "devspeak-ci-deployer-sa"
  display_name = "DevSpeak GitHub Actions Deployer"
  description  = "Dedicated service account assumed by GitHub Actions via Workload Identity Federation"
}

# Allow CI Deployer to act as Cloud Run Developer/Admin
resource "google_project_iam_member" "ci_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.ci_deployer_sa.email}"
}

# Allow CI Deployer to write images to Artifact Registry
resource "google_project_iam_member" "ci_artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.ci_deployer_sa.email}"
}

# Allow CI Deployer to impersonate runtime service accounts
resource "google_service_account_iam_member" "ci_impersonate_api_sa" {
  service_account_id = google_service_account.api_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.ci_deployer_sa.email}"
}

resource "google_service_account_iam_member" "ci_impersonate_web_sa" {
  service_account_id = google_service_account.web_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.ci_deployer_sa.email}"
}

# Allow Backend SA to connect to Cloud SQL
resource "google_project_iam_member" "api_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

# Workload Identity Pool for GitHub Actions
resource "google_iam_workload_identity_pool" "github_pool" {
  project                   = var.project_id
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions WIF Pool"
  description               = "Identity pool for GitHub Actions OIDC federation"
  disabled                  = false
}

# Workload Identity Provider for GitHub Actions OIDC
resource "google_iam_workload_identity_pool_provider" "github_provider" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-actions-provider"
  display_name                       = "GitHub Actions Provider"
  description                        = "OIDC Provider for GitHub Actions"

  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.actor"            = "assertion.actor"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
    "attribute.ref"              = "assertion.ref"
  }

  attribute_condition = "assertion.repository == '${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Bind GitHub Repository to the CI Deployer Service Account via WIF
resource "google_service_account_iam_member" "wif_binding" {
  service_account_id = google_service_account.ci_deployer_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repo}"
}
