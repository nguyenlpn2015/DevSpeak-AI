variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "github_repo" {
  description = "The GitHub repository in org/repo format"
  type        = string
  default     = "nguyenlpn2015/DevSpeak-AI"
}
