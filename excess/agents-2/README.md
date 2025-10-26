# WanderLink ASI Agents

Autonomous matchmaking system powered by **Fetch.ai ASI (Autonomous Superintelligent Agents)** for WanderLink social travel platform.

## ⚠️ Important: Current Implementation Status

**This is a PROOF-OF-CONCEPT / MOCK implementation** that demonstrates:
- ✅ Agent negotiation logic and algorithms
- ✅ Synergy calculation and matching
- ✅ Multi-round negotiation protocol
- ❌ **NOT YET connected to real Fetch.ai network**
- ❌ **NOT using Fetch.ai's uAgents framework**

**For REAL Fetch.ai integration**, see: [REAL_FETCHAI_INTEGRATION.md](./REAL_FETCHAI_INTEGRATION.md)

This TypeScript implementation shows **HOW** the agents would work. To deploy on Fetch.ai's actual network, you need:
1. Python agents using `uagents` library
2. Registration on Agentverse (https://agentverse.ai)
3. Connection to Fetch.ai testnet/mainnet

## Overview

The ASI agent system enables autonomous, intelligent group matching for travelers. Each user has their own `TravelAgent` that represents their preferences and negotiates with other agents to find optimal travel companions.

## Architecture

### 1. TravelAgent (Individual Agent)
Each traveler has a personal agent that:
- Stores travel preferences (destination, dates, budget, activities)
- Calculates synergy scores with other agents
- Evaluates match proposals
- Negotiates group composition
- Interacts with smart contracts (stake, accept/reject)

### 2. MatchMakerAgent (Coordinator)
Central agent that:
- Manages the agent pool
- Finds potential matches using ML algorithms
- Runs multi-round negotiation protocols
- Ensures fair and efficient matching
- Finalizes matches on-chain

## Features

### Intelligent Synergy Calculation
Agents calculate compatibility scores (0-100) based on:
- **Destination match** (30% weight)
- **Date overlap** (20% weight)
- **Budget compatibility** (15% weight)
- **Activity preferences** (20% weight)
- **Travel style** (15% weight)

### Multi-Round Negotiation
- Agents propose, counter-propose, accept, or reject matches
- Up to 5 negotiation rounds
- Automatic proposal merging
- Fair compromise finding

### Matching Algorithms
1. **Greedy**: Select agents with highest synergy scores
2. **Optimal**: K-means clustering for best composition
3. **Balanced**: Balance synergy (70%) with diversity (30%)

## Installation

```bash
cd agents
npm install
```

## Usage

### Run Demo
```bash
npm run dev
```

### Example Code
```typescript
import { TravelAgentImpl } from './TravelAgent.js';
import { MatchMakerAgent } from './MatchMakerAgent.js';

// Create agent with preferences
const agent = new TravelAgentImpl(
  'agent-alice',
  '0x1234...alice',
  {
    destination: 'Tokyo, Japan',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-25'),
    budget: { min: 2000, max: 3500, currency: 'USD' },
    groupSize: { min: 2, max: 4 },
    activities: {
      adventure: 0.6,
      culture: 0.9,
      relaxation: 0.4,
      foodie: 0.8,
      nightlife: 0.5,
      nature: 0.3
    },
    travelStyle: {
      luxury: 0.6,
      flexibility: 0.7,
      socialLevel: 0.8
    }
  },
  85 // reputation score
);

// Create MatchMaker
const matchMaker = new MatchMakerAgent({
  minGroupSize: 2,
  maxGroupSize: 6,
  minSynergyScore: 60,
  maxNegotiationRounds: 5,
  matchingAlgorithm: 'balanced'
});

// Register and find matches
await matchMaker.registerAgent(agent);
const matches = await matchMaker.findMatches('agent-alice');

// Negotiate best match
const finalProposal = await matchMaker.negotiate(matches[0]);

// Finalize on-chain
const tripId = await matchMaker.finalizeMatch(finalProposal);
```

## Integration with Fetch.ai

This system is designed to integrate with Fetch.ai's Agentverse platform:

1. **Agent Registration**: Each TravelAgent registers on Agentverse with unique address
2. **Agent Communication**: Agents use Fetch.ai protocols to communicate
3. **On-chain Finalization**: Successful matches are recorded via smart contracts

### Fetch.ai Integration Points
- [ ] Connect to Fetch.ai testnet
- [ ] Register agents on Agentverse
- [ ] Use Fetch.ai messaging protocols
- [ ] Store agent preferences on distributed ledger
- [ ] Integrate with uAgents framework

## Smart Contract Integration

Agents interact with WanderLink smart contracts:

### TripEscrow
- `createTrip()`: Finalize match and create trip
- `stakeTokens()`: Each agent stakes commitment tokens
- `confirmAttendance()`: Verify trip completion
- `distributeRewards()`: Distribute rewards after trip

### ReputationSBT
- Query reputation scores for trust calculation
- Update reputation after trip completion

## Configuration

Environment variables (`.env`):
```bash
# Fetch.ai
FETCHAI_NETWORK=testnet
FETCHAI_SEED_PHRASE=your_seed_phrase_here

# Smart Contracts
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your_private_key

SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
ETH_PRIVATE_KEY=your_private_key

# Contract Addresses
TRIP_ESCROW_HEDERA=0x26aA9a1F65FFD5925cF4651E9901250AB2A159Ee
TRIP_ESCROW_SEPOLIA=0x780A2b692a9640572E8D39263FB4E86840cB492d
```

## Roadmap

- [x] Basic agent architecture
- [x] Synergy calculation
- [x] Multi-round negotiation
- [x] Three matching algorithms
- [ ] Fetch.ai Agentverse integration
- [ ] On-chain finalization
- [ ] Reputation-based trust
- [ ] ML-based preference learning
- [ ] Privacy-preserving matching (Lit Protocol)

## Sponsor Technologies

This agent system showcases **Fetch.ai ASI** capabilities:
- Autonomous decision-making
- Multi-agent negotiation
- Intelligent matchmaking
- Decentralized coordination

## License

MIT
