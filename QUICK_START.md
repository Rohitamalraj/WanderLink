# 🎯 Quick Start Guide - All Services Running

## ✅ What Just Happened

**Matchmaker Agent is RUNNING!** ✅
- Port: 8001
- Address: agent1q2nj9ufky0ryqd95rhep9et6mjfxs0jy6nt8kd6l692ec39rahjq6nah4k8
- Status: Active and listening

The warnings about "Almanac contract" are NORMAL for local development. You can ignore them.

---

## 🚀 Start All 4 Services

### Terminal 1: ✅ Matchmaker Agent (ALREADY RUNNING)
```powershell
cd D:\WanderLink\agents
python src\matchmaker_agent.py
```
**Status:** ✅ Running on port 8001

---

### Terminal 2: Planner Agent
**Open a NEW terminal** and run:
```powershell
cd D:\WanderLink\agents
python src\planner_agent.py
```

---

### Terminal 3: Agent Service (API)
**Open a NEW terminal** and run:
```powershell
cd D:\WanderLink\agents
python src\agent_service.py
```

---

### Terminal 4: Frontend
**Open a NEW terminal** and run:
```powershell
cd D:\WanderLink\frontend
npm run dev
```

---

## 📊 Expected Output

### ✅ Matchmaker Agent (Port 8001)
```
🚀 Starting WanderLink MatchMaker Agent...
Agent Address: agent1q2nj9ufky0ryqd95rhep9et6mjfxs0jy6nt8kd6l692ec39rahjq6nah4k8
Port: 8001
Starting server on http://0.0.0.0:8001
```

### ✅ Planner Agent (Port 8002)
```
🚀 Starting WanderLink Planner Agent...
Agent Address: agent1q[...unique_address...]
Port: 8002
Starting server on http://0.0.0.0:8002
```

### ✅ Agent Service (Port 8000)
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### ✅ Frontend (Port 3000)
```
- ready started server on [::]:3000, url: http://localhost:3000
- event compiled client and server successfully
- wait compiling...
- event compiled successfully
```

---

## 🎮 How to Test

### 1. Open Browser
Go to: **http://localhost:3000/trips**

### 2. Find the "JOIN A TRIP" Button
Look for the purple gradient button at the top-right of the page with a sparkles (✨) icon.

### 3. Click and Fill the Form

**Step 1 - Basic Info:**
```
Name: John Doe
Email: john@example.com
Age: 28
Gender: Male
Location: New York, USA
```

**Step 2 - Travel Preferences:**
```
Destinations: Click "Add destination" and type:
- Tokyo
- Paris
- Bali

Budget: 
- Min: $500
- Max: $3000

Travel Pace: Moderate
Experience: Intermediate
```

**Step 3 - Interests:**
Select at least 3:
- ✅ Culture
- ✅ Food  
- ✅ Photography
- ✅ Beach
- ✅ Adventure

**Step 4 - Additional:**
```
Accommodation: 
- ✅ Hotel
- ✅ Airbnb

Languages:
- ✅ English
- ✅ Spanish

Smoking: Non-smoking preferred
Drinking: Social drinking okay
```

### 4. Submit
Click **"FIND MY MATCHES!"** button at the bottom.

### 5. View Results
You should see:
- Loading spinner (2-3 seconds)
- Match results modal opens
- 5 trips displayed with compatibility scores
- Color-coded badges (Green/Yellow/Orange)

### 6. Interact
- Click **"VIEW DETAILS"** to expand trip info
- Click **"JOIN TRIP"** to send a request
- Click **❤️ heart** to save to favorites

---

## 🎉 Success Indicators

### ✅ All Services Running
```
Matchmaker Agent → Port 8001 ✅
Planner Agent    → Port 8002 ⏳
Agent Service    → Port 8000 ⏳
Frontend         → Port 3000 ⏳
```

### ✅ Frontend Working
- Page loads without errors
- "JOIN A TRIP" button visible
- Button has purple gradient and sparkles icon
- Clicking opens modal

### ✅ Form Working
- Can navigate through 4 steps
- Progress bar updates
- Can add/remove destinations
- Can select multiple interests
- Validation prevents skipping required fields

### ✅ Matching Working
- Submit button triggers loading
- Results modal appears
- Shows 5 mock trips
- Each has compatibility score (%)
- Can expand details
- Can join or save trips

### ✅ Database Working
Check Supabase dashboard:
```sql
SELECT * FROM users;           -- Should have your entry
SELECT * FROM user_preferences; -- Should have your preferences
SELECT * FROM user_agent_states; -- Should have agent info
SELECT * FROM match_requests;   -- Should have matches
```

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on port (e.g., 8001)
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F
```

### Agent Won't Start
```powershell
# Make sure you're in the agents directory
cd D:\WanderLink\agents
# Check if virtual environment is needed
python src\matchmaker_agent.py
```

### Frontend Won't Load
```powershell
cd D:\WanderLink\frontend
# Clear cache and restart
rm -r .next
npm run dev
```

### No Matches Showing
- Check browser console (F12) for errors
- Verify all 4 services are running
- Check agent service is on port 8000
- Verify Supabase credentials in .env files

---

## 📱 Quick Commands

### Stop All Services
Press `CTRL+C` in each terminal window.

### Restart a Service
1. Stop with `CTRL+C`
2. Run the command again

### Check What's Running
```powershell
# Check ports in use
netstat -ano | findstr :8000
netstat -ano | findstr :8001
netstat -ano | findstr :8002
netstat -ano | findstr :3000
```

### View Supabase Data
Go to: https://supabase.com/dashboard/project/xbspnzviiefekzosukfa/editor

---

## 🎯 What to Do Right Now

**NEXT 3 COMMANDS:**

1. **Open Terminal 2:**
```powershell
cd D:\WanderLink\agents
python src\planner_agent.py
```

2. **Open Terminal 3:**
```powershell
cd D:\WanderLink\agents
python src\agent_service.py
```

3. **Open Terminal 4:**
```powershell
cd D:\WanderLink\frontend
npm run dev
```

**Then open:** http://localhost:3000/trips

---

## 🎊 You're Almost There!

**Current Status:**
- ✅ Matchmaker Agent Running (Port 8001)
- ⏳ Need to start 3 more services
- ⏳ Then test in browser

**Time to Complete:** 2 minutes

**What You'll See:** A fully working travel matching system with AI-powered compatibility scoring!

Let's go! 🚀
