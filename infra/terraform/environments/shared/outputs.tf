output "artifact_registry_url" {
  description = "Docker repository URL in Artifact Registry"
  value       = module.artifact_registry.repository_url
}

output "wif_provider_name" {
  description = "Workload Identity Provider resource name for GitHub Actions"
  value       = module.wif.wif_provider_name
}

output "ci_deployer_sa_email" {
  description = "CI/CD deployer service account email"
  value       = module.wif.ci_deployer_sa_email
}

output "cloud_sql_instance_name" {
  description = "Cloud SQL shared instance name"
  value       = module.cloud_sql_instance.instance_name
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL Auth Proxy connection name"
  value       = module.cloud_sql_instance.instance_connection_name
}
