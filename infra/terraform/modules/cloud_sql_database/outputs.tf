output "database_name" {
  description = "The database name"
  value       = google_sql_database.db.name
}

output "database_user" {
  description = "The database application user"
  value       = google_sql_user.user.name
}
