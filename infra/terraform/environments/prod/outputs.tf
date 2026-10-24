output "api_cloud_run_url" {
  description = "HTTPS URL of devspeak-api-prod Cloud Run service"
  value       = module.cloud_run.api_url
}

output "web_cloud_run_url" {
  description = "HTTPS URL of devspeak-web-prod Cloud Run service"
  value       = module.cloud_run.web_url
}

output "database_name" {
  description = "Production database name"
  value       = module.cloud_sql_database.database_name
}

output "prod_deployer_sa_email" {
  description = "Dedicated production CI/CD deployer service account email"
  value       = google_service_account.prod_deployer_sa.email
}
