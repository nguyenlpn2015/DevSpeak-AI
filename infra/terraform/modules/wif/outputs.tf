output "wif_provider_name" {
  description = "Full provider name for Workload Identity Federation"
  value       = google_iam_workload_identity_pool_provider.github_provider.name
}

output "ci_deployer_sa_email" {
  description = "Email of the CI/CD deployer service account"
  value       = google_service_account.ci_deployer_sa.email
}

output "ci_deployer_sa_name" {
  description = "Resource name of the CI/CD deployer service account"
  value       = google_service_account.ci_deployer_sa.name
}
