# 🚀 WanderLink - Complete Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **pnpm** (recommended) or npm
- **Git** for version control
- **MetaMask** or HashPack wallet
- **Accounts for**:
  - Hedera Testnet ([portal.hedera.com](https://portal.hedera.com))
  - Polygon Mumbai testnet ([faucet.polygon.technology](https://faucet.polygon.technology))
  - WalletConnect Project ID ([cloud.walletconnect.com](https://cloud.walletconnect.com))
  - OpenAI API key ([platform.openai.com](https://platform.openai.com))
  - Lighthouse API key ([lighthouse.storage](https://lighthouse.storage))

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/WanderLink.git
cd WanderLink
```

### 2. Install Dependencies

```bash
# Install pnpm globally if you haven't
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

This will install dependencies for all packages in the monorepo.

---

## ⚙️ Configuration

### 1. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 2. Fill in Your Credentials

Open `.env.local` and fill in the following:

#### Hedera Configuration
```env
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
```

**Get Hedera Testnet Account:**
1. Visit [portal.hedera.com](https://portal.hedera.com)
2. Create an account
3. Note your Account ID and Private Key

#### Polygon Configuration
```env
POLYGON_NETWORK=mumbai
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
DEPLOYER_PRIVATE_KEY=YOUR_METAMASK_PRIVATE_KEY
```

**Get Mumbai Testnet MATIC:**
1. Visit [faucet.polygon.technology](https://faucet.polygon.technology)
2. Request testnet MATIC

#### API Keys
```env
# WalletConnect (Required for wallet connection)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# OpenAI (Required for AI agents)
OPENAI_API_KEY=sk-your_openai_key

# Lighthouse (Required for decentralized storage)
LIGHTHOUSE_API_KEY=your_lighthouse_key

# Worldcoin (Optional for demo)
WORLDCOIN_APP_ID=app_your_app_id
```

---

## 📦 Deploy Smart Contracts

### Deploy to Hedera Testnet

```bash
cd contracts
pnpm deploy:hedera
```

Expected output:
```
✅ TripEscrow deployed to: 0x...
✅ ReputationSBT deployed to: 0x...
✅ TripNFT deployed to: 0x...
```

### Deploy to Polygon Mumbai

```bash
pnpm deploy:polygon
```

### Save Contract Addresses

Update `frontend/lib/contracts.ts` with the deployed addresses:

```typescript
export const CONTRACTS = {
  hedera: {
    tripEscrow: '0xYOUR_HEDERA_ESCROW_ADDRESS',
    reputationSBT: '0xYOUR_HEDERA_SBT_ADDRESS',
    tripNFT: '0xYOUR_HEDERA_NFT_ADDRESS',
  },
  polygon: {
    tripEscrow: '0xYOUR_POLYGON_ESCROW_ADDRESS',
    reputationSBT: '0xYOUR_POLYGON_SBT_ADDRESS',
    tripNFT: '0xYOUR_POLYGON_NFT_ADDRESS',
  },
}
```

---

## 🚀 Run the Application

### Start All Services (Recommended)

From the root directory:

```bash
pnpm dev
```

This starts:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8080
- **Agent Service** → http://localhost:8081

### Or Run Services Individually

#### Frontend Only
```bash
cd frontend
pnpm dev
```

#### Backend Only
```bash
cd backend
pnpm dev
```

#### Agent Service Only
```bash
cd agents
pnpm dev
```

---

## 🧪 Run Tests

### Test Smart Contracts

```bash
cd contracts
pnpm test
```

### Test Backend

```bash
cd backend
pnpm test
```

### Test Agents

```bash
cd agents
pnpm test
```

---

## 📁 Project Structure Overview

```
WanderLink/
├── 
│   ├── frontend/          # Next.js 14 app
│   ├── contracts/         # Smart contracts
│   ├── backend/           # Node.js API
│   ├── agents/            # AI agents
│   └── shared/            # Shared types
├── docs/                  # Documentation
├── .env.example           # Environment template
└── package.json           # Root package.json
```

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** — it's in `.gitignore`
2. **Use testnet funds only** for development
3. **Rotate API keys regularly**
4. **Use separate wallets** for testnet and mainnet
5. **Enable 2FA** on all service accounts

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"
**Solution:** Run `pnpm install` again from root

### Issue: "Insufficient funds for transaction"
**Solution:** Get testnet funds from faucets:
- Hedera: [portal.hedera.com](https://portal.hedera.com)
- Polygon: [faucet.polygon.technology](https://faucet.polygon.technology)

### Issue: "Contract deployment failed"
**Solution:** Check your private key and network configuration in `.env.local`

### Issue: Frontend build errors
**Solution:**
```bash
cd frontend
rm -rf .next node_modules
pnpm install
pnpm dev
```

---

## 📚 Next Steps

1. **Read the docs**: Check `/docs` for detailed architecture
2. **Explore the demo**: Visit http://localhost:3000
3. **Test the flow**: Create a test trip and stake funds
4. **Customize**: Modify contracts and frontend to your needs

---

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

---

## 💬 Support

- **Discord**: [Join our community](https://discord.gg/WanderLink)
- **Email**: team@WanderLink.xyz
- **GitHub Issues**: [github.com/yourusername/WanderLink/issues](https://github.com/yourusername/WanderLink/issues)

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Happy hacking! 🌍✨**
