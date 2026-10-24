output "api_cloud_run_url" {
  description = "HTTPS URL of devspeak-api-staging Cloud Run service"
  value       = module.cloud_run.api_url
}

output "web_cloud_run_url" {
  description = "HTTPS URL of devspeak-web-staging Cloud Run service"
  value       = module.cloud_run.web_url
}

output "database_name" {
  description = "Staging database name"
  value       = module.cloud_sql_database.database_name
}

output "migration_job_name" {
  description = "The name of the staging database migration Cloud Run Job"
  value       = module.cloud_run.migration_job_name
}
