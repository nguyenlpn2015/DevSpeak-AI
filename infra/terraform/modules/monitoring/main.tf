# Notification Channel (Email) - optional
resource "google_monitoring_notification_channel" "email" {
  count        = var.notification_email != "" ? 1 : 0
  project      = var.project_id
  display_name = "DevSpeak [${var.environment}] SRE Alerts (${var.notification_email})"
  type         = "email"

  labels = {
    email_address = var.notification_email
  }
}

# Alert Policy: Cloud Run High 5xx Server Error Rate
resource "google_monitoring_alert_policy" "cloud_run_errors" {
  project      = var.project_id
  display_name = "DevSpeak [${var.environment}] - Cloud Run High 5xx Error Rate"
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run 5xx response count > 5 for 5 minutes"

    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 5

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = var.notification_email != "" ? [google_monitoring_notification_channel.email[0].name] : []

  user_labels = {
    severity    = "warning"
    app         = "devspeak-ai"
    environment = var.environment
  }
}
