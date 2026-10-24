# ==============================================================================
# DevSpeak AI - Teardown Local kind Cluster
# ==============================================================================
$env:Path = "$env:Path;C:\Users\Nguyen\AppData\Local\Microsoft\WinGet\Links"
$clusterName = "devspeak-local"

Write-Host "Deleting kind cluster '$clusterName'..." -ForegroundColor Yellow
kind delete cluster --name $clusterName

Write-Host "Local kind cluster '$clusterName' has been cleanly removed." -ForegroundColor Green
