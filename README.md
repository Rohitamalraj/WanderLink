# 🌐 WanderLink — The Web3 Era of Social Travel

**"Find your travel tribe — powered by AI, secured by Web3."**

## 🎯 ETHOnline 2025 Submission

### Problem
Solo travelers want authentic small-group experiences with strangers, but meeting unknown people and pooling money creates **safety, fraud, and accountability risks** that Web2 services can't solve.

### Solution
**WanderLink** is a decentralized stranger-trip marketplace where:
- ✅ Every participant is **verified** (privacy-preserving via Lit Protocol)
- 🤖 Each person has a **TravelAgent AI** (ASI) that negotiates groups autonomously
- 🔒 Commitments enforced by **on-chain escrow & reputation** (Hedera/Polygon)
- 🛡️ Safety via **multi-layer controls** (verification, stake, SOS, evidence collection)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │◄────►│   ASI Agents     │◄────►│  Smart Contracts│
│  (Next.js)      │      │  (Autonomous)    │      │  (Hedera/Polygon)│
└────────┬────────┘      └────────┬─────────┘      └────────┬────────┘
         │                        │                          │
         └────────────────────────┼──────────────────────────┘
                                  │
                         ┌────────▼────────┐
                         │   Lighthouse    │
                         │ (Encrypted Data)│
                         └─────────────────┘
```

### Tech Stack

**Blockchain & Web3:**
- 🔷 **Hedera Hashgraph** - TripEscrow contracts, fast consensus
- 🟣 **Polygon** - Scalable L2 for high-frequency interactions
- 🔐 **Lit Protocol** - Encrypted KYC & access control
- 📦 **Lighthouse** - Decentralized encrypted storage
- 🪪 **Worldcoin WorldID** - Proof of personhood

**AI & Agents:**
- 🤖 **Fetch.ai ASI** - Autonomous agent negotiation
- 🧠 **LangChain** - Agent orchestration
- 🎯 **OpenAI GPT-4** - Preference matching & itinerary generation

**Frontend:**
- ⚛️ **Next.js 14** - App router, Server Components
- 🎨 **TailwindCSS** - Styling
- 🔌 **RainbowKit / Web3Auth** - Wallet connection
- 📊 **React Query** - State management

**Backend:**
- 🚀 **Node.js + Express** - API server
- 🗄️ **PostgreSQL** - User profiles, trip metadata
- 🔴 **Redis** - Session caching, agent coordination

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- MetaMask or HashPack wallet
- Hedera testnet account

### Installation

```bash
# Clone the repository
git clone <your-repo>
cd WanderLink

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys (see Configuration below)

# Run contracts tests
cd contracts
pnpm test

# Start development servers
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Agent Service: http://localhost:8081

---

## 📁 Project Structure

```
WanderLink/
├── frontend/              # Next.js 14 app
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # Web3, API clients
│   └── public/            # Static assets
│
├── contracts/             # Smart contracts (Hedera/Polygon)
│   ├── src/               # Solidity contracts
│   ├── scripts/           # Deployment scripts
│   └── test/              # Contract tests
│
│   ├── backend/           # Node.js API server
│   │   ├── src/
│   │   │   ├── routes/    # REST endpoints
│   │   │   ├── services/  # Business logic
│   │   │   └── db/        # Database models
│   │   └── prisma/        # Database schema
│   │
│   ├── agents/            # ASI Travel Agents
│   │   ├── src/
│   │   │   ├── agents/    # Agent definitions
│   │   │   ├── negotiator/# Matchmaking logic
│   │   │   └── protocols/ # Agent communication
│   │   └── tests/
│   │
│   └── shared/            # Shared types, utils
│       ├── types/         # TypeScript definitions
│       └── constants/     # Constants, ABIs
│
├── docs/                  # Documentation
├── scripts/               # Deployment & setup
└── pnpm-workspace.yaml    # Monorepo config
```

---

## 🔐 Security Features

### 1. Identity & Verification
- **Tier 0**: Email + WorldID (basic events)
- **Tier 1**: Photo + WorldID (standard trips)
- **Tier 2**: Full KYC via Civic/Fractal (high-value trips)

### 2. Financial Security
- Smart contract escrow holds all stakes
- Automated slashing for no-shows
- Multi-sig emergency freezes
- Cancellation windows with partial refunds

### 3. Safety Mechanisms
- ✅ Signed wallet check-ins (EIP-191)
- 📸 Hashed media trail on Lighthouse
- 🚨 SOS button → alerts + escrow freeze
- 🤝 Local partner verification
- 📊 Reputation SBT tracking

### 4. Privacy
- Lit Protocol encrypts all KYC data
- Agents work on embeddings, not raw PII
- Access control via Lit conditions
- Soulbound tokens (non-transferable)

---

## 🤖 AI Agent System

### Agent Roles
1. **TravelAgent** - Represents each user's preferences
2. **MatchMakerAgent** - Negotiates optimal group formation
3. **EscrowAgent** - Monitors contract state
4. **SafetyAgent** - Real-time risk monitoring
5. **PlannerAgent** - Generates itineraries

### Negotiation Flow
```
User Inputs → TravelAgent → Multi-round Negotiation 
→ Synergy Score Calculation → Group Proposals → Human Approval
→ Smart Contract Execution
```

---

## 📜 Smart Contracts

### TripEscrow.sol
- `joinTrip()` - Stake funds and join group
- `confirmAttendance()` - Submit signed proof
- `reportIncident()` - Trigger investigation
- `releaseFunds()` - Distribute after verification
- `slashUser()` - Penalize bad actors

### ReputationSBT.sol (Soulbound)
- `mintVerifiedSBT()` - Issue verification token
- `updateScore()` - Adjust reputation
- `getTripHistory()` - Query past trips

### TripNFT.sol
- Minted after successful trip completion
- Contains: destination, dates, synergy score, verified proof

---

## 🎯 MVP Features (Hackathon)

✅ **Core Features:**
1. Wallet auth + Lit verification (SBT minting)
2. AI agent matchmaking demo (3+ agents negotiate)
3. TripEscrow contract (stake/confirm/slash)
4. Signed check-ins + Lighthouse media hashing
5. SOS system + evidence packet export

📊 **Demo Flow (90 seconds):**
1. 3 users input travel preferences
2. Agents negotiate → show synergy scores
3. Group accepts → each stakes 0.02 ETH (testnet)
4. Show signed check-in messages
5. Simulate SOS → escrow freeze + evidence export
6. Resolve → release funds + mint TripNFT

---

## 🛠️ Configuration

### Environment Variables

```bash
# Blockchain
HEDERA_ACCOUNT_ID=
HEDERA_PRIVATE_KEY=
POLYGON_RPC_URL=
DEPLOYER_PRIVATE_KEY=

# Lit Protocol
LIT_NETWORK=cayenne
LIT_PKP_PUBLIC_KEY=

# Lighthouse
LIGHTHOUSE_API_KEY=

# AI Services
OPENAI_API_KEY=
FETCHAI_AGENT_ADDRESS=

# WorldID
WORLDCOIN_APP_ID=
WORLDCOIN_ACTION=

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379

# Frontend
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

---

## 🧪 Testing

```bash
# Test smart contracts
cd contracts
pnpm test

# Test agents
cd agents
pnpm test

# Test backend
cd backend
pnpm test

# E2E tests
pnpm test:e2e
```

---

## 🚢 Deployment

```bash
# Deploy contracts to Hedera testnet
cd contracts
pnpm deploy:hedera

# Deploy to Polygon Mumbai
pnpm deploy:polygon

# Deploy frontend to Vercel
cd frontend
vercel deploy

# Deploy backend to Railway
cd backend
railway up
```

---

## 🎬 Demo Video Script

[See `docs/DEMO_SCRIPT.md` for full presentation guide]

---

## 🏆 ETHOnline 2025 Tracks

This project qualifies for:
- 🔷 **Hedera** - TripEscrow contracts + consensus
- 🟣 **Polygon** - Scalable reputation system
- 🔐 **Lit Protocol** - Encrypted KYC & access control
- 🪪 **Worldcoin** - Proof of personhood
- 🤖 **Fetch.ai** - Autonomous agent coordination
- 📦 **Lighthouse** - Decentralized storage

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## ⚖️ License

MIT License - see [LICENSE](./LICENSE)

---

## 📞 Contact

- **Team**: WanderLink
- **Email**: team@WanderLink.xyz
- **Twitter**: [@WanderLink](https://twitter.com/WanderLink)
- **Discord**: [Join our community](https://discord.gg/WanderLink)

---

## 🙏 Acknowledgments

Built for ETHOnline 2025 🌍✨

*Making stranger travel safe, fair, and magical.*
