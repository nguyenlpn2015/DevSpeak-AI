terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "gcs" {
    bucket = "devspeak-tf-state-359194986638"
    prefix = "terraform/state/prod"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
