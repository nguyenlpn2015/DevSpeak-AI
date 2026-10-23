variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "api_sa_email" {
  description = "Service account email of the backend API"
  type        = string
}

variable "gemini_api_key" {
  description = "Optional Gemini API Key (defaults to mock placeholder if empty)"
  type        = string
  default     = ""
  sensitive   = true
}
