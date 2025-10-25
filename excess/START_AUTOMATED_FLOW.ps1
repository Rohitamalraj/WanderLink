# ============================================
# WanderLink Automated Flow - Quick Start
# ============================================

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   WANDERLINK AUTOMATED FLOW STARTER   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if supabase is installed
Write-Host "🔍 Checking Python dependencies..." -ForegroundColor Yellow
$pipList = pip list 2>&1 | Out-String
if ($pipList -match "supabase") {
    Write-Host "✅ supabase-py is installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  supabase-py not found. Installing..." -ForegroundColor Yellow
    pip install supabase
    Write-Host "✅ supabase-py installed" -ForegroundColor Green
}

Write-Host "`n📋 SETUP CHECKLIST:" -ForegroundColor Yellow
Write-Host ""

# Check .env file
if (Test-Path "agents\.env") {
    $envContent = Get-Content "agents\.env" -Raw
    if ($envContent -match "SUPABASE_URL" -and $envContent -match "SUPABASE_SERVICE_KEY") {
        Write-Host "  ✅ Supabase credentials in agents\.env" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing Supabase credentials in agents\.env" -ForegroundColor Red
        Write-Host "     Add SUPABASE_URL and SUPABASE_SERVICE_KEY" -ForegroundColor Yellow
        exit
    }
} else {
    Write-Host "  ❌ agents\.env not found!" -ForegroundColor Red
    exit
}

# Check if database schema has been run
Write-Host "`n  ⚠️  IMPORTANT: Have you run SUPABASE_SCHEMA.sql?" -ForegroundColor Yellow
Write-Host "     If not, open Supabase Dashboard → SQL Editor → Run it first!" -ForegroundColor Yellow
$response = Read-Host "`n  Continue? (y/n)"
if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "`n  👉 Run SUPABASE_SCHEMA.sql first, then restart this script." -ForegroundColor Yellow
    exit
}

Write-Host "`n🚀 Starting services..." -ForegroundColor Cyan

# Start Agent Service
Write-Host "`n1️⃣  Starting Agent Service (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\agents'; Write-Host '🤖 AGENT SERVICE' -ForegroundColor Cyan; python src\simple_agent_service.py"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "2️⃣  Starting Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🌐 NEXT.JS FRONTEND' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 5

# Open browser
Write-Host "`n3️⃣  Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/agent-trips-v2"

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        ✅ ALL SERVICES STARTED!        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📍 URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:      http://localhost:3000/agent-trips-v2" -ForegroundColor White
Write-Host "   Agent Service: http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:      http://localhost:8000/docs" -ForegroundColor White

Write-Host "`n📝 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Update Planner Agent on Agentverse:" -ForegroundColor White
Write-Host "     • Copy: agents\src\agents\planner_agent.py" -ForegroundColor Gray
Write-Host "     • Paste into Agentverse Planner agent editor" -ForegroundColor Gray
Write-Host "     • Add Secret: AGENT_SERVICE_URL = http://your-public-url:8000" -ForegroundColor Gray
Write-Host "       (Use ngrok or similar to expose localhost:8000)" -ForegroundColor Gray
Write-Host "     • Deploy agent" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Test the flow:" -ForegroundColor White
Write-Host "     • Open 3 browser tabs/windows" -ForegroundColor Gray
Write-Host "     • Each submits a trip description" -ForegroundColor Gray
Write-Host "     • Watch for 'GROUP MATCHED!' 🎉" -ForegroundColor Gray
Write-Host "     • Click 'OPEN GROUP CHAT'" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 TIP: Check AUTOMATED_FLOW_SETUP.md for detailed guide" -ForegroundColor Cyan
Write-Host ""
