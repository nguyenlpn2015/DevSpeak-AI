variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "environment" {
  description = "The target deployment environment (staging or prod)"
  type        = string
}

variable "ci_deployer_sa_email" {
  description = "The email of the CI/CD deployer service account to grant impersonation"
  type        = string
  default     = ""
}
