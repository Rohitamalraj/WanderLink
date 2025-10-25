# 🏗️ WanderLink Architecture

## System Overview

WanderLink is a **multi-layer decentralized platform** combining:
- **Smart Contracts** (Hedera + Polygon)
- **AI Agents** (Fetch.ai ASI)
- **Encrypted Storage** (Lighthouse + Lit Protocol)
- **Identity** (Worldcoin WorldID + Civic/Fractal)

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│  Web3 Wallet (MetaMask/HashPack) + Browser                      │
└────────────────────┬───────────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────────┐
│                      FRONTEND (Next.js 14)                      │
│  - React Components                                              │
│  - RainbowKit / Web3Auth                                        │
│  - React Query (state)                                           │
│  - Wagmi (chain interaction)                                     │
└────────┬─────────────┬──────────────┬────────────────────────┘
         │             │              │
         │             │              │
    ┌────▼────┐   ┌────▼─────┐  ┌────▼────────┐
    │ Backend │   │  Agent   │  │   Smart     │
    │   API   │   │ Service  │  │  Contracts  │
    └────┬────┘   └────┬─────┘  └────┬────────┘
         │             │              │
         │             │              │
┌────────▼─────────────▼──────────────▼────────────────────────┐
│                   INFRASTRUCTURE LAYER                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Hedera   │  │ Polygon  │  │Fetch.ai  │  │  Lighthouse │  │
│  │ Hashgraph│  │    L2    │  │   ASI    │  │   Storage   │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │   Lit    │  │Worldcoin │  │PostgreSQL│                    │
│  │ Protocol │  │ WorldID  │  │ + Redis  │                    │
│  └──────────┘  └──────────┘  └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Component Breakdown

### 1. Frontend (Next.js 14)

**Tech Stack:**
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **Web3:** Wagmi + RainbowKit + Viem
- **State:** React Query + Zustand
- **UI:** Headless UI + Hero Icons

**Key Pages:**
- `/` — Landing page
- `/explore` — Browse trips
- `/create` — Create new trip
- `/trip/[id]` — Trip details
- `/profile` — User profile + reputation
- `/dashboard` — Active trips dashboard

**Key Features:**
- Wallet connection (multi-chain)
- Verification flow (WorldID)
- Real-time trip status
- SOS button + alerts
- TripNFT gallery

---

### 2. Smart Contracts (Solidity 0.8.20)

#### **TripEscrow.sol** (Core Contract)

**Purpose:** Manages trip lifecycle, stakes, and enforcement

**Key Functions:**
```solidity
createTrip(stake, maxParticipants, startTime, endTime)
joinTrip(tripId) payable
confirmAttendance(tripId, proofHash)
completeTrip(tripId)
reportIncident(tripId)
slashUser(tripId, participant)
cancelTrip(tripId, reason)
```

**State Machine:**
```
Created → Active → Completed
              ↓
          Disputed → Resolved
              ↓
          Cancelled
```

**Security Features:**
- ReentrancyGuard
- AccessControl (RBAC)
- Pausable (emergency)
- Multi-sig admin

---

#### **ReputationSBT.sol** (Soulbound Token)

**Purpose:** Non-transferable identity + reputation

**Verification Tiers:**
- **Tier 0:** None
- **Tier 1:** Basic (Email + WorldID)
- **Tier 2:** Standard (Photo + WorldID)
- **Tier 3:** Full (KYC via Civic/Fractal)

**Key Functions:**
```solidity
mintVerifiedSBT(wallet, tier, kycHash)
updateScore(wallet, delta)
recordTripCompletion(wallet, tripId, stake)
upgradeTier(wallet, newTier, newKYCHash)
```

**Reputation Score Formula:**
```
Score = baseScore(100) 
        + completedTrips * 10
        + noDisputes * 5
        - disputes * 20
        - slashing * 50
```

---

#### **TripNFT.sol** (Commemorative NFT)

**Purpose:** Mint permanent trip memories

**Metadata Structure:**
```json
{
  "tripId": 123,
  "destination": "Bali, Indonesia",
  "startDate": 1704067200,
  "endDate": 1704672000,
  "synergyScore": 94,
  "proofHash": "0xabc...",
  "mediaHashes": ["ipfs://..."],
  "participants": ["0x...", "0x..."]
}
```

---

### 3. Backend API (Node.js + Express)

**Tech Stack:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis
- **Auth:** JWT + Wallet signatures

**Key Endpoints:**

```
POST   /api/auth/login              # Wallet sign-in
GET    /api/trips                   # List trips
GET    /api/trips/:id               # Trip details
POST   /api/trips                   # Create trip
POST   /api/verification/worldid    # Verify WorldID
POST   /api/verification/kyc        # Upload KYC
GET    /api/profile/:address        # User profile
POST   /api/sos                     # Emergency alert
GET    /api/reputation/:address     # Reputation data
```

**Database Schema (Prisma):**
```prisma
model User {
  id            String   @id @default(uuid())
  wallet        String   @unique
  email         String?
  verifiedSBT   String?
  tier          Int      @default(0)
  tripScore     Int      @default(100)
  createdAt     DateTime @default(now())
  trips         Trip[]
}

model Trip {
  id              String   @id @default(uuid())
  contractAddress String
  tripId          Int
  destination     String
  startDate       DateTime
  endDate         DateTime
  stakeAmount     String
  status          String
  participants    User[]
  createdAt       DateTime @default(now())
}
```

---

### 4. AI Agent Service (Fetch.ai ASI)

**Tech Stack:**
- **Framework:** uAgents (Fetch.ai)
- **AI:** LangChain + OpenAI GPT-4
- **Coordination:** Redis pub/sub

**Agent Types:**

#### **TravelAgent** (Per-User)
```python
class TravelAgent(Agent):
    def __init__(self, user_profile):
        self.preferences = encode_preferences(user_profile)
        self.budget = user_profile['budget']
        self.constraints = user_profile['constraints']
    
    async def negotiate(self, proposals):
        # Evaluate proposals and counter-offer
        scores = [self.compute_utility(p) for p in proposals]
        return max(scores, key=lambda x: x.score)
```

#### **MatchMakerAgent** (Orchestrator)
```python
class MatchMakerAgent(Agent):
    async def form_groups(self, agents):
        # Multi-round negotiation
        for round in range(MAX_ROUNDS):
            proposals = await self.generate_proposals(agents)
            responses = await asyncio.gather(
                *[agent.negotiate(proposals) for agent in agents]
            )
            best_group = self.select_optimal(responses)
        return best_group
```

**Synergy Score Algorithm:**
```python
def compute_synergy(group):
    score = 0
    
    # Preference alignment
    pref_similarity = cosine_similarity(
        [a.preferences for a in group]
    )
    score += pref_similarity * 40
    
    # Budget compatibility
    budget_variance = np.std([a.budget for a in group])
    score += (1 - min(budget_variance / 100, 1)) * 30
    
    # Personality balance
    personality_balance = check_personality_mix(group)
    score += personality_balance * 20
    
    # Reputation safety
    min_reputation = min([a.reputation for a in group])
    score += (min_reputation / 1000) * 10
    
    return min(score, 100)
```

---

### 5. Encrypted Storage (Lighthouse + Lit)

**Flow:**

1. **User uploads KYC document**
```typescript
// Encrypt with Lit Protocol
const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
  'sensitive-kyc-data',
  {
    accessControlConditions: [
      {
        contractAddress: REPUTATION_SBT_ADDRESS,
        standardContractType: 'ERC721',
        method: 'balanceOf',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
    ],
  }
);

// Store on Lighthouse
const uploadResponse = await lighthouse.uploadText(
  ciphertext,
  LIGHTHOUSE_API_KEY
);
```

2. **Store hash on-chain**
```solidity
encryptedKYCHash[tokenId] = keccak256(uploadResponse.Hash);
```

3. **Retrieve & decrypt (authorized only)**
```typescript
const decrypted = await LitJsSdk.decryptString(
  ciphertext,
  dataToEncryptHash,
  authSig
);
```

---

## 🔒 Security Architecture

### Identity Verification Layers

```
Layer 1: Wallet Signature (EIP-191/EIP-712)
         ↓
Layer 2: WorldID Proof of Personhood
         ↓
Layer 3: KYC Document (Civic/Fractal)
         ↓
Layer 4: Soulbound Token Mint
         ↓
Layer 5: Reputation Score Tracking
```

### Escrow Security

**Multi-sig Admin:**
- Requires 2-of-3 signatures for emergency actions
- Time-locked upgrades (48-hour delay)

**Slashing Rules:**
- No-show: 30% of stake
- Verified harm: 100% of stake
- False report: 20% penalty

**Audit Trail:**
- All actions logged on-chain
- Evidence hashes stored immutably
- Off-chain backups on Lighthouse

---

## 📊 Data Flow Examples

### Example 1: Creating a Trip

```
1. User (Alice) → Frontend → "Create Trip"
2. Frontend → Agent Service → Generate AI-optimized itinerary
3. Agent Service → Backend → Store draft trip
4. Backend → Smart Contract → createTrip()
5. Smart Contract → Emit TripCreated event
6. Frontend → Subscribe to event → Update UI
7. Backend → Index trip in database
```

### Example 2: Joining a Trip

```
1. User (Bob) → Frontend → "Join Trip"
2. Frontend → Check ReputationSBT (tier >= required)
3. Frontend → Agent Service → Negotiate with existing agents
4. Agent Service → Return synergy score
5. Frontend → Display group preview
6. User confirms → Smart Contract → joinTrip() + stake
7. Smart Contract → Update state
8. Backend → Notify all participants via push
```

### Example 3: SOS Alert

```
1. User → Frontend → Press "SOS"
2. Frontend → Backend → POST /api/sos
3. Backend → Trigger alert pipeline:
   - Send push to all group members
   - Send SMS to emergency contacts
   - Call Smart Contract → reportIncident()
4. Smart Contract → Freeze escrow
5. Backend → Create incident report
6. Backend → Notify platform ops team
7. Ops → Investigate + coordinate with local partners
```

---

## 🚀 Deployment Architecture

### Production Stack

```
┌─────────────────────────────────────────────┐
│            CloudFlare (CDN + DDoS)           │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          Vercel (Frontend - Next.js)         │
└────────────────┬────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
┌────────▼──────┐  ┌─────▼────────┐
│   Railway     │  │   Railway    │
│ (Backend API) │  │ (Agents)     │
└────────┬──────┘  └─────┬────────┘
         │               │
    ┌────▼───────────────▼────┐
    │  Supabase (PostgreSQL)  │
    │  Upstash (Redis)         │
    └──────────────────────────┘
```

### Smart Contract Networks

- **Hedera Testnet:** 296 (testing)
- **Hedera Mainnet:** 295 (production)
- **Polygon Mumbai:** 80001 (testing)
- **Polygon Mainnet:** 137 (production)

---

## 📈 Scalability Considerations

### Current Limitations
- Max 8 participants per trip
- Max 100 concurrent negotiations per agent service instance
- Rate limit: 10 trips/min per user

### Scale Solutions
- **Horizontal scaling:** Multiple agent service replicas
- **Database sharding:** Partition by user region
- **CDN:** Static assets + API caching
- **L2 chains:** Polygon for high-frequency ops

---

## 🔍 Monitoring & Observability

### Metrics to Track
- Trip creation rate
- Average synergy score
- SOS incident frequency
- Contract gas costs
- Agent negotiation time
- API latency (p95, p99)

### Tools
- **Sentry:** Error tracking
- **PostHog:** Analytics
- **Grafana:** Metrics dashboards
- **Datadog:** APM

---

## 📚 Further Reading

- [Hedera SDK Docs](https://docs.hedera.com)
- [Fetch.ai uAgents](https://docs.fetch.ai/uagents)
- [Lit Protocol](https://developer.litprotocol.com)
- [Lighthouse Storage](https://docs.lighthouse.storage)
- [Worldcoin WorldID](https://docs.worldcoin.org)

---

**Questions? Open an issue or join our Discord!**
