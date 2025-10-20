# 🚀 Quick Start Guide - WanderLink

**Get up and running in 5 minutes!**

---

## ⚡ Prerequisites

Install these first:

```bash
# Node.js 18+
node --version  # Should be v18.x or higher

# pnpm (recommended)
npm install -g pnpm

# Git
git --version
```

---

## 📥 1. Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/WanderLink.git
cd WanderLink

# Install all dependencies (this may take a minute)
pnpm install
```

---

## ⚙️ 2. Configure Environment (2 minutes)

```bash
# Copy environment template
cp .env.example .env.local
```

### **Minimum Required Variables** (for local testing)

Open `.env.local` and add:

```env
# Hedera (Get from portal.hedera.com)
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_HEDERA_PRIVATE_KEY

# Polygon (Use your MetaMask private key)
DEPLOYER_PRIVATE_KEY=YOUR_METAMASK_PRIVATE_KEY

# WalletConnect (Get from cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID

# Optional (for full features)
OPENAI_API_KEY=sk-YOUR_KEY           # For AI agents
LIGHTHOUSE_API_KEY=YOUR_KEY          # For storage
WORLDCOIN_APP_ID=app_YOUR_ID         # For verification
```

### **Get Free Testnet Funds**

```bash
# Hedera Testnet HBAR (free)
# Visit: https://portal.hedera.com

# Polygon Mumbai MATIC (free)
# Visit: https://faucet.polygon.technology
```

---

## 🏗️ 3. Deploy Contracts (1 minute)

```bash
cd contracts

# Deploy to Hedera testnet
pnpm deploy:hedera

# Deploy to Polygon Mumbai
pnpm deploy:polygon

# Save the contract addresses shown in the output!
```

Expected output:
```
✅ TripEscrow deployed to: 0xABC123...
✅ ReputationSBT deployed to: 0xDEF456...
✅ TripNFT deployed to: 0xGHI789...
```

---

## 🎨 4. Start Development Servers

### **Option A: Start Everything** (Recommended)

From the root directory:

```bash
pnpm dev
```

This starts:
- 🎨 **Frontend** → http://localhost:3000
- 🔧 **Backend API** → http://localhost:8080
- 🤖 **Agent Service** → http://localhost:8081

### **Option B: Start Individual Services**

```bash
# Terminal 1: Frontend only
cd frontend
pnpm dev

# Terminal 2: Backend only
cd backend
pnpm dev

# Terminal 3: Agents only
cd agents
pnpm dev
```

---

## ✅ 5. Test the Application

### **Open the App**

Visit: **http://localhost:3000**

### **Basic Flow Test**

1. **Connect Wallet**
   - Click "Connect Wallet" in header
   - Select MetaMask or HashPack
   - Approve connection

2. **Explore Trips**
   - Click "Explore Trips"
   - Browse available trips
   - Click on a trip to see details

3. **Create Test Trip** (Optional)
   - Click "Create Trip"
   - Fill in destination, dates, stake amount
   - Submit transaction

---

## 🧪 Run Tests

```bash
# Test smart contracts
cd contracts
pnpm test

# Test backend
cd backend
pnpm test

# Test agents
cd agents
pnpm test

# Run all tests
pnpm test  # from root
```

---

## 🐛 Troubleshooting

### **Issue: "Cannot find module"**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
pnpm install
```

### **Issue: "Insufficient funds"**
```bash
# Solution: Get testnet tokens
# Hedera: https://portal.hedera.com
# Polygon: https://faucet.polygon.technology
```

### **Issue: "Contract deployment failed"**
```bash
# Solution: Check your private key format in .env.local
# Should NOT have "0x" prefix for Hedera
# Should HAVE "0x" prefix for Polygon
```

### **Issue: Frontend build errors**
```bash
cd frontend
rm -rf .next
pnpm dev
```

### **Issue: Port already in use**
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Next Steps

### **Learn More**
- 📖 [Full Setup Guide](./docs/SETUP.md)
- 🏗️ [Architecture Overview](./docs/ARCHITECTURE.md)
- 🎬 [Demo Script](./docs/DEMO_SCRIPT.md)
- ✅ [Submission Checklist](./docs/SUBMISSION_CHECKLIST.md)

### **Customize**
- Edit smart contracts in `contracts/src/`
- Customize frontend in `frontend/app/`
- Modify AI agents in `agents/src/`

### **Deploy**
- Deploy frontend to Vercel: `vercel deploy`
- Deploy backend to Railway: `railway up`
- Deploy contracts to mainnet (after audit)

---

## 🤝 Get Help

- **Discord:** [Join our community](https://discord.gg/WanderLink)
- **GitHub Issues:** [Report bugs](https://github.com/yourusername/WanderLink/issues)
- **Email:** team@WanderLink.xyz

---

## 🎯 Demo Workflow (for ETHOnline)

```bash
# 1. Ensure all services are running
pnpm dev

# 2. Open http://localhost:3000 in browser

# 3. Follow demo script:
#    - Connect 3 wallets (Alice, Bob, Charlie)
#    - Show AI matchmaking
#    - Demonstrate escrow staking
#    - Show trip execution
#    - Mint TripNFT

# 4. Record screen for submission video
```

---

## ⚡ Common Commands

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Build everything
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Clean build artifacts
pnpm clean

# Deploy contracts
cd contracts && pnpm deploy:hedera
cd contracts && pnpm deploy:polygon
```

---

## 🔗 Important URLs

- **Frontend (Local):** http://localhost:3000
- **Backend API (Local):** http://localhost:8080
- **Agent Service (Local):** http://localhost:8081
- **Hedera Testnet Explorer:** https://hashscan.io/testnet
- **Polygon Mumbai Explorer:** https://mumbai.polygonscan.com

---

## 🎉 You're Ready!

Start building the future of social travel! 🌍✨

**Questions? Check the [docs](./docs/) or ask on [Discord](https://discord.gg/WanderLink)!**
