variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for Artifact Registry"
  type        = string
  default     = "asia-southeast1"
}

variable "repository_id" {
  description = "The ID of the Artifact Registry repository"
  type        = string
  default     = "devspeak-docker"
}
