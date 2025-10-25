# ✅ Setup Checklist - User Agent System

## Step-by-Step Setup Progress

### ✅ 1. Supabase Project Creation
- [x] Created Supabase project at https://xbspnzviiefekzosukfa.supabase.co
- [x] Obtained anon public key
- [x] Obtained service role key

### ✅ 2. Environment Variables
- [x] **Backend** (`agents/.env`) - Supabase credentials added
- [x] **Frontend** (`frontend/.env.local`) - Supabase credentials added

### ✅ 3. Dependencies Installation
- [x] **Backend** - `pip install supabase` ✅ Installed
- [x] **Backend** - `pip install python-dotenv` ✅ Installed  
- [x] **Frontend** - `npm install @supabase/supabase-js` ✅ Installed

### ✅ 4. Supabase Connection Test
- [x] Test script created (`agents/test_supabase.py`)
- [x] Connection successful ✅
- [x] Users table accessible ✅

---

## 🔜 Next Steps

### 📊 5. Run SQL Schema (CRITICAL)

You need to run the SQL commands from **`SUPABASE_SETUP.md`** in your Supabase project:

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/xbspnzviiefekzosukfa

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Copy & Run Each Section:**
   
   **Section 1: Create Tables**
   ```sql
   -- Copy from SUPABASE_SETUP.md: "CREATE TABLE users..."
   -- Run this first
   ```

   **Section 2: RLS Policies**
   ```sql
   -- Copy from SUPABASE_SETUP.md: "ALTER TABLE users ENABLE ROW LEVEL SECURITY..."
   -- Run after tables are created
   ```

   **Section 3: Indexes**
   ```sql
   -- Copy from SUPABASE_SETUP.md: "CREATE INDEX idx_users_agent_address..."
   -- Run after RLS policies
   ```

   **Section 4: Triggers**
   ```sql
   -- Copy from SUPABASE_SETUP.md: "CREATE OR REPLACE FUNCTION update_updated_at_column()..."
   -- Run last
   ```

4. **Verify Tables Created:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   
   You should see:
   - users
   - user_preferences
   - user_agent_states
   - match_requests
   - saved_matches

---

### 🚀 6. Start the System

Once SQL schema is set up, start all services:

**Terminal 1: Matchmaker Agent**
```powershell
cd D:\WanderLink\agents
.\venv\Scripts\Activate.ps1
python src\matchmaker_agent.py
```

**Terminal 2: Planner Agent**
```powershell
cd D:\WanderLink\agents
.\venv\Scripts\Activate.ps1
python src\planner_agent.py
```

**Terminal 3: Agent Service**
```powershell
cd D:\WanderLink\agents
.\venv\Scripts\Activate.ps1
python src\agent_service.py
```

**Terminal 4: Frontend**
```powershell
cd D:\WanderLink\frontend
npm run dev
```

---

### 🧪 7. Test the Complete Flow

1. **Open browser:** http://localhost:3000/trips

2. **Click "JOIN A TRIP"** button (purple gradient, top-right)

3. **Fill 4-step form:**
   - **Step 1:** Name, Email, Age, Gender, Location
   - **Step 2:** Destinations (add multiple), Budget range, Pace, Experience
   - **Step 3:** Interests (select multiple from 12 options)
   - **Step 4:** Accommodation types, Languages, Preferences

4. **Click "FIND MY MATCHES!"**

5. **View Results:**
   - Should show matching trips
   - Each with compatibility score (0-100%)
   - Breakdown by factor (Interests, Budget, Pace, Destination)
   - Color-coded badges (green/yellow/orange)

6. **Test Actions:**
   - Click "VIEW DETAILS" to expand trip info
   - Click "JOIN TRIP" to send request
   - Click heart icon to save to favorites

7. **Verify Database:**
   Go to Supabase dashboard → Table Editor:
   - Check `users` table has your entry
   - Check `user_preferences` table has your preferences
   - Check `user_agent_states` table has agent created
   - Check `match_requests` table has match results

---

## 📋 Quick Commands Reference

### Test Supabase Connection
```powershell
cd D:\WanderLink\agents
python test_supabase.py
```

### Start All Services (4 terminals needed)
```powershell
# Terminal 1
cd D:\WanderLink\agents
python src\matchmaker_agent.py

# Terminal 2
python src\planner_agent.py

# Terminal 3
python src\agent_service.py

# Terminal 4
cd ..\frontend
npm run dev
```

### Check if Tables Exist
```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### View All Users
```sql
-- Run in Supabase SQL Editor
SELECT * FROM users;
```

### View All Preferences
```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_preferences;
```

---

## 🎯 Success Criteria

Your system is fully working when:

✅ All 4 services start without errors  
✅ Frontend loads at http://localhost:3000  
✅ "JOIN A TRIP" button visible on /trips page  
✅ Modal opens with 4-step form  
✅ Form validates correctly (can't proceed without required fields)  
✅ Matches display after form submission  
✅ Compatibility scores show correctly  
✅ Can expand trip details  
✅ Can join trips and save favorites  
✅ Data appears in Supabase tables  

---

## 🐛 Troubleshooting

### "Table 'users' does not exist"
→ Run SQL schema from SUPABASE_SETUP.md

### "Supabase not configured"
→ Check .env files have correct credentials

### "No matches found"
→ Normal! Mock matching is working. Data shows "no real trips yet"

### Frontend won't start
→ Run `npm install --legacy-peer-deps` in frontend folder

### Agent service errors
→ Make sure virtual environment is activated

---

## 📚 Documentation Files

- **`SUPABASE_SETUP.md`** - Complete SQL schema (MUST RUN THIS!)
- **`FULL_USER_AGENT_SYSTEM_GUIDE.md`** - Full implementation guide
- **`agents/.env`** - Backend environment variables ✅ CONFIGURED
- **`frontend/.env.local`** - Frontend environment variables ✅ CONFIGURED

---

## 🎉 Current Status

**COMPLETED:**
- ✅ Supabase project created
- ✅ Environment variables configured (both backend & frontend)
- ✅ Dependencies installed (supabase, python-dotenv, @supabase/supabase-js)
- ✅ Connection test successful

**NEXT:**
- 🔜 Run SQL schema in Supabase (5-10 minutes)
- 🔜 Start all 4 services
- 🔜 Test the complete user flow

**You're 90% done! Just need to run the SQL schema and start testing! 🚀**
