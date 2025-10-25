# Start WanderLink Clean Agent Service

Write-Host "🚀 Starting WanderLink Agent Service - Clean Start" -ForegroundColor Cyan
Write-Host ""

# Navigate to agents directory
Set-Location -Path "$PSScriptRoot"

# Check if virtual environment exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "✅ Activating virtual environment..." -ForegroundColor Green
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "⚠️  Virtual environment not found. Using system Python." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Agent Service on http://localhost:8000" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

# Start the service
python src\agent_service.py
