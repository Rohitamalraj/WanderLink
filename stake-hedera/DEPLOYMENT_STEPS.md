# 🚀 Contract Deployment Steps

## ✅ Step 1: Compilation - COMPLETED

```
✅ Bytecode saved to: contracts/build/StakingEscrow.bin
✅ ABI saved to: contracts/build/StakingEscrow.abi
✅ Size: 10856 bytes
```

---

## 📝 Step 2: Configure Environment Variables

You need to add your Hedera credentials to the `.env` file.

### Get Hedera Testnet Accounts

1. **Go to:** https://portal.hedera.com/dashboard
2. **Create 2 accounts** (free testnet accounts)
3. **Copy credentials** for both accounts

### Edit `.env` File

Open `c:\Users\russe\OneDrive\Desktop\stake-hedera\.env` and fill in:

```env
# Coordinator Account (Account 1)
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID_1
HEDERA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_1

# Validator Account (Account 2)
VALIDATOR_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID_2
VALIDATOR_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_2

# OpenAI API Key
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY

# Optional (leave empty for now)
HEDERA_NETWORK=testnet
A2A_TOPIC_ID=
CONTRACT_ID=
```

### Where to Get Keys

**Hedera Accounts:**
- Portal: https://portal.hedera.com/dashboard
- Click "Create Account"
- Copy Account ID (format: 0.0.12345)
- Copy Private Key (format: 0x...)

**OpenAI API Key:**
- Portal: https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy key (format: sk-proj-...)

---

## 🚀 Step 3: Deploy Contract

Once you've filled in the `.env` file:

```bash
npm run deploy:contract
```

### Expected Output

```
🚀 Deploying StakingEscrow Contract to Hedera...

📄 Reading contract bytecode...
   Bytecode size: 21712 bytes

📤 Uploading bytecode to Hedera File Service...
   ✅ Bytecode File ID: 0.0.12345677

🏗️  Deploying contract...
   ✅ Contract deployed!

📋 Contract Details:
   Contract ID: 0.0.12345678
   Bytecode File ID: 0.0.12345677
   Validator: 0.0.YOUR_VALIDATOR_ID
   Network: Testnet

💾 Contract info saved to contract-info.json

✅ Deployment complete!
```

---

## 📝 Step 4: Save Contract ID

After deployment, add the Contract ID to `.env`:

```env
CONTRACT_ID=0.0.12345678
```

---

## 🧪 Step 5: Test the Contract

### Start Application

```bash
npm run dev
```

### Test Multi-User Staking

```bash
curl -X POST http://localhost:3000/api/multi-stake \
  -H "Content-Type: application/json" \
  -d "{\"users\": [{\"accountId\": \"0.0.YOUR_ACCOUNT_1\", \"amount\": 1000, \"location\": \"New York\"}, {\"accountId\": \"0.0.YOUR_ACCOUNT_2\", \"amount\": 500, \"location\": \"London\"}]}"
```

---

## 🔍 Verify Deployment

### View on HashScan

```
https://hashscan.io/testnet/contract/0.0.YOUR_CONTRACT_ID
```

### Check Contract Info

```bash
# View saved contract info
cat contract-info.json
```

---

## 🚨 Troubleshooting

### Error: "Missing environment variables"

**Solution:** Make sure `.env` has all required variables:
- HEDERA_ACCOUNT_ID
- HEDERA_PRIVATE_KEY
- VALIDATOR_ACCOUNT_ID
- VALIDATOR_PRIVATE_KEY
- OPENAI_API_KEY

### Error: "Insufficient balance"

**Solution:** 
1. Go to https://portal.hedera.com/dashboard
2. Click "Get Test HBAR"
3. You need ~20 HBAR for deployment

### Error: "Invalid private key"

**Solution:**
- Ensure private key starts with `0x`
- Use ECDSA format (not ED25519)
- Copy from Hedera portal exactly

### Error: "Contract creation failed"

**Solution:**
- Check bytecode file exists: `contracts/build/StakingEscrow.bin`
- Verify gas limit is sufficient
- Ensure validator account exists

---

## 📊 Cost Breakdown

| Operation | Cost (HBAR) |
|-----------|-------------|
| Upload Bytecode | ~2 HBAR |
| Deploy Contract | ~18 HBAR |
| **Total** | **~20 HBAR** |

*Testnet HBAR is free from portal.hedera.com*

---

## ✅ Deployment Checklist

- [x] Contract compiled successfully
- [ ] `.env` file configured with credentials
- [ ] Hedera accounts have test HBAR
- [ ] OpenAI API key added
- [ ] Run `npm run deploy:contract`
- [ ] Contract ID saved to `.env`
- [ ] Verified on HashScan
- [ ] Tested multi-user staking

---

## 🎯 Current Status

✅ **Compilation:** COMPLETE  
⏳ **Configuration:** WAITING (fill in `.env`)  
⏳ **Deployment:** READY (run after config)  

---

## 📞 Next Action

**Edit the `.env` file with your credentials, then run:**

```bash
npm run deploy:contract
```

**Need help getting credentials?**
- Hedera: https://portal.hedera.com/dashboard
- OpenAI: https://platform.openai.com/api-keys
