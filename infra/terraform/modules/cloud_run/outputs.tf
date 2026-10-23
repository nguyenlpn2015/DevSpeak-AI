output "api_url" {
  description = "The HTTPS URL of the devspeak-api service"
  value       = google_cloud_run_v2_service.api.uri
}

output "web_url" {
  description = "The HTTPS URL of the devspeak-web service"
  value       = google_cloud_run_v2_service.web.uri
}

output "migration_job_name" {
  description = "The name of the database migration Cloud Run Job"
  value       = google_cloud_run_v2_job.migration.name
}
