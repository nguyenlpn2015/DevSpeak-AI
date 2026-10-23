variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for Cloud SQL"
  type        = string
  default     = "asia-southeast1"
}

variable "database_name" {
  description = "The database name"
  type        = string
  default     = "devspeak"
}

variable "database_user" {
  description = "The database application username"
  type        = string
  default     = "devspeak_user"
}

variable "db_password" {
  description = "The database user password"
  type        = string
  sensitive   = true
}
