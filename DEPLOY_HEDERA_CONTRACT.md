# 🚀 Deploy GroupRegistry Contract to Hedera

## ✅ Method 1: Using Remix IDE (Recommended - Easiest)

### **Step 1: Open Remix IDE**
1. Go to https://remix.ethereum.org/
2. This is a browser-based Solidity IDE

### **Step 2: Create the Contract File**
1. In Remix, click on "File Explorer" (📁 icon on left)
2. Click "Create New File" button
3. Name it: `GroupRegistry.sol`
4. Copy and paste the contract code from `d:\WanderLink\contracts\GroupRegistry.sol`

### **Step 3: Compile the Contract**
1. Click on "Solidity Compiler" (📝 icon on left)
2. Select compiler version: `0.8.0` or higher
3. Click "Compile GroupRegistry.sol"
4. Wait for green checkmark ✅

### **Step 4: Get Hedera Testnet Account**
1. Go to https://portal.hedera.com/
2. Login/Create account
3. Switch to "Testnet" network (top right)
4. Copy your Account ID (e.g., `0.0.7098247`)
5. Copy your Private Key (from Account Details)
6. Get free testnet HBAR from faucet: https://portal.hedera.com/faucet

### **Step 5: Deploy Using Hedera JSON-RPC**
1. In Remix, click "Deploy & Run Transactions" (🚀 icon on left)
2. Change "Environment" to "Injected Provider - MetaMask"
3. **Configure MetaMask for Hedera Testnet:**
   - Network Name: `Hedera Testnet`
   - RPC URL: `https://testnet.hashio.io/api`
   - Chain ID: `296`
   - Currency Symbol: `HBAR`
   - Block Explorer: `https://hashscan.io/testnet`

4. Click "Deploy" button
5. Confirm transaction in MetaMask
6. Wait for deployment (5-10 seconds)
7. **Copy the Contract Address** (e.g., `0x1234...5678`)

### **Step 6: Convert EVM Address to Hedera Contract ID**
1. Go to https://hashscan.io/testnet
2. Search for your contract address
3. Find the "Contract ID" (format: `0.0.XXXXXXX`)
4. Copy this Contract ID

### **Step 7: Update Your .env.local**
```env
NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID=0.0.XXXXXXX
```

---

## ✅ Method 2: Using Hedera SDK (For Developers)

### **Step 1: Install Dependencies**
```bash
npm install @hashgraph/sdk
```

### **Step 2: Create Deployment Script**

Create `scripts/deploy-group-registry.js`:

```javascript
const {
  Client,
  PrivateKey,
  AccountId,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  Hbar,
} = require('@hashgraph/sdk');
const fs = require('fs');

async function deployContract() {
  // Configure client
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  console.log('📝 Reading contract bytecode...');
  
  // Read compiled bytecode (you need to compile first with solc)
  const bytecode = fs.readFileSync('contracts/GroupRegistry.bin', 'utf8');

  console.log('📤 Uploading bytecode to Hedera...');

  // Create file on Hedera to store bytecode
  const fileCreateTx = new FileCreateTransaction()
    .setKeys([operatorKey])
    .setContents(bytecode.slice(0, 4096))
    .setMaxTransactionFee(new Hbar(2));

  const fileCreateSubmit = await fileCreateTx.execute(client);
  const fileCreateRx = await fileCreateSubmit.getReceipt(client);
  const bytecodeFileId = fileCreateRx.fileId;

  console.log(`✅ Bytecode file created: ${bytecodeFileId}`);

  // If bytecode is larger than 4096 bytes, append the rest
  if (bytecode.length > 4096) {
    const fileAppendTx = new FileAppendTransaction()
      .setFileId(bytecodeFileId)
      .setContents(bytecode.slice(4096))
      .setMaxTransactionFee(new Hbar(2));

    await fileAppendTx.execute(client);
    console.log('✅ Bytecode appended');
  }

  console.log('🚀 Deploying contract...');

  // Deploy contract
  const contractCreateTx = new ContractCreateTransaction()
    .setBytecodeFileId(bytecodeFileId)
    .setGas(100000)
    .setConstructorParameters()
    .setMaxTransactionFee(new Hbar(20));

  const contractCreateSubmit = await contractCreateTx.execute(client);
  const contractCreateRx = await contractCreateSubmit.getReceipt(client);
  const contractId = contractCreateRx.contractId;

  console.log(`✅ Contract deployed!`);
  console.log(`📍 Contract ID: ${contractId}`);
  console.log(`🔗 View on HashScan: https://hashscan.io/testnet/contract/${contractId}`);

  return contractId;
}

deployContract()
  .then((contractId) => {
    console.log('\\n✅ Deployment successful!');
    console.log(`Add this to your .env.local:`);
    console.log(`NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID=${contractId}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
```

### **Step 3: Compile Contract First**
```bash
# Install solc compiler
npm install -g solc

# Compile contract
solcjs --bin contracts/GroupRegistry.sol -o contracts/
```

### **Step 4: Run Deployment**
```bash
node scripts/deploy-group-registry.js
```

---

## ✅ Method 3: Use Pre-deployed Contract (Quick Test)

If you just want to test quickly, I can provide you with a similar contract that's already deployed on Hedera testnet. However, for production, you should deploy your own.

---

## 🎯 Recommended Approach

**For Quick Testing:** Use **Method 1 (Remix IDE)**
- No installation needed
- Visual interface
- Easy to debug
- Works in browser

**For Production:** Use **Method 2 (Hedera SDK)**
- Automated deployment
- Version control
- Repeatable process
- CI/CD integration

---

## 🔧 After Deployment

1. **Copy the Contract ID** (format: `0.0.XXXXXXX`)

2. **Update `.env.local`:**
```env
NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID=0.0.XXXXXXX
```

3. **Restart your dev server:**
```bash
cd frontend
npm run dev
```

4. **Test the registration:**
   - Go to `/trips`
   - Use AI Match Finder
   - Wait for group formation
   - Click "REGISTER ON HEDERA BLOCKCHAIN"
   - View transaction on HashScan!

---

## 📚 Resources

- **Remix IDE:** https://remix.ethereum.org/
- **Hedera Portal:** https://portal.hedera.com/
- **HashScan Explorer:** https://hashscan.io/testnet
- **Hedera Docs:** https://docs.hedera.com/hedera/tutorials/smart-contracts/deploy-a-smart-contract
- **Get Testnet HBAR:** https://portal.hedera.com/faucet

---

## 💡 Need Help?

If you encounter any issues:
1. Make sure you have testnet HBAR
2. Check your account ID and private key are correct
3. Verify the contract compiles without errors
4. Check HashScan for transaction status

Let me know which method you'd like to use and I can help you through it! 🚀
