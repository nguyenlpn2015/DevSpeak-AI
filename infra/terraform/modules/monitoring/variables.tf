variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "environment" {
  description = "The deployment environment (staging or prod)"
  type        = string
}

variable "notification_email" {
  description = "Email address for monitoring alert notifications"
  type        = string
  default     = ""
}
