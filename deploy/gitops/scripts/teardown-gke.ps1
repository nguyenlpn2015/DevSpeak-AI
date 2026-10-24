# ==============================================================================
# DevSpeak AI - Clean Teardown of Ephemeral GKE Cluster (Cost Protection)
# ==============================================================================
param (
    [switch]$AutoApprove = $false
)

$ErrorActionPreference = "Stop"
$env:Path = "D:\DEVSPEAK-AI\.bin;$env:Path;C:\Users\Nguyen\AppData\Local\Microsoft\WinGet\Links"

$tfDir = "infra/terraform/environments/gke"

Write-Host "=== TEARING DOWN EPHEMERAL GKE CLUSTER (COST PROTECTION) ===" -ForegroundColor Yellow
Push-Location $tfDir

try {
    Write-Host "`nStep 1: Removing LoadBalancer Services & Ingress..." -ForegroundColor Cyan
    kubectl delete ingress --all --all-namespaces --timeout=60s 2>$null
    kubectl delete svc -l "type=LoadBalancer" --all-namespaces --timeout=60s 2>$null

    Write-Host "`nStep 2: Destroying GKE Cluster with Terraform..." -ForegroundColor Cyan
    if ($AutoApprove) {
        terraform destroy -auto-approve
    } else {
        terraform destroy
    }

    Write-Host "`nStep 3: Checking for Orphan Persistent Disks..." -ForegroundColor Cyan
    gcloud compute disks list --filter="zone ~ asia-southeast1" --format="table(name,sizeGb,status,users)" 2>$null

    Write-Host "`nStep 4: Checking for Reserved Static IP Addresses..." -ForegroundColor Cyan
    gcloud compute addresses list --filter="region:asia-southeast1" --format="table(name,address,status)" 2>$null

    Write-Host "`n=== GKE CLUSTER DESTROYED & BUDGET PROTECTED! ===" -ForegroundColor Green
} finally {
    Pop-Location
}
