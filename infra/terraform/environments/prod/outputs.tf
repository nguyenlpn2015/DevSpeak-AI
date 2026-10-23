output "artifact_registry_url" {
  description = "Docker repository URL in Artifact Registry"
  value       = module.artifact_registry.repository_url
}

output "wif_provider_name" {
  description = "Workload Identity Provider resource name for GitHub Actions"
  value       = module.service_accounts.wif_provider_name
}

output "ci_deployer_sa_email" {
  description = "CI/CD deployer service account email"
  value       = module.service_accounts.ci_deployer_sa_email
}

output "api_cloud_run_url" {
  description = "HTTPS URL of devspeak-api Cloud Run service"
  value       = module.cloud_run.api_url
}

output "web_cloud_run_url" {
  description = "HTTPS URL of devspeak-web Cloud Run service"
  value       = module.cloud_run.web_url
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL Auth Proxy connection name"
  value       = module.cloud_sql.instance_connection_name
}
