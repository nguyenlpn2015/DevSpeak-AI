variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "instance_name" {
  description = "The Cloud SQL instance name"
  type        = string
}

variable "database_name" {
  description = "The database name"
  type        = string
}

variable "database_user" {
  description = "The database application username"
  type        = string
}

variable "db_password" {
  description = "The database user password"
  type        = string
  sensitive   = true
}
