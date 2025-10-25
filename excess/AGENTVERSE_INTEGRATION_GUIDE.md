# 🚀 Connecting Frontend to Agentverse Agents

This guide explains how to connect your WanderLink frontend to the deployed agents on Fetch.ai Agentverse.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Agent Addresses](#getting-agent-addresses)
3. [Frontend Configuration](#frontend-configuration)
4. [How It Works](#how-it-works)
5. [Testing the Integration](#testing-the-integration)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
└────────┬────────┘
         │
         │ HTTP Requests
         │
┌────────▼────────┐
│ Agent Service   │
│  (FastAPI)      │
│  Port 8000      │
└────────┬────────┘
         │
         │ Uses ASI-1 API
         │
┌────────▼────────────────────────┐
│     Agentverse Agents           │
│                                 │
│  ┌──────────────────┐          │
│  │  Travel Agent     │          │
│  │  - Extracts prefs │          │
│  │  - Uses ASI-1     │          │
│  └────────┬─────────┘          │
│           │                     │
│           │ Sends to            │
│           │                     │
│  ┌────────▼─────────┐          │
│  │ MatchMaker Agent  │          │
│  │ - Pools trips     │          │
│  │ - Forms groups    │          │
│  │ - Generates itinerary│       │
│  └──────────────────┘          │
└─────────────────────────────────┘
```

## 🔍 Getting Agent Addresses

### Step 1: Find Your Agent Addresses on Agentverse

1. **Log in to Agentverse**: https://agentverse.ai
2. **Go to "My Agents"** section
3. **Copy the agent addresses**:
   - Find your `TravelAgent` 
   - Find your `MatchMakerAgent`
   - Each will have an address like: `agent1qxxx...`

Example:
```
Travel Agent: agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt
MatchMaker Agent: agent1qxxx... (your address)
```

### Step 2: Configure Agent Communication

In your agent files (`travel_agent_asi.py` and `matchmaker_agent_asi.py`), make sure:

**travel_agent_asi.py**:
```python
# This should point to your MatchMaker agent address
MATCHMAKER_ADDRESS = "agent1qxxx..."  # Your MatchMaker address from Agentverse
```

**matchmaker_agent_asi.py**:
```python
# The address is auto-generated when you deploy
# Just make sure it's the same one you see on Agentverse
```

---

## ⚙️ Frontend Configuration

### Step 1: Create Environment Variables

Create a `.env.local` file in your `frontend/` directory:

```bash
cd D:\WanderLink\frontend
cp .env.example .env.local
```

### Step 2: Add Your Agent Addresses

Edit `.env.local` and add your deployed agent addresses:

```bash
# Your Travel Agent address from Agentverse
NEXT_PUBLIC_TRAVEL_AGENT_ADDRESS=agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt

# Your MatchMaker Agent address from Agentverse  
NEXT_PUBLIC_MATCHMAKER_AGENT_ADDRESS=agent1qxxx...

# Agent Service URL (your FastAPI backend)
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000

# Supabase (if you have it set up)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Restart Your Frontend

```bash
cd D:\WanderLink\frontend
npm run dev
```

---

## 🎯 How It Works

### User Flow

1. **User opens**: `http://localhost:3000/trips`
2. **User clicks**: "FIND MY MATCHES" button
3. **User enters**: Natural language trip description
   - Example: "I want a beach vacation in Bali for 7 days with adventure activities"
4. **Frontend sends**: Request to Agent Service (`http://localhost:8000`)
5. **Agent Service**:
   - Uses ASI-1 API to extract structured preferences
   - Returns: `{ destination, duration, budget, travel_type, interests, group_type }`
6. **Frontend queries**: Supabase for matching groups
7. **Display results**: Compatible travel groups shown to user

### Agent Flow (Behind the Scenes)

When you deploy agents to Agentverse, they run independently:

```
User Input → Agent Service → ASI-1 API → Structured Preferences
                                              ↓
                                    Store in Database
                                              ↓
                         MatchMaker Agent (on Agentverse) polls for new trips
                                              ↓
                         When MIN_GROUP_SIZE reached (3 people)
                                              ↓
                         Forms groups using greedy-swap algorithm
                                              ↓
                         Generates itinerary using ASI-1
                                              ↓
                         Stores group in database
                                              ↓
                         Frontend queries and displays matches
```

---

## 🧪 Testing the Integration

### Test 1: Basic Preference Extraction

**Frontend**: Open `http://localhost:3000/trips`

**Action**: Click "FIND MY MATCHES" and enter:
```
I want a relaxing beach vacation in Goa for 4 days with a budget of $500
```

**Expected Response**:
```json
{
  "success": true,
  "preferences": {
    "destination": "Goa",
    "duration": "4 days",
    "budget": "$500",
    "travel_type": "relaxation",
    "group_type": "small group",
    "interests": ["beach", "relaxation"]
  }
}
```

### Test 2: Direct API Call

Test your agent service directly:

```bash
# PowerShell
curl -X POST http://localhost:8000/api/extract-preferences `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"test123\",\"nlpInput\":\"I want beach vacation in Bali for 7 days\"}'
```

**Expected Output**:
```json
{
  "success": true,
  "preferences": {
    "destination": "Bali",
    "duration": "7 days",
    "budget": "$2000-3000",
    "travel_type": "beach",
    "group_type": "small group",
    "interests": ["beach", "water sports"]
  },
  "original_input": "I want beach vacation in Bali for 7 days"
}
```

### Test 3: Check Agent Service Status

```bash
curl http://localhost:8000/health
```

**Expected**:
```json
{
  "status": "healthy",
  "service": "WanderLink Agent Service",
  "supabase": "connected"
}
```

### Test 4: Full End-to-End Flow

1. **Start Agent Service**: 
   ```bash
   cd D:\WanderLink\agents\src
   python -m uvicorn agent_service:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend**:
   ```bash
   cd D:\WanderLink\frontend
   npm run dev
   ```

3. **Submit 3 Trip Requests**:
   - User 1: "Beach vacation in Bali, 7 days, $2000"
   - User 2: "Relaxing beach trip to Bali for a week, budget friendly"
   - User 3: "Bali beach adventure for 7 days"

4. **Expected**: MatchMaker forms a group when 3rd user submits

---

## 🐛 Troubleshooting

### Issue 1: "Failed to extract preferences"

**Cause**: Agent Service not running or ASI-1 API error

**Solution**:
```bash
# Check if agent service is running
curl http://localhost:8000/health

# If not running, start it:
cd D:\WanderLink\agents\src
python -m uvicorn agent_service:app --host 0.0.0.0 --port 8000 --reload
```

### Issue 2: "No matches found"

**Cause**: Not enough users in the trip pool (need MIN_GROUP_SIZE = 3)

**Solution**: 
- Submit at least 3 trip requests with similar preferences
- MatchMaker only forms groups when threshold is met
- Check Supabase `travel_groups` table for pending trips

### Issue 3: Frontend can't connect to Agent Service

**Cause**: CORS or network error

**Solution**:
```typescript
// Check frontend/.env.local
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000

// Make sure agent_service.py has CORS enabled:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 4: Agents on Agentverse not responding

**Cause**: Agents might be stopped or not deployed

**Solution**:
1. Go to Agentverse dashboard
2. Check agent status (should be "Running")
3. Check agent logs for errors
4. Restart agents if needed

### Issue 5: ASI-1 API Key Invalid

**Cause**: API key expired or incorrect

**Solution**:
```python
# Check agents/src/agent_service.py
ASI_API_KEY = "sk_7aa8a96be59b426695dcd1a2ee00e5807c2903f9c43b4f1c8d84d8fb52ac62a4"

# Test ASI-1 API directly:
curl -X POST https://api.asi1.ai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"asi1-mini","messages":[{"role":"user","content":"Hello"}]}'
```

---

## 🔄 Communication Flow Diagram

```
Frontend (localhost:3000)
    │
    │ POST /api/extract-preferences
    │ { userId, nlpInput }
    │
    ▼
Agent Service (localhost:8000)
    │
    │ Uses ASI-1 API
    │ POST https://api.asi1.ai/v1/chat/completions
    │
    ▼
ASI-1 API
    │
    │ Returns structured JSON
    │ { destination, duration, budget, ... }
    │
    ▼
Agent Service
    │
    │ Returns to Frontend
    │
    ▼
Frontend
    │
    │ Displays preferences
    │ Queries Supabase for matches
    │
    ▼
Display Results to User
```

---

## 📊 Monitoring Agent Activity

### Check Agent Service Logs

```bash
# The agent service shows real-time logs
cd D:\WanderLink\agents\src
python -m uvicorn agent_service:app --host 0.0.0.0 --port 8000 --reload

# You'll see:
# ✅ Supabase client initialized
# INFO: Uvicorn running on http://0.0.0.0:8000
# [When request comes in] POST /api/extract-preferences
```

### Check Agentverse Dashboard

1. Go to https://agentverse.ai
2. Click on your agent (Travel Agent or MatchMaker)
3. View **Logs** tab to see:
   - Incoming messages
   - Preference extraction
   - Group formation
   - Itinerary generation

### Check Supabase Database

```sql
-- Check pending trips waiting to be matched
SELECT * FROM trip_requests WHERE status = 'pending';

-- Check formed groups
SELECT * FROM travel_groups WHERE status = 'active';

-- Check user preferences
SELECT * FROM user_preferences ORDER BY created_at DESC;
```

---

## 🎉 Success Checklist

- [ ] Agent Service running on port 8000
- [ ] Frontend running on port 3000
- [ ] `.env.local` configured with agent addresses
- [ ] ASI-1 API key valid
- [ ] Supabase connected
- [ ] Can extract preferences from NLP input
- [ ] Can query for matching groups
- [ ] Agents deployed and running on Agentverse
- [ ] Agent logs showing activity

---

## 🚀 Next Steps

1. **Deploy Frontend**: Deploy to Vercel/Netlify
2. **Deploy Agent Service**: Deploy to Railway/Render
3. **Set up WebSocket**: For real-time itinerary updates
4. **Add Notifications**: Email/SMS when group is formed
5. **Integrate Blockchain**: Add TripFactory.sol smart contracts
6. **Add Payments**: Integrate Web3 wallet payments

---

## 📞 Support

If you encounter issues:

1. Check agent service logs: `http://localhost:8000/docs`
2. Check browser console: `F12` → Console tab
3. Check Agentverse logs: Agent dashboard → Logs
4. Check Supabase logs: Supabase dashboard → Logs

**Common Error Messages**:
- "Failed to extract preferences" → Agent service not running
- "No matches found" → Need more users in pool
- "CORS error" → Check CORS configuration
- "Agent not responding" → Check Agentverse agent status
