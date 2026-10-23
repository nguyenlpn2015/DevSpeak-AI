# 1. Cloud Run: devspeak-api (Backend)
resource "google_cloud_run_v2_service" "api" {
  project  = var.project_id
  name     = "devspeak-api-${var.environment}"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = var.api_sa_email

    scaling {
      min_instance_count = 0                                 # Scale-to-zero compute (Zero Idle Cost)
      max_instance_count = var.environment == "prod" ? 3 : 2 # Cost control cap
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [var.cloud_sql_connection_name]
      }
    }

    containers {
      image = var.api_image

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle = true # Scale-to-zero CPU allocation
      }

      ports {
        container_port = 8000
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "AI_PROVIDER"
        value = "mock"
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql+asyncpg://${var.db_user}@/${var.db_name}?host=/cloudsql/${var.cloud_sql_connection_name}"
      }

      env {
        name = "JWT_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = var.jwt_secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "DATABASE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.db_password_secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = var.gemini_api_key_secret_id
            version = "latest"
          }
        }
      }
    }
  }

  labels = {
    app         = "devspeak-ai"
    service     = "api"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Allow public unauthenticated HTTPS traffic to Backend API
resource "google_cloud_run_v2_service_iam_member" "public_api" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 2. Cloud Run: devspeak-web (Frontend)
resource "google_cloud_run_v2_service" "web" {
  project  = var.project_id
  name     = "devspeak-web-${var.environment}"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = var.web_sa_email

    scaling {
      min_instance_count = 0                                 # Scale-to-zero compute (Zero Idle Cost)
      max_instance_count = var.environment == "prod" ? 2 : 1 # Cost control cap
    }

    containers {
      image = var.web_image

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle = true
      }

      ports {
        container_port = 3000
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "NEXT_TELEMETRY_DISABLED"
        value = "1"
      }

      # Injects the backend Cloud Run HTTPS URL into the frontend
      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.api.uri
      }
    }
  }

  labels = {
    app         = "devspeak-ai"
    service     = "web"
    environment = var.environment
    managed_by  = "terraform"
  }

  depends_on = [google_cloud_run_v2_service.api]
}

# Allow public unauthenticated HTTPS traffic to Frontend Web
resource "google_cloud_run_v2_service_iam_member" "public_web" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.web.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
