# DevSpeak AI - Unified Development Server Launcher
# Starts both FastAPI Backend (port 8000) and Next.js Web (port 3001)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     DevSpeak AI - Starting Development Servers    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Start Backend in separate window
Write-Host "`n[1/2] Launching Backend API (http://127.0.0.1:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\apps\api'; .\.venv\Scripts\python.exe -m uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start Frontend in separate window
Write-Host "[2/2] Launching Frontend Web (http://localhost:3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\apps\web'; npm run dev"

Write-Host "`nServers launched in independent background windows!" -ForegroundColor Yellow
Write-Host "  Frontend:    http://localhost:3001 (or http://127.0.0.1:3001)" -ForegroundColor White
Write-Host "  Backend API: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

