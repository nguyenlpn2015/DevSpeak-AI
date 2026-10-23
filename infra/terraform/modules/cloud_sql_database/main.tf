resource "google_sql_database" "db" {
  project  = var.project_id
  name     = var.database_name
  instance = var.instance_name
}

resource "google_sql_user" "user" {
  project  = var.project_id
  name     = var.database_user
  instance = var.instance_name
  password = var.db_password
}
