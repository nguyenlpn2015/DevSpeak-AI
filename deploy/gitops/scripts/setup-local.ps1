# ==============================================================================
# DevSpeak AI - Setup Local kind Cluster with Ingress & Dev Database
# ==============================================================================
param (
    [switch]$SkipClusterCreation = $false
)

$ErrorActionPreference = "Stop"
$env:Path = "$env:Path;C:\Users\Nguyen\AppData\Local\Microsoft\WinGet\Links"

$clusterName = "devspeak-local"
$configFile = "deploy/gitops/environments/local-kind/kind-cluster-config.yaml"

if (-not $SkipClusterCreation) {
    $existing = kind get clusters
    if ($existing -contains $clusterName) {
        Write-Host "Cluster '$clusterName' already exists. Skipping creation." -ForegroundColor Yellow
    } else {
        Write-Host "Creating kind cluster '$clusterName'..." -ForegroundColor Cyan
        kind create cluster --config $configFile
    }
}

Write-Host "Setting kubectl context to kind-$clusterName..." -ForegroundColor Cyan
kubectl cluster-info --context "kind-$clusterName"

Write-Host "`nDeploying NGINX Ingress Controller for kind..." -ForegroundColor Cyan
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

Write-Host "Waiting for Ingress NGINX to be ready..." -ForegroundColor Cyan
kubectl wait --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=120s

Write-Host "`nDeploying Ephemeral PostgreSQL for Local Development..." -ForegroundColor Cyan
kubectl apply -f deploy/gitops/environments/local-kind/postgres-dev.yaml

Write-Host "Waiting for postgres-dev to be ready..." -ForegroundColor Cyan
kubectl wait --for=condition=available --timeout=60s deployment/postgres-dev

Write-Host "`n=== Local kind cluster is ready for DevSpeak AI! ===" -ForegroundColor Green
