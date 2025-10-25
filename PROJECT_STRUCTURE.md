# 📁 WanderLink - Ultra-Clean Project Structure

## 🎯 Active Files & Folders (Minimal & Essential)

```
WanderLink/
├── 📄 README.md                      # Main project documentation
├── 📄 PROJECT_STRUCTURE.md           # This file
├── 📄 TRAVEL_GROUPS_SCHEMA.sql       # Active Supabase database schema
│
├── 📁 agents/                        # Python agents (deploy to Agentverse)
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Template
│   ├── requirements.txt              # Python dependencies
│   └── src/
│       └── agents/
│           ├── travel_agent_asi.py   # ✅ Extracts preferences, sends to MatchMaker
│           ├── matchmaker_agent_asi.py # ✅ Collects 3 users, sends to Planner
│           └── planner_agent.py      # ✅ Creates groups, stores in Supabase
│
├── 📁 frontend/                      # Next.js frontend application
│   ├── app/
│   │   ├── agent-trips-v2/
│   │   │   └── page.tsx              # ✅ Main UI (working!)
│   │   ├── test-agent/
│   │   │   └── page.tsx              # ✅ Test page (for debugging)
│   │   └── api/
│   │       ├── agent-message/
│   │       │   └── route.ts          # ✅ Send messages to agents
│   │       └── planner-listener/
│   │           └── route.ts          # ✅ Poll Supabase for groups
│   ├── hooks/
│   │   └── useGroupStatus.ts         # ✅ Polling hook (stops when found)
│   ├── lib/
│   │   └── supabase.ts               # Supabase client
│   └── .env.local                    # ✅ Environment variables
│
├── 📁 supabase/                      # Supabase migrations
│   └── migrations/
│
└── 📁 excess/                        # ⚠️ Unused/old files (850+ items)
    ├── 140+ .md documentation files
    ├── BrandX/ folder
    ├── mofo/ folder
    ├── social-media-manager/ folder
    ├── contracts/ folder
    ├── docs/ folder
    ├── services/ folder (old agent services)
    ├── utils/ folder (old utilities)
    ├── Old scripts (.ps1, .py, .bat)
    ├── Old SQL files
    └── Old config files (package.json, tsconfig.json, etc.)
```

---

## 🚀 Quick Start

### 1. **Deploy Agents to Agentverse**
```bash
# Deploy these 3 files:
agents/src/agents/travel_agent_asi.py
agents/src/agents/matchmaker_agent_asi.py
agents/src/agents/planner_agent.py
```

### 2. **Setup Supabase**
```sql
-- Run this in Supabase SQL Editor:
TRAVEL_GROUPS_SCHEMA.sql
```

### 3. **Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

### 4. **Test**
Open: `http://localhost:3000/agent-trips-v2`

---

## 📊 Data Flow

```
User (Main UI)
    ↓
/api/agent-message
    ↓
Travel Agent (Agentverse)
    ↓
MatchMaker Agent (Agentverse)
    ↓
Planner Agent (Agentverse)
    ↓
Supabase (travel_groups table)
    ↓
/api/planner-listener (polls every 5s)
    ↓
useGroupStatus hook
    ↓
Main UI displays group! ✅
```

---

## ✅ What's Working

- ✅ Direct agent communication (no webhook needed)
- ✅ User ID tracking through agent chain
- ✅ Automatic group formation (3 users)
- ✅ Supabase polling (stops when group found)
- ✅ Beautiful main UI with group chat
- ✅ Itinerary display from AI agents
- ✅ Clean, organized codebase

---

## 📝 Important Files Only

### **Frontend (5 key files):**
1. `frontend/app/agent-trips-v2/page.tsx` - Main UI
2. `frontend/app/api/agent-message/route.ts` - Agent communication
3. `frontend/app/api/planner-listener/route.ts` - Supabase polling
4. `frontend/hooks/useGroupStatus.ts` - Polling hook
5. `frontend/.env.local` - Configuration

### **Agents (3 files):**
1. `agents/src/agents/travel_agent_asi.py`
2. `agents/src/agents/matchmaker_agent.py`
3. `agents/src/agents/planner_agent.py`

### **Database (1 file):**
1. `TRAVEL_GROUPS_SCHEMA.sql`

---

## 🗑️ Excess Folder

The `excess/` folder contains **850+ old/unused files**:
- 140+ markdown documentation files
- Old folders (BrandX, mofo, social-media-manager, contracts, docs, services, utils)
- Deprecated scripts (.ps1, .py, .bat files)
- Old SQL files
- Old configuration files (package.json, tsconfig.json, etc.)
- Test files and utilities

**You can safely ignore or delete the excess folder.**

---

## 🎯 Next Steps

1. ✅ Agents deployed to Agentverse
2. ✅ Supabase schema created
3. ✅ Frontend running locally
4. 🚀 Ready to test with 3 users!

---

**Your project is now clean and organized!** 🎉
