# 🚀 Deploy to Hedera Using Remix - Step by Step

## ✅ The Problem
You're getting a gas estimation error because Remix is trying to deploy to Ethereum, not Hedera.

## 🔧 Solution: Configure MetaMask for Hedera

### **Step 1: Add Hedera Testnet to MetaMask**

1. **Open MetaMask** in your browser
2. Click the **network dropdown** (top left, currently shows "Ethereum Mainnet" or similar)
3. Click **"Add Network"** or **"Add a network manually"**
4. Enter these details:

```
Network Name: Hedera Testnet
RPC URL: https://testnet.hashio.io/api
Chain ID: 296
Currency Symbol: HBAR
Block Explorer URL: https://hashscan.io/testnet
```

5. Click **"Save"**
6. Switch to **"Hedera Testnet"** network

### **Step 2: Get Testnet HBAR**

1. Go to https://portal.hedera.com/
2. Login and switch to **Testnet**
3. Copy your **Account ID** (e.g., `0.0.7098247`)
4. Go to **Faucet** and get free testnet HBAR
5. In MetaMask, you should see HBAR balance

### **Step 3: Import Your Hedera Account to MetaMask**

1. In Hedera Portal, go to **Account Details**
2. Copy your **Private Key** (ECDSA key)
3. In MetaMask, click account icon → **Import Account**
4. Paste the private key
5. Your Hedera account is now in MetaMask!

### **Step 4: Deploy in Remix**

1. **In Remix IDE** (https://remix.ethereum.org/)
2. Make sure your contract is compiled ✅
3. Go to **"Deploy & Run Transactions"** tab
4. **IMPORTANT:** Change "Environment" to **"Injected Provider - MetaMask"**
5. MetaMask will popup → **Confirm connection**
6. **Verify** MetaMask shows "Hedera Testnet" (Chain ID: 296)
7. Click **"Deploy"** button
8. MetaMask will popup → **Confirm transaction**
9. Wait 5-10 seconds for deployment
10. **Success!** ✅

### **Step 5: Get Contract ID**

After deployment, you'll see the contract address in Remix (e.g., `0x1234...5678`)

**Convert to Hedera Contract ID:**
1. Go to https://hashscan.io/testnet
2. Search for your contract address
3. Find the **"Contract ID"** (format: `0.0.XXXXXXX`)
4. Copy this Contract ID

### **Step 6: Update Your .env.local**

```env
NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID=0.0.XXXXXXX
```

Replace `0.0.XXXXXXX` with your actual Contract ID.

### **Step 7: Restart Dev Server**

```bash
cd frontend
npm run dev
```

---

## 🎯 Quick Checklist

Before deploying, make sure:
- ✅ MetaMask is installed
- ✅ Hedera Testnet network is added to MetaMask
- ✅ You have testnet HBAR in your account
- ✅ MetaMask is connected to Hedera Testnet (Chain ID: 296)
- ✅ Remix environment is set to "Injected Provider - MetaMask"
- ✅ Contract is compiled without errors

---

## 🔍 Troubleshooting

### **"Gas estimation errored"**
- ❌ You're on the wrong network (Ethereum instead of Hedera)
- ✅ Switch MetaMask to "Hedera Testnet"

### **"Insufficient funds"**
- ❌ No HBAR in your account
- ✅ Get testnet HBAR from https://portal.hedera.com/faucet

### **"Network not found"**
- ❌ Hedera network not added to MetaMask
- ✅ Add network manually with Chain ID 296

### **"Transaction failed"**
- ❌ Wrong network or insufficient gas
- ✅ Verify Chain ID is 296 and you have HBAR

---

## 📚 Network Details Reference

### **Hedera Testnet:**
- Network Name: `Hedera Testnet`
- RPC URL: `https://testnet.hashio.io/api`
- Chain ID: `296`
- Symbol: `HBAR`
- Explorer: `https://hashscan.io/testnet`

### **Hedera Mainnet (for production):**
- Network Name: `Hedera Mainnet`
- RPC URL: `https://mainnet.hashio.io/api`
- Chain ID: `295`
- Symbol: `HBAR`
- Explorer: `https://hashscan.io/mainnet`

---

## 🎉 After Successful Deployment

You should see:
1. ✅ Contract deployed in Remix
2. ✅ Transaction confirmed in MetaMask
3. ✅ Contract visible on HashScan
4. ✅ Contract ID in format `0.0.XXXXXXX`

Then you can test the group registration feature! 🚀
