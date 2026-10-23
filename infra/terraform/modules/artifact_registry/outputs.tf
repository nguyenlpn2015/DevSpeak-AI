output "repository_id" {
  description = "The repository ID"
  value       = google_artifact_registry_repository.docker_repo.repository_id
}

output "repository_url" {
  description = "The Docker repository URL"
  value       = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}
