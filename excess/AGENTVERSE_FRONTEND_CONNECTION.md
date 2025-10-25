# 🚀 Frontend → Agentverse Connection Guide

## ✅ Current Status

Your **Agent Service is RUNNING** on `http://localhost:8000` ✅

```
✅ Supabase client initialized
✅ ASI-1 API configured
✅ FastAPI server active
✅ Ready to communicate with Agentverse agents
```

---

## 📍 What You Have Deployed on Agentverse

You deployed **2 agents** to Fetch.ai Agentverse:

1. **Travel Agent** (`travel_agent_asi.py`)
   - Receives user trip requests
   - Extracts preferences using ASI-1
   - Forwards to MatchMaker

2. **MatchMaker Agent** (`matchmaker_agent_asi.py`)  
   - Pools incoming trips
   - Forms groups when MIN_GROUP_SIZE (3) reached
   - Generates itineraries using ASI-1

---

## 🔗 How to Connect Frontend

### Step 1: Get Your Agent Addresses

From Agentverse dashboard, copy your agent addresses:

```
Travel Agent: agent1qxxx...
MatchMaker Agent: agent1qyyy...
```

### Step 2: Configure Frontend Environment

Create `frontend/.env.local`:

```bash
# Agent addresses from Agentverse
NEXT_PUBLIC_TRAVEL_AGENT_ADDRESS=agent1qxxx...
NEXT_PUBLIC_MATCHMAKER_AGENT_ADDRESS=agent1qyyy...

# Your running agent service (already running!)
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000

# Supabase (if you have it)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Step 3: Start Frontend

```bash
cd D:\WanderLink\frontend
npm run dev
```

### Step 4: Test It!

1. Open: `http://localhost:3000/trips`
2. Click: **"FIND MY MATCHES"** button
3. Enter: "I want a beach vacation in Bali for 7 days with adventure activities"
4. Watch the magic! ✨

---

## 🔄 Communication Flow

```
User (Browser)
    ↓
    │ Natural language: "Beach trip to Bali for 7 days"
    ↓
Frontend (localhost:3000)
    ↓
    │ POST /api/extract-preferences
    ↓
Agent Service (localhost:8000) ← YOU ARE HERE! ✅
    ↓
    │ Uses ASI-1 API
    ↓
ASI-1 API
    ↓
    │ Returns structured JSON
    │ { destination, duration, budget, interests... }
    ↓
Agent Service
    ↓
    │ Returns to Frontend
    ↓
Frontend displays preferences
    ↓
    │ Queries Supabase for matches
    ↓
Shows matching groups to user
```

---

## 🧪 Quick Test

Test your agent service right now:

```powershell
# Test 1: Health check
curl http://localhost:8000/health

# Test 2: Extract preferences
curl -X POST http://localhost:8000/api/extract-preferences `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"test\",\"nlpInput\":\"Beach vacation in Bali for 7 days\"}'
```

Expected output:
```json
{
  "success": true,
  "preferences": {
    "destination": "Bali",
    "duration": "7 days",
    "budget": "$2000-3000",
    "travel_type": "beach",
    "interests": ["beach", "water sports"]
  }
}
```

---

## 📊 Architecture

```
┌──────────────────┐
│   Frontend       │ ← User enters trip description
│  (Next.js)       │
└────────┬─────────┘
         │
         │ HTTP POST
         │
┌────────▼─────────┐
│ Agent Service    │ ← ✅ RUNNING NOW (port 8000)
│   (FastAPI)      │ 
│                  │
│ - Extract prefs  │ ← Uses ASI-1 API
│ - Find matches   │ ← Queries Supabase
│                  │
└────────┬─────────┘
         │
         │ (Your deployed agents run independently on Agentverse)
         │
┌────────▼──────────────────────┐
│   Agentverse (Fetch.ai)       │
│                               │
│  ┌─────────────────┐         │
│  │ Travel Agent    │         │
│  │ (ASI-1 powered) │         │
│  └────────┬────────┘         │
│           │                   │
│  ┌────────▼────────┐         │
│  │ MatchMaker      │         │
│  │ - Pools trips   │         │
│  │ - Forms groups  │         │
│  │ - Creates itin  │         │
│  └─────────────────┘         │
└───────────────────────────────┘
```

---

## 🎯 What Happens When User Submits Trip

1. **User clicks** "Find My Matches" button
2. **User types**: "I want a beach vacation in Bali for 7 days"
3. **Frontend sends** to Agent Service (localhost:8000)
4. **Agent Service** calls ASI-1 API to extract preferences
5. **ASI-1 returns** structured JSON:
   ```json
   {
     "destination": "Bali",
     "duration": "7 days",
     "budget": "$2000-3000",
     "travel_type": "beach",
     "interests": ["beach", "adventure"]
   }
   ```
6. **Agent Service** saves to database
7. **MatchMaker Agent** (on Agentverse) polls database
8. **When 3 users** with similar preferences → forms group
9. **Generates itinerary** using ASI-1
10. **Stores group** in database
11. **Frontend queries** and displays matches

---

## 📁 Key Files Updated

| File | What Changed |
|------|--------------|
| `frontend/app/trips/page.tsx` | Now calls `/api/extract-preferences` endpoint |
| `frontend/lib/agentverse-client.ts` | **NEW** - Client for agent communication |
| `frontend/.env.example` | **NEW** - Template for environment variables |
| `agents/src/agent_service.py` | Running with ASI-1 integration ✅ |

---

## 🔧 Troubleshooting

### "Cannot connect to agent service"
```bash
# Check if service is running
curl http://localhost:8000/health

# If not, start it:
cd D:\WanderLink\agents\src
python -m uvicorn agent_service:app --reload
```

### "No matches found"
- Need 3+ users with similar preferences
- MatchMaker only forms groups when MIN_GROUP_SIZE reached
- Check Supabase for pending trips

### "Frontend not loading"
```bash
cd D:\WanderLink\frontend
npm install  # Install dependencies
npm run dev  # Start dev server
```

---

## 📚 Documentation Files

For more details, see:

- **`AGENTVERSE_INTEGRATION_GUIDE.md`** - Complete integration guide
- **`ASI_IMPLEMENTATION_COMPLETE.md`** - ASI-1 system documentation
- **`.env.example`** - Environment variables template

---

## ✨ You're Ready!

**Agent Service**: ✅ Running  
**Agents on Agentverse**: ✅ Deployed  
**Frontend code**: ✅ Updated  

**All you need to do now**:
1. Configure `.env.local` with your agent addresses
2. Start frontend: `npm run dev`
3. Test it out! 🎉

---

## 🎊 Success Checklist

- [x] Agent Service running (port 8000)
- [x] ASI-1 API configured
- [x] Supabase connected
- [x] Agents deployed to Agentverse
- [ ] Frontend `.env.local` configured ← **DO THIS**
- [ ] Frontend started ← **THEN THIS**
- [ ] Test end-to-end flow ← **FINALLY THIS**

**You're almost there!** Just 3 steps away from a working system! 🚀
