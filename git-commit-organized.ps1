# Organized Git Commits for WanderLink

Write-Host "Creating organized git commits..." -ForegroundColor Green
Write-Host ""

# First, add excess folder to .gitignore
Write-Host "1. Adding excess folder to .gitignore..." -ForegroundColor Cyan
Add-Content -Path ".gitignore" -Value "`n# Excess/unused files`nexcess/"
git add .gitignore
git commit -m "chore: add excess folder to .gitignore"
Write-Host "✅ Committed .gitignore update" -ForegroundColor Green
Write-Host ""

# Commit 1: Agent Implementation
Write-Host "2. Committing agent implementation..." -ForegroundColor Cyan
git add agents/src/agents/travel_agent_asi.py
git add agents/src/agents/matchmaker_agent_asi.py
git add agents/src/agents/planner_agent.py
git add agents/.env.example
git add agents/requirements.txt
git commit -m "feat: implement AI agents with user ID tracking

- Add Travel Agent with ASI-1 AI for preference extraction
- Add MatchMaker Agent to pool 3 travelers by destination
- Add Planner Agent to create groups and generate itineraries
- Implement USER_ID tracking through agent chain
- Store groups directly in Supabase (no webhook needed)
- Hardcode Supabase credentials in Planner for testing"
Write-Host "✅ Committed agent implementation" -ForegroundColor Green
Write-Host ""

# Commit 2: Frontend API Routes
Write-Host "3. Committing frontend API routes..." -ForegroundColor Cyan
git add frontend/app/api/agent-message/route.ts
git add frontend/app/api/planner-listener/route.ts
git commit -m "feat: add API routes for agent communication and polling

- Add /api/agent-message for direct agent communication
- Append [USER_ID:xxx] to messages for tracking
- Add /api/planner-listener for Supabase polling
- Query groups by user ID from members array
- Return group data with itinerary and members"
Write-Host "✅ Committed API routes" -ForegroundColor Green
Write-Host ""

# Commit 3: useGroupStatus Hook
Write-Host "4. Committing useGroupStatus hook..." -ForegroundColor Cyan
git add frontend/hooks/useGroupStatus.ts
git commit -m "feat: add useGroupStatus hook with auto-stop polling

- Poll Supabase every 5 seconds for group formation
- Automatically stop polling when group is found
- Prevent unnecessary API calls after group match
- Trigger onGroupFound callback when group detected"
Write-Host "✅ Committed useGroupStatus hook" -ForegroundColor Green
Write-Host ""

# Commit 4: Main UI Implementation
Write-Host "5. Committing main UI implementation..." -ForegroundColor Cyan
git add frontend/app/agent-trips-v2/page.tsx
git add frontend/app/agent-trips-v2/layout.tsx
git commit -m "feat: implement main UI with agent integration

- Add trip submission form with AI agent communication
- Implement real-time group formation with polling
- Display group details, itinerary, and members
- Add group chat functionality with agent responses
- Show waiting state with progress indicators
- Use test_xxx user ID format for tracking"
Write-Host "✅ Committed main UI" -ForegroundColor Green
Write-Host ""

# Commit 5: Database Schema
Write-Host "6. Committing database schema..." -ForegroundColor Cyan
git add TRAVEL_GROUPS_SCHEMA.sql
git add supabase/migrations/
git commit -m "feat: add Supabase schema for travel groups

- Create travel_groups table with JSONB columns
- Add indexes for performance (group_id, members array)
- Set up RLS policies for public access
- Support storing itinerary, travelers, and group info
- Enable querying by user ID in members array"
Write-Host "✅ Committed database schema" -ForegroundColor Green
Write-Host ""

# Commit 6: Documentation
Write-Host "7. Committing documentation..." -ForegroundColor Cyan
git add README.md
git add PROJECT_STRUCTURE.md
git commit -m "docs: add project documentation and structure guide

- Update README with current implementation
- Add PROJECT_STRUCTURE.md with clean file organization
- Document agent flow and data architecture
- Add quick start guide for deployment
- List all active files and their purposes"
Write-Host "✅ Committed documentation" -ForegroundColor Green
Write-Host ""

# Commit 7: Environment Configuration
Write-Host "8. Committing environment configuration..." -ForegroundColor Cyan
git add .env.example
git add frontend/.env.local.example
git commit -m "chore: add environment configuration templates

- Add .env.example for root configuration
- Add frontend/.env.local.example for Next.js
- Include Supabase credentials placeholders
- Include agent addresses placeholders"
Write-Host "✅ Committed environment config" -ForegroundColor Green
Write-Host ""

# Commit 8: Cleanup - Remove test pages
Write-Host "9. Committing cleanup of test pages..." -ForegroundColor Cyan
git add -A
git commit -m "chore: remove test pages and unused files

- Remove test-agent page (functionality moved to main UI)
- Remove test-group-flow page (deprecated)
- Clean up unused services and utils folders
- Move 850+ unused files to excess folder (gitignored)"
Write-Host "✅ Committed cleanup" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ All commits created successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Commit Summary:" -ForegroundColor Cyan
Write-Host "1. chore: add excess folder to .gitignore" -ForegroundColor White
Write-Host "2. feat: implement AI agents with user ID tracking" -ForegroundColor White
Write-Host "3. feat: add API routes for agent communication and polling" -ForegroundColor White
Write-Host "4. feat: add useGroupStatus hook with auto-stop polling" -ForegroundColor White
Write-Host "5. feat: implement main UI with agent integration" -ForegroundColor White
Write-Host "6. feat: add Supabase schema for travel groups" -ForegroundColor White
Write-Host "7. docs: add project documentation and structure guide" -ForegroundColor White
Write-Host "8. chore: add environment configuration templates" -ForegroundColor White
Write-Host "9. chore: remove test pages and unused files" -ForegroundColor White
Write-Host ""
Write-Host "Ready to push! Run: git push origin main" -ForegroundColor Yellow
