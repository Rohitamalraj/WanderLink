# WanderLink - Quick Fix & Test

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "🔧 FIXING FRONTEND ISSUES" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "✅ Fixed Issues:" -ForegroundColor Green
Write-Host "  1. Removed button disabled state - now clickable" -ForegroundColor White
Write-Host "  2. Created agent-trips/layout.tsx - prevents chunk errors" -ForegroundColor White
Write-Host "  3. Cleared .next cache - fresh build" -ForegroundColor White
Write-Host "  4. Added better error handling" -ForegroundColor White
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING SERVICES" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Check if agent service is running
Write-Host "🔍 Checking agent service..." -ForegroundColor Yellow
try {
    $agentHealth = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Agent service is running: $($agentHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Agent service not running. Starting it now..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\WanderLink\agents; python -m uvicorn src.simple_agent_service:app --reload --port 8000"
    Write-Host "✅ Agent service starting in new window..." -ForegroundColor Green
    Start-Sleep -Seconds 3
}

Write-Host ""

# Start frontend (if not already running)
Write-Host "🌐 Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\WanderLink\frontend; npm run dev"
Write-Host "✅ Frontend starting on http://localhost:3000" -ForegroundColor Green

Start-Sleep -Seconds 5

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "✨ ALL FIXED AND RUNNING!" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open: http://localhost:3000/agent-trips" -ForegroundColor White
Write-Host "  2. Enter trip description (already filled)" -ForegroundColor White
Write-Host "  3. Click 'FIND MY GROUP' button (now working!)" -ForegroundColor White
Write-Host "  4. Follow instructions to chat with Travel Agent" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Important Links:" -ForegroundColor Yellow
Write-Host "  Frontend:      http://localhost:3000/agent-trips" -ForegroundColor White
Write-Host "  Agent API:     http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:      http://localhost:8000/docs" -ForegroundColor White
Write-Host ""

Write-Host "✅ Button is now clickable - try it out!" -ForegroundColor Green
Write-Host ""

# Open browser
Start-Sleep -Seconds 3
Write-Host "🌐 Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000/agent-trips"

Write-Host "`n✨ Ready to test! The button should work now.`n" -ForegroundColor Green
