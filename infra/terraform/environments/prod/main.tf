# Read shared infrastructure outputs (Artifact Registry, WIF, Cloud SQL Instance)
data "terraform_remote_state" "shared" {
  backend = "gcs"
  config = {
    bucket = "devspeak-tf-state-359194986638"
    prefix = "terraform/state/shared"
  }
}

# 1. Dedicated Production CI/CD Deployer Service Account (Locked to refs/heads/main)
resource "google_service_account" "prod_deployer_sa" {
  project      = var.project_id
  account_id   = "devspeak-prod-deployer-sa"
  display_name = "DevSpeak Production GitHub Actions Deployer"
  description  = "Dedicated service account for Production CD assumed only from main branch"
}

# Bind ONLY the main branch of nguyenlpn2015/DevSpeak-AI via WIF
resource "google_service_account_iam_member" "prod_wif_binding" {
  service_account_id = google_service_account.prod_deployer_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principal://iam.googleapis.com/${split("/providers/", data.terraform_remote_state.shared.outputs.wif_provider_name)[0]}/subject/repo:${var.github_repo}:ref:refs/heads/main"
}

# Allow Production Deployer to manage Cloud Run services & jobs
resource "google_project_iam_member" "prod_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.prod_deployer_sa.email}"
}

# Allow Production Deployer to push release images to Artifact Registry
resource "google_project_iam_member" "prod_artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.prod_deployer_sa.email}"
}

# 2. Production Runtime Service Accounts
module "service_accounts" {
  source               = "../../modules/service_accounts"
  project_id           = var.project_id
  environment          = "prod"
  ci_deployer_sa_email = google_service_account.prod_deployer_sa.email
}

# 3. Production Secret Manager
module "secret_manager" {
  source         = "../../modules/secret_manager"
  project_id     = var.project_id
  environment    = "prod"
  api_sa_email   = module.service_accounts.api_sa_email
  gemini_api_key = var.gemini_api_key
}

# 4. Production Cloud SQL Database on Shared Instance
module "cloud_sql_database" {
  source        = "../../modules/cloud_sql_database"
  project_id    = var.project_id
  instance_name = data.terraform_remote_state.shared.outputs.cloud_sql_instance_name
  database_name = "devspeak_prod"
  database_user = "devspeak_prod_user"
  db_password   = module.secret_manager.db_password_value
}

# 5. Production Cloud Run (Frontend & Backend, scale-to-zero)
module "cloud_run" {
  source                    = "../../modules/cloud_run"
  project_id                = var.project_id
  region                    = var.region
  environment               = "prod"
  api_sa_email              = module.service_accounts.api_sa_email
  web_sa_email              = module.service_accounts.web_sa_email
  api_image                 = "${data.terraform_remote_state.shared.outputs.artifact_registry_url}/devspeak-api:baseline"
  web_image                 = "${data.terraform_remote_state.shared.outputs.artifact_registry_url}/devspeak-web:baseline"
  cloud_sql_connection_name = data.terraform_remote_state.shared.outputs.cloud_sql_connection_name
  db_user                   = module.cloud_sql_database.database_user
  db_name                   = module.cloud_sql_database.database_name
  db_password_secret_id     = module.secret_manager.db_password_id
  jwt_secret_id             = module.secret_manager.jwt_secret_id
  gemini_api_key_secret_id  = module.secret_manager.gemini_api_key_id
}

# 6. Production Cloud Monitoring & Alerting
module "monitoring" {
  source             = "../../modules/monitoring"
  project_id         = var.project_id
  environment        = "prod"
  notification_email = var.notification_email
}

