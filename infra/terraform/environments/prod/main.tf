# Module 1: Artifact Registry for Docker Containers
module "artifact_registry" {
  source     = "../../modules/artifact_registry"
  project_id = var.project_id
  region     = var.region
}

# Module 2: IAM Service Accounts & Workload Identity Federation
module "service_accounts" {
  source      = "../../modules/service_accounts"
  project_id  = var.project_id
  github_repo = var.github_repo
}

# Module 3: Secret Manager
module "secret_manager" {
  source         = "../../modules/secret_manager"
  project_id     = var.project_id
  api_sa_email   = module.service_accounts.api_sa_email
  gemini_api_key = var.gemini_api_key
}

# Module 4: Cloud SQL for PostgreSQL (db-f1-micro, Single-zone, no HA)
module "cloud_sql" {
  source        = "../../modules/cloud_sql"
  project_id    = var.project_id
  region        = var.region
  database_name = "devspeak"
  database_user = "devspeak_user"
  db_password   = module.secret_manager.db_password_value
}

# Module 5: Cloud Run (Frontend & Backend, scale-to-zero)
module "cloud_run" {
  source                    = "../../modules/cloud_run"
  project_id                = var.project_id
  region                    = var.region
  api_sa_email              = module.service_accounts.api_sa_email
  web_sa_email              = module.service_accounts.web_sa_email
  cloud_sql_connection_name = module.cloud_sql.instance_connection_name
  db_user                   = module.cloud_sql.database_user
  db_name                   = module.cloud_sql.database_name
  db_password_secret_id     = module.secret_manager.db_password_id
  jwt_secret_id             = module.secret_manager.jwt_secret_id
  gemini_api_key_secret_id  = module.secret_manager.gemini_api_key_id
}

# Module 6: Cloud Monitoring & Alerting
module "monitoring" {
  source             = "../../modules/monitoring"
  project_id         = var.project_id
  notification_email = var.notification_email
}
