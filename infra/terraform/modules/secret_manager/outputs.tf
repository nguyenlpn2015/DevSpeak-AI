output "jwt_secret_id" {
  description = "Resource ID of the JWT secret"
  value       = google_secret_manager_secret.jwt_secret.secret_id
}

output "db_password_id" {
  description = "Resource ID of the DB password secret"
  value       = google_secret_manager_secret.db_password.secret_id
}

output "db_password_value" {
  description = "Raw database password generated"
  value       = random_password.db_password.result
  sensitive   = true
}

output "gemini_api_key_id" {
  description = "Resource ID of the Gemini API key secret"
  value       = google_secret_manager_secret.gemini_api_key.secret_id
}
