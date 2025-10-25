# Clean up unused files in agents folder

Write-Host "Cleaning up agents folder..." -ForegroundColor Green

# Move all .md files from agents folder
Get-ChildItem -Path "agents\" -Filter "*.md" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination "excess\" -Force
    Write-Host "Moved: $($_.Name)" -ForegroundColor Yellow
}

# Move unused scripts
$scriptsToMove = @(
    "agents\START_INTEGRATION.ps1",
    "agents\start_agents.ps1",
    "agents\start_all_agents.bat",
    "agents\start_all_agents.ps1",
    "agents\start_all_services.ps1",
    "agents\start_asi_service.ps1",
    "agents\start_clean_service.ps1",
    "agents\test_agents.ps1",
    "agents\test_agentverse.ps1"
)

foreach ($script in $scriptsToMove) {
    if (Test-Path $script) {
        Move-Item -Path $script -Destination "excess\" -Force
        Write-Host "Moved: $(Split-Path $script -Leaf)" -ForegroundColor Yellow
    }
}

# Move test files
$testFiles = @(
    "agents\test.py",
    "agents\test1.py",
    "agents\test_agentverse_api.py",
    "agents\test_agentverse_endpoints.py",
    "agents\test_agentverse_mailbox.py",
    "agents\test_imports.py",
    "agents\test_supabase.py",
    "agents\check_dns.py"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "excess\" -Force
        Write-Host "Moved: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

# Move unused config files
$configFiles = @(
    "agents\fix_dns.ps1",
    "agents\package.json",
    "agents\package-lock.json",
    "agents\tsconfig.json"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "excess\" -Force
        Write-Host "Moved: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

# Move venv folder if empty
if (Test-Path "agents\venv") {
    $venvItems = Get-ChildItem -Path "agents\venv" -Recurse
    if ($venvItems.Count -eq 0) {
        Remove-Item -Path "agents\venv" -Force -Recurse
        Write-Host "Removed empty venv folder" -ForegroundColor Yellow
    }
}

Write-Host "`nAgents folder cleanup complete!" -ForegroundColor Green
Write-Host "`nKept in agents folder:" -ForegroundColor Cyan
Write-Host "  - .env (environment variables)" -ForegroundColor White
Write-Host "  - .env.example (template)" -ForegroundColor White
Write-Host "  - requirements.txt (Python dependencies)" -ForegroundColor White
Write-Host "  - src/agents/ (active agent files)" -ForegroundColor White
