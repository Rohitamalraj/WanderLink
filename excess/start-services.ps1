# WanderLink - Start All Agent Services
# Run this script to start all FastAPI agent services

Write-Host "🚀 Starting WanderLink Agent Services..." -ForegroundColor Green
Write-Host ""

# Activate virtual environment
& D:/WanderLink/agents/venv/Scripts/Activate.ps1

# Start Agent Service (Main API - Port 8001)
Write-Host "Starting Agent Service on port 8001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\WanderLink; & D:/WanderLink/agents/venv/Scripts/Activate.ps1; python agents/src/simple_agent_service.py"
Start-Sleep -Seconds 2

# Start Travel Agent Service (Port 8002)
Write-Host "Starting Travel Agent Service on port 8002..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\WanderLink; & D:/WanderLink/agents/venv/Scripts/Activate.ps1; python agents/src/services/travel_agent_service.py"
Start-Sleep -Seconds 2

# Start MatchMaker Service (Port 8003)
Write-Host "Starting MatchMaker Service on port 8003..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\WanderLink; & D:/WanderLink/agents/venv/Scripts/Activate.ps1; python agents/src/services/matchmaker_service.py"
Start-Sleep -Seconds 2

# Start Planner Service (Port 8004)
Write-Host "Starting Planner Service on port 8004..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\WanderLink; & D:/WanderLink/agents/venv/Scripts/Activate.ps1; python agents/src/services/planner_service.py"

Write-Host ""
Write-Host "✅ All services starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  - Agent Service (Main API):    http://localhost:8001" -ForegroundColor White
Write-Host "  - Travel Agent Service:        http://localhost:8002" -ForegroundColor White
Write-Host "  - MatchMaker Service:          http://localhost:8003" -ForegroundColor White
Write-Host "  - Planner Service:             http://localhost:8004" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
