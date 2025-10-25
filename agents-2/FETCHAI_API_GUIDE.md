# Fetch.ai API Integration Guide

## ✅ Real Fetch.ai Connection via API

This implementation connects to Fetch.ai Agentverse using their REST API - **no Python required!**

## Quick Setup (5 minutes)

### Step 1: Create Agentverse Account

1. Go to https://agentverse.ai
2. Click "Sign Up" / "Get Started"
3. Create account (free)
4. Verify email

### Step 2: Create Your First Agent

1. Click "Agents" in sidebar
2. Click "+ Create Agent"
3. Fill in:
   - **Name**: `wanderlink-travel-agent-alice`
   - **Description**: `Travel companion matching for WanderLink`
   - **Protocol**: `wanderlink:travel-matching:1.0`
4. Click "Create"

### Step 3: Get API Credentials

1. Click on your newly created agent
2. Click "API Keys" tab
3. Click "Generate New Key"
4. **Copy the API key** (you won't see it again!)
5. **Copy the agent address** (starts with `agent1q...`)

### Step 4: Add to Environment

Edit `.env.local` and add:

```bash
# Fetch.ai Agentverse API
FETCHAI_API_KEY=your_api_key_here_from_step_3
FETCHAI_AGENT_ADDRESS=agent1q...your_address_here
FETCHAI_NETWORK=testnet
```

### Step 5: Install Dependencies

```bash
cd C:\Users\USER\WanderLink\agents
npm install axios dotenv
```

### Step 6: Run Demo

```bash
npm run dev:fetchai
```

Or directly:
```bash
npx tsx src/demo-fetchai.ts
```

---

## What You'll See

### With API Key (Real):
```
╔══════════════════════════════════════════════════════════════╗
║     🌍 WanderLink - Real Fetch.ai API Integration           ║
╚══════════════════════════════════════════════════════════════╝

🚀 Initializing Fetch.ai agent...
✅ Fetch.ai Agent initialized: agent1q...

👤 Creating Alice's travel agent...
📡 Registering on Fetch.ai Agentverse...
✅ Agent registered on Agentverse

🔍 Searching for MatchMaker agents...
✅ Found 1 MatchMaker agent(s)

📤 Sending match request...
📤 Message sent to agent1q...matchmaker

👂 Listening for match proposals...
📥 Received 1 messages
📬 Received match proposal: proposal-abc123
   Synergy: 85%
   Group size: 3
✅ Sent response: accept
```

### Without API Key (Mock):
```
⚠️  No API key - running mock demo

╔══════════════════════════════════════════════════════════════╗
║         🌍 WanderLink - Mock Agent Demo                     ║
╚══════════════════════════════════════════════════════════════╝

[Shows local simulation with TypeScript agents]
```

---

## API Features

### ✅ What Works via API

1. **Agent Registration**
   ```typescript
   await fetchAgent.registerAgent({
     name: 'TravelAgent-Tokyo',
     description: 'Finding Tokyo travel companions',
     protocols: ['wanderlink:travel-matching:1.0'],
   });
   ```

2. **Send Messages**
   ```typescript
   await fetchAgent.sendMessage(
     'agent1q...target',
     'wanderlink:travel-matching:1.0',
     { type: 'match_request', preferences: {...} }
   );
   ```

3. **Receive Messages**
   ```typescript
   const messages = await fetchAgent.receiveMessages();
   // Returns array of messages sent to your agent
   ```

4. **Find Other Agents**
   ```typescript
   const agents = await fetchAgent.findAgentsByProtocol(
     'wanderlink:travel-matching:1.0'
   );
   // Returns array of agent addresses
   ```

5. **Query Agent Info**
   ```typescript
   const info = await fetchAgent.getAgentInfo('agent1q...');
   // Returns metadata, protocols, endpoints
   ```

---

## Integration with Your App

### Backend API Route (Next.js)

```typescript
// frontend/app/api/agents/match/route.ts
import { FetchAIAgent, FetchAITravelAgent } from '@/lib/fetchai';

export async function POST(req: Request) {
  const { walletAddress, preferences } = await req.json();
  
  // Create agent for this user
  const fetchAgent = new FetchAIAgent({
    apiKey: process.env.FETCHAI_API_KEY!,
    agentAddress: generateAgentAddress(walletAddress),
    network: 'testnet',
  });
  
  const travelAgent = new FetchAITravelAgent(fetchAgent, preferences);
  await travelAgent.initialize();
  
  // Request matches
  const matchMakerAddress = process.env.MATCHMAKER_AGENT_ADDRESS!;
  await travelAgent.requestMatches(matchMakerAddress);
  
  return Response.json({ 
    success: true,
    agentAddress: fetchAgent.getAddress() 
  });
}
```

### Frontend Component

```typescript
// components/RequestMatches.tsx
export function RequestMatches() {
  const [loading, setLoading] = useState(false);
  
  async function requestMatches() {
    setLoading(true);
    
    const response = await fetch('/api/agents/match', {
      method: 'POST',
      body: JSON.stringify({
        walletAddress: address,
        preferences: {
          destination: 'Tokyo',
          budget: { min: 2000, max: 3500 },
          // ...
        },
      }),
    });
    
    const data = await response.json();
    console.log('Agent created:', data.agentAddress);
    
    setLoading(false);
  }
  
  return (
    <button onClick={requestMatches}>
      {loading ? 'Finding matches...' : 'Find Travel Companions'}
    </button>
  );
}
```

---

## Webhook Integration (Optional)

Instead of polling, use webhooks for instant notifications:

### 1. Set up webhook endpoint

```typescript
// frontend/app/api/webhooks/fetchai/route.ts
export async function POST(req: Request) {
  const message = await req.json();
  
  // Verify webhook signature
  const isValid = verifyFetchAIWebhook(req.headers, message);
  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Process message
  if (message.type === 'match_proposal') {
    // Store in database
    await db.matchProposals.create({
      proposalId: message.proposalId,
      agents: message.agents,
      synergyScore: message.synergyScore,
      // ...
    });
    
    // Notify user via WebSocket/SSE
    notifyUser(message.agentAddress, message);
  }
  
  return Response.json({ success: true });
}
```

### 2. Register webhook in Agentverse

```typescript
await fetchAgent.updateMetadata({
  endpoints: ['https://your-app.com/api/webhooks/fetchai'],
});
```

---

## Cost & Limits

### Agentverse Free Tier:
- ✅ Unlimited agent registration
- ✅ 1000 messages/day
- ✅ 100 API calls/hour
- ✅ Testnet access

### Paid Plans:
- 🚀 More messages
- 🚀 Mainnet access
- 🚀 Priority support
- 🚀 Custom protocols

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           Your Next.js App (Frontend)               │
│   - User enters travel preferences                  │
│   - Clicks "Find Companions"                        │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│        Your Backend API (Next.js API Routes)        │
│   - fetchai-api.ts                                  │
│   - FetchAIAgent class                              │
│   - FetchAITravelAgent class                        │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────┐
│         Fetch.ai Agentverse (Cloud)                 │
│   - Agent registry                                  │
│   - Message routing                                 │
│   - Protocol discovery                              │
└───────────────────┬─────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│  TravelAgent A  │   │  TravelAgent B  │
│  (Your Agent)   │◄──►  (Other User)   │
└─────────────────┘   └─────────────────┘
```

---

## Testing Without Real Agents

If MatchMaker not deployed yet:

```typescript
// Create mock response for testing
const mockProposal = {
  proposalId: 'test-123',
  agents: ['agent1q...alice', 'agent1q...bob'],
  synergyScore: 85,
  destination: 'Tokyo, Japan',
  estimatedCost: 2800,
};

await fetchAgent.sendMessage(
  fetchAgent.getAddress(), // Send to yourself
  'wanderlink:travel-matching:1.0',
  { type: 'match_proposal', proposal: mockProposal }
);

// Then receive it
const messages = await fetchAgent.receiveMessages();
// You'll see your own message!
```

---

## Troubleshooting

### Error: 401 Unauthorized
- ❌ API key is wrong
- ✅ Double-check FETCHAI_API_KEY in .env.local
- ✅ Regenerate key on Agentverse if needed

### Error: 404 Agent Not Found
- ❌ Agent address is wrong
- ✅ Check FETCHAI_AGENT_ADDRESS matches Agentverse
- ✅ Make sure agent is registered

### Error: No messages received
- ℹ️ This is normal if no other agents are active
- ✅ Deploy MatchMaker agent first
- ✅ Or use mock demo for testing

### Error: Rate limit exceeded
- ⚠️ Too many API calls
- ✅ Add delay between calls
- ✅ Use webhooks instead of polling
- ✅ Upgrade to paid plan

---

## Next Steps

1. ✅ **Get API Key** - Sign up at agentverse.ai
2. ✅ **Test Connection** - Run demo-fetchai.ts
3. ⚠️ **Deploy MatchMaker** - Central coordinator agent
4. ⚠️ **Integrate Frontend** - Connect UI to agents
5. ⚠️ **Add Webhooks** - Real-time notifications
6. ⚠️ **Connect Contracts** - On-chain finalization

---

## Resources

- **Agentverse**: https://agentverse.ai
- **API Docs**: https://docs.fetch.ai/guides/agentverse/agentverse-intro
- **Discord**: https://discord.gg/fetchai
- **Support**: https://fetch.ai/support

---

**This is REAL Fetch.ai integration!** 🎉

No Python needed - pure TypeScript + API calls!
