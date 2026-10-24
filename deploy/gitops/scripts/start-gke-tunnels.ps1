<#
.SYNOPSIS
    Convenient background tunnels to GKE Autopilot workloads (Argo CD, Web, API).
.DESCRIPTION
    Starts kubectl port-forwards in the background and opens browser or displays URLs.
#>

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  DevSpeak AI — GKE Portfolio Tunnel Manager              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Set kubectl path
$env:PATH = "D:\DEVSPEAK-AI\.bin;" + $env:PATH

# Switch context to GKE cluster
Write-Host "[1/4] Switching kubectl context to GKE Autopilot..." -ForegroundColor Yellow
kubectl config use-context gke_project-12679df0-893b-4260-924_asia-southeast1_devspeak-gke-portfolio | Out-Null

Write-Host "[2/4] Starting port-forward for Argo CD Dashboard (Port 8080)..." -ForegroundColor Green
$jobArgo = Start-Job -ScriptBlock {
    $env:PATH = "D:\DEVSPEAK-AI\.bin;" + $env:PATH
    kubectl port-forward svc/argocd-server -n argocd 8080:443
}

Write-Host "[3/4] Starting port-forward for DevSpeak Web (Port 3002)..." -ForegroundColor Green
$jobWeb = Start-Job -ScriptBlock {
    $env:PATH = "D:\DEVSPEAK-AI\.bin;" + $env:PATH
    kubectl port-forward svc/devspeak-web-gke -n devspeak 3002:3000
}

Write-Host "[4/4] Starting port-forward for DevSpeak API (Port 8002)..." -ForegroundColor Green
$jobApi = Start-Job -ScriptBlock {
    $env:PATH = "D:\DEVSPEAK-AI\.bin;" + $env:PATH
    kubectl port-forward svc/devspeak-api-gke -n devspeak 8002:8000
}

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Tunnels are ACTIVE! Click the links below to test:      " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  - Argo CD UI:     https://localhost:8080" -ForegroundColor White
Write-Host "  - DevSpeak Web:   http://localhost:3002" -ForegroundColor White
Write-Host "  - DevSpeak API:   http://localhost:8002/readyz" -ForegroundColor White
Write-Host "  - Swagger Docs:   http://localhost:8002/docs" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Press Enter or Ctrl+C in this terminal to stop tunnels. " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

try {
    Read-Host "Press [Enter] to terminate all tunnels"
} finally {
    Write-Host "Stopping background tunnel jobs..." -ForegroundColor Yellow
    Stop-Job $jobArgo, $jobWeb, $jobApi -ErrorAction SilentlyContinue
    Remove-Job $jobArgo, $jobWeb, $jobApi -ErrorAction SilentlyContinue
    Write-Host "Tunnels closed cleanly." -ForegroundColor Green
}
