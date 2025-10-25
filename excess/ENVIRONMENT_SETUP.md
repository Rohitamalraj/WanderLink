# Required Environment Variables

## agents/.env

```env
# Agentverse Agent Addresses (from your deployment)
TRAVEL_AGENT_ADDRESS=agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey
MATCHMAKER_ADDRESS=agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt
PLANNER_ADDRESS=agent1qdp7kupk4agz8nnevejljzdskur5x9nrqy8eec2t42hnqpca2mdmzscfdpj

# ASI-1 API Key (for LLM calls)
ASI_API_KEY=sk_7aa8a96be59b426695dcd1a2ee00e5807c2903f9c43b4f1c8d84d8fb52ac62a4

# Agentverse API Key (for mailbox API - if needed)
AGENTVERSE_API_KEY=your_agentverse_api_key_here

# Supabase (for group storage - optional for now)
SUPABASE_URL=https://xbspnzviiefekzosukfa.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
```

## frontend/.env.local

```env
# Agent Service URL
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000

# Supabase (if using frontend DB calls)
NEXT_PUBLIC_SUPABASE_URL=https://xbspnzviiefekzosukfa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Setup Instructions

### 1. Create agents/.env
```powershell
cd d:\WanderLink\agents
Copy-Item .env.example .env
# Edit .env with the values above
```

### 2. Create frontend/.env.local
```powershell
cd d:\WanderLink\frontend
New-Item .env.local
# Add the frontend environment variables
```

### 3. Install Dependencies

**Backend:**
```powershell
cd d:\WanderLink\agents
pip install fastapi uvicorn python-dotenv supabase openai uagents
```

**Frontend:**
```powershell
cd d:\WanderLink\frontend
npm install
```

### 4. Verify Setup
```powershell
# Test agent service
cd d:\WanderLink\agents
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('Travel Agent:', os.getenv('TRAVEL_AGENT_ADDRESS'))"

# Test frontend env
cd d:\WanderLink\frontend
Get-Content .env.local
```

---

## Important Notes

### Agent Addresses
These are your deployed agent addresses on Agentverse. They are already set in the code files:
- **Travel Agent:** `agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey`
- **MatchMaker:** `agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt`
- **Planner:** `agent1qdp7kupk4agz8nnevejljzdskur5x9nrqy8eec2t42hnqpca2mdmzscfdpj`

### ASI-1 API Key
Currently using: `sk_7aa8a96be59b426695dcd1a2ee00e5807c2903f9c43b4f1c8d84d8fb52ac62a4`

If you get authentication errors, get a new key from:
https://fetch.ai or https://asi1.ai

### Supabase
Optional for now - the Planner agent uses local storage. If you want persistent group storage, configure Supabase.

---

## Quick Verification

Run this script to verify all environment variables:

```powershell
# agents/.env check
cd d:\WanderLink\agents
python -c @"
from dotenv import load_dotenv
import os
load_dotenv()
print('✅ Travel Agent:', os.getenv('TRAVEL_AGENT_ADDRESS', 'NOT SET')[:20] + '...')
print('✅ MatchMaker:', os.getenv('MATCHMAKER_ADDRESS', 'NOT SET')[:20] + '...')
print('✅ Planner:', os.getenv('PLANNER_ADDRESS', 'NOT SET')[:20] + '...')
print('✅ ASI API Key:', 'SET' if os.getenv('ASI_API_KEY') else 'NOT SET')
"@
```

Expected output:
```
✅ Travel Agent: agent1q0z4x0eugfdax0...
✅ MatchMaker: agent1qdsd9mu8uhgkru...
✅ Planner: agent1qdp7kupk4agz8n...
✅ ASI API Key: SET
```
