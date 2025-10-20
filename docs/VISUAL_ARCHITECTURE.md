# 🎨 WanderLink Visual Architecture

## 🏗️ System Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             USER INTERFACE LAYER                             │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Browser    │  │    Mobile    │  │   Desktop    │  │   Tablet     │  │
│  │  (Chrome)    │  │   (Safari)   │  │   (Edge)     │  │   (iPad)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │                  │           │
│         └──────────────────┴──────────────────┴──────────────────┘           │
│                                     │                                         │
└─────────────────────────────────────┼─────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND APPLICATION                                │
│                         (Next.js 14 + React 18)                              │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Components                                                          │    │
│  │  ├─ Layout (Header, Footer, Navigation)                            │    │
│  │  ├─ Pages (Home, Explore, Trip Details, Dashboard, Profile)        │    │
│  │  ├─ Forms (Create Trip, Verification, Stake)                       │    │
│  │  └─ Modals (SOS, Wallet Connect, Confirmation)                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  State Management                                                    │    │
│  │  ├─ React Query (Server state)                                     │    │
│  │  ├─ Zustand (Client state)                                         │    │
│  │  └─ Wagmi (Blockchain state)                                       │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Web3 Integration                                                    │    │
│  │  ├─ RainbowKit (Wallet connection)                                 │    │
│  │  ├─ Viem (Ethereum interactions)                                   │    │
│  │  └─ Ethers.js (Contract calls)                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────┬──────────────────────┬────────────────────┬────────────────┘
              │                      │                    │
              │                      │                    │
      ┌───────▼───────┐      ┌───────▼───────┐   ┌───────▼───────┐
      │   Backend     │      │     Agent     │   │    Smart      │
      │     API       │      │    Service    │   │  Contracts    │
      └───────┬───────┘      └───────┬───────┘   └───────┬───────┘
              │                      │                    │
              │                      │                    │
              ▼                      ▼                    ▼
```

---

## 🔧 Backend API Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND API SERVER                                  │
│                        (Node.js + Express.js)                                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  Routes Layer                                                      │      │
│  │  ├─ /api/auth/*          → Authentication endpoints              │      │
│  │  ├─ /api/trips/*         → Trip CRUD operations                  │      │
│  │  ├─ /api/users/*         → User profile management               │      │
│  │  ├─ /api/verification/*  → KYC & WorldID verification            │      │
│  │  ├─ /api/sos/*           → Emergency alerts                      │      │
│  │  └─ /api/reputation/*    → Reputation queries                    │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                      │                                       │
│  ┌──────────────────────────────────▼───────────────────────────────┐      │
│  │  Services Layer                                                    │      │
│  │  ├─ AuthService          → JWT, wallet signature verification    │      │
│  │  ├─ TripService          → Trip business logic                   │      │
│  │  ├─ VerificationService  → KYC processing                        │      │
│  │  ├─ NotificationService  → Email, SMS, push notifications        │      │
│  │  └─ BlockchainService    → Contract interaction abstraction      │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                      │                                       │
│  ┌──────────────────────────────────▼───────────────────────────────┐      │
│  │  Data Layer                                                        │      │
│  │  ├─ Prisma ORM           → Type-safe database queries            │      │
│  │  ├─ PostgreSQL           → Relational data (users, trips)        │      │
│  │  ├─ Redis                → Session cache, agent coordination     │      │
│  │  └─ Lighthouse           → Encrypted file storage                │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Agent System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          AGENT SERVICE                                       │
│                    (Fetch.ai ASI + LangChain)                                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  Agent Orchestrator                                                │      │
│  │  ├─ Agent Registry       → Tracks active agents                  │      │
│  │  ├─ Message Router       → Routes inter-agent messages           │      │
│  │  ├─ Negotiation Manager  → Coordinates multi-round bargaining    │      │
│  │  └─ State Synchronizer   → Keeps agents in sync                  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                      │                                       │
│  ┌──────────────────────────────────▼───────────────────────────────┐      │
│  │  Agent Types                                                       │      │
│  │                                                                    │      │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │      │
│  │  │  TravelAgent    │  │ MatchMakerAgent │  │  SafetyAgent    │  │      │
│  │  │  (Per User)     │  │  (Orchestrator) │  │  (Guardian)     │  │      │
│  │  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤  │      │
│  │  │ • Preferences   │  │ • Group forming │  │ • Check-ins     │  │      │
│  │  │ • Budget        │  │ • Synergy calc  │  │ • SOS monitor   │  │      │
│  │  │ • Constraints   │  │ • Optimization  │  │ • Alerts        │  │      │
│  │  │ • Negotiation   │  │ • Coordination  │  │ • Freezes       │  │      │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │      │
│  │                                                                    │      │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │      │
│  │  │  EscrowAgent    │  │  PlannerAgent   │  │  MemoryAgent    │  │      │
│  │  │  (Monitor)      │  │  (Itinerary)    │  │  (Logger)       │  │      │
│  │  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤  │      │
│  │  │ • Contract      │  │ • Route gen     │  │ • Trip summary  │  │      │
│  │  │   state watch   │  │ • Activity rec  │  │ • Highlights    │  │      │
│  │  │ • Auto-release  │  │ • Cost optimize │  │ • Insights      │  │      │
│  │  │ • Slash trigger │  │ • Time manage   │  │ • Learning      │  │      │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                      │                                       │
│  ┌──────────────────────────────────▼───────────────────────────────┐      │
│  │  AI/ML Layer                                                       │      │
│  │  ├─ LangChain             → Agent chaining & tools               │      │
│  │  ├─ OpenAI GPT-4          → Language understanding               │      │
│  │  ├─ Embedding Models      → Preference vectorization             │      │
│  │  └─ Reinforcement Learning → Agent improvement                   │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## ⛓️ Blockchain Layer Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        SMART CONTRACTS LAYER                                 │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                        Hedera Hashgraph                            │      │
│  │                         (Fast Consensus)                           │      │
│  │                                                                    │      │
│  │  ┌───────────────────────────────────────────────────────────┐   │      │
│  │  │  TripEscrow.sol                                             │   │      │
│  │  │  ┌─────────────────────────────────────────────────────┐   │   │      │
│  │  │  │  State Variables                                      │   │   │      │
│  │  │  │  • mapping(uint => Trip) trips                       │   │   │      │
│  │  │  │  • mapping(uint => mapping(address => Participant))  │   │   │      │
│  │  │  │  • uint256 tripCounter                               │   │   │      │
│  │  │  └─────────────────────────────────────────────────────┘   │   │      │
│  │  │  ┌─────────────────────────────────────────────────────┐   │   │      │
│  │  │  │  Functions                                            │   │   │      │
│  │  │  │  • createTrip()    → Initialize new trip             │   │   │      │
│  │  │  │  • joinTrip()      → Stake & join                    │   │   │      │
│  │  │  │  • confirmAttendance() → Check-in proof              │   │   │      │
│  │  │  │  • completeTrip()  → Release funds + mint NFT        │   │   │      │
│  │  │  │  • reportIncident() → Emergency freeze               │   │   │      │
│  │  │  │  • slashUser()     → Penalize bad actors             │   │   │      │
│  │  │  │  • cancelTrip()    → Refund all stakes               │   │   │      │
│  │  │  └─────────────────────────────────────────────────────┘   │   │      │
│  │  └───────────────────────────────────────────────────────────┘   │      │
│  │                                                                    │      │
│  │  ┌───────────────────────────────────────────────────────────┐   │      │
│  │  │  ReputationSBT.sol                                          │   │      │
│  │  │  ┌─────────────────────────────────────────────────────┐   │   │      │
│  │  │  │  • mintVerifiedSBT() → Issue soulbound token        │   │   │      │
│  │  │  │  • updateScore()     → Adjust reputation            │   │   │      │
│  │  │  │  • recordTrip()      → Log completed trip           │   │   │      │
│  │  │  │  • upgradeTier()     → Increase verification level  │   │   │      │
│  │  │  │  • Non-transferable  → Prevent token sales          │   │   │      │
│  │  │  └─────────────────────────────────────────────────────┘   │   │      │
│  │  └───────────────────────────────────────────────────────────┘   │      │
│  │                                                                    │      │
│  │  ┌───────────────────────────────────────────────────────────┐   │      │
│  │  │  TripNFT.sol                                                │   │      │
│  │  │  ┌─────────────────────────────────────────────────────┐   │   │      │
│  │  │  │  • mintTripNFT()     → Create trip memory           │   │   │      │
│  │  │  │  • Store metadata    → Destination, dates, score    │   │   │      │
│  │  │  │  • Media hashes      → Link to Lighthouse storage   │   │   │      │
│  │  │  │  • Transferable      → Can be sold/traded           │   │   │      │
│  │  │  └─────────────────────────────────────────────────────┘   │   │      │
│  │  └───────────────────────────────────────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                         Polygon L2                                 │      │
│  │                     (Scalable Operations)                          │      │
│  │                                                                    │      │
│  │  • High-frequency reputation updates                              │      │
│  │  • Low-cost interactions                                          │      │
│  │  • Fast finality                                                  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security & Identity Layer

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     SECURITY & IDENTITY INFRASTRUCTURE                       │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  Verification Pipeline                                             │      │
│  │                                                                    │      │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │      │
│  │  │ Wallet  │ → │ WorldID │ → │   KYC   │ → │   SBT   │      │      │
│  │  │Signature│    │  Proof  │    │Document │    │  Mint   │      │      │
│  │  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │      │
│  │      ↓              ↓              ↓              ↓              │      │
│  │   EIP-191      Worldcoin      Civic/Fractal   Blockchain         │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  Lit Protocol - Encryption & Access Control                       │      │
│  │                                                                    │      │
│  │  ┌─────────────────────────────────────────────────────────┐     │      │
│  │  │  1. User uploads KYC document                            │     │      │
│  │  │  2. Lit encrypts with access control conditions          │     │      │
│  │  │  3. Ciphertext stored on Lighthouse (IPFS)               │     │      │
│  │  │  4. Hash stored on-chain (ReputationSBT)                 │     │      │
│  │  │  5. Only SBT holders can decrypt                         │     │      │
│  │  └─────────────────────────────────────────────────────────┘     │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  Lighthouse - Decentralized Storage                               │      │
│  │                                                                    │      │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │      │
│  │  │  KYC Documents  │  │  Trip Media     │  │  Evidence       │  │      │
│  │  │  (Encrypted)    │  │  (Encrypted)    │  │  Packets        │  │      │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │      │
│  │          │                     │                     │            │      │
│  │          └─────────────────────┴─────────────────────┘            │      │
│  │                              │                                     │      │
│  │                    ┌─────────▼─────────┐                          │      │
│  │                    │  IPFS/Filecoin    │                          │      │
│  │                    │  Distributed      │                          │      │
│  │                    │  Storage Network  │                          │      │
│  │                    └───────────────────┘                          │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### User Creates Trip

```
User → Frontend → Backend → Agent Service → Smart Contract
  │                                              │
  └──────────── Event Subscription ─────────────┘
```

### Agent Matchmaking

```
User A → TravelAgent A ──┐
                          ├─→ MatchMakerAgent → Group Proposal
User B → TravelAgent B ──┤
                          ├─→ (Multi-round negotiation)
User C → TravelAgent C ──┘
                          │
                          ▼
                    Synergy Score (0-100)
                          │
                          ▼
              Users approve → Smart Contract
```

### Trip Execution

```
Trip Start → Check-in Required
    │
    ├─→ User signs message (EIP-191)
    │   │
    │   ├─→ Hash proof
    │   │
    │   └─→ Store on Lighthouse + Smart Contract
    │
Trip End → Verification Period
    │
    └─→ Smart Contract verifies all proofs
        │
        ├─→ Release funds to confirmed participants
        ├─→ Slash no-shows (30%)
        └─→ Mint TripNFTs
```

### SOS Emergency

```
User presses SOS
    │
    ├─→ Frontend → Backend → Alert Service
    │                  │
    │                  ├─→ Notify group members
    │                  ├─→ Notify emergency contacts
    │                  ├─→ Alert platform ops
    │                  └─→ Contact local partners
    │
    ├─→ Smart Contract → Freeze escrow
    │
    └─→ Evidence snapshot
        ├─→ Last check-in location
        ├─→ Media hash trail
        └─→ Agent logs
```

---

## 🌐 Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  CloudFlare (CDN + DDoS Protection)                      │  │
│  └───────────────────────┬─────────────────────────────────┘  │
│                          │                                     │
│  ┌───────────────────────▼─────────────────────────────────┐  │
│  │  Vercel (Frontend)                                        │  │
│  │  • Next.js 14 app                                        │  │
│  │  • Edge functions                                         │  │
│  │  • Image optimization                                     │  │
│  └───────────────────────┬─────────────────────────────────┘  │
│                          │                                     │
│                          ▼                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Railway (Backend + Agents)                             │  │
│  │  ├─ Backend API (Node.js)                              │  │
│  │  └─ Agent Service (Python)                             │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database & Cache                                        │  │
│  │  ├─ Supabase (PostgreSQL)                              │  │
│  │  └─ Upstash (Redis)                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Blockchain Networks                                      │  │
│  │  ├─ Hedera Mainnet (Fast consensus)                     │  │
│  │  └─ Polygon Mainnet (Scalability)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Component Interaction Matrix

| Component | Interacts With | Purpose |
|-----------|----------------|---------|
| **Frontend** | Backend API, Smart Contracts, Wallet | User interface & Web3 interaction |
| **Backend API** | Database, Agents, Lighthouse | Business logic & coordination |
| **Agents** | Backend, Redis, OpenAI | AI-powered matchmaking |
| **Smart Contracts** | Frontend, Backend | On-chain logic & escrow |
| **Lit Protocol** | Frontend, Backend, Lighthouse | Encryption & access control |
| **Lighthouse** | Frontend, Backend | Decentralized storage |
| **WorldID** | Frontend, Backend | Proof of personhood |
| **PostgreSQL** | Backend | Structured data storage |
| **Redis** | Backend, Agents | Cache & coordination |

---

**This architecture enables:**
- ✅ Trustless transactions
- ✅ Privacy-preserving verification
- ✅ Autonomous agent coordination
- ✅ Scalable Web3 operations
- ✅ Multi-chain compatibility
- ✅ Real-time safety mechanisms

---

**Built for ETHOnline 2025 🌍✨**
