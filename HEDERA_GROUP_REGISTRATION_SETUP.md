# 🔗 Hedera Group Registration Setup Guide

## ✅ What Was Created

### **1. Smart Contract**
📄 `contracts/GroupRegistry.sol` - Solidity contract for registering travel groups on Hedera

**Features:**
- Register group formations with ID, destination, member count
- Query group information
- Immutable on-chain records
- Event emissions for transparency

### **2. Hedera Service**
📄 `frontend/lib/hedera-group.ts` - Service to interact with Hedera blockchain

**Functions:**
- `registerGroupOnChain()` - Register a group on Hedera
- `getGroupFromChain()` - Query group data from blockchain
- `getGroupTransactionInfo()` - Get transaction details from localStorage
- `isGroupRegisteredOnChain()` - Check if group is registered

### **3. UI Component**
📄 `frontend/components/GroupOnChainRegistration.tsx` - React component for registration

**Features:**
- Button to register group on Hedera
- Loading states during transaction
- Success state with transaction ID and HashScan link
- Error handling

### **4. Updated ProcessingTripCard**
📄 `frontend/components/ProcessingTripCard.tsx`

**Changes:**
- Added "BLOCKCHAIN" tab (opens by default)
- Shows GroupOnChainRegistration component
- Users must register on-chain before viewing other tabs

---

## 🚀 Setup Instructions

### **Step 1: Deploy the GroupRegistry Contract**

You need to deploy `contracts/GroupRegistry.sol` to Hedera testnet.

#### **Option A: Using Hardhat**

1. Install dependencies:
```bash
npm install --save-dev hardhat @hashgraph/hardhat-hethers @hashgraph/sdk
```

2. Create `hardhat.config.js`:
```javascript
require("@hashgraph/hardhat-hethers");

module.exports = {
  solidity: "0.8.0",
  networks: {
    testnet: {
      url: "https://testnet.hashio.io/api",
      accounts: [process.env.HEDERA_PRIVATE_KEY],
      chainId: 296
    }
  }
};
```

3. Deploy:
```bash
npx hardhat run scripts/deploy-group-registry.js --network testnet
```

#### **Option B: Using Hedera Portal**

1. Go to https://portal.hedera.com/
2. Connect your testnet account
3. Navigate to "Smart Contracts"
4. Upload `GroupRegistry.sol`
5. Deploy and copy the contract ID

---

### **Step 2: Update Environment Variables**

Add to `frontend/.env.local`:

```env
# Hedera Group Registry
NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID=0.0.XXXXXXX
```

Replace `0.0.XXXXXXX` with your deployed contract ID.

---

### **Step 3: Test the Flow**

1. **Start the frontend:**
```bash
cd frontend
npm run dev
```

2. **Navigate to `/trips` page**

3. **Use AI Match Finder:**
   - Enter trip details (e.g., "Varkala adventure trip, 5 days")
   - Submit and wait for group formation

4. **Register on Blockchain:**
   - When group is found, you'll see the "BLOCKCHAIN" tab
   - Click "REGISTER ON HEDERA BLOCKCHAIN"
   - Wait for transaction confirmation
   - View transaction on HashScan

5. **View Group Details:**
   - After registration, switch to other tabs
   - Overview, Chatbox, Members

---

## 📊 How It Works

### **Flow Diagram:**

```
1. User submits trip request
   ↓
2. AI Agent matches travelers
   ↓
3. Group found & stored in Supabase
   ↓
4. ProcessingTripCard shows "BLOCKCHAIN" tab
   ↓
5. User clicks "REGISTER ON HEDERA BLOCKCHAIN"
   ↓
6. Transaction sent to Hedera network
   ↓
7. Smart contract stores group data
   ↓
8. Transaction ID & HashScan link displayed
   ↓
9. Group card shows "REGISTERED" status
   ↓
10. User can now view other tabs
```

---

## 🔐 Security & Privacy

### **What's Stored On-Chain:**
- ✅ Group ID (UUID)
- ✅ Destination
- ✅ Member count
- ✅ Creation timestamp

### **What's NOT Stored On-Chain:**
- ❌ Personal information
- ❌ Member addresses/emails
- ❌ Detailed itinerary
- ❌ Chat messages

---

## 💰 Cost Estimation

### **Hedera Testnet (FREE):**
- Contract deployment: FREE (testnet HBAR)
- Group registration: ~0.001 HBAR per transaction

### **Hedera Mainnet:**
- Contract deployment: ~$5-10 USD
- Group registration: ~$0.001 USD per transaction

---

## 🎯 Benefits

✅ **Immutable Records** - Group formations can't be altered  
✅ **Transparent** - Anyone can verify on HashScan  
✅ **Decentralized** - No single point of failure  
✅ **Low Cost** - Hedera's low fees (~$0.001 per tx)  
✅ **Fast** - 3-5 second finality  
✅ **Eco-Friendly** - Carbon-negative network  

---

## 🔧 Troubleshooting

### **Error: "Group Registry Contract ID not configured"**
- Make sure `NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID` is set in `.env.local`
- Restart the dev server after adding env variables

### **Error: "Hedera credentials not configured"**
- Check `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY` in `.env.local`
- Make sure they're valid testnet credentials

### **Transaction Fails:**
- Ensure you have testnet HBAR in your account
- Get free testnet HBAR from: https://portal.hedera.com/faucet
- Check contract is deployed correctly

---

## 📚 Resources

- **Hedera Portal:** https://portal.hedera.com/
- **HashScan Explorer:** https://hashscan.io/testnet
- **Hedera Docs:** https://docs.hedera.com/
- **Get Testnet HBAR:** https://portal.hedera.com/faucet

---

## 🎉 Next Steps

1. ✅ Deploy GroupRegistry contract
2. ✅ Update `.env.local` with contract ID
3. ✅ Test group registration flow
4. ✅ View transactions on HashScan
5. ✅ Share with users!

**Your travel groups are now permanently recorded on the Hedera blockchain!** 🚀
