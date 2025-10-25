# 🧪 WanderLink - Complete Testing Guide

> **Date**: October 22, 2025  
> **Purpose**: Step-by-step testing of ALL components working together  
> **Status**: Ready for End-to-End Testing

---

## 📋 Table of Contents
1. [Pre-Testing Checklist](#pre-testing-checklist)
2. [Environment Setup Verification](#environment-setup-verification)
3. [Database Setup & Verification](#database-setup--verification)
4. [Backend Agent Testing](#backend-agent-testing)
5. [Frontend Testing](#frontend-testing)
6. [End-to-End Integration Testing](#end-to-end-integration-testing)
7. [Troubleshooting Guide](#troubleshooting-guide)

---

## ✅ Pre-Testing Checklist

### Required Software
```bash
✅ Node.js 18+ installed
✅ Python 3.9+ installed
✅ PowerShell/Terminal access
✅ Browser (Chrome/Firefox/Edge)
✅ Supabase account active
```

### Directory Structure Check
```
D:\WanderLink\
├── frontend/          ← Next.js application
├── agents/            ← Python agents
│   ├── src/
│   │   ├── matchmaker_agent.py
│   │   ├── planner_agent.py
│   │   └── agent_service.py
│   └── venv/          ← Python virtual environment
└── QUICK_SETUP.sql    ← Database setup script
```

---

## 🔧 Environment Setup Verification

### Step 1: Check Frontend Environment Variables

**File**: `D:\WanderLink\frontend\.env.local`

```bash
# Open PowerShell in frontend directory
cd D:\WanderLink\frontend
Get-Content .env.local
```

**Verify these are set:**
```env
✅ NEXT_PUBLIC_SUPABASE_URL=https://xbspnzviiefekzosukfa.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (long key)
✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (long key)
✅ AGENT_SERVICE_URL=http://localhost:8000
✅ NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000
```

**⚠️ Action Required:**
- If `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are empty:
  - Google Login will not work (expected for now)
  - You can still test with mock user ID

---

### Step 2: Check Agent Environment Variables

**File**: `D:\WanderLink\agents\.env`

```bash
# Open PowerShell in agents directory
cd D:\WanderLink\agents
Get-Content .env
```

**Verify these are set:**
```env
✅ ASI_ONE_API_KEY=sk_675e22c10000478886c8ed320354d866679a65354ecd4a50bf93928249f774c5
✅ GEMINI_API_KEY=AIzaSyAQevDYh8-cFF4w2l71Z7LUWKj8f-EN6jE
✅ SUPABASE_URL=https://xbspnzviiefekzosukfa.supabase.co
✅ SUPABASE_SERVICE_KEY=eyJhbGci... (long key)
```

---

## 🗄️ Database Setup & Verification

### Step 1: Run Database Setup Script

**Important**: This creates test data for testing!

1. **Go to Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/xbspnzviiefekzosukfa
   ```

2. **Navigate to SQL Editor**:
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Paste** the contents of `QUICK_SETUP.sql`:
   ```bash
   # In PowerShell
   cd D:\WanderLink
   Get-Content QUICK_SETUP.sql | clip  # Copies to clipboard
   ```

4. **Run the Script**:
   - Paste into SQL Editor
   - Click "RUN"
   - Should see: "Success. No rows returned"

---

### Step 2: Verify Database Tables

**In Supabase → Table Editor:**

#### ✅ Check `users` table:
```sql
SELECT id, email, full_name FROM users LIMIT 5;
```
**Expected**: At least 1 user with ID `f7e78b88-682c-4534-af7c-c4332db4c038`

#### ✅ Check `travel_groups` table:
```sql
SELECT id, name, destination, current_members, max_members, status 
FROM travel_groups 
ORDER BY created_at DESC 
LIMIT 5;
```
**Expected**: 5 test groups:
- Tokyo Cherry Blossom Adventure 🌸
- Bali Wellness & Beaches 🏝️
- Iceland Northern Lights ❄️
- Thailand Island Hopping 🛥️
- Morocco Desert Safari 🐪

#### ✅ Check `group_members` table:
```sql
SELECT group_id, user_id, status, compatibility_score 
FROM group_members 
LIMIT 5;
```
**Expected**: 5 memberships with status='accepted'

---

### Step 3: Test Database Connection

```bash
# In PowerShell (frontend directory)
cd D:\WanderLink\frontend

# Test Supabase connection
node -e "const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); supabase.from('travel_groups').select('count').then(({data, error}) => console.log('Groups:', data, error))"
```

**Expected Output**: `Groups: [ { count: 5 } ] null`

---

## 🤖 Backend Agent Testing

### Terminal 1: Start Agent Service (FastAPI)

```powershell
# Open new PowerShell window
cd D:\WanderLink\agents
.\venv\Scripts\Activate.ps1
python src\agent_service.py
```

**Expected Output**:
```
============================================================
🚀 WanderLink Agent Service Started!
============================================================
FastAPI Server: http://localhost:8000
Docs: http://localhost:8000/docs
⚠️  Using LOCAL agents (Agentverse not configured)
   Make sure matchmaker_agent.py and planner_agent.py are running!
============================================================

INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**✅ Test Health Endpoint**:
```powershell
# In another PowerShell
curl http://localhost:8000/health
```

**Expected Response**:
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

**✅ View API Docs**:
- Open browser: http://localhost:8000/docs
- Should see FastAPI Swagger UI with endpoints

---

### Terminal 2: Start MatchMaker Agent

```powershell
# Open new PowerShell window
cd D:\WanderLink\agents
.\venv\Scripts\Activate.ps1
python src\matchmaker_agent.py
```

**Expected Output**:
```
============================================================
🤝 WanderLink MatchMaker Agent Started!
============================================================
Agent Name: wanderlink_matchmaker
Agent Address: agent1q2nj9ufky0ryqd95rhep9et6mjfxs0jy6nt8kd6l692ec39rahjq6nah4k8
💬 Chat Protocol: ENABLED
============================================================
INFO: [wanderlink_matchmaker]: Manifest published successfully: AgentChatProtocol
INFO: [uagents.registration]: Registration on Almanac API successful
INFO: [wanderlink_matchmaker]: 🚀 Server starting on http://127.0.0.1:8001
```

**Key Success Indicators**:
- ✅ "Manifest published successfully: AgentChatProtocol"
- ✅ "Registration on Almanac API successful"
- ✅ Server running on port 8001
- ✅ NO warnings about protocol name overrides

---

### Terminal 3: Start Planner Agent

```powershell
# Open new PowerShell window
cd D:\WanderLink\agents
.\venv\Scripts\Activate.ps1
python src\planner_agent.py
```

**Expected Output**:
```
============================================================
🗺️  WanderLink Planner Agent Started!
============================================================
Agent Name: wanderlink_planner
Agent Address: agent1q2kxy...
💬 Chat Protocol: ENABLED
============================================================
INFO: [wanderlink_planner]: Manifest published successfully: AgentChatProtocol
INFO: [uagents.registration]: Registration on Almanac API successful
INFO: [wanderlink_planner]: 🚀 Server starting on http://127.0.0.1:8002
```

**Key Success Indicators**:
- ✅ "Manifest published successfully: AgentChatProtocol"
- ✅ Server running on port 8002

---

### Verify All 3 Backend Services Running

```powershell
# Check ports
netstat -ano | findstr "8000 8001 8002"
```

**Expected**:
```
TCP    127.0.0.1:8000    LISTENING    (Agent Service)
TCP    127.0.0.1:8001    LISTENING    (MatchMaker)
TCP    127.0.0.1:8002    LISTENING    (Planner)
```

---

## 🎨 Frontend Testing

### Terminal 4: Start Frontend

```powershell
# Open new PowerShell window
cd D:\WanderLink\frontend
npm run dev
```

**Expected Output**:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

**✅ Open Browser**: http://localhost:3000

---

### Frontend Component Tests

#### Test 1: Homepage Loads
```
✅ Visit: http://localhost:3000
✅ Should see: "WANDERLINK" logo
✅ Should see: "LOG IN WITH GOOGLE" button (may not work without OAuth setup)
✅ Should see: Hero section with "DISCOVER YOUR TRIBE"
```

#### Test 2: Dashboard Access
```
✅ Visit: http://localhost:3000/dashboard
✅ Should see: Dashboard with stats
✅ Should see: "WELCOME BACK" message
```

#### Test 3: Trips Page Loads
```
✅ Visit: http://localhost:3000/trips
✅ Should see: "DISCOVER AMAZING TRIPS" header
✅ Should see: Two buttons:
   - "CREATE GROUP" (green button)
   - "FIND MY MATCHES" (purple button)
✅ Should see: Mock trip cards displayed
```

---

## 🔗 End-to-End Integration Testing

### **TEST SCENARIO 1: Create a Travel Group**

#### Step-by-Step:

1. **Open**: http://localhost:3000/trips

2. **Click**: "CREATE GROUP" button (green)

3. **Fill Form**:
   ```
   Group Name: "Paris Adventure 2025"
   Destination: "Paris, France"
   Start Date: "2025-12-01"
   End Date: "2025-12-08"
   Budget: "1500"
   Max Members: 3
   ```

4. **Click**: "CREATE GROUP"

5. **Expected Result**:
   ```
   ✅ Success message appears
   ✅ Modal closes
   ✅ New group appears in database
   ```

6. **Verify in Supabase**:
   ```sql
   SELECT * FROM travel_groups 
   WHERE name = 'Paris Adventure 2025'
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   Should show your new group!

---

### **TEST SCENARIO 2: Find Compatible Matches (Critical Integration Test!)**

This tests: **Frontend → API → Agent Service → MatchMaker Agent → Database**

#### Step-by-Step:

1. **Open**: http://localhost:3000/trips

2. **Click**: "FIND MY MATCHES" button (purple)

3. **Fill Preferences Form**:
   ```
   Destinations: Select "Tokyo" or "Bali"
   Budget Range: $1000 - $2000
   Interests: Check "Culture", "Food", "Adventure"
   Travel Style: Select "Social" and "Budget"
   ```

4. **Click**: "FIND MATCHES"

5. **Watch Terminal Outputs**:

   **Frontend Terminal** (Terminal 4):
   ```
   🔍 Starting match finding process...
   📋 User preferences: {...}
   ✅ Using user ID: user_1234...
   🔎 Finding matches...
   ```

   **Agent Service Terminal** (Terminal 1):
   ```
   INFO: POST /api/find-matches
   📨 Received match request for user: user_1234...
   🌐 Using LOCAL agents (forwarding to port 8001)
   ✅ Got response from MatchMaker agent
   ```

   **MatchMaker Agent Terminal** (Terminal 2):
   ```
   INFO: 📥 Received match request
   INFO: 🔍 Finding compatible matches...
   INFO: ✅ Found 3 matches (compatibility > 60%)
   INFO: 📤 Sending response...
   ```

6. **Expected Frontend Result**:
   ```
   ✅ Modal shows "🎉 We Found X Compatible Matches!"
   ✅ Match cards displayed with:
      - Compatibility percentage (e.g., 75% Compatible)
      - Destination name
      - Budget range
      - Shared interests tags
      - "JOIN GROUP" button
   ```

7. **Click on a Match Card**:
   ```
   ✅ Expands to show more details
   ✅ Shows host information
   ✅ Shows trip dates
   ✅ Shows group size (e.g., "1/3 travelers")
   ```

8. **Click**: "JOIN GROUP" on a match

9. **Expected Result**:
   ```
   ✅ Alert: "🎉 Successfully joined the group!"
   ✅ Modal closes
   ```

10. **Verify in Database**:
    ```sql
    SELECT gm.*, tg.name, tg.destination
    FROM group_members gm
    JOIN travel_groups tg ON gm.group_id = tg.id
    ORDER BY gm.joined_at DESC
    LIMIT 5;
    ```
    Should show your new membership!

---

### **TEST SCENARIO 3: Generate Itinerary (AI Agent Test)**

This tests: **Frontend → Planner Agent → AI Generation**

#### Step-by-Step:

1. **From a Match Card**, click "View Details"

2. **Click**: "GENERATE ITINERARY" button

3. **Fill Itinerary Form**:
   ```
   Number of Days: 7
   Daily Budget: $150
   Pace: "Moderate"
   Interests: (auto-filled from profile)
   ```

4. **Click**: "GENERATE"

5. **Watch Planner Agent Terminal** (Terminal 3):
   ```
   INFO: 📥 Received itinerary request
   INFO: 🤖 Using ASI:One AI for generation...
   INFO: ✅ Generated 7-day itinerary
   INFO: 📤 Sending response...
   ```

6. **Expected Frontend Result**:
   ```
   ✅ Modal shows day-by-day itinerary
   ✅ Each day has:
      - Day number and title
      - Morning/Afternoon/Evening activities
      - Cost per activity
      - Total daily cost
   ✅ Shows total trip cost
   ✅ Shows "Powered by ASI:One AI" badge
   ```

---

## 🔍 Detailed API Testing (Using Browser/Postman)

### Test 1: Health Check

```bash
# Method: GET
# URL: http://localhost:8000/health
```

**Expected Response**:
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

---

### Test 2: Find Matches API

```bash
# Method: POST
# URL: http://localhost:8000/api/find-matches
# Headers: Content-Type: application/json
# Body:
```

```json
{
  "user_id": "test_user_123",
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
    "luxury": 0.5,
    "social": 0.9
  }
}
```

**Using PowerShell**:
```powershell
$body = @{
    user_id = "test_user_123"
    destination = "Tokyo"
    start_date = "2025-11-15"
    end_date = "2025-11-22"
    budget_min = 1000
    budget_max = 2000
    activities = @{
        culture = 0.9
        food = 0.8
        adventure = 0.6
    }
    travel_style = @{
        luxury = 0.5
        social = 0.9
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/find-matches" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response**:
```json
{
  "matches": [
    {
      "user_id": "user_abc",
      "group_id": "group_xyz",
      "destination": "Tokyo",
      "compatibility": 85.5,
      "shared_interests": ["culture", "food"],
      "estimated_cost": 1400,
      "confidence": "High"
    }
  ],
  "confidence": "High",
  "message": "Found X compatible matches",
  "asi_powered": true
}
```

---

### Test 3: Generate Itinerary API

```bash
# Method: POST
# URL: http://localhost:8000/api/generate-itinerary
# Body:
```

```json
{
  "destination": "Tokyo",
  "num_days": 7,
  "interests": ["culture", "food", "technology"],
  "budget_per_day": 200,
  "pace": "moderate"
}
```

**Using PowerShell**:
```powershell
$body = @{
    destination = "Tokyo"
    num_days = 7
    interests = @("culture", "food", "technology")
    budget_per_day = 200
    pace = "moderate"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/generate-itinerary" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response**:
```json
{
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival & Cultural Immersion",
      "activities": [...]
    }
  ],
  "recommendations": [...],
  "estimated_cost": "$1,400 total",
  "message": "7-day itinerary generated",
  "asi_powered": true
}
```

---

## 🐛 Troubleshooting Guide

### Problem 1: Frontend Won't Start

**Error**: `Module not found` or `Cannot find package`

**Solution**:
```powershell
cd D:\WanderLink\frontend
npm install
npm run dev
```

---

### Problem 2: Agent Service Fails

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```powershell
cd D:\WanderLink\agents
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

### Problem 3: Agents Won't Start

**Error**: `ModuleNotFoundError: No module named 'uagents'`

**Solution**:
```powershell
cd D:\WanderLink\agents
.\venv\Scripts\Activate.ps1
pip install uagents uagents-core
pip install -r requirements.txt
```

---

### Problem 4: Database Connection Fails

**Error**: `Database error` or `Authentication failed`

**Check**:
1. Supabase URL is correct in `.env.local`
2. Service role key is correct
3. Run `QUICK_SETUP.sql` to create tables
4. Check RLS policies in Supabase

**Quick Fix**:
```sql
-- In Supabase SQL Editor, disable RLS temporarily for testing
ALTER TABLE travel_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
```

---

### Problem 5: "Database error: invalid input syntax for type integer: max_members"

**Fixed**: This was a SQL query issue in `find-matches` route

**If you still see this error**:
1. Make sure frontend is restarted after the fix
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check `FIX_DATABASE_ERROR.md` for details

**Solution**: The route now filters groups in JavaScript instead of SQL

---

### Problem 6: No Matches Found

**Possible Causes**:
1. No groups in database → Run `QUICK_SETUP.sql`
2. All groups are full → Check `current_members < max_members`
3. Agent not running → Check Terminal 2
4. Agent Service not forwarding → Check Terminal 1

**Debug**:
```powershell
# Check database has groups
# In Supabase SQL Editor:
SELECT COUNT(*) FROM travel_groups WHERE status = 'forming';
```

Should return at least 5 groups from QUICK_SETUP.sql

---

### Problem 6: Port Already in Use

**Error**: `Address already in use`

**Solution**:
```powershell
# Find process using port
netstat -ano | findstr "8000"  # Or 8001, 8002, 3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

### Problem 7: ASI:One API Key Invalid

**Error**: `Invalid API key` or `401 Unauthorized`

**Solution**:
- ASI:One features will be disabled
- Agent will fall back to basic matching
- Check `agents\.env` has valid `ASI_ONE_API_KEY`

---

## ✅ Complete Testing Checklist

### Environment Setup
- [ ] Frontend `.env.local` configured
- [ ] Agents `.env` configured
- [ ] Database `QUICK_SETUP.sql` executed
- [ ] All dependencies installed

### Services Running
- [ ] Frontend running on http://localhost:3000
- [ ] Agent Service running on http://localhost:8000
- [ ] MatchMaker Agent running on http://localhost:8001
- [ ] Planner Agent running on http://localhost:8002

### Database Verification
- [ ] `users` table has at least 1 user
- [ ] `travel_groups` table has 5 test groups
- [ ] `group_members` table has memberships
- [ ] Can query tables without errors

### Frontend Tests
- [ ] Homepage loads
- [ ] Trips page loads
- [ ] Can click "CREATE GROUP"
- [ ] Can click "FIND MY MATCHES"
- [ ] Modal forms display correctly

### Backend Tests
- [ ] Agent Service `/health` returns 200
- [ ] MatchMaker publishes manifest successfully
- [ ] Planner publishes manifest successfully
- [ ] No error messages in agent terminals

### Integration Tests
- [ ] Create group flow works end-to-end
- [ ] Find matches flow works end-to-end
- [ ] Match results display correctly
- [ ] Can join a group
- [ ] Group membership saved to database
- [ ] Generate itinerary works
- [ ] Itinerary displays in frontend

### API Tests
- [ ] POST /api/find-matches returns matches
- [ ] POST /api/generate-itinerary returns itinerary
- [ ] GET /health returns healthy status
- [ ] All API responses have correct format

---

## 🎯 Success Criteria

### You know everything is working when:

1. **All 4 terminals are running without errors**:
   - ✅ Frontend (port 3000)
   - ✅ Agent Service (port 8000)
   - ✅ MatchMaker Agent (port 8001)
   - ✅ Planner Agent (port 8002)

2. **You can complete this user journey**:
   ```
   Visit Homepage → Go to Trips → Click "FIND MY MATCHES" 
   → Fill Preferences → See Match Results → Click "JOIN GROUP" 
   → Success Message → Verify in Database
   ```

3. **Agent terminals show successful processing**:
   ```
   MatchMaker: "✅ Found 3 matches (compatibility > 60%)"
   Planner: "✅ Generated 7-day itinerary"
   ```

4. **Database has your test data**:
   ```sql
   -- Should return your joins
   SELECT COUNT(*) FROM group_members 
   WHERE user_id LIKE 'user_%';
   ```

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Deploy Agents to Agentverse**:
   - Follow `AGENTVERSE_DEPLOY_FIXED.md`
   - Test in ASI:One Chat

2. **Set up Google OAuth**:
   - Get credentials from Google Cloud Console
   - Update `.env.local`
   - Test real authentication

3. **Production Deployment**:
   - Deploy frontend to Vercel
   - Update environment variables
   - Test live application

---

## 📊 Expected Test Results Summary

| Test | Expected Result | Status |
|------|----------------|--------|
| Frontend starts | http://localhost:3000 loads | ⏳ |
| Agent Service starts | Port 8000 listening | ⏳ |
| MatchMaker starts | Port 8001 + manifest published | ⏳ |
| Planner starts | Port 8002 + manifest published | ⏳ |
| Database has data | 5 groups, 1 user | ⏳ |
| Create group | New group in database | ⏳ |
| Find matches | Returns compatible groups | ⏳ |
| Join group | Membership saved | ⏳ |
| Generate itinerary | 7-day plan returned | ⏳ |

Fill in ✅ as you complete each test!

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0  
**Ready for Testing**: YES ✅
