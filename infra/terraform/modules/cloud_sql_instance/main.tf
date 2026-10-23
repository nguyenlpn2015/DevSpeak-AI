resource "random_id" "db_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "default" {
  project             = var.project_id
  name                = "devspeak-db-${random_id.db_suffix.hex}"
  database_version    = "POSTGRES_16"
  region              = var.region
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    edition           = "ENTERPRISE"
    disk_size         = 10
    disk_type         = "PD_SSD"
    disk_autoresize   = false
    availability_type = "ZONAL" # Single-zone: zero HA multi-zone cost

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }

    ip_configuration {
      ipv4_enabled = true # Reached securely via Cloud SQL Auth Proxy in Cloud Run
    }

    user_labels = {
      app         = "devspeak-ai"
      environment = "shared"
      managed_by  = "terraform"
    }
  }
}
