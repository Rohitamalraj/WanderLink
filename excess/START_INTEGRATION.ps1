# Quick Start Script for WanderLink Agentverse Integration

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🚀 WANDERLINK AGENTVERSE INTEGRATION - QUICK START" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Checklist:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Agent Code Updated:" -ForegroundColor White
Write-Host "   ✅ travel_agent_asi.py - Mailbox enabled" -ForegroundColor Green
Write-Host "   ✅ matchmaker_agent_asi.py - Mailbox enabled" -ForegroundColor Green
Write-Host ""

Write-Host "2. Agent Service Integration:" -ForegroundColor White  
Write-Host "   ✅ /api/extract-preferences-and-send endpoint" -ForegroundColor Green
Write-Host "   ✅ /api/send-to-travel-agent endpoint" -ForegroundColor Green
Write-Host "   ✅ Agentverse API configured" -ForegroundColor Green
Write-Host ""

Write-Host "3. Frontend Integration:" -ForegroundColor White
Write-Host "   ✅ Updated to use hybrid endpoint" -ForegroundColor Green
Write-Host "   ✅ Console logging added" -ForegroundColor Green
Write-Host ""

Write-Host "4. Your Deployed Agents:" -ForegroundColor White
Write-Host "   Travel Agent: agent1q0z4x0eugfdax0..." -ForegroundColor Cyan
Write-Host "   MatchMaker:   agent1qdsd9mu8uhgkru..." -ForegroundColor Cyan
Write-Host ""

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "⚠️  IMPORTANT: Enable Mailbox on Agentverse!" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Before testing, you MUST:" -ForegroundColor Yellow
Write-Host "1. Go to https://agentverse.ai/agents" -ForegroundColor White
Write-Host "2. Click on your Travel Agent" -ForegroundColor White
Write-Host "3. Go to Settings → Enable Mailbox ✅" -ForegroundColor White
Write-Host "4. Repeat for MatchMaker Agent" -ForegroundColor White
Write-Host "5. Redeploy both agents with updated code" -ForegroundColor White
Write-Host ""

$response = Read-Host "Have you enabled mailbox on both agents? (yes/no)"

if ($response -ne "yes") {
    Write-Host ""
    Write-Host "Please enable mailbox first, then run this script again!" -ForegroundColor Red
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🧪 RUNNING INTEGRATION TESTS" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if agent service is running
Write-Host "Checking if agent service is running..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "✅ Agent service is running!" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "❌ Agent service is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Starting agent service..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start agent service in background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\WanderLink\agents; python -m uvicorn src.agent_service:app --host 0.0.0.0 --port 8000 --reload"
    
    Write-Host "⏳ Waiting for service to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    try {
        $healthCheck = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ Agent service started!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "❌ Failed to start agent service" -ForegroundColor Red
        Write-Host "Please start it manually: python -m uvicorn src.agent_service:app --reload" -ForegroundColor Yellow
        exit
    }
}

# Run integration tests
Write-Host "Running integration tests..." -ForegroundColor Yellow
Write-Host ""

& ".\test_agentverse.ps1"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🎯 NEXT STEPS" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "If tests passed:" -ForegroundColor Green
Write-Host "1. ✅ Agent service is running" -ForegroundColor White
Write-Host "2. ✅ Messages are being sent to Agentverse" -ForegroundColor White
Write-Host "3. ✅ Integration is complete!" -ForegroundColor White
Write-Host ""

Write-Host "Verify on Agentverse:" -ForegroundColor Yellow
Write-Host "1. Go to https://agentverse.ai/agents" -ForegroundColor White
Write-Host "2. Click on Travel Agent" -ForegroundColor White
Write-Host "3. Check 'Messages' tab" -ForegroundColor White
Write-Host "4. You should see test messages! 🎉" -ForegroundColor White
Write-Host ""

Write-Host "Start the frontend:" -ForegroundColor Yellow
Write-Host "  cd D:\WanderLink\frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "  Open: http://localhost:3000/trips" -ForegroundColor White
Write-Host ""

Write-Host "Test end-to-end:" -ForegroundColor Yellow
Write-Host "1. Click 'Find My Matches'" -ForegroundColor White
Write-Host "2. Enter trip description" -ForegroundColor White
Write-Host "3. Check browser console (F12)" -ForegroundColor White
Write-Host "4. Verify on Agentverse dashboard" -ForegroundColor White
Write-Host ""

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🎉 You're all set!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
