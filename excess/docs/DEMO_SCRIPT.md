# 🎬 Demo Script for ETHOnline 2025 Presentation

**Duration:** 90 seconds  
**Goal:** Show the complete WanderLink flow from matchmaking to trip completion

---

## 🎯 Setup Before Demo

### Pre-requisites
- 3 wallets ready (Alice, Bob, Charlie)
- Contracts deployed on Hedera testnet
- Frontend running on http://localhost:3000
- Backend & agent service running

### Test Data
- **Trip destination:** Bali, Indonesia 🏝️
- **Duration:** 7 days
- **Stake amount:** 0.02 ETH (testnet)
- **Start date:** 2 weeks from now

---

## 📋 Demo Flow (90 seconds)

### Part 1: User Onboarding & AI Matching (30 sec)

**[Screen 1: Landing Page]**

> "WanderLink is the first stranger-trip platform where safety and trust are guaranteed by code — not promises."

**Actions:**
1. Click **"Explore Trips"**
2. Show verification prompt
3. Connect **Alice's wallet** (MetaMask)
4. Click **"Complete Verification"** → WorldID scan (simulated)
5. Show **Verified Traveler SBT** minted on-chain

**[Screen 2: Personality Quiz]**

> "Alice takes a 60-second quiz. Her AI agent encodes her travel style — adventurous, budget-conscious, social."

**Actions:**
1. Select preferences (sliders):
   - Adventure: 85%
   - Budget: Medium ($50/day)
   - Social: High
2. Click **"Find My Tribe"**

**[Screen 3: Agent Negotiation]**

> "In the background, 3 AI agents negotiate. They compute synergy scores across destinations, dates, and personalities."

**Visual:**
- Show agent negotiation animation
- Display synergy score: **94/100** ✅
- Show matched group: Alice, Bob, Charlie

**Actions:**
1. Alice reviews group proposal
2. Click **"Accept Group"**

---

### Part 2: Smart Contract Escrow (20 sec)

**[Screen 4: Stake & Commit]**

> "Now comes the Web3 magic. Everyone stakes 0.02 ETH to a smart contract. No central party holds the money — just code."

**Actions:**
1. Show **TripEscrow** contract details
2. Alice clicks **"Stake & Join"**
3. MetaMask popup → confirm transaction
4. Show on-chain transaction hash
5. **Bob and Charlie** auto-stake (pre-recorded)

**Visual:**
- Display escrow balance: **0.06 ETH**
- Show participant list with checkmarks

---

### Part 3: Trip Execution & Safety (20 sec)

**[Screen 5: Trip Dashboard]**

> "Fast-forward to trip day. All travelers check in with signed wallet messages. These create an immutable forensic trail."

**Actions:**
1. Show trip timeline
2. Alice clicks **"Check In"** → sign message
3. Show signed proof hash stored on Lighthouse
4. Display real-time group status:
   - ✅ Alice: Checked in
   - ✅ Bob: Checked in
   - ✅ Charlie: Checked in

**[Screen 6: SOS Demo (optional)]**

> "If something goes wrong, anyone can hit SOS. This freezes the escrow and alerts the group + emergency contacts."

**Actions (5 sec):**
1. Alice clicks **"SOS"** button
2. Show alert modal
3. Show escrow status: **FROZEN** 🔒
4. Click **"Cancel SOS"** (demo purposes)

---

### Part 4: Completion & Rewards (20 sec)

**[Screen 7: Trip Completion]**

> "Trip ends. The smart contract verifies all check-ins and releases funds automatically."

**Actions:**
1. Fast-forward 7 days (show time-lapse animation)
2. Click **"Complete Trip"**
3. Show transaction:
   - Stakes returned ✅
   - Bonus rewards distributed
   - **TripNFT minted** for each traveler

**[Screen 8: TripNFT & Reputation]**

> "Alice receives her TripNFT — a permanent on-chain memory. Her reputation score increases. She's ready for the next adventure."

**Visual:**
- Display Alice's TripNFT:
  - Destination: Bali 🏝️
  - Duration: 7 days
  - Synergy Score: 94
  - Verified proof hash
  - Media gallery (Lighthouse)
- Show updated reputation: **+50 points**
- Display new badge: **Verified Traveler ⭐**

---

## 🎤 Closing Statement

> "That's WanderLink. AI agents for perfect matching. Smart contracts for trustless commitment. Encrypted proofs for safety. All powered by Hedera, Polygon, Lit Protocol, Worldcoin, Fetch.ai, and Lighthouse."

> "Stranger travel — reimagined for Web3."

**[End slide: Logo + GitHub + Demo link]**

---

## 🛠️ Technical Setup for Demo

### Terminal Commands (before presenting)

```bash
# Terminal 1: Frontend
cd frontend
pnpm dev

# Terminal 2: Backend
cd backend
pnpm dev

# Terminal 3: Agent service
cd agents
pnpm dev

# Terminal 4: Contract interaction (optional)
cd contracts
npx hardhat console --network hedera-testnet
```

### Backup Plan (if live demo fails)

- **Pre-recorded video** of the flow (2 min)
- **Screenshot slides** of each step
- **Static demo** with hardcoded data

---

## 📊 Metrics to Highlight

- **Synergy Score:** 94/100
- **Transaction Speed:** < 3 sec (Hedera)
- **Gas Cost:** ~$0.01 (testnet)
- **Verification Layers:** 3 (WorldID + KYC + SBT)
- **Agent Negotiation Time:** 2.5 sec
- **Proof Storage:** Encrypted on Lighthouse

---

## 🎯 Key Points to Emphasize

1. **Autonomy** — AI agents negotiate without human intervention
2. **Trust** — Smart contracts enforce commitment automatically
3. **Safety** — Multi-layer verification + SOS + forensic evidence trail
4. **Privacy** — Lit Protocol encrypts sensitive data
5. **Incentives** — Reputation + rewards + TripNFTs

---

## 🏆 ETHOnline Tracks

Mention we qualify for:
- 🔷 **Hedera** — TripEscrow contracts
- 🟣 **Polygon** — Scalable reputation system
- 🔐 **Lit Protocol** — Encrypted KYC
- 🪪 **Worldcoin** — Proof of personhood
- 🤖 **Fetch.ai** — Autonomous agents
- 📦 **Lighthouse** — Decentralized storage

---

**Good luck! 🚀**
