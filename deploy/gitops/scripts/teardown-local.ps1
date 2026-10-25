# ==============================================================================
# DevSpeak AI - Teardown Local kind Cluster
# ==============================================================================
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

Assert-ToolInstalled "kind"
$clusterName = "devspeak-local"

Write-Host "Deleting kind cluster '$clusterName'..." -ForegroundColor Yellow
kind delete cluster --name $clusterName

Write-Host "Local kind cluster '$clusterName' has been cleanly removed." -ForegroundColor Green
