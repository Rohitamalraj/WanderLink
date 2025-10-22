# WanderLink - Local Testing Guide

## 🚀 Quick Start

### 1. Start All Agents and Backend

**Option A: Using Batch Script (Recommended)**
```powershell
cd agents
.\start_all_agents.bat
```

**Option B: Using PowerShell Script**
```powershell
cd agents
.\start_all_agents.ps1
```

**Option C: Manual Start (for debugging)**
```powershell
# Terminal 1 - MatchMaker Agent
cd agents
.\venv\Scripts\Activate.ps1
python src\matchmaker_agent.py

# Terminal 2 - Planner Agent
cd agents
.\venv\Scripts\Activate.ps1
python src\planner_agent.py

# Terminal 3 - User Agent
cd agents
.\venv\Scripts\Activate.ps1
python src\user_agent.py

# Terminal 4 - Agent Service (Backend API)
cd agents
.\venv\Scripts\Activate.ps1
python src\agent_service.py
```

### 2. Start Frontend

```powershell
cd frontend
npm run dev
```

---

## 📡 Service Endpoints

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **MatchMaker Agent** | 8001 | http://localhost:8001 | Find travel companions |
| **Planner Agent** | 8002 | http://localhost:8002 | Generate itineraries |
| **User Agent** | 8003 | http://localhost:8003 | Manage user profiles |
| **Agent Service API** | 8000 | http://localhost:8000 | Backend API gateway |
| **Frontend** | 3000 | http://localhost:3000 | Next.js web app |

---

## 🧪 Testing the System

### Test 1: Check Backend Health

```powershell
# Open PowerShell and run:
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "WanderLink Agent Service",
  "agents": {
    "matchmaker": "local",
    "planner": "local"
  }
}
```

### Test 2: Find Matches (via Backend)

```powershell
curl -X POST http://localhost:8000/api/find-matches `
  -H "Content-Type: application/json" `
  -d '{
    "user_id": "test-user-123",
    "destination": "Tokyo",
    "start_date": "2025-11-15",
    "end_date": "2025-11-22",
    "budget_min": 1000,
    "budget_max": 2000,
    "activities": {
      "culture": 0.9,
      "food": 0.8,
      "adventure": 0.6
    },
    "travel_style": {
      "social": 0.9,
      "luxury": 0.5
    }
  }'
```

### Test 3: Generate Itinerary (via Backend)

```powershell
curl -X POST http://localhost:8000/api/generate-itinerary `
  -H "Content-Type: application/json" `
  -d '{
    "destination": "Tokyo",
    "num_days": 5,
    "interests": ["culture", "food", "photography"],
    "budget_per_day": 150,
    "pace": "moderate"
  }'
```

### Test 4: Frontend Integration

1. Open browser: http://localhost:3000
2. Click "Sign in with Google" and authenticate
3. Navigate to "Create Trip" or "Find Trips"
4. Fill out preferences form
5. Click "Find Matches" or "Generate Itinerary"
6. Verify agents respond with results

---

## 🔍 Debugging

### Check Agent Logs

Each agent terminal will show logs:
- MatchMaker: Connection requests, compatibility scores
- Planner: Itinerary generation, activity selection
- User Agent: Profile updates, preference changes
- Agent Service: HTTP requests, agent communication

### Common Issues

**Issue**: "Connection refused" errors
- **Solution**: Make sure all agents are running (check 4 terminal windows)
- **Verify**: `curl http://localhost:8001` should return agent info

**Issue**: "Agent not responding, returning mock data"
- **Solution**: Check individual agent terminal for errors
- **Restart**: Close terminal and restart that specific agent

**Issue**: Frontend can't connect to backend
- **Solution**: Verify `AGENT_SERVICE_URL=http://localhost:8000` in frontend `.env.local`
- **Check**: Backend should be running on port 8000

**Issue**: Ports already in use
- **Solution**: Kill processes on ports:
```powershell
# Find process using port
netstat -ano | findstr :8000
# Kill process (replace PID)
taskkill /PID <PID> /F
```

---

## 🧩 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Port 3000)                  │
│                      Next.js + React + TypeScript            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Agent Service API (Port 8000)                   │
│                  FastAPI + Python                            │
│  Routes: /api/find-matches, /api/generate-itinerary         │
└──────┬──────────────────────┬─────────────────┬─────────────┘
       │                      │                 │
       │ uAgents              │ uAgents         │ uAgents
       │ Protocol             │ Protocol        │ Protocol
       ↓                      ↓                 ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ MatchMaker   │    │   Planner    │    │     User     │
│ Agent        │    │   Agent      │    │    Agent     │
│ (Port 8001)  │    │ (Port 8002)  │    │ (Port 8003)  │
│              │    │              │    │              │
│ • Find       │    │ • Generate   │    │ • Manage     │
│   matches    │    │   itinerary  │    │   profiles   │
│ • Calculate  │    │ • Day plans  │    │ • Store      │
│   compatibility    │ • Activities │    │   preferences│
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 📋 Request/Response Examples

### Find Matches Request

**Frontend → Backend:**
```typescript
POST /api/ai/match
{
  userId: "user123",
  preferences: {
    destination: "Tokyo",
    startDate: "2025-11-15",
    endDate: "2025-11-22",
    budget: { min: 1000, max: 2000 },
    activities: { culture: 0.9, food: 0.8 },
    travelStyle: { social: 0.9 }
  }
}
```

**Backend → MatchMaker Agent:**
```python
POST http://localhost:8001/submit
{
  "user_id": "user123",
  "preferences": {
    "destination": "Tokyo",
    "start_date": "2025-11-15",
    "end_date": "2025-11-22",
    "budget_min": 1000,
    "budget_max": 2000,
    "activities": {"culture": 0.9, "food": 0.8},
    "travel_style": {"social": 0.9}
  }
}
```

**Response:**
```json
{
  "matches": [
    {
      "user_id": "user456",
      "compatibility": 85.5,
      "destination": "Tokyo",
      "estimated_cost": 1500,
      "confidence": "High"
    }
  ],
  "confidence": "High",
  "message": "Found 3 compatible match(es)"
}
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ All 4 terminal windows show "Agent Started!" messages
2. ✅ `http://localhost:8000/health` returns healthy status
3. ✅ `http://localhost:8000/docs` shows FastAPI Swagger docs
4. ✅ Frontend at `http://localhost:3000` loads successfully
5. ✅ "Find Matches" returns results (not mock data)
6. ✅ "Generate Itinerary" creates day-by-day plans
7. ✅ Agent logs show incoming requests and responses

---

## 🛑 Stopping the System

**If you used the batch/PowerShell script:**
- Close all 4 terminal windows manually
- Or press Ctrl+C in the main terminal

**If you started manually:**
- Press Ctrl+C in each terminal window

**Kill all Python processes:**
```powershell
taskkill /F /IM python.exe
```

---

## 🔧 Advanced Configuration

### Enable Agentverse Mode

1. Deploy agents to Agentverse.ai
2. Get agent addresses
3. Update `agents/.env`:
```
AGENTVERSE_API_KEY=your_key_here
MATCHMAKER_ADDRESS=agent1q...
PLANNER_ADDRESS=agent1q...
```
4. Restart agent service

### Enable Database Mode

1. Configure Supabase in `agents/.env`
2. Update user_agent.py to use database
3. Test with: `python src/user_agent.py`

---

## 📞 Support

If you encounter issues:
1. Check agent terminal logs for errors
2. Verify all ports are free (8000-8003)
3. Ensure virtual environment is activated
4. Check `agents/.env` configuration
5. Try manual start to isolate problems

---

## 🎯 Next Steps

Once local testing works:
1. Deploy agents to Agentverse.ai
2. Update frontend to use production backend
3. Configure database for persistent storage
4. Add authentication and authorization
5. Set up monitoring and logging

**Happy Testing!** 🚀
