# WanderLink Complete Automated Setup Script
# Run this after completing manual steps in Supabase

Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 WANDERLINK AUTOMATED FLOW - COMPLETE SETUP GUIDE     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase tables exist
Write-Host "📋 MANUAL STEPS CHECKLIST:" -ForegroundColor Yellow
Write-Host ""
Write-Host "[ ] STEP 1: Run SUPABASE_SCHEMA.sql" -ForegroundColor White
Write-Host "    1. Open: https://supabase.com/dashboard/project/xbspnzviiefekzosukfa/sql/new" -ForegroundColor Gray
Write-Host "    2. Open file: SUPABASE_SCHEMA.sql from project root" -ForegroundColor Gray
Write-Host "    3. Copy entire contents" -ForegroundColor Gray
Write-Host "    4. Paste into Supabase SQL Editor" -ForegroundColor Gray
Write-Host "    5. Click RUN or press Ctrl+Enter" -ForegroundColor Gray
Write-Host "    6. Verify success (no errors)" -ForegroundColor Gray
Write-Host ""

Write-Host "[ ] STEP 2: Update Planner Agent on Agentverse" -ForegroundColor White
Write-Host "    1. Open: https://agentverse.ai" -ForegroundColor Gray
Write-Host "    2. Find 'Planner' agent (agent1qdp7kupk4agz8n...)" -ForegroundColor Gray
Write-Host "    3. Open agent.py editor" -ForegroundColor Gray
Write-Host "    4. Copy: agents\src\agents\planner_agent.py" -ForegroundColor Gray
Write-Host "    5. Paste into Agentverse editor" -ForegroundColor Gray
Write-Host "    6. Go to Secrets tab" -ForegroundColor Gray
Write-Host "    7. Add secret: AGENT_SERVICE_URL" -ForegroundColor Gray
Write-Host "       Value: Enter your ngrok URL or public URL" -ForegroundColor Gray
Write-Host "       (For local testing, you'll need ngrok)" -ForegroundColor Gray
Write-Host "    8. Click 'Save & Deploy'" -ForegroundColor Gray
Write-Host "    9. Check logs for: '✨ Ready to create travel groups!'" -ForegroundColor Gray
Write-Host ""

Write-Host "[ ] STEP 3 (Optional): Setup ngrok for local testing" -ForegroundColor White
Write-Host "    1. Install ngrok: https://ngrok.com/download" -ForegroundColor Gray
Write-Host "    2. Run: ngrok http 8000" -ForegroundColor Gray
Write-Host "    3. Copy forwarding URL (e.g., https://abc123.ngrok.io)" -ForegroundColor Gray
Write-Host "    4. Add to Agentverse Planner secrets as AGENT_SERVICE_URL" -ForegroundColor Gray
Write-Host "    5. This allows Agentverse agent to call your local service" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Have you completed the manual steps above? (y/n)"

if ($continue -ne "y") {
    Write-Host "`n⚠️  Please complete the manual steps first, then run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit
}

Write-Host "`n✅ Great! Proceeding with automated checks..." -ForegroundColor Green
Write-Host ""

# Check if agent service is running
Write-Host "🔍 Checking if agent service is running..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ RUNNING" -ForegroundColor Green
    }
} catch {
    Write-Host " ❌ NOT RUNNING" -ForegroundColor Red
    Write-Host "   Starting agent service..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\WanderLink'; python agents/src/simple_agent_service.py"
    Write-Host "   ✅ Agent service started in new window" -ForegroundColor Green
    Start-Sleep -Seconds 3
}

# Check if frontend is running
Write-Host "🔍 Checking if frontend is running..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
    Write-Host " ✅ RUNNING" -ForegroundColor Green
} catch {
    Write-Host " ❌ NOT RUNNING" -ForegroundColor Red
    Write-Host "   Starting frontend..." -ForegroundColor Yellow
    
    # Clear .next cache first
    if (Test-Path "frontend\.next") {
        Remove-Item -Recurse -Force "frontend\.next"
        Write-Host "   ✅ Cleared .next cache" -ForegroundColor Green
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\WanderLink\frontend'; npm run dev"
    Write-Host "   ✅ Frontend started in new window" -ForegroundColor Green
    Write-Host "   ⏳ Waiting 10 seconds for frontend to compile..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ SETUP COMPLETE!                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 TESTING INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open NEW automated page:" -ForegroundColor White
Write-Host "   http://localhost:3000/agent-trips-v2" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Test with 3 BROWSER TABS (for complete group):" -ForegroundColor White
Write-Host "   Tab 1: Submit 'Varkala adventure trip, 5 days'" -ForegroundColor Gray
Write-Host "   Tab 2: Submit 'Goa beach vacation, 7 days'" -ForegroundColor Gray
Write-Host "   Tab 3: Submit 'Jaipur cultural tour, 4 days'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Watch for automatic flow:" -ForegroundColor White
Write-Host "   ✅ Status changes to 'AGENTS ARE WORKING...'" -ForegroundColor Gray
Write-Host "   ⏳ Frontend polls every 3 seconds" -ForegroundColor Gray
Write-Host "   🎉 'GROUP MATCHED!' banner appears (all 3 tabs)" -ForegroundColor Gray
Write-Host "   💬 Click 'OPEN GROUP CHAT' to see messages" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verify group chat shows:" -ForegroundColor White
Write-Host "   ✅ Welcome message from system" -ForegroundColor Gray
Write-Host "   ✅ Full itinerary from Planner agent" -ForegroundColor Gray
Write-Host "   ✅ All 3 members listed" -ForegroundColor Gray
Write-Host "   ✅ Group name and destination" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 DEBUGGING TOOLS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "• Agent Service API Docs:" -ForegroundColor White
Write-Host "  http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "• Supabase Dashboard:" -ForegroundColor White
Write-Host "  https://supabase.com/dashboard/project/xbspnzviiefekzosukfa" -ForegroundColor Yellow
Write-Host ""
Write-Host "• Check Database Tables:" -ForegroundColor White
Write-Host "  SELECT * FROM groups;" -ForegroundColor Gray
Write-Host "  SELECT * FROM group_members;" -ForegroundColor Gray
Write-Host "  SELECT * FROM group_messages;" -ForegroundColor Gray
Write-Host "  SELECT * FROM user_trip_preferences;" -ForegroundColor Gray
Write-Host ""
Write-Host "• Agentverse Logs:" -ForegroundColor White
Write-Host "  https://agentverse.ai" -ForegroundColor Yellow
Write-Host "  Check Planner agent logs for database operations" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 TROUBLESHOOTING:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Problem: Button disabled" -ForegroundColor Yellow
Write-Host "  → Use /agent-trips-v2 (not /agent-trips)" -ForegroundColor Gray
Write-Host ""
Write-Host "Problem: Polling never finds group" -ForegroundColor Yellow
Write-Host "  → Need 3 users to submit trips" -ForegroundColor Gray
Write-Host "  → Check Agentverse Planner logs for errors" -ForegroundColor Gray
Write-Host "  → Verify AGENT_SERVICE_URL in Agentverse secrets" -ForegroundColor Gray
Write-Host ""
Write-Host "Problem: No messages in chat" -ForegroundColor Yellow
Write-Host "  → Check Supabase group_messages table" -ForegroundColor Gray
Write-Host "  → Verify agent service received /api/store-group call" -ForegroundColor Gray
Write-Host ""
Write-Host "Problem: Agent service can't be reached from Agentverse" -ForegroundColor Yellow
Write-Host "  → Setup ngrok: ngrok http 8000" -ForegroundColor Gray
Write-Host "  → Add ngrok URL to AGENT_SERVICE_URL secret" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Happy Testing! Your automated travel group matching is ready!" -ForegroundColor Green
Write-Host ""

# Open browser to new page
Write-Host "Opening browser to new automated page..." -ForegroundColor Cyan
Start-Process "http://localhost:3000/agent-trips-v2"
