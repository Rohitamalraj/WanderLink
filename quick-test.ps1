# WanderLink Quick Test Script
# Run this to verify all components are ready

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WanderLink - Quick Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 2: Python
Write-Host "2. Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "   ✅ Python installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 3: Frontend dependencies
Write-Host "3. Checking Frontend..." -ForegroundColor Yellow
if (Test-Path "D:\WanderLink\frontend\node_modules") {
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend dependencies missing - run: cd frontend; npm install" -ForegroundColor Yellow
    $allGood = $false
}

# Check 4: Frontend .env.local
Write-Host "4. Checking Frontend Environment..." -ForegroundColor Yellow
if (Test-Path "D:\WanderLink\frontend\.env.local") {
    $envContent = Get-Content "D:\WanderLink\frontend\.env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "   ✅ Frontend .env.local configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Frontend .env.local incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Frontend .env.local missing!" -ForegroundColor Red
    $allGood = $false
}

# Check 5: Agent virtual environment
Write-Host "5. Checking Agent Virtual Environment..." -ForegroundColor Yellow
if (Test-Path "D:\WanderLink\agents\venv") {
    Write-Host "   ✅ Agent venv exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Agent venv missing - run: cd agents; python -m venv venv" -ForegroundColor Yellow
    $allGood = $false
}

# Check 6: Agent dependencies
Write-Host "6. Checking Agent Dependencies..." -ForegroundColor Yellow
if (Test-Path "D:\WanderLink\agents\venv\Lib\site-packages\uagents") {
    Write-Host "   ✅ uagents installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  uagents missing - run: cd agents; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt" -ForegroundColor Yellow
    $allGood = $false
}

# Check 7: Agent .env
Write-Host "7. Checking Agent Environment..." -ForegroundColor Yellow
if (Test-Path "D:\WanderLink\agents\.env") {
    $agentEnv = Get-Content "D:\WanderLink\agents\.env" -Raw
    if ($agentEnv -match "ASI_ONE_API_KEY") {
        Write-Host "   ✅ Agent .env configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Agent .env incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Agent .env missing!" -ForegroundColor Red
    $allGood = $false
}

# Check 8: Ports availability
Write-Host "8. Checking Port Availability..." -ForegroundColor Yellow
$ports = @(3000, 8000, 8001, 8002)
$portsInUse = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $portsInUse += $port
    }
}

if ($portsInUse.Count -eq 0) {
    Write-Host "   ✅ All required ports available (3000, 8000, 8001, 8002)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Ports in use: $($portsInUse -join ', ')" -ForegroundColor Yellow
    Write-Host "      These might be from already running services (which is fine!)" -ForegroundColor Gray
}

# Check 9: Database setup file
Write-Host "9. Checking Database Setup Script..." -ForegroundColor Yellow
if (Test-Path "D:\WanderLink\QUICK_SETUP.sql") {
    Write-Host "   ✅ QUICK_SETUP.sql found" -ForegroundColor Green
} else {
    Write-Host "   ❌ QUICK_SETUP.sql missing!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to test! Follow these steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Run QUICK_SETUP.sql in Supabase SQL Editor" -ForegroundColor White
    Write-Host "2. Open 4 PowerShell terminals:" -ForegroundColor White
    Write-Host ""
    Write-Host "   Terminal 1 - Agent Service:" -ForegroundColor Yellow
    Write-Host "   cd D:\WanderLink\agents" -ForegroundColor Gray
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "   python src\agent_service.py" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Terminal 2 - MatchMaker Agent:" -ForegroundColor Yellow
    Write-Host "   cd D:\WanderLink\agents" -ForegroundColor Gray
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "   python src\matchmaker_agent.py" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Terminal 3 - Planner Agent:" -ForegroundColor Yellow
    Write-Host "   cd D:\WanderLink\agents" -ForegroundColor Gray
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "   python src\planner_agent.py" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Terminal 4 - Frontend:" -ForegroundColor Yellow
    Write-Host "   cd D:\WanderLink\frontend" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Open browser: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See TESTING_GUIDE.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  SOME CHECKS FAILED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fix the issues above and run this script again" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
