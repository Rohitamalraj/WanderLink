# WanderLink Agent Services Startup Script
# Starts all agent services in separate terminals

Write-Host "🚀 Starting WanderLink Agent Services..." -ForegroundColor Green
Write-Host ""

# Activate virtual environment
$venvPath = "D:\WanderLink\agents\venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "❌ Virtual environment not found at: $venvPath" -ForegroundColor Red
    exit 1
}

# Service configurations
$services = @(
    @{
        Name = "Travel Agent"
        Port = 8002
        Script = "agents\src\services\travel_agent_service.py"
        Color = "Cyan"
    },
    @{
        Name = "MatchMaker"
        Port = 8003
        Script = "agents\src\services\matchmaker_service.py"
        Color = "Magenta"
    },
    @{
        Name = "Planner"
        Port = 8004
        Script = "agents\src\services\planner_service.py"
        Color = "Yellow"
    },
    @{
        Name = "Main Service"
        Port = 8001
        Script = "agents\src\simple_agent_service.py"
        Color = "Blue"
    }
)

# Start each service in a new PowerShell window
foreach ($service in $services) {
    Write-Host "🔄 Starting $($service.Name) on port $($service.Port)..." -ForegroundColor $service.Color
    
    $command = "cd D:\WanderLink; & '$venvPath'; python $($service.Script)"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command `
        -WindowStyle Normal
    
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor White
Write-Host "  🌐 Travel Agent:  http://localhost:8002" -ForegroundColor Cyan
Write-Host "  🤝 MatchMaker:    http://localhost:8003" -ForegroundColor Magenta
Write-Host "  📋 Planner:       http://localhost:8004" -ForegroundColor Yellow
Write-Host "  🔧 Main Service:  http://localhost:8001" -ForegroundColor Blue
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
