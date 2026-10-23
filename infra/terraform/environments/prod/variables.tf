variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
  default     = "project-12679df0-893b-4260-924"
}

variable "region" {
  description = "The target Google Cloud Region"
  type        = string
  default     = "asia-southeast1"
}

variable "github_repo" {
  description = "The target GitHub repository for Workload Identity Federation"
  type        = string
  default     = "nguyenlpn2015/DevSpeak-AI"
}

variable "gemini_api_key" {
  description = "Google Gemini API Key (Optional, defaults to mock if empty)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "notification_email" {
  description = "Email address for monitoring alert notifications"
  type        = string
  default     = "nguyenlpn2015@gmail.com"
}
