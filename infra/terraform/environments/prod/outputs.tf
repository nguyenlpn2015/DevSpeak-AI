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
