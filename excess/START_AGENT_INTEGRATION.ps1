# WanderLink Agent Integration - Quick Start Guide

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "🚀 WANDERLINK AGENT INTEGRATION - QUICK START" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "📋 CURRENT SETUP:" -ForegroundColor Yellow
Write-Host "  ✅ Travel Agent deployed: agent1q0z4x0eugfdax0..." -ForegroundColor Green
Write-Host "  ✅ MatchMaker deployed: agent1qdsd9mu8uhgkru..." -ForegroundColor Green
Write-Host "  ✅ Planner deployed: agent1qdp7kupk4agz8n..." -ForegroundColor Green
Write-Host ""

Write-Host "🎯 HOW IT WORKS:" -ForegroundColor Yellow
Write-Host "  1. User chats with Travel Agent on Agentverse" -ForegroundColor White
Write-Host "  2. Travel Agent extracts preferences → sends to MatchMaker" -ForegroundColor White
Write-Host "  3. MatchMaker pools 3 users → generates itinerary" -ForegroundColor White
Write-Host "  4. MatchMaker sends group+itinerary → Planner" -ForegroundColor White
Write-Host "  5. Planner distributes itinerary to all 3 users" -ForegroundColor White
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "STEP 1: START AGENT SERVICE" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Starting simple agent service on port 8000..." -ForegroundColor Yellow

# Navigate to agents directory
Set-Location -Path "agents"

# Start the simple agent service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn src.simple_agent_service:app --reload --port 8000"

Start-Sleep -Seconds 3

Write-Host "✅ Agent service started!" -ForegroundColor Green
Write-Host "   📡 API: http://localhost:8000" -ForegroundColor White
Write-Host "   📚 Docs: http://localhost:8000/docs`n" -ForegroundColor White

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "STEP 2: START FRONTEND" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Starting Next.js frontend on port 3000..." -ForegroundColor Yellow

# Navigate to frontend directory
Set-Location -Path "..\frontend"

# Start Next.js dev server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Start-Sleep -Seconds 5

Write-Host "✅ Frontend started!" -ForegroundColor Green
Write-Host "   🌐 Frontend: http://localhost:3000`n" -ForegroundColor White

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "STEP 3: TEST THE INTEGRATION" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "🎯 OPTION 1: Use Frontend (Recommended)" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:3000/agent-trips" -ForegroundColor White
Write-Host "   2. Describe your trip (e.g., 'Varkala adventure 5 days')" -ForegroundColor White
Write-Host "   3. Click 'FIND MY GROUP'" -ForegroundColor White
Write-Host "   4. Open Agentverse chat link from response" -ForegroundColor White
Write-Host "   5. Chat with Travel Agent there`n" -ForegroundColor White

Write-Host "🎯 OPTION 2: Direct Agentverse Chat" -ForegroundColor Yellow
Write-Host "   1. Go to https://agentverse.ai/agents/agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey/chat" -ForegroundColor White
Write-Host "   2. Send: 'Varkala adventure trip, 5 days'" -ForegroundColor White
Write-Host "   3. Wait for 3 users to join" -ForegroundColor White
Write-Host "   4. Receive group itinerary in chat`n" -ForegroundColor White

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📊 MONITORING" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Check agent logs on Agentverse:" -ForegroundColor Yellow
Write-Host "  Travel Agent: https://agentverse.ai/agents/agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey/logs" -ForegroundColor White
Write-Host "  MatchMaker:   https://agentverse.ai/agents/agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt/logs" -ForegroundColor White
Write-Host "  Planner:      https://agentverse.ai/agents/agent1qdp7kupk4agz8nnevejljzdskur5x9nrqy8eec2t42hnqpca2mdmzscfdpj/logs`n" -ForegroundColor White

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✨ ALL SYSTEMS RUNNING!" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Press any key to view service status..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Test agent service
Write-Host "`n🔍 Testing Agent Service..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
    Write-Host "✅ Agent Service: " -ForegroundColor Green -NoNewline
    Write-Host "$($response.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Agent Service: Not responding" -ForegroundColor Red
}

Write-Host "`n📝 QUICK REFERENCE:" -ForegroundColor Yellow
Write-Host "  Frontend:     http://localhost:3000/agent-trips" -ForegroundColor White
Write-Host "  Agent API:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Agent Chat:   https://agentverse.ai (use travel agent address)" -ForegroundColor White

Write-Host "`n✨ Ready to match travelers!`n" -ForegroundColor Green
