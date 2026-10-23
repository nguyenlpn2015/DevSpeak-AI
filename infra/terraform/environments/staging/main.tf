# Read shared infrastructure outputs (Artifact Registry, WIF, Cloud SQL Instance)
data "terraform_remote_state" "shared" {
  backend = "gcs"
  config = {
    bucket = "devspeak-tf-state-359194986638"
    prefix = "terraform/state/shared"
  }
}

# 1. Staging Runtime Service Accounts
module "service_accounts" {
  source               = "../../modules/service_accounts"
  project_id           = var.project_id
  environment          = "staging"
  ci_deployer_sa_email = data.terraform_remote_state.shared.outputs.ci_deployer_sa_email
}

# 2. Staging Secret Manager
module "secret_manager" {
  source         = "../../modules/secret_manager"
  project_id     = var.project_id
  environment    = "staging"
  api_sa_email   = module.service_accounts.api_sa_email
  gemini_api_key = var.gemini_api_key
}

# 3. Staging Cloud SQL Database on Shared Instance
module "cloud_sql_database" {
  source        = "../../modules/cloud_sql_database"
  project_id    = var.project_id
  instance_name = data.terraform_remote_state.shared.outputs.cloud_sql_instance_name
  database_name = "devspeak_staging"
  database_user = "devspeak_staging_user"
  db_password   = module.secret_manager.db_password_value
}

# 4. Staging Cloud Run (Frontend & Backend, scale-to-zero)
module "cloud_run" {
  source                    = "../../modules/cloud_run"
  project_id                = var.project_id
  region                    = var.region
  environment               = "staging"
  api_sa_email              = module.service_accounts.api_sa_email
  web_sa_email              = module.service_accounts.web_sa_email
  cloud_sql_connection_name = data.terraform_remote_state.shared.outputs.cloud_sql_connection_name
  db_user                   = module.cloud_sql_database.database_user
  db_name                   = module.cloud_sql_database.database_name
  db_password_secret_id     = module.secret_manager.db_password_id
  jwt_secret_id             = module.secret_manager.jwt_secret_id
  gemini_api_key_secret_id  = module.secret_manager.gemini_api_key_id
}

# 5. Staging Cloud Monitoring & Alerting
module "monitoring" {
  source             = "../../modules/monitoring"
  project_id         = var.project_id
  environment        = "staging"
  notification_email = var.notification_email
}
