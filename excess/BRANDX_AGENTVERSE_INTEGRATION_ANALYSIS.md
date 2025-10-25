# BrandX Agentverse Integration Analysis

## 🎯 Executive Summary

BrandX implements a **3-tier architecture** to interact with agents deployed on Agentverse:

```
Frontend (Next.js) → Orchestrator (FastAPI) → Individual Agents (FastAPI on Cloud Run)
```

**Key Insight**: BrandX does **NOT** use Agentverse's mailbox API or protocol-based communication. Instead, they deploy their agents as **independent REST APIs on Google Cloud Run** and orchestrate them through HTTP requests.

---

## 🏗️ Architecture Overview

### Component Breakdown

#### 1. **Frontend Layer** (`BrandX/frontend`)
- **Framework**: Next.js 
- **Location**: `src/app/api/ai/suggest-bounties/route.ts`
- **Purpose**: Next.js API route that acts as a proxy between client and orchestrator

```typescript
// Frontend calls the orchestrator
const ORCHESTRATOR_BASE_URL = 'https://orchestrator-739298578243.us-central1.run.app'
const BOUNTY_AGENT_URL = 'https://bountyagent-739298578243.us-central1.run.app'
const METRICS_AGENT_URL = 'https://metricsagent-739298578243.us-central1.run.app'

// Initiate brand research
const researchResponse = await fetch(`${ORCHESTRATOR_BASE_URL}/research-brand`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    brand_name: businessData.business_name
  })
})
```

#### 2. **Orchestrator Layer** (`BrandX/Agents/Agent_Cluster/Orchestrator`)
- **Framework**: FastAPI (Python)
- **Deployed**: Google Cloud Run
- **Purpose**: Coordinates all specialized agents in sequence
- **Key Features**:
  - Background task processing
  - Global status tracking
  - Retry logic with polling
  - Knowledge Graph integration (MeTTa)

```python
# Orchestrator calls individual agents via HTTP
async with httpx.AsyncClient(timeout=None) as client:
    # Call Web Search Agent
    web_search_response = await client.post(
        "https://websearchagent-739298578243.us-central1.run.app/research/brand",
        json={"brand_name": brand_name}
    )
    
    # Call Negative Reviews Agent
    negative_reviews_response = await client.post(
        "https://negativereviewsagent-739298578243.us-central1.run.app/reviews/negative",
        json={"brand_name": brand_name}
    )
    
    # ... more agents
```

#### 3. **Agent Layer** (Individual Specialized Agents)
- **Framework**: Each agent is a FastAPI service with uAgents
- **Deployed**: Each on separate Google Cloud Run instance
- **Communication**: REST API endpoints + uAgents mailbox (optional)
- **Agents**:
  - Web Search Agent
  - Negative Reviews Agent
  - Positive Reviews Agent
  - Negative Reddit Agent
  - Positive Reddit Agent
  - Negative Social Agent
  - Positive Social Agent
  - Metrics Generation Agent
  - Bounty Generation Agent

```python
# Example: Metrics Generation Agent
agent = Agent(
    name="brandx_brand_metrics_agent",
    port=8080,
    seed="brandx metrics agent seed",
    mailbox=True,  # Enables Agentverse mailbox
    endpoint=["http://localhost:8080/submit"]
)

# REST API Endpoint
@agent.on_rest_post("/brand/metrics", BrandMetricsRequest, BrandMetricsResponse)
async def handle_brand_metrics(ctx: Context, req: BrandMetricsRequest) -> BrandMetricsResponse:
    # Process request using ASI-One API
    # Return structured response
```

---

## 🔄 Communication Flow

### Step-by-Step Request Flow

```
User Request
    ↓
[Frontend: Next.js Client]
    ↓ (HTTP POST)
[Frontend: Next.js API Route] (/api/ai/suggest-bounties/route.ts)
    ↓ (HTTP POST - /research-brand)
[Orchestrator: FastAPI] (Cloud Run)
    ↓
    ├─→ [Web Search Agent] (Cloud Run) ──────────┐
    ├─→ [Negative Reviews Agent] (Cloud Run) ────┤
    ├─→ [Positive Reviews Agent] (Cloud Run) ────┤
    ├─→ [Negative Reddit Agent] (Cloud Run) ─────┤
    ├─→ [Positive Reddit Agent] (Cloud Run) ─────┼─→ [Results]
    ├─→ [Negative Social Agent] (Cloud Run) ─────┤
    ├─→ [Positive Social Agent] (Cloud Run) ─────┤
    ├─→ [Metrics Agent] (Cloud Run) ─────────────┤
    └─→ [Bounty Agent] (Cloud Run) ──────────────┘
    ↓ (Aggregated Response)
[Knowledge Graph: MeTTa] (Store results)
    ↓
[Orchestrator: Return Response]
    ↓
[Frontend: Poll for Status]
    ↓
[Frontend: Save to Supabase]
    ↓
[User: Display Results]
```

---

## 🌐 Deployment Strategy

### Google Cloud Run Deployment

Each agent is deployed as an **independent containerized service** on Google Cloud Run:

```
Web Search Agent        → https://websearchagent-739298578243.us-central1.run.app
Negative Reviews Agent  → https://negativereviewsagent-739298578243.us-central1.run.app
Positive Reviews Agent  → https://positivereviewsagent-739298578243.us-central1.run.app
Negative Reddit Agent   → https://redditnegativeagent-739298578243.us-central1.run.app
Positive Reddit Agent   → https://redditpositiveagent-739298578243.us-central1.run.app
Negative Social Agent   → https://negativesocialsagent-739298578243.us-central1.run.app
Positive Social Agent   → https://positivesocialsagent-739298578243.us-central1.run.app
Metrics Agent           → https://metricsagent-739298578243.us-central1.run.app
Bounty Agent            → https://bountyagent-739298578243.us-central1.run.app
Orchestrator            → https://orchestrator-739298578243.us-central1.run.app
```

**Why This Approach?**
- ✅ **Independent Scaling**: Each agent scales independently
- ✅ **Fault Isolation**: One agent failure doesn't crash others
- ✅ **Public HTTP Endpoints**: Easy to call from anywhere
- ✅ **No Special Protocol**: Standard HTTP/JSON
- ⚠️ **Cost**: 10+ Cloud Run instances running
- ⚠️ **Not True Agentverse**: Agents don't communicate via Fetch.ai protocols

---

## 📡 Agent Structure

### Agent Code Pattern

Every BrandX agent follows this structure:

```python
from uagents import Agent, Context, Model, Protocol
from uagents_core.contrib.protocols.chat import chat_protocol_spec
import os
from dotenv import load_dotenv

# Environment setup
load_dotenv()
ASI_ONE_API_KEY = os.environ.get("ASI_ONE_API_KEY")
AGENTVERSE_API_KEY = os.environ.get("AGENTVERSE_API_KEY")

# Initialize agent with mailbox
agent = Agent(
    name="brandx_agent_name",
    port=8080,
    seed="unique seed phrase",
    mailbox=True,  # Enable Agentverse mailbox
    endpoint=["http://localhost:8080/submit"]
)

# REST API Models
class RequestModel(Model):
    brand_name: str

class ResponseModel(Model):
    success: bool
    result: str
    timestamp: str
    agent_address: str

# REST API Handler
@agent.on_rest_post("/endpoint/path", RequestModel, ResponseModel)
async def handle_request(ctx: Context, req: RequestModel) -> ResponseModel:
    # 1. Call ASI-One API for AI processing
    # 2. Process results
    # 3. Return structured response
    pass

# Include Chat Protocol (optional for Agentverse integration)
agent.include(chat_protocol, publish_manifest=True)

# Run agent
if __name__ == '__main__':
    agent.run()
```

---

## 🔍 Key Differences from WanderLink's Approach

| Feature | BrandX | WanderLink (Current) | WanderLink (Proposed) |
|---------|--------|---------------------|----------------------|
| **Agent Deployment** | Cloud Run (HTTP APIs) | Agentverse (Mailbox) | Agentverse (Mailbox) |
| **Communication** | Direct HTTP POST | ASI-1 API only | HTTP Mailbox API |
| **Orchestration** | Centralized FastAPI | None (frontend direct) | ProxyService/Agent Service |
| **Agent Protocol** | REST API endpoints | Not used | uAgents protocols |
| **Scaling** | Cloud Run auto-scale | Agentverse managed | Agentverse managed |
| **Cost** | $$$ (10+ Cloud Run) | $ (Agentverse free tier) | $ (Agentverse free tier) |
| **True A2A** | No (HTTP only) | No (not connected) | Yes (via mailbox) |

---

## 💡 What WanderLink Can Learn

### ✅ **Good Patterns to Adopt**

#### 1. **Orchestrator Pattern**
BrandX's orchestrator coordinates multiple agents sequentially. WanderLink should implement similar coordination.

```python
# BrandX Pattern
async def process_brand_research(brand_name: str):
    # Sequential agent calls
    web_results = await call_web_agent(brand_name)
    reviews = await call_reviews_agent(brand_name)
    reddit = await call_reddit_agent(brand_name)
    
    # Aggregate results
    return aggregate(web_results, reviews, reddit)
```

**Apply to WanderLink:**
```python
# WanderLink Orchestrator
async def coordinate_trip_matching(trip_request):
    # Call Travel Agent
    preferences = await send_to_travel_agent(trip_request)
    
    # Call MatchMaker Agent
    matches = await send_to_matchmaker(preferences)
    
    # Form groups
    groups = await form_groups(matches)
    
    return groups
```

#### 2. **Background Processing + Status Polling**
BrandX uses background tasks with status endpoints for long-running operations.

```python
# BrandX Pattern
global_status = {
    "is_processing": False,
    "progress": "Ready",
    "result": None
}

@app.post("/research-brand")
async def research_brand(request: BrandRequest):
    # Start background task
    asyncio.create_task(process_brand_research(request.brand_name))
    return {"status": "processing", "message": "Research started"}

@app.get("/research-status")
async def get_status():
    return global_status
```

**Apply to WanderLink:**
```python
# WanderLink Pattern
@app.post("/api/find-matches")
async def find_matches(request: TripRequest):
    # Start background matching
    task_id = await start_matching_task(request)
    return {"task_id": task_id, "status": "processing"}

@app.get("/api/match-status/{task_id}")
async def get_match_status(task_id: str):
    return get_task_status(task_id)
```

#### 3. **Retry Logic with Polling**
BrandX implements robust retry mechanisms for agent failures.

```python
# BrandX Pattern
attempt = 0
while True:
    attempt += 1
    try:
        response = await client.post(agent_url, json=data)
        if response.get("success"):
            break
        await asyncio.sleep(4)
    except Exception as e:
        print(f"Attempt {attempt} failed, retrying...")
        await asyncio.sleep(4)
```

#### 4. **Knowledge Graph Storage**
BrandX stores all agent results in MeTTa knowledge graph for querying.

```python
# Store results
kg_service.add_brand_data(brand_name, {
    'web_results': web_search_result,
    'positive_reddit': positive_reddit_result,
    'negative_reddit': negative_reddit_result,
    # ...
})

# Query results
summary = kg_service.get_brand_summary(brand_name)
```

**Apply to WanderLink:**
- Store trip preferences, user profiles, group formations
- Enable semantic queries: "Find all beach trips in July"
- Track matching history

---

### ❌ **What NOT to Adopt**

#### 1. **Cloud Run Deployment**
BrandX deploys agents on Cloud Run (expensive, not true Agentverse).

**WanderLink Should**: Use Agentverse hosting (free tier, true agent-to-agent communication)

#### 2. **HTTP-Only Communication**
BrandX agents use plain HTTP, not uAgents protocols.

**WanderLink Should**: Use Agentverse mailbox API and uAgents messaging protocols

#### 3. **No Agent-to-Agent Communication**
BrandX agents don't talk to each other directly (orchestrator mediates everything).

**WanderLink Should**: Enable Travel Agent ↔ MatchMaker direct communication via protocols

---

## 🚀 Implementation Recommendation for WanderLink

### Option A: BrandX-Style HTTP Orchestration (Quick, Not True Agentverse)

```
Frontend → Agent Service (FastAPI) → HTTP POST to Agentverse REST endpoints
```

**Pros:**
- Fast to implement (1-2 days)
- Similar to current architecture
- Familiar HTTP patterns

**Cons:**
- Doesn't use true agent protocols
- Misses Agentverse benefits
- Agents are passive (no autonomy)

### Option B: True Agentverse Integration (Proper, Takes Longer)

```
Frontend → Agent Service → Agentverse Mailbox API → Travel Agent → MatchMaker Agent
```

**Implementation Steps:**

#### 1. **Enable Mailbox on Deployed Agents**
```python
# In agent code (already done)
agent = Agent(
    name="travel_agent",
    port=8080,
    seed="travel agent seed",
    mailbox=True,  # ✅ Already enabled
    endpoint=["http://localhost:8080/submit"]
)
```

#### 2. **Update Agent Service to Send Messages**
```python
# agents/src/agent_service.py
import requests

AGENTVERSE_MAILBOX_API = "https://agentverse.ai/v1/agents"
TRAVEL_AGENT_ADDRESS = "agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey"

@app.post("/api/extract-preferences")
async def extract_preferences(request: NLPMatchRequest):
    # Send message to Travel Agent on Agentverse
    mailbox_url = f"{AGENTVERSE_MAILBOX_API}/{TRAVEL_AGENT_ADDRESS}/submit"
    
    payload = {
        "type": "trip_request",
        "user_id": request.userId,
        "message": request.nlpInput,
        "timestamp": datetime.now().isoformat()
    }
    
    response = requests.post(
        mailbox_url,
        json=payload,
        headers={
            "Authorization": f"Bearer {AGENTVERSE_API_KEY}",
            "Content-Type": "application/json"
        }
    )
    
    return {"success": True, "message": "Sent to Travel Agent"}
```

#### 3. **Implement Agent Message Handlers**
```python
# In Travel Agent code
from uagents import Context, Protocol

trip_protocol = Protocol()

@trip_protocol.on_message(model=TripRequest)
async def handle_trip_request(ctx: Context, sender: str, msg: TripRequest):
    # Extract preferences using ASI-1
    preferences = extract_preferences_with_asi1(msg.message)
    
    # Send to MatchMaker Agent
    await ctx.send(MATCHMAKER_AGENT_ADDRESS, preferences)
```

#### 4. **Frontend Polls for Results**
```typescript
// frontend/app/trips/page.tsx
const handleNLPSubmit = async () => {
    // 1. Send to agent service
    await fetch('/api/send-to-travel-agent', {
        method: 'POST',
        body: JSON.stringify({ userId, nlpInput })
    })
    
    // 2. Poll for results in Supabase
    const interval = setInterval(async () => {
        const matches = await fetch(`/api/check-matches/${userId}`)
        if (matches.data.length >= 3) {
            // Group formed!
            clearInterval(interval)
            showResults(matches.data)
        }
    }, 3000)
}
```

---

## 📊 BrandX vs WanderLink Architecture Comparison

### BrandX Architecture
```
┌─────────────────┐
│  Next.js Client │
└────────┬────────┘
         │ HTTP POST
┌────────▼───────────────────┐
│ Next.js API Route (Proxy)  │
└────────┬───────────────────┘
         │ HTTP POST /research-brand
┌────────▼────────────────────┐
│   Orchestrator (Cloud Run)  │
│   - FastAPI                 │
│   - Background Tasks        │
│   - Status Tracking         │
│   - Knowledge Graph (MeTTa) │
└────────┬────────────────────┘
         │
         ├─→ Web Search Agent (Cloud Run)
         ├─→ Reviews Agent (Cloud Run)
         ├─→ Reddit Agent (Cloud Run)
         ├─→ Social Agent (Cloud Run)
         ├─→ Metrics Agent (Cloud Run)
         └─→ Bounty Agent (Cloud Run)
              │
              └─→ Each agent:
                  - FastAPI REST API
                  - ASI-One integration
                  - Optional uAgents mailbox
                  - Returns JSON response
```

### WanderLink Current Architecture
```
┌─────────────────┐
│  Next.js Client │
└────────┬────────┘
         │ HTTP POST
┌────────▼────────────────────┐
│   Agent Service (FastAPI)   │
│   - Direct ASI-1 API calls  │
│   - Supabase integration    │
└────────┬────────────────────┘
         │
         ├─→ ASI-1 API (preference extraction)
         └─→ Supabase (store preferences)

❌ Problem: Deployed Agentverse agents are NOT in this flow!
```

### WanderLink Proposed Architecture (Option B)
```
┌─────────────────┐
│  Next.js Client │
└────────┬────────┘
         │ HTTP POST
┌────────▼────────────────────┐
│   Agent Service (FastAPI)   │
│   - Agentverse Mailbox API  │
│   - Status tracking         │
│   - Background tasks        │
└────────┬────────────────────┘
         │ HTTP POST to Agentverse
┌────────▼─────────────────────────────┐
│       Agentverse Platform            │
│                                      │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Travel Agent │──│ MatchMaker   │ │
│  │ - Extract    │  │ - Pool trips │ │
│  │ - ASI-1 call │  │ - Form groups│ │
│  └──────┬───────┘  └──────┬───────┘ │
│         │                  │         │
│         └──────────────────┘         │
│         Agent-to-Agent Protocol      │
└─────────────────────────────────────┘
         │
         └─→ Results stored in Supabase
```

---

## 🔑 Key Takeaways

### BrandX's Approach:
1. ✅ **Robust orchestration** with retry logic and status tracking
2. ✅ **Modular agent design** with clear separation of concerns
3. ✅ **Background processing** for long-running tasks
4. ✅ **Knowledge graph** for intelligent data storage
5. ❌ **Not true Agentverse** - uses Cloud Run + HTTP instead
6. ❌ **Expensive** - 10+ Cloud Run instances
7. ❌ **No agent autonomy** - orchestrator controls everything

### WanderLink Should:
1. ✅ **Keep Agentverse deployment** (already done)
2. ✅ **Implement orchestration layer** (agent service)
3. ✅ **Add background tasks** for trip pooling
4. ✅ **Use Agentverse mailbox API** for true agent communication
5. ✅ **Enable agent-to-agent protocols** (Travel Agent ↔ MatchMaker)
6. ✅ **Add status polling** for real-time updates
7. ✅ **Consider knowledge graph** for trip matching history

---

## 📝 Next Steps for WanderLink

### Phase 1: Basic Integration (1-2 days)
1. ✅ Already have agents deployed on Agentverse
2. ✅ Already have agent addresses configured
3. ⏳ Update `agent_service.py` to send messages via Agentverse mailbox API
4. ⏳ Test message delivery to Travel Agent
5. ⏳ Verify agent receives messages in Agentverse console

### Phase 2: Agent-to-Agent Communication (2-3 days)
1. ⏳ Implement protocol handlers in Travel Agent
2. ⏳ Implement protocol handlers in MatchMaker Agent
3. ⏳ Test Travel Agent → MatchMaker message flow
4. ⏳ Verify group formation logic

### Phase 3: Background Processing (2-3 days)
1. ⏳ Add background task system to agent service
2. ⏳ Implement trip pooling (MIN_GROUP_SIZE = 3)
3. ⏳ Add status polling endpoints
4. ⏳ Update frontend to poll for results

### Phase 4: Polish (1-2 days)
1. ⏳ Add retry logic (learn from BrandX)
2. ⏳ Add error handling and logging
3. ⏳ Test end-to-end flow with 3+ users
4. ⏳ Deploy to production

---

## 🎓 Conclusion

**BrandX's approach**: Cloud Run + HTTP orchestration (expensive but simple)

**WanderLink's approach**: Agentverse + Mailbox API (cheaper, more powerful, true agents)

**Recommendation**: **Do NOT copy BrandX's Cloud Run deployment**. Instead, learn from their orchestration patterns and apply them to WanderLink's Agentverse-based architecture.

**The Missing Piece**: WanderLink just needs to send messages to deployed agents via Agentverse mailbox API instead of calling ASI-1 directly!

```python
# Current (wrong)
asi_client.chat.completions.create(...)

# Correct (use agents)
requests.post(f"{AGENTVERSE_API}/agents/{AGENT_ADDRESS}/submit", json=message)
```

That's it! 🚀
