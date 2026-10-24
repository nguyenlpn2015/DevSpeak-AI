variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "project-12679df0-893b-4260-924"
}

variable "region" {
  description = "GCP Region (asia-southeast1)"
  type        = string
  default     = "asia-southeast1"
}

variable "cluster_name" {
  description = "GKE cluster name"
  type        = string
  default     = "devspeak-gke-portfolio"
}

variable "k8s_namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "devspeak"
}

variable "k8s_service_account" {
  description = "Kubernetes service account for workload identity"
  type        = string
  default     = "devspeak-gke-sa"
}
