# 🚀 Deploy GroupRegistry Using Hardhat - Step by Step

## ✅ Setup Complete!

Hardhat is now installed and configured. Follow these steps to deploy:

---

## 📋 Step 1: Get Your Hedera Private Key

1. Go to https://portal.hedera.com/
2. Login and switch to **Testnet**
3. Click on your **Account Details**
4. Copy your **Private Key** (ECDSA format, starts with `0x`)
5. Make sure you have testnet HBAR (get from Faucet if needed)

---

## 📋 Step 2: Update .env File

Open `d:\WanderLink\.env` and replace:

```env
HEDERA_PRIVATE_KEY=YOUR_HEDERA_PRIVATE_KEY_HERE
```

With your actual private key:

```env
HEDERA_PRIVATE_KEY=0x1234567890abcdef...
```

**⚠️ IMPORTANT:** Never commit this file to Git! It's already in `.gitignore`.

---

## 📋 Step 3: Deploy the Contract

Run this command in the terminal:

```bash
cd d:\WanderLink
npx hardhat run scripts/deploy-group-registry.js --network hederaTestnet
```

You should see output like:

```
🚀 Deploying GroupRegistry to Hedera...
📍 Network: hederaTestnet
👤 Deploying with account: 0x1234...5678
💰 Account balance: 100.0 HBAR

📝 Deploying GroupRegistry contract...
✅ GroupRegistry deployed to: 0xabcd...ef01

⏳ Waiting for block confirmations...

🎉 Deployment successful!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Contract Address (EVM): 0xabcd...ef01
🔗 View on HashScan:
   https://hashscan.io/testnet/contract/0xabcd...ef01
```

---

## 📋 Step 4: Get Contract ID from HashScan

1. Click the HashScan link from the output
2. On HashScan, find the **"Contract ID"** (format: `0.0.XXXXXXX`)
3. Copy this Contract ID

---

## 📋 Step 5: Update Frontend .env.local

Open `d:\WanderLink\frontend\.env.local` and add:

```env
NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID=0.0.XXXXXXX
```

Replace `0.0.XXXXXXX` with your actual Contract ID from HashScan.

---

## 📋 Step 6: Restart Dev Server

```bash
cd frontend
npm run dev
```

---

## 🎉 Done! Test the Feature

1. Go to http://localhost:3000/trips
2. Use **AI Match Finder**
3. Enter trip details (e.g., "Varkala adventure trip, 5 days")
4. Wait for group formation
5. Click **"REGISTER ON HEDERA BLOCKCHAIN"**
6. View transaction on HashScan!

---

## 🔧 Troubleshooting

### **Error: "HEDERA_PRIVATE_KEY not found"**
- Make sure you updated `.env` file with your private key
- Private key should start with `0x`

### **Error: "Insufficient funds"**
- Get testnet HBAR from https://portal.hedera.com/faucet
- Wait a few seconds and try again

### **Error: "Network timeout"**
- Hedera network might be slow
- Try again or increase timeout in `hardhat.config.js`

### **Contract deployed but can't find Contract ID**
- Go to HashScan manually: https://hashscan.io/testnet
- Search for your contract address
- Contract ID will be shown on the page

---

## 📚 Files Created

- ✅ `hardhat.config.js` - Hardhat configuration
- ✅ `scripts/deploy-group-registry.js` - Deployment script
- ✅ `.env` - Updated with HEDERA_PRIVATE_KEY

---

## 🎯 What Happens After Deployment

1. **Contract is deployed** to Hedera Testnet
2. **Contract gets an address** (EVM format: `0x...`)
3. **Hedera assigns a Contract ID** (format: `0.0.XXXXXXX`)
4. **You can view it on HashScan** (blockchain explorer)
5. **Frontend can interact** with the contract using the Contract ID

---

## 💡 Next Steps After Testing

If everything works on testnet:
1. Deploy to mainnet: `--network hederaMainnet`
2. Update `.env.local` with mainnet Contract ID
3. Get real HBAR for mainnet deployment (~$5-10)

---

## 🚀 Ready to Deploy?

Run this command:

```bash
npx hardhat run scripts/deploy-group-registry.js --network hederaTestnet
```

Good luck! 🎉
