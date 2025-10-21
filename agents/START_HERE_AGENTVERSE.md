# WanderLink Agentverse Setup - Quick Start

## 🚀 **Start Here!**

You chose **Option 2: Real Fetch.ai Agents on Agentverse.ai**

**Time Required:** 5-8 hours
**Difficulty:** Advanced
**Reward:** Production-ready AI agents! 🌟

---

## 📋 **Quick Setup (Copy-Paste Commands)**

### 1. Check Python (2 mins)

```powershell
# Check if Python is installed
python --version

# Should show: Python 3.9.x or higher
# If not, download from: https://www.python.org/downloads/
```

### 2. Setup Virtual Environment (5 mins)

```powershell
# Go to agents folder
cd d:\WanderLink\agents

# Create virtual environment
python -m venv venv

# Activate it (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# You should see (venv) in your terminal now
```

### 3. Install Dependencies (5 mins)

```powershell
# Make sure venv is activated!
pip install -r requirements.txt

# This installs:
# - uagents (Fetch.ai framework)
# - fastapi (API server)
# - openai (AI features)
# - scikit-learn (ML algorithms)
# ... and more
```

### 4. Create .env File (2 mins)

**Create:** `d:\WanderLink\agents\.env`

```bash
# Copy this content:

# Agentverse (you'll get these after creating agents)
AGENTVERSE_API_KEY=
MATCHMAKER_ADDRESS=
PLANNER_ADDRESS=

# OpenAI (optional - get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=

# Agent Seeds (keep these secret!)
MATCHMAKER_SEED=wanderlink_matchmaker_secret_2025
PLANNER_SEED=wanderlink_planner_secret_2025

# Service URL
AGENT_SERVICE_URL=http://localhost:8000
```

---

## 🌐 **Next: Create Agentverse Account**

### Step-by-Step:

1. **Go to:** https://agentverse.ai
2. **Click "Sign Up"**
3. **Enter email & password**
4. **Verify email** (check inbox)
5. **Login to dashboard**

**Screenshot the dashboard - you'll need it!**

---

## 📖 **Main Guide**

Follow the complete guide here:
**`AGENTVERSE_SETUP_COMPLETE.md`**

It has:
- ✅ Full Python code for MatchMaker agent
- ✅ Full Python code for Planner agent
- ✅ Agent deployment instructions
- ✅ Frontend integration code
- ✅ Testing procedures

---

## ⏱️ **Time Breakdown**

| Phase | Task | Time |
|-------|------|------|
| 1 | Environment Setup | 30 mins |
| 2 | Create Python Agents | 3-4 hours |
| 3 | Deploy to Agentverse | 1 hour |
| 4 | Connect to Frontend | 2 hours |
| 5 | Testing | 1 hour |

**Total: 7-8 hours**

---

## 🎯 **Milestones**

Track your progress:

### Phase 1: Setup ✅
- [ ] Python 3.9+ installed
- [ ] Virtual environment created & activated
- [ ] Dependencies installed
- [ ] .env file created
- [ ] Agentverse account created

### Phase 2: Build Agents ✅
- [ ] Created `src/matchmaker_agent.py`
- [ ] Created `src/planner_agent.py`
- [ ] Created `src/agent_service.py`
- [ ] Tested agents run locally

### Phase 3: Deploy ✅
- [ ] Deployed MatchMaker to Agentverse
- [ ] Deployed Planner to Agentverse
- [ ] Got agent addresses
- [ ] Got API key
- [ ] Updated .env file

### Phase 4: Integrate ✅
- [ ] Created frontend API routes
- [ ] Agent service running
- [ ] Frontend connects to service
- [ ] End-to-end test works

---

## 🆘 **Common Issues**

### "python not recognized"
**Fix:** Install Python from https://www.python.org/downloads/
Make sure to check "Add Python to PATH" during installation

### "venv\Scripts\Activate.ps1 cannot be loaded"
**Fix:** Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "pip install fails"
**Fix:** Update pip first:
```powershell
python -m pip install --upgrade pip
```

### "Module not found: uagents"
**Fix:** Make sure venv is activated (you see `(venv)` in terminal)
```powershell
.\venv\Scripts\Activate.ps1
pip install uagents
```

---

## 💡 **Pro Tips**

1. **Keep Multiple Terminals Open:**
   - Terminal 1: MatchMaker agent
   - Terminal 2: Planner agent
   - Terminal 3: Agent service (FastAPI)
   - Terminal 4: Frontend (Next.js)

2. **Test Each Phase:**
   Don't move to next phase until current one works!

3. **Save Agent Addresses:**
   Write them down immediately - you'll need them everywhere

4. **Optional OpenAI:**
   Agents work without OpenAI key (use mock data)
   But AI-generated itineraries are cooler!

5. **Read Error Messages:**
   Python errors are usually very clear about what's wrong

---

## 📚 **Learning Resources**

- **Fetch.ai Docs:** https://docs.fetch.ai/
- **uAgents Guide:** https://docs.fetch.ai/guides/agents/
- **Agentverse Tutorial:** https://docs.fetch.ai/guides/agentverse/

---

## 🎉 **You Got This!**

This is ambitious, but you'll learn SO much:
- ✅ Autonomous AI agents
- ✅ Fetch.ai blockchain integration
- ✅ Python microservices
- ✅ Real production architecture

**Take breaks, test often, and ask for help if stuck!** 💪

---

## 🚀 **Ready to Start?**

```powershell
# Let's go! 🔥
cd d:\WanderLink\agents
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Then open AGENTVERSE_SETUP_COMPLETE.md
```

**You're about to build something amazing!** 🌟
