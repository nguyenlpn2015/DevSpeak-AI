# Service Account for devspeak-api (Backend)
resource "google_service_account" "api_sa" {
  project      = var.project_id
  account_id   = "devspeak-api-${var.environment}-sa"
  display_name = "DevSpeak API [${var.environment}] Service Account"
  description  = "Least-privilege runtime service account for FastAPI backend in ${var.environment}"
}

# Service Account for devspeak-web (Frontend)
resource "google_service_account" "web_sa" {
  project      = var.project_id
  account_id   = "devspeak-web-${var.environment}-sa"
  display_name = "DevSpeak Web [${var.environment}] Service Account"
  description  = "Least-privilege runtime service account for Next.js frontend in ${var.environment}"
}

# Allow Backend SA to connect to Cloud SQL
resource "google_project_iam_member" "api_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

# Allow CI Deployer to impersonate runtime service accounts
resource "google_service_account_iam_member" "ci_impersonate_api_sa" {
  count              = var.ci_deployer_sa_email != "" ? 1 : 0
  service_account_id = google_service_account.api_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${var.ci_deployer_sa_email}"
}

resource "google_service_account_iam_member" "ci_impersonate_web_sa" {
  count              = var.ci_deployer_sa_email != "" ? 1 : 0
  service_account_id = google_service_account.web_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${var.ci_deployer_sa_email}"
}
