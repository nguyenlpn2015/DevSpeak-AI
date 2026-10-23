# Random generator for JWT Secret (high entropy 32 bytes)
resource "random_password" "jwt_secret" {
  length  = 32
  special = false
}

# Random generator for Database Password
resource "random_password" "db_password" {
  length  = 24
  special = false
}

# Secret: JWT Secret Key
resource "google_secret_manager_secret" "jwt_secret" {
  project   = var.project_id
  secret_id = "devspeak-jwt-secret"

  replication {
    auto {}
  }

  labels = {
    app         = "devspeak-ai"
    environment = "prod"
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = random_password.jwt_secret.result
}

# Secret: Database Password
resource "google_secret_manager_secret" "db_password" {
  project   = var.project_id
  secret_id = "devspeak-db-password"

  replication {
    auto {}
  }

  labels = {
    app         = "devspeak-ai"
    environment = "prod"
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# Secret: Gemini API Key
resource "google_secret_manager_secret" "gemini_api_key" {
  project   = var.project_id
  secret_id = "devspeak-gemini-api-key"

  replication {
    auto {}
  }

  labels = {
    app         = "devspeak-ai"
    environment = "prod"
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "gemini_api_key" {
  secret      = google_secret_manager_secret.gemini_api_key.id
  secret_data = var.gemini_api_key != "" ? var.gemini_api_key : "mock-devspeak-gemini-key"
}

# Grant backend service account read permissions to all secrets
resource "google_secret_manager_secret_iam_member" "api_jwt_secret" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.jwt_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.api_sa_email}"
}

resource "google_secret_manager_secret_iam_member" "api_db_password" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.db_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.api_sa_email}"
}

resource "google_secret_manager_secret_iam_member" "api_gemini_key" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.gemini_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.api_sa_email}"
}
