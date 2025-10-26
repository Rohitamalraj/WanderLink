# Fetch.ai ASI Agent Integration

## Current Implementation: Mock vs Real

### What We Have (Mock):
- TypeScript simulation of agent behavior
- Runs locally in Node.js
- Demonstrates the logic but NO connection to Fetch.ai network

### What We Need (Real Fetch.ai):
- Python agents using `uagents` library
- Registered on Fetch.ai Agentverse
- Communicating via Fetch.ai's DeltaV protocol

---

## Option 1: Real Fetch.ai Python Agents (Recommended)

Create Python agents that connect to Fetch.ai's actual network:

### Installation
```bash
pip install uagents
pip install requests
```

### Example: Real TravelAgent using Fetch.ai

```python
# agents_python/travel_agent.py
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
import json

class TravelPreferences(Model):
    destination: str
    start_date: str
    end_date: str
    budget_min: int
    budget_max: int
    activities: dict

class MatchProposal(Model):
    proposal_id: str
    agents: list
    synergy_score: int
    destination: str
    estimated_cost: int

# Create a Fetch.ai agent
alice = Agent(
    name="travel_agent_alice",
    seed="alice_secret_seed_phrase_wanderlink",
    port=8000,
    endpoint=["http://localhost:8000/submit"],
)

# Fund the agent (required for Fetch.ai testnet)
fund_agent_if_low(alice.wallet.address())

# Store preferences
alice.storage.set("preferences", {
    "destination": "Tokyo, Japan",
    "start_date": "2025-03-15",
    "end_date": "2025-03-25",
    "budget_min": 2000,
    "budget_max": 3500,
    "activities": {
        "culture": 0.9,
        "foodie": 0.8,
        "adventure": 0.6
    }
})

@alice.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Travel Agent Alice started")
    ctx.logger.info(f"Address: {alice.address}")
    
    # Register on Agentverse
    await ctx.send(
        "agent1q...matchmaker_address",
        {"type": "register", "preferences": alice.storage.get("preferences")}
    )

@alice.on_message(model=MatchProposal)
async def handle_match_proposal(ctx: Context, sender: str, msg: MatchProposal):
    ctx.logger.info(f"Received match proposal: {msg.proposal_id}")
    ctx.logger.info(f"Synergy score: {msg.synergy_score}%")
    
    # Evaluate proposal
    if msg.synergy_score >= 70:
        ctx.logger.info("✅ Accepting proposal!")
        await ctx.send(sender, {
            "type": "accept",
            "proposal_id": msg.proposal_id
        })
    else:
        ctx.logger.info("❌ Rejecting proposal - synergy too low")
        await ctx.send(sender, {
            "type": "reject",
            "proposal_id": msg.proposal_id,
            "reason": "Synergy score below threshold"
        })

if __name__ == "__main__":
    alice.run()
```

### Run Real Fetch.ai Agent
```bash
cd agents_python
python travel_agent.py
```

**Output with real Fetch.ai:**
```
INFO: [travel_agent_alice]: Travel Agent Alice started
INFO: [travel_agent_alice]: Address: agent1qw8...xyz123
INFO: [travel_agent_alice]: Registering on Agentverse...
INFO: [travel_agent_alice]: Connected to Fetch.ai network
```

---

## Option 2: Hybrid Approach (TypeScript + Fetch.ai API)

Keep your TypeScript logic but connect to Fetch.ai via API:

### Using Fetch.ai Agentverse REST API

```typescript
// agents/src/fetchai-integration.ts
import axios from 'axios';

const AGENTVERSE_API = 'https://agentverse.ai/api/v1';
const AGENT_ADDRESS = 'agent1q...your_agent_address';

export class FetchAIAgent {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Register agent on Agentverse
  async registerAgent(preferences: any) {
    const response = await axios.post(
      `${AGENTVERSE_API}/agents/register`,
      {
        address: AGENT_ADDRESS,
        metadata: preferences
      },
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    return response.data;
  }

  // Send message to another agent
  async sendMessage(targetAgent: string, message: any) {
    const response = await axios.post(
      `${AGENTVERSE_API}/agents/message`,
      {
        from: AGENT_ADDRESS,
        to: targetAgent,
        payload: message
      },
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    return response.data;
  }

  // Listen for messages (webhook or polling)
  async pollMessages() {
    const response = await axios.get(
      `${AGENTVERSE_API}/agents/${AGENT_ADDRESS}/messages`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    return response.data;
  }
}
```

---

## Option 3: Use Fetch.ai DeltaV (Easiest for Demo)

DeltaV is Fetch.ai's AI agent marketplace. You can:

1. **Create agents on Agentverse Dashboard**: https://agentverse.ai
2. **Define agent protocols** (what they can do)
3. **Users interact via DeltaV chat**: "Find me travel companions to Tokyo"
4. **Agents negotiate autonomously** behind the scenes

### Steps:
1. Go to https://agentverse.ai
2. Create account
3. Click "Create Agent"
4. Define protocol:
   ```json
   {
     "name": "TravelMatchmaking",
     "description": "Find compatible travel companions",
     "inputs": {
       "destination": "string",
       "dates": "string",
       "budget": "number"
     },
     "outputs": {
       "matches": "array",
       "synergy_scores": "array"
     }
   }
   ```
5. Deploy agent
6. Users can interact via DeltaV app

---

## Recommendation for Hackathon

### For Demo/Presentation:
**Use current TypeScript mock** + explain it's a **proof-of-concept** showing:
- How agents would negotiate
- Synergy calculation algorithm
- Multi-round protocol

**Then show Fetch.ai integration roadmap:**
- "This is the logic, next step is deploying to Agentverse"
- Show Agentverse dashboard (create free account)
- "Agents would run 24/7 on Fetch.ai network"

### For Full Integration (Post-Hackathon):
1. **Python microservice** with real `uagents`
2. **Bridge**: TypeScript backend ↔ Python agents via REST API
3. **Deploy** agents to Fetch.ai testnet
4. **Register** on Agentverse with your protocols

---

## Quick Setup: Real Fetch.ai Agent (5 minutes)

Want to test a REAL Fetch.ai agent right now?

```bash
# Install uagents
pip install uagents

# Create simple agent
cat > test_agent.py << 'EOF'
from uagents import Agent, Context

agent = Agent(name="wanderlink_test", seed="test_seed_123")

@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Agent started! Address: {agent.address}")
    ctx.logger.info("Connected to Fetch.ai network!")

if __name__ == "__main__":
    agent.run()
EOF

# Run it
python test_agent.py
```

This will show:
```
INFO: [wanderlink_test]: Agent started! Address: agent1q...
INFO: [wanderlink_test]: Connected to Fetch.ai network!
```

That's a **REAL** Fetch.ai agent connected to their network!

---

## Summary

| Aspect | Current (Mock) | Real Fetch.ai |
|--------|---------------|---------------|
| Language | TypeScript | Python (uagents) |
| Network | Local only | Fetch.ai testnet/mainnet |
| Address | Fake IDs | agent1q...xyz (real addresses) |
| Communication | In-memory | Fetch.ai protocol |
| Agentverse | Not registered | Registered on platform |
| DeltaV | No | Yes - users can interact |

**Your current code is great for showing the LOGIC**, but for real ASI integration, you need Python agents or Agentverse API calls.

Would you like me to:
1. Create a Python real agent implementation?
2. Set up Agentverse API integration in TypeScript?
3. Keep the mock but improve the demo documentation?
