# Read shared infrastructure state (Artifact Registry, WIF)
data "terraform_remote_state" "shared" {
  backend = "gcs"
  config = {
    bucket = "devspeak-tf-state-359194986638"
    prefix = "terraform/state/shared"
  }
}

# Provision GKE Autopilot Cluster Module
module "gke_cluster" {
  source              = "../../modules/gke"
  project_id          = var.project_id
  region              = var.region
  cluster_name        = var.cluster_name
  k8s_namespace       = var.k8s_namespace
  k8s_service_account = var.k8s_service_account
  enable_autopilot    = true
}
