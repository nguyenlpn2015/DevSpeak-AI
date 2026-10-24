output "cluster_name" {
  description = "GKE cluster name"
  value       = google_container_cluster.gke.name
}

output "cluster_endpoint" {
  description = "GKE control plane endpoint"
  value       = google_container_cluster.gke.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "GKE cluster CA certificate"
  value       = google_container_cluster.gke.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "gke_workload_sa_email" {
  description = "GCP Service Account email bound to GKE Workload Identity"
  value       = google_service_account.gke_workload_sa.email
}

output "connect_command" {
  description = "gcloud command to configure kubectl context"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.gke.name} --region ${google_container_cluster.gke.location} --project ${var.project_id}"
}
