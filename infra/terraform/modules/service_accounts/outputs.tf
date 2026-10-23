output "api_sa_email" {
  description = "Email of the devspeak-api service account"
  value       = google_service_account.api_sa.email
}

output "web_sa_email" {
  description = "Email of the devspeak-web service account"
  value       = google_service_account.web_sa.email
}
