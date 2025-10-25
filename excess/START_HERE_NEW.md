# 🌐 WanderLink - Start Here

**The Web3 Era of Social Travel** - Find your travel tribe powered by AI agents and blockchain trust.

---

## 🎯 What is WanderLink?

A **decentralized AI + Web3 travel matchmaking platform** where each user has a **PersonalAgent** that:
- Learns your travel personality (6 dimensions)
- Finds compatible travel groups
- Negotiates trip details autonomously
- Ensures trust through blockchain

Every trip is represented by a **GroupAgent** that evaluates applicants and forms the perfect group.

---

## ✅ CURRENT STATUS: Phase 1A Complete!

### What's Built
- ✅ **PersonalAgent Factory** - Creates AI agents for users
- ✅ **6-Dimensional Personality** - Adventure, Social, Budget, Planning, Pace, Culture
- ✅ **Agent Service** - REST API for agent operations
- ✅ **Database Schema** - Supabase storage for agents

### What You Can Do Right Now
1. **Create a PersonalAgent** for any user
2. **View personality profile** (6 dimensions + preferences)
3. **Store in database** with full RLS security

---

## 🚀 QUICK START (5 Minutes)

### 1. Run Database Migration
```sql
-- Go to Supabase Dashboard → SQL Editor
-- Copy & paste: agents/migrations/001_create_personal_agents.sql
-- Click "Run"
```

### 2. Start Agent Service
```powershell
cd D:\WanderLink\agents
python src\agent_service.py
```

### 3. Test Agent Creation
```powershell
curl -X POST http://localhost:8000/api/create-personal-agent `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test-user-123",
    "preferences": {
      "destinations": ["Bali", "Thailand"],
      "budgetMin": 2000,
      "budgetMax": 4000,
      "interests": ["beach", "culture", "food"],
      "pace": "moderate"
    }
  }'
```

### 4. Verify in Supabase
Go to Database → Tables → `personal_agents` - you should see your agent!

---

## 📚 DOCUMENTATION

| Document | Purpose |
|----------|---------|
| **COMPLETE_ROADMAP.md** ⭐ | Full 8-week implementation plan |
| **PHASE1_IMPLEMENTATION.md** | Current phase details & next steps |
| **agents/CLEANUP_COMPLETE.md** | What was cleaned up |
| **agents/PERSONALIZED_AGENTS_IMPLEMENTATION.md** | Original implementation plan |

---

## 🗺️ ROADMAP OVERVIEW

```
✅ Phase 1A (DONE): PersonalAgent Factory
⏳ Phase 1B-1F: Complete agent system (11 hours)
⏳ Phase 2: Web3 Integration (10 hours)
⏳ Phase 3: AgentVerse Deployment (10 hours)
⏳ Phase 4: Advanced Features (13 hours)
```

**Total to MVP**: ~44 hours remaining

---

## 🎨 HOW IT WORKS

### User Signs Up
```
POST /auth/signup
  ↓
POST /api/create-personal-agent
  ↓
PersonalAgent Created ✅
```

### Agent Personality Example
```json
{
  "adventure_level": 0.75,      // Loves adventure!
  "social_level": 0.60,         // Enjoys groups
  "budget_flexibility": 0.50,   // Moderate budget
  "planning_style": 0.40,       // Somewhat spontaneous
  "pace_preference": 0.70,      // Fast-paced trips
  "cultural_immersion": 0.80,   // Deep cultural experiences
  
  "preferred_destinations": ["Bali", "Thailand", "Japan"],
  "interests": ["beach", "culture", "food", "hiking"],
  "budget_range": {"min": 2000, "max": 4000}
}
```

### Finding Matches (Coming Soon)
```
User searches → PersonalAgent evaluates all trips → Returns matches
  Trip 1: 0.89 compatibility ⭐⭐⭐⭐⭐
  Trip 2: 0.76 compatibility ⭐⭐⭐⭐
```

---

## 🎯 NEXT STEPS

### Immediate (Today)
1. ✅ Run database migration
2. ✅ Test agent creation
3. ⏳ Create PersonalAgent Template
4. ⏳ Create GroupAgent Template

### This Week
5. ⏳ Build Agent Orchestrator
6. ⏳ Integrate with frontend
7. ⏳ Test end-to-end flow

### Next Week
8. ⏳ Deploy smart contracts
9. ⏳ Integrate Avail Network
10. ⏳ Add Lit Protocol KYC

---

## 🛠️ PROJECT STRUCTURE

```
WanderLink/
├── frontend/               # Next.js frontend
├── agents/
│   ├── src/
│   │   ├── agent_service.py         ✅ API service
│   │   ├── services/
│   │   │   └── agent_factory.py     ✅ Creates PersonalAgents
│   │   ├── agents/
│   │   │   ├── (personal_agent_template.py)  ⏳ Next
│   │   │   └── (group_agent_template.py)     ⏳ Next
│   │   └── models/
│   └── migrations/
│       └── 001_create_personal_agents.sql   ✅ Database schema
├── packages/
│   └── contracts/          # Smart contracts (Phase 2)
└── docs/
    ├── COMPLETE_ROADMAP.md          ⭐ Read this!
    └── PHASE1_IMPLEMENTATION.md     ⭐ Current phase
```

---

## 🔧 TECH STACK

### Current (Phase 1)
- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Python, FastAPI
- **Database**: Supabase (PostgreSQL)
- **Agents**: Custom Python agents

### Phase 2 (Web3)
- **Blockchain**: Solidity smart contracts
- **Staking**: Avail Network
- **KYC**: Lit Protocol
- **Explorer**: Blockscout/Hedera

### Phase 3 (Autonomous)
- **Agent Network**: Fetch.ai AgentVerse
- **AI**: ASI Alliance LLM
- **Communication**: uAgents protocol

---

## 🚀 WHERE TO START

**For Development**:
1. Read `COMPLETE_ROADMAP.md` for full vision
2. Read `PHASE1_IMPLEMENTATION.md` for current tasks
3. Run database migration
4. Test agent creation
5. Build PersonalAgent Template next

**For Understanding**:
1. Check `agents/src/services/agent_factory.py` - see how agents are created
2. Check `agents/migrations/001_create_personal_agents.sql` - see database schema
3. Check API docs at http://localhost:8000/docs when running

---

## 📞 NEED HELP?

- **API Documentation**: http://localhost:8000/docs (when running)
- **Database Schema**: `agents/migrations/001_create_personal_agents.sql`
- **Implementation Details**: `PHASE1_IMPLEMENTATION.md`
- **Full Roadmap**: `COMPLETE_ROADMAP.md`

---

**Status**: 🟢 Phase 1A Complete - Ready to build PersonalAgent Template!

**Progress**: 4.3% (2 of 46 hours)

**Next**: Run database migration, then create PersonalAgent Template 🚀
