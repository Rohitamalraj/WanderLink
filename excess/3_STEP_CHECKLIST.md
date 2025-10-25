# ✅ 3-Step Checklist: Connect Frontend to Agentverse

## Your Current Status
- ✅ **Agent Service**: Running on port 8000
- ✅ **Agents**: Deployed on Agentverse (Travel Agent + MatchMaker)
- ⏳ **Frontend**: Needs configuration

---

## Step 1: Get Agent Addresses (2 minutes)

1. Go to: https://agentverse.ai
2. Login to your account
3. Go to **"My Agents"**
4. Copy both addresses:
   - `TravelAgent` address: `agent1qxxx...`
   - `MatchMakerAgent` address: `agent1qyyy...`

**Save these addresses - you'll need them in Step 2!**

---

## Step 2: Configure Frontend (3 minutes)

```powershell
# Navigate to frontend
cd D:\WanderLink\frontend

# Copy environment template
copy .env.example .env.local

# Open .env.local in VS Code
code .env.local
```

**Edit `.env.local` and add**:

```bash
# Paste your agent addresses from Step 1
NEXT_PUBLIC_TRAVEL_AGENT_ADDRESS=agent1qxxx...
NEXT_PUBLIC_MATCHMAKER_AGENT_ADDRESS=agent1qyyy...

# Agent service (already running!)
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000

# If you have Supabase configured, add these:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Save the file!**

---

## Step 3: Start Frontend (1 minute)

```powershell
cd D:\WanderLink\frontend
npm run dev
```

**Wait for**:
```
✓ Ready on http://localhost:3000
```

---

## 🎉 Test It! (30 seconds)

1. Open: http://localhost:3000/trips
2. Click: **"FIND MY MATCHES"** button
3. Type: "I want a beach vacation in Bali for 7 days with adventure activities"
4. Click: **"Find My Matches"**

**Expected Result**:
- ✅ Preferences extracted and displayed
- ✅ System searches for compatible groups
- ✅ Shows results or "Your trip is pooled, waiting for more travelers"

---

## 🔍 Quick Verification

### Check 1: Agent Service Running
```powershell
curl http://localhost:8000/health
```
Expected: `{"status":"healthy"}`

### Check 2: Frontend Running
Open: http://localhost:3000

Expected: WanderLink homepage loads

### Check 3: End-to-End Test
```powershell
curl -X POST http://localhost:8000/api/extract-preferences `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"test\",\"nlpInput\":\"Beach trip to Bali\"}'
```

Expected: JSON with extracted preferences

---

## 📊 Architecture Diagram

```
You are here ────────────┐
                         │
                         ▼
         ┌───────────────────────────┐
         │   Frontend (localhost:3000)│
         │   "Find My Matches" button │
         └──────────┬────────────────┘
                    │
                    │ HTTP POST
                    │
         ┌──────────▼────────────────┐
         │ Agent Service (port 8000)  │ ✅ RUNNING
         │ - Extract preferences      │
         │ - Find matches             │
         └──────────┬────────────────┘
                    │
                    │ ASI-1 API
                    │
         ┌──────────▼────────────────┐
         │   Your Deployed Agents     │
         │   (Agentverse)             │
         │                            │
         │  • Travel Agent            │
         │  • MatchMaker Agent        │
         └────────────────────────────┘
```

---

## 🐛 If Something Goes Wrong

### Problem: "Cannot connect to localhost:8000"
**Solution**: Check if agent service is running
```powershell
# In a new terminal
cd D:\WanderLink\agents\src
python -m uvicorn agent_service:app --reload
```

### Problem: "Environment variables not found"
**Solution**: Make sure `.env.local` exists in `frontend/` directory
```powershell
cd D:\WanderLink\frontend
dir .env.local  # Should exist
```

### Problem: "No matches found"
**Solution**: This is normal! MatchMaker needs 3+ users with similar preferences
- Try submitting 3 different trip requests
- All should have similar destinations/dates

### Problem: Frontend won't start
**Solution**: Install dependencies
```powershell
cd D:\WanderLink\frontend
npm install
npm run dev
```

---

## 📝 Summary

**What you did**:
1. ✅ Got agent addresses from Agentverse
2. ✅ Configured frontend `.env.local`
3. ✅ Started frontend

**What happens now**:
- Users enter natural language trip descriptions
- Agent Service extracts structured preferences (ASI-1)
- MatchMaker Agent pools trips and forms groups
- Users see compatible travel groups

**Total time**: ~6 minutes ⚡

---

## 🚀 Next Actions

Once frontend is working:

1. **Test with multiple users**: Open 3 browser tabs, submit 3 similar trips
2. **Check Agentverse logs**: See your agents in action
3. **Monitor database**: Watch groups form in Supabase
4. **Deploy to production**: When ready, deploy to Vercel/Railway

---

## 📚 More Info

- **Full guide**: `AGENTVERSE_INTEGRATION_GUIDE.md`
- **Architecture**: `ASI_IMPLEMENTATION_COMPLETE.md`
- **Connection details**: `AGENTVERSE_FRONTEND_CONNECTION.md`

**You got this! 🎉**
