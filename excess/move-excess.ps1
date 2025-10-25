# Move unused files and folders to excess directory

Write-Host "Moving unused files to excess folder..." -ForegroundColor Green

# Move all .md files except README.md
Get-ChildItem -Path . -Filter "*.md" -File | Where-Object {$_.Name -ne "README.md"} | ForEach-Object {
    Move-Item -Path $_.FullName -Destination "excess\" -Force
    Write-Host "Moved: $($_.Name)" -ForegroundColor Yellow
}

# Move unused folders
$foldersToMove = @(
    "BrandX",
    "mofo",
    "social-media-manager",
    "contracts",
    "docs"
)

foreach ($folder in $foldersToMove) {
    if (Test-Path $folder) {
        Move-Item -Path $folder -Destination "excess\" -Force
        Write-Host "Moved folder: $folder" -ForegroundColor Yellow
    }
}

# Move unused scripts
$scriptsToMove = @(
    "COMPLETE_SETUP.ps1",
    "FIX_AND_TEST.ps1",
    "START_AGENT_INTEGRATION.ps1",
    "START_AUTOMATED_FLOW.ps1",
    "quick-test.ps1",
    "start-all.ps1",
    "start-services.ps1"
)

foreach ($script in $scriptsToMove) {
    if (Test-Path $script) {
        Move-Item -Path $script -Destination "excess\" -Force
        Write-Host "Moved script: $script" -ForegroundColor Yellow
    }
}

# Move unused SQL files
$sqlToMove = @(
    "FIX_SUPABASE_FOREIGN_KEY.sql",
    "QUICK_SETUP.sql",
    "SUPABASE_SCHEMA.sql"
)

foreach ($sql in $sqlToMove) {
    if (Test-Path $sql) {
        Move-Item -Path $sql -Destination "excess\" -Force
        Write-Host "Moved SQL: $sql" -ForegroundColor Yellow
    }
}

# Move unused text files
$txtToMove = @(
    "QUICK_FIX_REFERENCE.txt",
    "REMAINING_STEPS.txt",
    "VISUAL_GUIDE.txt"
)

foreach ($txt in $txtToMove) {
    if (Test-Path $txt) {
        Move-Item -Path $txt -Destination "excess\" -Force
        Write-Host "Moved text: $txt" -ForegroundColor Yellow
    }
}

# Move unused config files
if (Test-Path "package.json") {
    Move-Item -Path "package.json" -Destination "excess\" -Force
    Write-Host "Moved: package.json" -ForegroundColor Yellow
}

Write-Host "`nCleanup complete! All unused files moved to 'excess' folder." -ForegroundColor Green
Write-Host "`nKept important files:" -ForegroundColor Cyan
Write-Host "  - README.md" -ForegroundColor White
Write-Host "  - TRAVEL_GROUPS_SCHEMA.sql (active schema)" -ForegroundColor White
Write-Host "  - USER_ID_TRACKING_SUMMARY.md (moved to excess)" -ForegroundColor White
Write-Host "  - MAIN_UI_INTEGRATION_SUMMARY.md (moved to excess)" -ForegroundColor White
Write-Host "  - agents/ folder (active)" -ForegroundColor White
Write-Host "  - frontend/ folder (active)" -ForegroundColor White
Write-Host "  - supabase/ folder (active)" -ForegroundColor White
