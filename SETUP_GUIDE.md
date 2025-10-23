# 🚀 WanderLink - Complete Setup Guide
## ETHOnline 2025 - Multi-Sponsor Integration

This guide will help you set up WanderLink with **ASI Alliance (Fetch.ai)**, **Hedera**, and **Lighthouse** integrations.

---

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- MetaMask or HashPack wallet
- Git

---

## 🔑 Step 1: Get API Keys & Credentials

### 1.1 Lighthouse Storage
**Purpose**: Encrypted file storage (replaces Lit Protocol)

1. Visit https://files.lighthouse.storage/
2. Connect your wallet
3. Click "Get API Key"
4. Copy your API key
5. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
   ```

### 1.2 Fetch.ai Agentverse
**Purpose**: AI agent hosting and communication

1. Visit https://agentverse.ai/
2. Sign up / Login
3. Go to "Profile" → "API Keys"
4. Generate new API key
5. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_AGENTVERSE_API_KEY=your_agentverse_api_key_here
   ```

### 1.3 Hedera Testnet Account
**Purpose**: Deploy smart contracts and use HTS

1. Visit https://portal.hedera.com/
2. Create account or login
3. Go to "Testnet" section
4. Get testnet HBAR from faucet
5. Note your Account ID and Private Key (you'll need these for deployment)

### 1.4 WalletConnect Project ID
**Purpose**: Wallet connection for frontend

1. Visit https://cloud.walletconnect.com/
2. Create new project
3. Copy Project ID
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

---

## 📦 Step 2: Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Rohitamalraj/WanderLink.git
cd WanderLink

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install --legacy-peer-deps

# Install agent dependencies
cd ../agents
npm install

# Install contract dependencies
cd ../contracts
npm install
```

---

## 🤖 Step 3: Set Up AI Agents (Fetch.ai)

### 3.1 Create Python Environment

```bash
cd agents
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install uagents fetch-ai metta-python python-dotenv
```

### 3.2 Configure Agent Environment

Create `agents/.env`:

```bash
# Fetch.ai Configuration
AGENTVERSE_API_KEY=your_agentverse_api_key_here
AGENT_MAILBOX_KEY=your_mailbox_key_here

# Database (optional for local testing)
DATABASE_URL=postgresql://localhost/wanderlink

# Hedera (for agent-contract interaction)
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your_private_key_here
```

### 3.3 Run Local Agents (Development)

```bash
cd agents/src

# Terminal 1: Travel Match Agent
python travel_match_agent.py

# Terminal 2: Escrow Agent
python escrow_agent.py

# Terminal 3: Reputation Agent
python reputation_agent.py
```

### 3.4 Deploy Agents to Agentverse (Production)

1. Visit https://agentverse.ai/agents
2. Click "Create Agent"
3. Upload `travel_match_agent.py`
4. Configure:
   - Name: "WanderLink Travel Match Agent"
   - Description: "Autonomous agent for matching travel groups"
   - Endpoints: Enable all
5. Deploy
6. Copy Agent Address
7. Repeat for other agents

---

## 📡 Step 4: Deploy Smart Contracts (Hedera)

### 4.1 Configure Hardhat

Edit `contracts/hardhat.config.ts`:

```typescript
networks: {
  hedera: {
    url: "https://testnet.hashio.io/api",
    accounts: [process.env.HEDERA_PRIVATE_KEY],
    chainId: 296
  }
}
```

Create `contracts/.env`:

```bash
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your_private_key_here
OPERATOR_KEY=your_operator_key_here
```

### 4.2 Deploy Contracts

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to Hedera Testnet
npx hardhat run scripts/deploy-hedera.ts --network hedera

# Output will show:
# ✅ TripEscrow deployed to: 0x...
# ✅ ReputationSBT deployed to: 0x...
# ✅ TripNFT deployed to: 0x...
```

### 4.3 Verify Contracts on Hashscan

```bash
npx hardhat verify --network hedera <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Example:
npx hardhat verify --network hedera 0x123... "WanderLink Reputation" "WREP"
```

### 4.4 Create Hedera Tokens (HTS)

```bash
# Run token creation script
node scripts/create-hts-tokens.js

# This will create:
# - WANDER fungible token
# - TripNFT collection
# - ReputationSBT (non-transferable)
```

---

## 🌐 Step 5: Configure Frontend

### 5.1 Update Contract Addresses

Edit `frontend/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  hedera: {
    tripEscrow: '0x...', // From Step 4.2
    reputationSBT: '0x...',
    tripNFT: '0x...',
  },
  sepolia: {
    tripEscrow: '0x...',
    // ... etc
  }
}

export const HTS_TOKENS = {
  wander: '0.0.xxxxx', // From Step 4.4
  tripNFT: '0.0.xxxxx',
  reputationSBT: '0.0.xxxxx',
}
```

### 5.2 Update Agent Addresses

Edit `frontend/lib/agents.ts`:

```typescript
export const AGENT_ADDRESSES = {
  travelMatch: 'agent1q...', // From Step 3.4
  escrow: 'agent1q...',
  reputation: 'agent1q...',
}
```

### 5.3 Complete .env.local

```bash
cd frontend
```

Your complete `.env.local` should look like:

```bash
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=6c7dae2fc70dc115f95b97c5f0dbb46b

# Lighthouse Storage
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here

# Fetch.ai / ASI Alliance
NEXT_PUBLIC_AGENTVERSE_API_KEY=your_agentverse_api_key_here
NEXT_PUBLIC_TRAVEL_MATCH_AGENT=agent1q...
NEXT_PUBLIC_ESCROW_AGENT=agent1q...
NEXT_PUBLIC_REPUTATION_AGENT=agent1q...

# Hedera
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_TRIP_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_SBT_ADDRESS=0x...
NEXT_PUBLIC_TRIP_NFT_ADDRESS=0x...
NEXT_PUBLIC_WANDER_TOKEN_ID=0.0.xxxxx

# RPC URLs
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_HEDERA_RPC_URL=https://testnet.hashio.io/api

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:3001
```

---

## 🏃 Step 6: Run the Application

### 6.1 Start All Services

```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# → http://localhost:3000

# Terminal 2: Agents (if running locally)
cd agents
python src/main.py
# → http://localhost:3001

# Terminal 3: Backend API (optional)
cd backend
npm run dev
# → http://localhost:8080
```

### 6.2 Test the Flow

1. **Open** http://localhost:3000
2. **Connect Wallet** (MetaMask or HashPack)
3. **Upload KYC** → Data encrypted and stored on Lighthouse
4. **Take Quiz** → Preferences sent to TravelMatchAgent
5. **AI Matching** → Agents negotiate via A2A protocol
6. **Review Group** → See synergy scores
7. **Stake Funds** → Smart contract locks WANDER tokens
8. **Complete Trip** → Funds released, TripNFT minted

---

## 🎨 Step 7: Create Lighthouse DataCoin (Optional)

### 7.1 Visit 1MB.io

1. Go to https://1mb.io/
2. Connect wallet
3. Click "Create DataCoin"

### 7.2 Configure DataCoin

```json
{
  "name": "WanderLink Travel Data",
  "symbol": "WTRAV",
  "description": "Verified travel booking and review data",
  "network": "polygon",
  "price": "0.01",
  "supply": "1000000",
  "dataSource": "lighthouse",
  "cid": "bafybei..." // Your Lighthouse CID
}
```

### 7.3 Set Access Conditions

```typescript
// Only DataCoin holders can access
{
  conditionType: 'token',
  contractAddress: '0x...', // DataCoin address
  minBalance: '1000000000000000000' // 1 token
}
```

---

## ✅ Step 8: Verification Checklist

Before submitting to hackathon, verify:

### ASI Alliance Requirements
- [ ] ✅ Agents registered on Agentverse
- [ ] ✅ A2A communication working
- [ ] ✅ MeTTa knowledge graphs integrated
- [ ] ✅ Real-time agent negotiation
- [ ] ✅ Comprehensive documentation

### Hedera Requirements
- [ ] ✅ Smart contracts deployed and verified on Hashscan
- [ ] ✅ Hedera Agent Kit integration
- [ ] ✅ AP2 payment settlement
- [ ] ✅ HTS tokens created
- [ ] ✅ Multiple Hedera services used (EVM + HTS + HCS)

### Lighthouse Requirements
- [ ] ✅ Lighthouse storage integrated
- [ ] ✅ DataCoin created on 1MB.io
- [ ] ✅ Access control conditions working
- [ ] ✅ Frontend demo deployed
- [ ] ✅ GitHub repository public

---

## 🐛 Troubleshooting

### Lighthouse Upload Fails
```bash
Error: API key invalid
```
**Solution**: Get a new API key from https://files.lighthouse.storage/

### Agent Not Responding
```bash
Error: Agent not found
```
**Solution**: Check agent address in Agentverse, ensure agent is running

### Contract Deployment Fails
```bash
Error: Insufficient HBAR
```
**Solution**: Get more testnet HBAR from https://portal.hedera.com/faucet

### Frontend Build Errors
```bash
Error: Module not found
```
**Solution**: Run `npm install --legacy-peer-deps` in frontend folder

---

## 📚 Additional Resources

### Documentation Links
- **Fetch.ai**: https://innovationlab.fetch.ai/resources/docs/intro
- **Hedera**: https://docs.hedera.com/
- **Lighthouse**: https://docs.lighthouse.storage/
- **1MB.io**: https://docs.lighthouse.storage/lighthouse-1/how-to/create-a-datacoin

### Support
- **Fetch.ai Discord**: https://fetch.ai/discord
- **Hedera Discord**: https://hedera.com/discord
- **Lighthouse**: support@lighthouse.storage

---

## 🎥 Demo Video Script

When recording your demo video (required for bounties):

1. **Intro (30s)**
   - "Hi, I'm presenting WanderLink, a decentralized AI-powered travel matching platform"
   - Show architecture diagram

2. **AI Agents (60s)**
   - Show Agentverse dashboard with your 3 agents
   - Demonstrate A2A communication logs
   - Explain MeTTa reasoning for compatibility

3. **Hedera Integration (60s)**
   - Show Hashscan with verified contracts
   - Demonstrate HTS token transfer
   - Show HCS consensus logs

4. **Lighthouse Storage (45s)**
   - Upload KYC document
   - Show encryption in browser console
   - Display DataCoin on 1MB.io

5. **Complete Flow (90s)**
   - User connects wallet
   - AI agents match group
   - Smart contract escrow
   - Trip completion
   - NFT minting

6. **Conclusion (15s)**
   - Recap sponsor integrations
   - Thank judges

**Total: ~5 minutes**

---

## 🚀 Deployment to Production

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Agents (Agentverse)
- Upload all agents to Agentverse
- Configure production API keys
- Enable mailbox for external communication

### Contracts (Hedera Mainnet)
```bash
# Update hardhat.config.ts to use mainnet
networks: {
  hedera: {
    url: "https://mainnet.hashio.io/api",
    chainId: 295
  }
}

# Deploy
npx hardhat run scripts/deploy-hedera.ts --network hedera
```

---

**Good luck with ETHOnline 2025!** 🎉

For questions or issues, please open a GitHub issue or reach out on the hackathon Discord.
