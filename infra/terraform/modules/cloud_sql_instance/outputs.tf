output "instance_name" {
  description = "The Cloud SQL instance name"
  value       = google_sql_database_instance.default.name
}

output "instance_connection_name" {
  description = "Connection name for Cloud SQL Auth Proxy (project:region:instance)"
  value       = google_sql_database_instance.default.connection_name
}
