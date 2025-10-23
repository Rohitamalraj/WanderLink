# 🎯 WanderLink - Complete Sponsor Integration Plan

## 🎖️ Three Sponsor Tracks Integration

### 📋 Executive Summary
WanderLink will integrate **ASI Alliance (Fetch.ai)**, **Hedera**, and **Lighthouse** to create a decentralized AI-powered travel matching platform with:
- 🤖 **Autonomous AI agents** negotiating travel groups (ASI)
- ⚡ **Fast consensus & payments** via Hedera Token Service (Hedera)
- 🔐 **Encrypted data storage** with Lighthouse DataCoins (Lighthouse)

---

## 1️⃣ ASI Alliance (Fetch.ai) Integration

### 🎯 Target Bounty: **Best Use of ASI Alliance Tech ($5,000)**

### Requirements Checklist
- [ ] ✅ **Agents registered on Agentverse** - TravelMatchAgent, EscrowAgent, ReputationAgent
- [ ] ✅ **Chat Protocol live for ASI:One** - Real-time agent communication
- [ ] ✅ **uAgents framework** - Python agents with protocols
- [ ] ✅ **MeTTa Knowledge Graphs** - Travel preferences reasoning
- [ ] ✅ **Real-world problem** - Stranger-trip safety & matching
- [ ] ✅ **Comprehensive documentation** - Architecture + integration guides

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    ASI Agent Ecosystem                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TravelMatchAgent (Agentverse)                             │
│  ├─ Receives user preferences from frontend                │
│  ├─ Uses MeTTa Knowledge Graph for reasoning               │
│  ├─ Negotiates with other TravelMatchAgents via A2A        │
│  └─ Returns optimal group matches                          │
│                                                             │
│  EscrowAgent (Agentverse)                                  │
│  ├─ Monitors Hedera smart contracts                        │
│  ├─ Triggers refunds/releases via AP2                      │
│  └─ Communicates with TravelMatchAgent                     │
│                                                             │
│  ReputationAgent (Agentverse)                              │
│  ├─ Analyzes trip completion data                          │
│  ├─ Updates user reputation scores                         │
│  └─ Shares insights with TravelMatchAgent                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Steps
1. **Create uAgents** (`agents/src/`)
   - `travel_match_agent.py` - Core matching logic
   - `escrow_agent.py` - Payment monitoring
   - `reputation_agent.py` - Score calculation

2. **Register on Agentverse**
   - Upload agents to Agentverse.ai
   - Configure API keys and endpoints
   - Set up agent-to-agent protocols

3. **Integrate MeTTa Knowledge Graphs**
   - Define travel ontology (destinations, activities, preferences)
   - Create reasoning rules for compatibility
   - Query MeTTa for synergy scores

4. **Implement A2A Communication**
   - Use Chat Protocol for agent negotiation
   - Implement multi-round bidding system
   - Handle consensus and group formation

5. **Frontend Integration**
   - API endpoints to trigger agent matching
   - Real-time updates via WebSockets
   - Display agent reasoning process

---

## 2️⃣ Hedera Integration

### 🎯 Target Bounties:
- **Best Use of Hedera Agent Kit & A2A ($4,000)**
- **Best Hedera x Lit Protocol Vincent Ability ($1,000)** ❌ (Removed Lit)
- **EVM Innovator Track ($4,000)**

### Requirements Checklist

#### Agent Kit & A2A Track
- [ ] ✅ **Multi-agent A2A communication** - Travel agents negotiate bookings
- [ ] ✅ **Hedera Agent Kit integration** - Use official SDK
- [ ] ✅ **AP2 payment settlement** - Stablecoin payments via HTS
- [ ] ✅ **Open-source + demo video** - GitHub + YouTube demo
- [ ] 🎁 **Bonus: Multiple Hedera services** - HTS + Smart Contracts + Consensus

#### EVM Innovator Track
- [ ] ✅ **Smart contracts deployed** - TripEscrow verified on Hashscan
- [ ] ✅ **Oracle integration** - Chainlink price feeds for dynamic pricing
- [ ] ✅ **Bridge integration** - LayerZero for cross-chain reputation
- [ ] ✅ **HTS System Contracts** - Native token operations
- [ ] ✅ **Wallet integration** - HashPack + MetaMask Snap

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                  Hedera Infrastructure                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Smart Contracts (EVM)                                      │
│  ├─ TripEscrow.sol - Stake & release funds                 │
│  ├─ ReputationSBT.sol - Soulbound reputation tokens        │
│  └─ TripNFT.sol - Commemorative NFTs                       │
│                                                             │
│  Hedera Token Service (HTS)                                │
│  ├─ WANDER token (fungible) - Platform currency           │
│  ├─ TripNFT collection - Achievement NFTs                  │
│  └─ ReputationSBT - Non-transferable identity              │
│                                                             │
│  Hedera Consensus Service (HCS)                            │
│  ├─ Trip check-in events                                   │
│  ├─ SOS emergency alerts                                   │
│  └─ Agent negotiation logs                                 │
│                                                             │
│  Hedera Agent Kit                                          │
│  ├─ TravelAgent - Implements A2A protocol                  │
│  ├─ PaymentAgent - Handles AP2 settlements                 │
│  └─ Custom plugins for trip management                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Hedera Agent Kit Setup**
   ```bash
   npm install @hashgraph/hedera-agent-kit
   ```
   - Create TravelAgent with A2A messaging
   - Implement AP2 payment protocol
   - Build custom trip management plugin

2. **Deploy HTS Tokens**
   - WANDER fungible token (1M supply)
   - TripNFT collection (unlimited)
   - ReputationSBT (non-transferable)

3. **Smart Contract Deployment**
   - Deploy TripEscrow to Hedera testnet
   - Verify on Hashscan
   - Integrate with HTS system contracts

4. **Oracle Integration**
   - Chainlink price feeds for USD/HBAR
   - Dynamic escrow amounts based on trip cost
   - Supra oracle for weather data (safety)

5. **Cross-Chain Bridge**
   - LayerZero integration
   - Sync reputation from Polygon to Hedera
   - Enable multi-chain wallet support

6. **Consensus Service**
   - Submit check-in proofs to HCS
   - Create immutable trip timeline
   - Enable dispute resolution

---

## 3️⃣ Lighthouse Integration

### 🎯 Target Bounties:
- **Best Consumer DataCoin Created ($500)**
- **Best DataAgent Created ($500)**

### Requirements Checklist

#### Consumer DataCoin Track
- [ ] ✅ **Launch DataCoin on 1MB.io** - TravelDataCoin
- [ ] ✅ **Store data via Lighthouse** - Trip reviews, KYC, photos
- [ ] ✅ **Real-world dataset with proof** - zkTLS verified booking data
- [ ] ✅ **Deploy to supported network** - Polygon/Base
- [ ] ✅ **Working frontend demo** - Deployed on Vercel
- [ ] ✅ **Open-source GitHub** - Public repository

#### DataAgent Track
- [ ] ✅ **AI Agent creates synthetic data** - Trip predictions, pricing models
- [ ] ✅ **DataCoin rewards agents** - Pay for quality predictions
- [ ] ✅ **Store via Lighthouse** - Encrypted datasets
- [ ] ✅ **Working demo** - Live frontend

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│              Lighthouse Data Infrastructure                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TravelDataCoin (1MB.io)                                   │
│  ├─ Trip Reviews Dataset - User-generated reviews          │
│  ├─ KYC Verification Dataset - Privacy-preserved IDs       │
│  ├─ Booking History Dataset - zkTLS verified bookings      │
│  └─ Price Predictions Dataset - AI-generated forecasts     │
│                                                             │
│  Lighthouse Storage                                         │
│  ├─ Encrypted KYC documents (wallet-based access)          │
│  ├─ Trip photos & evidence (group-shared access)           │
│  ├─ Agent-generated datasets (datacoin holders access)     │
│  └─ Check-in proofs & GPS data (time-locked)               │
│                                                             │
│  Access Control Conditions                                  │
│  ├─ Wallet-based: Only user can decrypt KYC               │
│  ├─ Token-gated: DataCoin holders access datasets         │
│  ├─ Time-locked: Emergency data released after 24h        │
│  └─ Multi-sig: Trip group members share photo access      │
│                                                             │
│  Data Agents                                                │
│  ├─ PricingAgent - Predicts trip costs from historical    │
│  ├─ SafetyAgent - Analyzes destination risk data           │
│  ├─ MatchAgent - Generates synthetic user profiles        │
│  └─ Agents earn DataCoins for quality contributions        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Replace Lit Protocol with Lighthouse**
   - Remove `lit-protocol.ts`
   - Create `lighthouse-encryption.ts`
   - Use Lighthouse SDK for encryption
   ```typescript
   import lighthouse from '@lighthouse-web3/sdk'
   ```

2. **Implement Access Control**
   ```typescript
   // Wallet-based access (KYC)
   const accessConditions = [
     {
       conditionType: 'wallet',
       chain: 'polygon',
       method: 'isOwner',
       parameters: [walletAddress]
     }
   ]
   
   // Token-gated access (DataCoin)
   const datasetAccess = [
     {
       conditionType: 'token',
       chain: 'polygon',
       contractAddress: DATACOIN_ADDRESS,
       method: 'balanceOf',
       minBalance: '1000000000000000000' // 1 DataCoin
     }
   ]
   ```

3. **Create TravelDataCoin on 1MB.io**
   - Define dataset schema
   - Upload initial seed data
   - Set pricing and access rules
   - Enable trading

4. **Build Data Agents**
   ```python
   # agents/src/pricing_agent.py
   class PricingAgent(Agent):
       async def generate_price_predictions(self):
           # Fetch historical data from Lighthouse
           dataset = await lighthouse.get_data(TRIP_HISTORY_CID)
           
           # Run ML model
           predictions = self.ml_model.predict(dataset)
           
           # Store predictions encrypted
           cid = await lighthouse.upload_encrypted(predictions)
           
           # Mint DataCoin shares
           await datacoin.mint_shares(cid, metadata)
   ```

5. **zkTLS Integration (Reclaim Protocol)**
   ```typescript
   import { ReclaimProtocol } from '@reclaimprotocol/js-sdk'
   
   // Verify booking from Booking.com/Airbnb
   const proof = await reclaim.generateProof({
     provider: 'booking.com',
     params: { bookingId: '123456' }
   })
   
   // Store proof on Lighthouse
   const cid = await lighthouse.uploadText(JSON.stringify(proof))
   
   // Add to DataCoin dataset
   await datacoin.addDataPoint(cid, proof.metadata)
   ```

6. **Frontend Integration**
   - Upload files to Lighthouse
   - Display DataCoin datasets
   - Enable data contribution rewards
   - Show agent-generated insights

---

## 🔄 Complete User Flow

### **Phase 1: Onboarding (30s)**
```
User → Connect Wallet → Upload KYC to Lighthouse (encrypted) 
     → Hash stored on-chain → Verified badge minted
```

### **Phase 2: AI Matching (60s)**
```
User Preferences → TravelMatchAgent (Fetch.ai) 
                 → MeTTa reasoning → A2A negotiation with other agents
                 → Optimal group formed → Synergy score calculated
```

### **Phase 3: Commitment (30s)**
```
Group Review → Stake WANDER tokens → Hedera TripEscrow.sol
            → HTS token transfer → Funds locked → Trip confirmed
```

### **Phase 4: Trip Execution (Live)**
```
Check-ins → GPS proof → HCS consensus service → Lighthouse storage
         → SOS button → Emergency data auto-release
         → Photos uploaded (encrypted, group-shared via Lighthouse)
```

### **Phase 5: Completion & Rewards (30s)**
```
Trip ends → EscrowAgent verifies → AP2 settlement (Hedera Agent Kit)
         → Funds released → TripNFT minted → Reputation updated
         → Trip data → TravelDataCoin (Lighthouse)
         → DataAgents analyze → Earn rewards
```

---

## 📦 Technical Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **AI Agents** | Fetch.ai uAgents + MeTTa | Autonomous matching & negotiation |
| **Agent Communication** | A2A Protocol (ASI:One) | Multi-agent coordination |
| **Smart Contracts** | Solidity (Hedera EVM) | Escrow, reputation, NFTs |
| **Payments** | Hedera Agent Kit + AP2 | Token transfers & settlements |
| **Native Tokens** | Hedera Token Service | WANDER, ReputationSBT, TripNFT |
| **Consensus** | Hedera Consensus Service | Immutable trip logs |
| **Oracles** | Chainlink + Supra | Price feeds, weather data |
| **Cross-Chain** | LayerZero | Reputation bridging |
| **Encryption** | Lighthouse Storage | KYC, photos, datasets |
| **DataCoins** | 1MB.io + Lighthouse | Monetize travel data |
| **zkTLS** | Reclaim Protocol | Verified booking proofs |
| **Frontend** | Next.js + Vercel | User interface |
| **Database** | PostgreSQL + Redis | Metadata & caching |

---

## 📝 Deliverables Checklist

### Code & Documentation
- [ ] ✅ Public GitHub repository with all code
- [ ] ✅ Comprehensive README with setup instructions
- [ ] ✅ Architecture documentation (this file)
- [ ] ✅ API documentation for agents
- [ ] ✅ Smart contract deployment addresses
- [ ] ✅ Hashscan verification links

### Demos & Videos
- [ ] ✅ 5-minute demo video (YouTube)
- [ ] ✅ Live frontend deployed on Vercel
- [ ] ✅ Agent interaction demo on Agentverse
- [ ] ✅ DataCoin live on 1MB.io

### Integration Proofs
- [ ] ✅ Agentverse agent URLs
- [ ] ✅ Hedera Hashscan contract links
- [ ] ✅ Lighthouse CIDs for encrypted data
- [ ] ✅ DataCoin trading page
- [ ] ✅ zkTLS proof examples

---

## 🎯 Scoring Strategy

### ASI Alliance (100 points)
- **Functionality (25)**: All 3 agents working, real-time communication ✅
- **ASI Tech (20)**: Agentverse + A2A + uAgents + MeTTa ✅
- **Innovation (20)**: First AI-negotiated stranger travel ✅
- **Impact (20)**: Solves real safety problem ✅
- **UX (15)**: Clean demo, full documentation ✅

### Hedera (Multiple Tracks)
- **Agent Kit & A2A**: Full A2A implementation + AP2 payments + multi-service
- **EVM Innovator**: Verified contracts + Chainlink + LayerZero + HTS integration

### Lighthouse (50 points)
- **DataCoin (25)**: Live coin + zkTLS proofs + real dataset ✅
- **DataAgent (25)**: AI agents create & monetize synthetic data ✅

---

## 🚀 Implementation Priority

### Week 1: Core Infrastructure
1. Set up Lighthouse SDK (replace Lit Protocol)
2. Deploy Hedera Agent Kit
3. Create basic uAgents for Fetch.ai
4. Deploy smart contracts to Hedera testnet

### Week 2: Agent Development
1. Implement TravelMatchAgent with MeTTa
2. Build A2A communication protocols
3. Create DataAgents for Lighthouse
4. Integrate AP2 payment settlement

### Week 3: Integration & Testing
1. Connect frontend to all services
2. Test end-to-end user flow
3. Deploy DataCoin on 1MB.io
4. Verify all sponsor requirements

### Week 4: Polish & Documentation
1. Record demo videos
2. Write comprehensive docs
3. Deploy to production
4. Final testing & bug fixes

---

## 📞 Support & Resources

### ASI Alliance
- Discord: [Fetch.ai Community](https://fetch.ai/discord)
- Docs: [Innovation Lab](https://innovationlab.fetch.ai)

### Hedera
- Discord: [Hedera Developers](https://hedera.com/discord)
- Portal: [Developer Portal](https://portal.hedera.com)

### Lighthouse
- Docs: [Lighthouse Storage](https://docs.lighthouse.storage)
- 1MB.io: [DataCoin Platform](https://1mb.io)

---

**Status**: 🟡 Ready to Implement
**Last Updated**: October 21, 2025
**Next Steps**: Start Lighthouse integration (remove Lit Protocol)
