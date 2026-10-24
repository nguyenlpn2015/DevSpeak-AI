output "cluster_name" {
  description = "GKE cluster name"
  value       = module.gke_cluster.cluster_name
}

output "gke_workload_sa_email" {
  description = "GCP Service Account email bound to GKE Workload Identity"
  value       = module.gke_cluster.gke_workload_sa_email
}

output "connect_command" {
  description = "Connect kubectl to the new cluster"
  value       = module.gke_cluster.connect_command
}
