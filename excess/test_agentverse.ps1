# PowerShell script to test Agentverse integration

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "TEST: AGENTVERSE MAILBOX API INTEGRATION" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if service is running
Write-Host "Checking if agent service is running..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Agent service is running!" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "Agent service is not running!" -ForegroundColor Red
    Write-Host "Please start it with: python -m uvicorn src.agent_service:app --reload" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Test 1: Send to Travel Agent
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "TEST 1: Send message to Travel Agent" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$body1 = @{
    userId = "test_user_123"
    nlpInput = "I want to go to Bali for 7 days with beach and adventure"
} | ConvertTo-Json

Write-Host "Sending: I want to go to Bali for 7 days..." -ForegroundColor White

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8000/api/send-to-travel-agent" -Method POST -Body $body1 -ContentType "application/json"
    
    Write-Host "TEST PASSED!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response1 | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "TEST FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 2: Hybrid approach
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "TEST 2: Extract preferences AND send to agent" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$body2 = @{
    userId = "test_user_456"
    nlpInput = "Relaxing beach vacation in Maldives, budget 3000 dollars, 5 days"
} | ConvertTo-Json

Write-Host "Sending: Relaxing beach vacation in Maldives..." -ForegroundColor White

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8000/api/extract-preferences-and-send" -Method POST -Body $body2 -ContentType "application/json"
    
    Write-Host "TEST PASSED!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response2 | ConvertTo-Json -Depth 10 | Write-Host
    
    if ($response2.task_id) {
        Write-Host ""
        Write-Host "Checking task status..." -ForegroundColor Yellow
        $statusResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/task-status/$($response2.task_id)"
        Write-Host "Task Status:" -ForegroundColor Yellow
        $statusResponse | ConvertTo-Json -Depth 10 | Write-Host
    }
} catch {
    Write-Host "TEST FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 3: Send to MatchMaker
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "TEST 3: Send preferences to MatchMaker" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$body3 = @{
    userId = "test_user_789"
    preferences = @{
        destination = "Thailand"
        duration = "10 days"
        budget = "2500"
        travel_type = "adventure"
        interests = @("beach", "scuba diving")
    }
} | ConvertTo-Json -Depth 10

Write-Host "Sending preferences to MatchMaker..." -ForegroundColor White

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:8000/api/send-to-matchmaker" -Method POST -Body $body3 -ContentType "application/json"
    
    Write-Host "TEST PASSED!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response3 | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "TEST FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "TEST SUITE COMPLETE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check Agentverse console for messages" -ForegroundColor White
Write-Host "2. Go to: https://agentverse.ai/agents" -ForegroundColor White
Write-Host "3. Click on your Travel Agent" -ForegroundColor White
Write-Host "4. Check the Messages or Logs tab" -ForegroundColor White
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
