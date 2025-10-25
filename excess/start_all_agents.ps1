# WanderLink - Start All Agents and Backend Service
# PowerShell script to run all components

Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host "🚀 Starting WanderLink Agent System" -ForegroundColor Cyan
Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host ""

# Check if virtual environment exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "❌ Virtual environment not found. Please run:" -ForegroundColor Red
    Write-Host "   python -m venv venv" -ForegroundColor Yellow
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "   pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting agents in separate terminals..." -ForegroundColor Cyan
Write-Host ""

# Start MatchMaker Agent
Write-Host "1️⃣  Starting MatchMaker Agent (Port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; Write-Host '🤝 MatchMaker Agent' -ForegroundColor Cyan; python src\matchmaker_agent.py"

Start-Sleep -Seconds 2

# Start Planner Agent
Write-Host "2️⃣  Starting Planner Agent (Port 8002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; Write-Host '🗺️  Planner Agent' -ForegroundColor Cyan; python src\planner_agent.py"

Start-Sleep -Seconds 2

# Start User Agent
Write-Host "3️⃣  Starting User Agent (Port 8003)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; Write-Host '👤 User Agent' -ForegroundColor Cyan; python src\user_agent.py"

Start-Sleep -Seconds 2

# Start Agent Service (Backend API)
Write-Host "4️⃣  Starting Agent Service (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; Write-Host '🌐 Agent Service API' -ForegroundColor Cyan; python src\agent_service.py"

Write-Host ""
Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host "✅ All agents started successfully!" -ForegroundColor Green
Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host ""
Write-Host "📡 Services running:" -ForegroundColor Cyan
Write-Host "   MatchMaker Agent:  http://localhost:8001" -ForegroundColor White
Write-Host "   Planner Agent:     http://localhost:8002" -ForegroundColor White
Write-Host "   User Agent:        http://localhost:8003" -ForegroundColor White
Write-Host "   Agent Service API: http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:          http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 Frontend should connect to: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop (will close all terminals)" -ForegroundColor Gray
Write-Host ""

# Keep this terminal open
Read-Host "Press Enter to exit"
