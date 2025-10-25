# 🔍 Testing Communication with Agentverse Agents

## The Issue

Your agents are deployed on Agentverse, but they're **not receiving messages** from the frontend because:

1. **Frontend → Agent Service**: ✅ Works (localhost:8000)
2. **Agent Service → ASI-1 API**: ✅ Works (preference extraction)
3. **Agent Service → Agentverse Agents**: ❌ **NOT CONNECTED**

## Why Agents Aren't Receiving Messages

Your deployed agents (`travel_agent_asi.py` and `matchmaker_agent_asi.py`) are listening for messages via **uagents protocol**, but the current setup only:
- Extracts preferences using ASI-1
- Queries Supabase database
- **Doesn't send agent-to-agent messages**

## How Agentverse Agents Receive Messages

### Option 1: Mailbox API (Recommended)
When you deploy agents to Agentverse, they get a **mailbox** that can receive HTTP messages.

**Endpoint**: 
```
POST https://agentverse.ai/v1/hosting/agents/{agent_address}/submit
```

### Option 2: Agent-to-Agent Protocol
Agents communicate directly using uagents protocol (requires both running on Fetch.ai network).

### Option 3: HTTP Endpoints
Agents can expose custom HTTP endpoints (requires configuration in agent code).

## Current Setup vs What's Needed

### Current Flow ❌
```
User → Frontend → Agent Service → ASI-1 API → Extract Preferences
                                              ↓
                                         Supabase Query
                                              ↓
                                         Show Matches

(Agentverse agents are deployed but isolated - not in the flow!)
```

### What You Need ✅
```
User → Frontend → Agent Service → Send to Travel Agent (Agentverse)
                                              ↓
                                   Travel Agent processes
                                              ↓
                                   Sends to MatchMaker (Agentverse)
                                              ↓
                                   MatchMaker pools & forms groups
                                              ↓
                                   Stores in Supabase
                                              ↓
                                   Frontend queries and shows matches
```

## Solution Options

### Option A: Use Agentverse Mailbox (Easiest)

Add this to your agent files before deploying:

```python
# In travel_agent_asi.py and matchmaker_agent_asi.py
agent = Agent(
    name="TravelAgent",  # or "MatchMakerAgent"
    seed="your_seed_phrase",
    mailbox=True,  # ← Enable mailbox
)
```

Then redeploy to Agentverse.

### Option B: Run Agents Locally (For Testing)

Instead of Agentverse, run agents locally:

**Terminal 1**:
```bash
cd D:\WanderLink\agents\src\agents
python matchmaker_agent_asi.py
```

**Terminal 2**:
```bash
cd D:\WanderLink\agents\src\agents
python travel_agent_asi.py
```

This way they can communicate directly via uagents protocol.

### Option C: Hybrid Approach (Current Best Option)

Keep the current flow working (ASI-1 extraction + Supabase) but add agent communication for advanced features later.

**Current working flow**:
1. User submits trip → Agent Service extracts preferences
2. Preferences saved to Supabase
3. Query Supabase for matches
4. Display results

**Add later** (when agents have mailbox):
- Real-time group formation notifications
- AI-generated itineraries
- Agent-negotiated trip plans

## Quick Fix: Make Current System Work

The current system **already works** for:
- ✅ Extracting preferences from natural language
- ✅ Storing trip requests
- ✅ Finding matching groups

The Agentverse agents aren't needed for basic functionality right now because:
- ASI-1 API handles preference extraction (same AI)
- Supabase handles storage and matching
- Frontend displays results

## To Actually Use Agentverse Agents

### Step 1: Check if Mailbox is Enabled

1. Go to https://agentverse.ai
2. Click on your Travel Agent
3. Check if "Mailbox" is enabled
4. If not, you need to redeploy with mailbox enabled

### Step 2: Get Mailbox Key

If mailbox is enabled, you need the mailbox API key to send messages.

### Step 3: Update Agent Code

Your agents need to handle incoming HTTP messages:

```python
from uagents import Agent

agent = Agent(
    name="TravelAgent",
    seed="your_seed",
    mailbox=True,  # Enable mailbox
    mailbox_key="your_mailbox_key"  # From Agentverse dashboard
)
```

## What to Do Right Now

### If You Want Agents on Agentverse to Receive Messages:

1. **Check mailbox settings** on Agentverse
2. **Enable mailbox** if not enabled
3. **Get mailbox API key**
4. **Update the send-to-travel-agent endpoint** with correct mailbox URL and auth

### If You Just Want the System to Work:

**The current setup already works!** 
- Preferences are extracted ✅
- Matching logic works ✅  
- The agents on Agentverse are optional for now

## Testing Current System

Try submitting 3 similar trips and it should:
1. Extract preferences using ASI-1 ✅
2. Store in Supabase ✅
3. Find matches when 3+ similar trips ✅
4. Display results ✅

The "agents not receiving messages" is expected because they're deployed but not integrated into the current flow. They can be added later for advanced features.

## Recommendation

**For now**: Use the current working system (ASI-1 + Supabase)

**Later**: When you need advanced features (real-time negotiation, complex itinerary generation), integrate Agentverse agents properly with mailbox API.

Your system is working! The Agentverse agents are deployed but dormant until you connect them via mailbox API.
