# WanderLink Agents - Clean Architecture

## 🎯 Purpose
Personalized travel agent system where each user has their own AI agent that communicates with other agents to find optimal trip matches.

## 📁 New Structure

```
agents/
├── src/
│   ├── agent_service_clean.py      # Clean FastAPI service (use this)
│   ├── services/                    # Agent services (NEW)
│   │   ├── agent_factory.py        # Creates personalized agents
│   │   ├── agent_orchestrator.py   # Manages agent communication
│   │   └── personality_builder.py  # Builds travel personality profiles
│   ├── agents/                      # Agent implementations (NEW)
│   │   ├── travel_agent_template.py # User's personal agent
│   │   ├── group_agent.py          # Represents travel groups
│   │   └── destination_agent.py    # Destination experts (future)
│   ├── models/                      # Data models (NEW)
│   │   └── agent_models.py         # Pydantic models for agents
│   └── OLD_FILES/                   # Archived old implementation
│       ├── agent_service.py        # Old service (archived)
│       ├── matchmaker_agent.py     # Old matchmaker (archived)
│       └── planner_agent.py        # Old planner (archived)
├── requirements.txt
└── README.md
```

## 🚀 Quick Start

### 1. Start Clean Agent Service

```powershell
# Navigate to agents directory
cd agents

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the clean service
python src/agent_service_clean.py
```

The service will start on `http://localhost:8000`

### 2. Test the Service

```powershell
# Health check
curl http://localhost:8000/health

# API documentation
# Open: http://localhost:8000/docs
```

## 🏗️ Implementation Plan

### Phase 1: Core Agent System (Current)
- [x] Clean service setup
- [x] Directory structure
- [ ] Agent Factory implementation
- [ ] Travel Agent Template
- [ ] Personality Builder

### Phase 2: Agent Communication
- [ ] Group Agent
- [ ] Agent Orchestrator
- [ ] Negotiation protocols

### Phase 3: Frontend Integration
- [ ] Create agent endpoint
- [ ] Find matches with agents
- [ ] UI for agent personality

### Phase 4: Advanced Features
- [ ] Destination expert agents
- [ ] Learning from feedback
- [ ] Multi-agent collaboration

## 📡 Available Endpoints

### Basic Endpoints
- `GET /` - Service info
- `GET /health` - Health check

### Agent Endpoints (Coming Soon)
- `POST /api/create-personal-agent` - Create user's personal agent
- `POST /api/find-matches` - Simple matching (temporary)
- `POST /api/find-matches-nlp` - NLP-based matching (temporary)

## 🔧 Environment Variables

```env
# Supabase (Required)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Agentverse (Optional - for cloud deployment)
AGENTVERSE_API_KEY=your_api_key
```

## 🧹 What Was Cleaned Up

### Removed/Archived:
- ❌ Old matchmaker_agent.py (static matching)
- ❌ Old planner_agent.py (static planning)
- ❌ Old user_agent.py (not used)
- ❌ Old verification_agent.py (not used)
- ❌ TypeScript agent files (not needed)
- ❌ Complex Agentverse integration docs

### Keeping:
- ✅ Supabase integration
- ✅ FastAPI service
- ✅ NLP parsing logic
- ✅ Basic compatibility calculation
- ✅ CORS configuration

## 🎨 New Agent Architecture

### User Flow
```
1. User signs up / logs in
2. Frontend calls POST /api/create-personal-agent
3. AgentFactory builds personality profile from:
   - User preferences
   - Travel history
   - Past matches
4. Personal agent deployed (locally or Agentverse)
5. User searches for trips
6. Personal agent communicates with group agents
7. Agents negotiate trip details
8. Best matches returned to user
```

### Agent Personality Dimensions
- **Adventure Level**: comfort seeker (0.0) → thrill seeker (1.0)
- **Social Level**: solo traveler (0.0) → group enthusiast (1.0)
- **Budget Flexibility**: strict (0.0) → flexible (1.0)
- **Planning Style**: spontaneous (0.0) → detailed planner (1.0)
- **Pace Preference**: relaxed (0.0) → fast-paced (1.0)
- **Cultural Immersion**: tourist spots (0.0) → local experiences (1.0)

## 📚 Next Steps

1. **Implement AgentFactory** - Create `services/agent_factory.py`
2. **Create Agent Template** - Build `agents/travel_agent_template.py`
3. **Test Agent Creation** - Verify personality building works
4. **Add Agent Communication** - Implement negotiation protocols
5. **Integrate Frontend** - Connect React components

## 🛠️ Development Commands

```powershell
# Install dependencies
pip install -r requirements.txt

# Start service
python src/agent_service_clean.py

# Test endpoints
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/find-matches-nlp ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"test\",\"nlpInput\":\"I want a beach vacation in Goa\"}"
```

## 📖 Documentation

- See `PERSONALIZED_AGENTS_IMPLEMENTATION.md` for full implementation plan
- See `agent_service_clean.py` for API documentation
- API docs available at `http://localhost:8000/docs` when running

---

**Status**: 🟡 Phase 1 in progress - Ready for AgentFactory implementation
