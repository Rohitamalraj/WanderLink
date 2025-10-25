# WanderLink ASI-1 Agent Service Startup

Write-Host "🚀 Starting WanderLink ASI-1 Agent Service" -ForegroundColor Cyan
Write-Host ""

# Navigate to agents directory
Set-Location -Path "$PSScriptRoot"

Write-Host "✅ ASI-1 API configured" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Agent Service on http://localhost:8000" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

# Start the service with uvicorn directly
cd src
uvicorn agent_service:app --host 0.0.0.0 --port 8000 --reload
