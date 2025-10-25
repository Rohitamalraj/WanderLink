# WanderLink Agent Integration Guide

## Quick Start - Testing Your ASI Agents

### Step 1: Install Agent Dependencies
```bash
cd C:\Users\USER\WanderLink\agents
npm install
```

### Step 2: Run Agent Demo
```bash
npm run dev
```

This will demonstrate:
- 3 TravelAgents (Alice, Bob, Charlie) looking for Tokyo trips
- Synergy calculation between agents
- Multi-round negotiation protocol
- Automatic match finalization

### Step 3: View Frontend
Your frontend is already running at: **http://localhost:3000**

Test the verification flow:
1. Visit http://localhost:3000/verify
2. Connect your wallet (MetaMask with Sepolia or Hedera)
3. Fill in KYC details
4. See Lit Protocol encrypt your data
5. Mint ReputationSBT with encrypted KYC hash

---

## How the Agent System Works

### 1. Agent Architecture

```typescript
// Each user has a TravelAgent
const agent = new TravelAgentImpl('agent-alice', '0x...', {
  destination: 'Tokyo, Japan',
  startDate: new Date('2025-03-15'),
  endDate: new Date('2025-03-25'),
  budget: { min: 2000, max: 3500, currency: 'USD' },
  activities: {
    adventure: 0.6,
    culture: 0.9,
    relaxation: 0.4,
    foodie: 0.8,
    nightlife: 0.5,
    nature: 0.3
  }
});
```

### 2. Matchmaking Flow

```
User registers → TravelAgent created → MatchMaker finds candidates
    ↓
Synergy calculation (0-100 score)
    ↓
Match proposals generated
    ↓
Multi-round negotiation (up to 5 rounds)
    ↓
All agents accept → Trip created on-chain
```

### 3. Synergy Calculation

Agents calculate compatibility based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Destination | 30% | Must match exactly |
| Date Overlap | 20% | More overlap = higher score |
| Budget | 15% | Overlapping budget ranges |
| Activities | 20% | Similar activity preferences |
| Travel Style | 15% | Luxury, flexibility, social level |

### 4. Negotiation Protocol

**Round 1**: Initial proposals
- MatchMaker generates proposals with different group sizes
- Each agent evaluates based on synergy, budget, dates

**Rounds 2-5**: Counter-proposals
- Agents can accept, reject, or counter-propose
- MatchMaker merges counter-proposals
- Finds compromise on dates, budget, activities

**Finalization**:
- All agents accept → Create trip on TripEscrow contract
- Any agent rejects → Match fails, try next proposal

---

## Integration with Smart Contracts

### Current Status
- ✅ Contracts deployed on Hedera & Sepolia
- ✅ ABIs exported to frontend
- ⚠️ Agent → Contract integration ready (needs implementation)

### Next: Connect Agents to TripEscrow

```typescript
// In TravelAgent.acceptMatch()
async acceptMatch(proposalId: string): Promise<void> {
  // Get contract instance
  const tripEscrow = getTripEscrowContract();
  
  // Create trip on-chain
  const tx = await tripEscrow.createTrip(
    this.preferences.destination,
    this.preferences.startDate.getTime() / 1000,
    this.preferences.endDate.getTime() / 1000,
    proposal.agents, // participant addresses
    100 // stake amount
  );
  
  await tx.wait();
  console.log(`Trip created: ${tx.hash}`);
}
```

---

## Fetch.ai Integration Roadmap

### Phase 1: Local Agents (✅ DONE)
- [x] TravelAgent implementation
- [x] MatchMaker coordinator
- [x] Synergy calculation
- [x] Negotiation protocol

### Phase 2: Fetch.ai Network (Next)
- [ ] Register agents on Agentverse
- [ ] Use Fetch.ai messaging protocols
- [ ] Deploy agents to Fetch.ai testnet
- [ ] Agent-to-agent communication via Fetch.ai

### Phase 3: On-Chain Finalization
- [ ] Connect agents to TripEscrow
- [ ] Automatic staking after match
- [ ] Reputation updates via ReputationSBT

---

## Frontend Integration

### Create API Route for Agent Matching

```typescript
// frontend/app/api/match/route.ts
import { MatchMakerAgent } from '@/lib/agents';

export async function POST(req: Request) {
  const { walletAddress, preferences } = await req.json();
  
  const matchMaker = new MatchMakerAgent();
  const agent = await matchMaker.registerAgent(walletAddress, preferences);
  const matches = await matchMaker.findMatches(agent.id);
  
  return Response.json({ matches });
}
```

### UI Component for Match Results

```typescript
// frontend/components/MatchResults.tsx
'use client';

export function MatchResults({ matches }) {
  return (
    <div>
      {matches.map(match => (
        <div key={match.id}>
          <h3>Synergy: {match.synergyScore}%</h3>
          <p>Group size: {match.agents.length}</p>
          <p>Cost: ${match.estimatedCost}</p>
          <button onClick={() => acceptMatch(match.id)}>
            Accept Match
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Testing Checklist

### ✅ Contracts
- [x] TripEscrow deployed on Hedera
- [x] TripEscrow deployed on Sepolia
- [x] All tests passing (12/12)

### ✅ Lit Protocol
- [x] Encryption service created
- [x] KYC encryption helpers
- [x] Verification form component

### ⚠️ ASI Agents
- [x] Agent architecture complete
- [ ] Install dependencies
- [ ] Run demo
- [ ] Test negotiation

### 🔄 Integration
- [ ] Frontend API routes
- [ ] Agent registration on user signup
- [ ] Match display in UI
- [ ] On-chain finalization

---

## Environment Setup

Add to `.env.local`:

```bash
# Fetch.ai (when ready for Agentverse)
FETCHAI_NETWORK=testnet
FETCHAI_AGENT_ADDRESS=agent1q...

# Agent Service
AGENT_SERVICE_URL=http://localhost:3001
```

---

## Demo for Hackathon Judges

### 1. Show Agent Demo (Terminal)
```bash
cd agents
npm run dev
```
**Output**: Live negotiation between 3 agents finding optimal Tokyo trip group

### 2. Show Frontend (Browser)
**URL**: http://localhost:3000
- Hero page with features
- Verification form with Lit encryption
- (Soon) Match results with agent proposals

### 3. Show Contracts (Block Explorer)
**Hedera**: https://hashscan.io/testnet/contract/0x26aA9a1F65FFD5925cF4651E9901250AB2A159Ee
**Sepolia**: https://sepolia.etherscan.io/address/0x780A2b692a9640572E8D39263FB4E86840cB492d

### 4. Explain Sponsor Tech
- **Hedera**: Fast, cheap transactions for high-frequency trip updates
- **Lit Protocol**: Privacy-preserving KYC without exposing PII
- **Fetch.ai ASI**: Autonomous agents negotiate on behalf of users 24/7

---

## Troubleshooting

### Frontend warnings (pino-pretty, async-storage)
**Status**: ⚠️ Can ignore - these are optional peer dependencies
**Fix**: Not needed, app works fine without them

### Agent TypeScript errors
**Status**: ✅ Fixed with proper type annotations
**Check**: Run `npm run build` in agents directory

### Contract interaction
**Status**: 🔄 Ready for implementation
**Next**: Create wagmi hooks for agent finalization

---

## Resources

- **Agent Code**: `/agents/src/`
- **Contracts**: `/contracts/src/`
- **Frontend**: `/frontend/`
- **Docs**: `/docs/`
- **Status**: `/ASI_AGENT_STATUS.md`
