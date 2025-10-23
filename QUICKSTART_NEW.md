# ⚡ WanderLink - Quick Start Guide
## Get Running in 15 Minutes

This guide gets you up and running with the **minimum viable setup** for testing WanderLink locally.

---

## 🎯 What You'll Achieve

By the end of this guide, you'll have:
- ✅ Frontend running with Lighthouse encryption
- ✅ AI agents running locally
- ✅ Smart contracts on Hedera testnet
- ✅ Complete user flow working

---

## 📋 Prerequisites (5 min)

Install these if you don't have them:

```bash
# Check versions
node --version  # Need 18+
python --version  # Need 3.9+
git --version

# If missing, install:
# Node.js: https://nodejs.org/
# Python: https://python.org/
```

---

## 🚀 Step 1: Clone & Install (3 min)

```bash
# Clone repository
git clone https://github.com/Rohitamalraj/WanderLink.git
cd WanderLink

# Install frontend
cd frontend
npm install --legacy-peer-deps

# Install agents
cd ../agents
pip install uagents fetch-ai python-dotenv

cd ..
```

---

## 🔑 Step 2: Get Free API Keys (5 min)

### Lighthouse API Key (Required)
1. Visit https://files.lighthouse.storage/
2. Click "Sign In" (top right)
3. Connect MetaMask
4. Click your profile → "API Keys"
5. Click "Generate API Key"
6. **Copy the key** (starts with `7d1a...`)

### WalletConnect Project ID (Required)
1. Visit https://cloud.walletconnect.com/
2. Sign up / Login
3. Click "Create New Project"
4. Name: "WanderLink"
5. **Copy Project ID** (looks like: `6c7dae2fc70dc115f95b97c5f0dbb46b`)

### Agentverse API Key (Optional - for advanced features)
1. Visit https://agentverse.ai/
2. Sign up / Login
3. Profile → API Keys → Generate
4. **Copy key**

---

## ⚙️ Step 3: Configure Environment (2 min)

```bash
cd frontend
```

Edit `.env.local`:

```bash
# Paste your keys here
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=7d1a...  # From Step 2
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=6c7dae2fc70dc115f95b97c5f0dbb46b  # From Step 2

# These are optional for now
NEXT_PUBLIC_AGENTVERSE_API_KEY=your_key_here_if_you_have_it

# Leave these as-is for local development
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:3001
```

**Save the file!**

---

## 🏃 Step 4: Start Everything (5 min)

Open **3 terminal windows**:

### Terminal 1: Frontend

```bash
cd frontend
npm run dev
```

**Wait for**: `✓ Ready in 4.2s` → Open http://localhost:3000

### Terminal 2: AI Agent (Optional but recommended)

```bash
cd agents/src
python travel_match_agent.py
```

**Wait for**: `🤖 WanderLink Travel Match Agent Started`

### Terminal 3: Keep this ready for contract deployment

---

## ✅ Step 5: Test It Works (2 min)

### Test Lighthouse Integration

1. Go to http://localhost:3000/test-lighthouse (we'll create this)
2. Connect your wallet
3. Click "Test Upload"
4. If you see "✅ Upload successful" → You're good!

### Test Frontend

1. Go to http://localhost:3000
2. Should see the WanderLink homepage
3. Click "Connect Wallet"
4. Choose MetaMask / your wallet
5. If wallet connects → You're ready!

---

## 🎯 Full User Flow Test (Optional)

If everything above works, try the complete flow:

1. **Connect Wallet** on homepage
2. **Upload KYC** → Data encrypted with Lighthouse
3. **Take Quiz** → Sends preferences to AI agent
4. **See Match** → Agent calculates synergy score
5. **View Group** → See matched travelers

---

## 🐛 Troubleshooting

### Frontend won't start

```bash
# Error: Module not found
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Lighthouse errors

```bash
# Error: Invalid API key
```
- Double-check you copied the full key from https://files.lighthouse.storage/
- Make sure no extra spaces in `.env.local`
- Key should start with `7d1a` or similar

### Wallet won't connect

```bash
# Error: Invalid project ID
```
- Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local`
- Make sure it's a real Project ID from WalletConnect Cloud
- No quotes needed in .env file

### Python agent crashes

```bash
# Error: Module 'uagents' not found
pip install uagents fetch-ai python-dotenv

# Error: Port already in use
# Change port in travel_match_agent.py line 18:
port=8002  # Instead of 8001
```

---

## 🎓 Next Steps

Once you have the basic setup running:

1. **Deploy Smart Contracts** → See [SETUP_GUIDE.md](./SETUP_GUIDE.md) Step 4
2. **Create DataCoin** → See [SETUP_GUIDE.md](./SETUP_GUIDE.md) Step 7
3. **Deploy to Agentverse** → See [SETUP_GUIDE.md](./SETUP_GUIDE.md) Step 3.4
4. **Record Demo Video** → See [SETUP_GUIDE.md](./SETUP_GUIDE.md) Demo Video Script

---

## 📞 Need Help?

- **GitHub Issues**: https://github.com/Rohitamalraj/WanderLink/issues
- **Discord**: ETHOnline 2025 Discord
- **Documentation**: Check `SETUP_GUIDE.md` for detailed setup

---

## 🎉 You're Ready!

Your local WanderLink environment is running! 

**What's Working:**
- ✅ Frontend with Lighthouse encryption
- ✅ AI agent for matchmaking
- ✅ Wallet connection
- ✅ File upload/encryption

**Next:** Deploy contracts and create your first trip match! 🚀

---

**Quick Reference:**

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main app UI |
| Travel Agent | http://localhost:8001 | AI matching |
| Lighthouse | https://gateway.lighthouse.storage | File storage |
| Agentverse | https://agentverse.ai | Agent hosting |

