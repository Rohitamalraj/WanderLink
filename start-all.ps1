# WanderLink - Start All Services
# This script helps you start all services in separate windows

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 Starting WanderLink Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\WanderLink"

# Check if directories exist
if (-not (Test-Path "$projectRoot\agents")) {
    Write-Host "❌ Agents directory not found!" -ForegroundColor Red
    exit
}

if (-not (Test-Path "$projectRoot\frontend")) {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit
}

Write-Host "Starting services in separate windows..." -ForegroundColor Yellow
Write-Host ""

# Start Agent Service
Write-Host "1️⃣  Starting Agent Service (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\agents'; .\venv\Scripts\Activate.ps1; Write-Host '🚀 Agent Service Starting...' -ForegroundColor Cyan; python src\agent_service.py"

Start-Sleep -Seconds 2

# Start MatchMaker Agent
Write-Host "2️⃣  Starting MatchMaker Agent (Port 8001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\agents'; .\venv\Scripts\Activate.ps1; Write-Host '🤝 MatchMaker Agent Starting...' -ForegroundColor Cyan; python src\matchmaker_agent.py"

Start-Sleep -Seconds 2

# Start Planner Agent
Write-Host "3️⃣  Starting Planner Agent (Port 8002)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\agents'; .\venv\Scripts\Activate.ps1; Write-Host '🗺️ Planner Agent Starting...' -ForegroundColor Cyan; python src\planner_agent.py"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "4️⃣  Starting Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; Write-Host '🎨 Frontend Starting...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Open your browser:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "📊 Check each window for status:" -ForegroundColor Cyan
Write-Host "   ✅ Agent Service: Look for 'Uvicorn running'" -ForegroundColor White
Write-Host "   ✅ MatchMaker: Look for 'Manifest published successfully'" -ForegroundColor White
Write-Host "   ✅ Planner: Look for 'Manifest published successfully'" -ForegroundColor White
Write-Host "   ✅ Frontend: Look for 'Ready in Xs'" -ForegroundColor White
Write-Host ""
Write-Host "⏸️  To stop all services: Close all PowerShell windows" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 See TESTING_GUIDE.md for testing instructions" -ForegroundColor Cyan
Write-Host ""
