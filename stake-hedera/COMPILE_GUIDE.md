# Contract Compilation Guide

## ❌ Issue: `solc` Not Found

The error means the Solidity compiler isn't installed globally on your system.

## ✅ Solution: Use Node.js Compiler

I've created a JavaScript-based compiler that works on Windows without global installation.

## 🚀 Quick Fix

### Step 1: Install Dependencies

```bash
# Make sure you're in the project root
cd c:\Users\russe\OneDrive\Desktop\stake-hedera

# Install all dependencies (includes solc)
npm install
```

### Step 2: Compile Contract

```bash
# Use the new compile script
npm run compile:contract
```

This will:
- ✅ Compile `StakingEscrow.sol`
- ✅ Generate bytecode (`contracts/build/StakingEscrow.bin`)
- ✅ Generate ABI (`contracts/build/StakingEscrow.abi`)

## 📋 Expected Output

```
📝 Compiling StakingEscrow.sol...

⚙️  Compiling...
✅ Bytecode saved to: contracts/build/StakingEscrow.bin
   Size: 12345 bytes
✅ ABI saved to: contracts/build/StakingEscrow.abi

🎉 Compilation successful!
```

## 🔧 Alternative: Install Global Solc (Optional)

If you prefer the global `solc` command:

### Option 1: NPM Global Install
```bash
npm install -g solc
```

### Option 2: Download Binary
1. Go to https://github.com/ethereum/solidity/releases
2. Download `solc-windows.exe`
3. Rename to `solc.exe`
4. Add to PATH

### Option 3: Use Chocolatey (Windows)
```bash
choco install solidity
```

## 📊 What Gets Compiled

### Input
- `contracts/StakingEscrow.sol` - Solidity source code

### Output
- `contracts/build/StakingEscrow.bin` - Bytecode for deployment
- `contracts/build/StakingEscrow.abi` - Interface for interaction

## 🎮 Next Steps After Compilation

### 1. Deploy Contract
```bash
npm run deploy:contract
```

### 2. Save Contract ID
The deployment will output:
```
Contract ID: 0.0.12345678
```

Add to `.env`:
```env
CONTRACT_ID=0.0.12345678
```

### 3. Test Contract
```bash
npm run dev

# Call multi-user API
curl -X POST http://localhost:3000/api/multi-stake \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {"accountId": "0.0.11111", "amount": 1000, "location": "NYC"},
      {"accountId": "0.0.22222", "amount": 500, "location": "London"}
    ]
  }'
```

## 🚨 Troubleshooting

### Error: "Cannot find module 'solc'"
```bash
# Install dependencies
npm install
```

### Error: "Compilation failed"
- Check Solidity syntax in `StakingEscrow.sol`
- Ensure Solidity version is 0.8.20 or compatible

### Error: "Permission denied"
```bash
# Run as administrator or use:
npm install --no-optional
```

## 📚 Files Created

1. **`scripts/compile-contract.js`** - JavaScript compiler
2. **`contracts/build/StakingEscrow.bin`** - Compiled bytecode
3. **`contracts/build/StakingEscrow.abi`** - Contract interface

## ✅ Summary

**Instead of:**
```bash
solc --bin --abi StakingEscrow.sol -o build/
```

**Use:**
```bash
npm run compile:contract
```

This works on all platforms without global installation! 🎉
