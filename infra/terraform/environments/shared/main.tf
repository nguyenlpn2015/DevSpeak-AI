# 1. Artifact Registry (Shared Docker repository for Staging & Prod)
module "artifact_registry" {
  source     = "../../modules/artifact_registry"
  project_id = var.project_id
  region     = var.region
}

# 2. Workload Identity Federation (Shared OIDC pool & provider for GitHub Actions)
module "wif" {
  source      = "../../modules/wif"
  project_id  = var.project_id
  github_repo = var.github_repo
}

# 3. Cloud SQL Instance (Shared db-f1-micro instance hosting devspeak_staging and devspeak_prod)
module "cloud_sql_instance" {
  source     = "../../modules/cloud_sql_instance"
  project_id = var.project_id
  region     = var.region
}
