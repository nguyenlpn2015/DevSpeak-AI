variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for Cloud Run"
  type        = string
  default     = "asia-southeast1"
}

variable "api_sa_email" {
  description = "Runtime service account for devspeak-api"
  type        = string
}

variable "web_sa_email" {
  description = "Runtime service account for devspeak-web"
  type        = string
}

variable "api_image" {
  description = "Container image for devspeak-api"
  type        = string
  default     = "gcr.io/cloudrun/hello"
}

variable "web_image" {
  description = "Container image for devspeak-web"
  type        = string
  default     = "gcr.io/cloudrun/hello"
}

variable "cloud_sql_connection_name" {
  description = "Connection string for Cloud SQL instance"
  type        = string
}

variable "db_user" {
  description = "Cloud SQL database user"
  type        = string
}

variable "db_name" {
  description = "Cloud SQL database name"
  type        = string
}

variable "db_password_secret_id" {
  description = "Secret Manager secret ID for DB password"
  type        = string
}

variable "jwt_secret_id" {
  description = "Secret Manager secret ID for JWT secret"
  type        = string
}

variable "gemini_api_key_secret_id" {
  description = "Secret Manager secret ID for Gemini API key"
  type        = string
}
