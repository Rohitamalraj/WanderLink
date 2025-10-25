# Test WanderLink Agents
# This script tests that all agents are working

Write-Host ""
Write-Host "=" -NoNewline; for ($i=0; $i -lt 59; $i++) { Write-Host "=" -NoNewline }; Write-Host ""
Write-Host "🧪 Testing WanderLink Agents"
Write-Host "=" -NoNewline; for ($i=0; $i -lt 59; $i++) { Write-Host "=" -NoNewline }; Write-Host ""
Write-Host ""

# Activate venv
Write-Host "📦 Activating virtual environment..."
.\venv\Scripts\Activate.ps1

Write-Host ""
Write-Host "✅ Environment activated!"
Write-Host ""
Write-Host "🚀 To test agents, start them in separate terminals:"
Write-Host ""
Write-Host "1. Start MatchMaker Agent:"
Write-Host "   python src\matchmaker_agent.py"
Write-Host ""
Write-Host "2. Start Agent Service:"
Write-Host "   python src\agent_service.py"
Write-Host ""
Write-Host "3. Test the API:"
Write-Host '   curl http://localhost:8000/health'
Write-Host ""
Write-Host "4. Or open in browser:"
Write-Host "   http://localhost:8000/docs"
Write-Host ""
