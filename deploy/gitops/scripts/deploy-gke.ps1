# ==============================================================================
# DevSpeak AI - Provision Ephemeral GKE Portfolio Cluster & Argo CD
# ==============================================================================
param (
    [switch]$AutoApprove = $false
)

$ErrorActionPreference = "Stop"

# Portable repository root resolution from script location
$ScriptDir = $PSScriptRoot
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..\..\..")).Path
$LocalBin = Join-Path $RepoRoot ".bin"
if (Test-Path $LocalBin) {
    if ($env:PATH -notlike "*$LocalBin*") {
        $env:PATH = "$LocalBin;$env:PATH"
    }
}

function Assert-ToolInstalled {
    param([string]$ToolName)
    if (-not (Get-Command $ToolName -ErrorAction SilentlyContinue)) {
        throw "Required tool '$ToolName' was not found in PATH. Please install or configure '$ToolName' to proceed."
    }
}

Assert-ToolInstalled "terraform"
Assert-ToolInstalled "kubectl"

$tfDir = Join-Path $RepoRoot "infra\terraform\environments\gke"

Write-Host "=== PROVISIONING EPHEMERAL GKE CLUSTER (TRACK B) ===" -ForegroundColor Cyan
Push-Location $tfDir

try {
    Write-Host "`nInitializing Terraform..." -ForegroundColor Cyan
    terraform init

    Write-Host "`nPlanning GKE Cluster Deployment..." -ForegroundColor Cyan
    terraform plan -out=tfplan

    if ($AutoApprove) {
        Write-Host "`nApplying Terraform Plan..." -ForegroundColor Cyan
        terraform apply tfplan
    } else {
        $confirm = Read-Host "Proceed with provisioning GKE cluster? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            terraform apply tfplan
        } else {
            Write-Host "Aborted by user." -ForegroundColor Yellow
            return
        }
    }

    $connectCmd = terraform output -raw connect_command
    Write-Host "`nConfiguring kubectl credentials..." -ForegroundColor Cyan
    Invoke-Expression $connectCmd

    Write-Host "`nInstalling Argo CD on GKE..." -ForegroundColor Cyan
    kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
    kubectl apply --server-side --force-conflicts -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

    Write-Host "`nWaiting for Argo CD Server..." -ForegroundColor Cyan
    kubectl wait --namespace argocd --for=condition=ready pod --selector=app.kubernetes.io/name=argocd-server --timeout=180s

    Write-Host "`n=== GKE CLUSTER & ARGO CD ARE READY! ===" -ForegroundColor Green
} finally {
    Pop-Location
}
