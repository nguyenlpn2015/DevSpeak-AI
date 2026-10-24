variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region for GKE Cluster (asia-southeast1)"
  type        = string
  default     = "asia-southeast1"
}

variable "cluster_name" {
  description = "Name of the ephemeral GKE cluster"
  type        = string
  default     = "devspeak-gke-portfolio"
}

variable "k8s_namespace" {
  description = "Target Kubernetes namespace for DevSpeak workloads"
  type        = string
  default     = "devspeak"
}

variable "k8s_service_account" {
  description = "Kubernetes Service Account name bound to Workload Identity"
  type        = string
  default     = "devspeak-gke-sa"
}

variable "enable_autopilot" {
  description = "Enable GKE Autopilot mode (Zero node management, cost-optimized)"
  type        = bool
  default     = true
}
