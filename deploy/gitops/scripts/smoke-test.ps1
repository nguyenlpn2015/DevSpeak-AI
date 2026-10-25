# ==============================================================================
# DevSpeak AI - 5-Environment Read-Only Smoke & Health Verification
# ==============================================================================
# This script executes non-destructive HTTP/HTTPS health and readiness probes
# against all five configured environments and reports a status matrix.
# It NEVER mutates resources, changes configurations, or deletes data.
# ==============================================================================
param (
    [string]$TargetEnvironment = "all",
    [int]$TimeoutSeconds = 10
)

$ErrorActionPreference = "Continue"

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "DEVSPEAK AI - 5-ENVIRONMENT HEALTH AND READINESS PROBE RUNNER" -ForegroundColor Cyan
Write-Host "Timestamp (UTC): $([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

$targets = @(
    @{ Name = "Local Docker Compose (Web)";       Env = "compose"; Url = "http://localhost:3001" },
    @{ Name = "Local Docker Compose (API readyz)";Env = "compose"; Url = "http://localhost:8000/readyz" },
    @{ Name = "Local Docker Compose (Catalog)";   Env = "compose"; Url = "http://localhost:8000/api/v1/questions" },
    
    @{ Name = "Cloud Run Staging (Web)";          Env = "staging"; Url = "https://devspeak-web-staging-ygz4gsol4q-as.a.run.app" },
    @{ Name = "Cloud Run Staging (API readyz)";   Env = "staging"; Url = "https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz" },
    @{ Name = "Cloud Run Staging (Catalog)";      Env = "staging"; Url = "https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/api/v1/questions" },

    @{ Name = "Cloud Run Production (Web)";       Env = "prod";    Url = "https://devspeak-web-prod-ygz4gsol4q-as.a.run.app" },
    @{ Name = "Cloud Run Production (API readyz)";Env = "prod";    Url = "https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz" },
    @{ Name = "Cloud Run Production (Catalog)";   Env = "prod";    Url = "https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/api/v1/questions" },

    @{ Name = "Local kind Ingress (Web)";         Env = "kind";    Url = "http://localhost/" },
    @{ Name = "Local kind Ingress (API readyz)";  Env = "kind";    Url = "http://localhost/readyz" },
    @{ Name = "Local kind Ingress (Catalog)";     Env = "kind";    Url = "http://localhost/api/v1/questions" },

    @{ Name = "GKE Autopilot Ingress (Web HTTPS)";Env = "gke";     Url = "https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/" },
    @{ Name = "GKE Autopilot (API readyz)";       Env = "gke";     Url = "https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/readyz" },
    @{ Name = "GKE Autopilot (Catalog)";          Env = "gke";     Url = "https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/api/v1/questions" }
)

$passed = 0
$failed = 0
$skipped = 0

foreach ($t in $targets) {
    if ($TargetEnvironment -ne "all" -and $t.Env -ne $TargetEnvironment) {
        $skipped++
        continue
    }

    try {
        $response = Invoke-WebRequest -Uri $t.Url -Method Get -TimeoutSec $TimeoutSeconds -UseBasicParsing -Headers @{"User-Agent"="DevSpeak-SmokeRunner/1.0"}
        $statusCode = $response.StatusCode

        if ($statusCode -eq 200) {
            Write-Host "[PASS 200] $($t.Name)" -ForegroundColor Green
            Write-Host "       URL: $($t.Url)" -ForegroundColor DarkGray
            $passed++
        } else {
            Write-Host "[WARN $statusCode] $($t.Name)" -ForegroundColor Yellow
            Write-Host "       URL: $($t.Url)" -ForegroundColor DarkGray
            $passed++
        }
    } catch {
        Write-Host "[FAIL] $($t.Name)" -ForegroundColor Red
        Write-Host "       URL:   $($t.Url)" -ForegroundColor DarkGray
        Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Summary: Passed=$passed | Failed=$failed | Skipped=$skipped" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}
