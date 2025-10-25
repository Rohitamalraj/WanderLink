# Smart Contract Deployment Guide

## 📋 Overview

This guide shows how to deploy the `StakingEscrow` Solidity contract to Hedera Network.

## 🔧 Prerequisites

1. **Solidity Compiler**
   ```bash
   npm install -g solc
   ```

2. **Hedera Accounts**
   - Coordinator account (in `.env`)
   - Validator account (in `.env`)

3. **HBAR for Gas**
   - ~20 HBAR for deployment
   - Get free testnet HBAR at https://portal.hedera.com/dashboard

## 📝 Contract Features

### Multi-User Staking Pool
- **2+ users** can pool their HBAR
- Each user sets their **required location**
- Funds locked until **all locations verified**

### Agent Negotiation
- Validator can update **negotiated amount**
- Proportional distribution to users

### Location-Based Release
- Each user must verify location
- Funds released individually after verification

## 🚀 Deployment Steps

### Step 1: Compile Contract

```bash
# Navigate to contracts directory
cd contracts

# Compile Solidity contract
solc --bin --abi StakingEscrow.sol -o build/

# This creates:
# - StakingEscrow.bin (bytecode)
# - StakingEscrow.abi (interface)
```

### Step 2: Deploy to Hedera

```bash
# Run deployment script
npm run deploy:contract

# Or with ts-node
npx ts-node scripts/deploy-contract.ts
```

### Step 3: Save Contract ID

The script will output:
```
✅ Contract deployed!
📋 Contract Details:
   Contract ID: 0.0.12345678
   Bytecode File ID: 0.0.12345677
   Validator: 0.0.xxxxx
```

Add to `.env`:
```env
CONTRACT_ID=0.0.12345678
```

## 🎮 Using the Contract

### Create a Pool (2 Users)

```typescript
const contractEscrow = new ContractEscrowService(client, contractId);

await contractEscrow.createPool('pool_001', [
  {
    address: '0.0.11111',
    amount: 500,
    location: 'New York'
  },
  {
    address: '0.0.22222',
    amount: 300,
    location: 'London'
  }
]);
```

### Update After Negotiation

```typescript
// Agents negotiated from 800 to 600 HBAR
await contractEscrow.updateNegotiatedAmount('pool_001', 600);
```

### Verify Locations

```typescript
// User 1 verifies location
await contractEscrow.verifyLocation('pool_001', '0.0.11111', 'New York');

// User 2 verifies location
await contractEscrow.verifyLocation('pool_001', '0.0.22222', 'London');
```

### Release Funds

```typescript
// User 1 gets their share: (500/800) * 600 = 375 HBAR
await contractEscrow.releaseFunds('pool_001', '0.0.11111');

// User 2 gets their share: (300/800) * 600 = 225 HBAR
await contractEscrow.releaseFunds('pool_001', '0.0.22222');
```

## 📊 Complete Flow Example

```typescript
// 1. Two users want to stake
const users = [
  { accountId: '0.0.11111', amount: 1000, location: 'Tokyo' },
  { accountId: '0.0.22222', amount: 500, location: 'Paris' }
];

// Total: 1500 HBAR

// 2. Create pool in contract
const poolId = 'pool_' + Date.now();
await contractEscrow.createPool(poolId, users);

// 3. Agents negotiate
// Validator suggests: 1050 HBAR (70% of 1500)
// Coordinator counters: 1275 HBAR (middle ground)
// Final: 1275 HBAR

// 4. Update contract with negotiated amount
await contractEscrow.updateNegotiatedAmount(poolId, 1275);

// 5. Users verify locations
await contractEscrow.verifyLocation(poolId, '0.0.11111', 'Tokyo');
await contractEscrow.verifyLocation(poolId, '0.0.22222', 'Paris');

// 6. Release funds
// User 1 gets: (1000/1500) * 1275 = 850 HBAR
await contractEscrow.releaseFunds(poolId, '0.0.11111');

// User 2 gets: (500/1500) * 1275 = 425 HBAR
await contractEscrow.releaseFunds(poolId, '0.0.22222');
```

## 🔐 Security Features

### Access Control
- **Owner**: Can emergency withdraw
- **Validator**: Can verify locations and update amounts
- **Users**: Can only withdraw their own funds

### Safety Checks
- ✅ Location must be verified before withdrawal
- ✅ Can't withdraw more than contributed
- ✅ Proportional distribution based on contribution
- ✅ Re-entrancy protection

### Emergency Functions
```typescript
// Owner can emergency withdraw all funds
await contractEscrow.emergencyWithdraw(poolId);
```

## 📡 API Integration

### Multi-User Staking Endpoint

```bash
POST /api/multi-stake

{
  "users": [
    {
      "accountId": "0.0.11111",
      "amount": 1000,
      "location": "New York"
    },
    {
      "accountId": "0.0.22222",
      "amount": 500,
      "location": "London"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "summary": {
    "totalRequested": 1500,
    "totalNegotiated": 1275,
    "userCount": 2,
    "userShares": [
      {
        "accountId": "0.0.11111",
        "originalAmount": 1000,
        "negotiatedShare": 850,
        "percentage": "66.67"
      },
      {
        "accountId": "0.0.22222",
        "originalAmount": 500,
        "negotiatedShare": 425,
        "percentage": "33.33"
      }
    ],
    "contractPoolId": "pool_1234567890"
  }
}
```

## 🧪 Testing

### Test Deployment

```bash
# Deploy to testnet
npm run deploy:contract

# Verify deployment
npm run verify:contract
```

### Test Contract Functions

```bash
# Run contract tests
npm run test:contract
```

## 📊 Gas Costs (Testnet)

| Operation | Gas | Cost (HBAR) |
|-----------|-----|-------------|
| Deploy Contract | ~2M | ~20 |
| Create Pool | ~300K | ~3 |
| Update Amount | ~100K | ~1 |
| Verify Location | ~100K | ~1 |
| Release Funds | ~150K | ~1.5 |

## 🔍 Monitoring

### View Contract on HashScan

```
https://hashscan.io/testnet/contract/0.0.YOUR_CONTRACT_ID
```

### Query Pool Info

```typescript
const poolInfo = await contractEscrow.getPoolInfo('pool_001');
console.log(poolInfo);
```

### Query User Info

```typescript
const userInfo = await contractEscrow.getUserInfo('pool_001', '0.0.11111');
console.log(userInfo);
```

## 🚨 Troubleshooting

**Contract deployment fails**
- Check you have enough HBAR (~20 HBAR)
- Verify bytecode file is correct
- Ensure validator account exists

**Transaction reverts**
- Check gas limit is sufficient
- Verify all parameters are correct
- Ensure user is in the pool

**Location verification fails**
- Must be called by validator account
- User must be in the pool
- Pool must be active

## 📚 Resources

- **Hedera Docs**: https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts
- **Solidity Docs**: https://docs.soliditylang.org/
- **HashScan Explorer**: https://hashscan.io/testnet

---

## ✅ Deployment Checklist

- [ ] Solidity compiler installed
- [ ] Contract compiled successfully
- [ ] Hedera accounts funded
- [ ] Environment variables set
- [ ] Contract deployed to testnet
- [ ] Contract ID saved to `.env`
- [ ] Tested create pool
- [ ] Tested negotiation update
- [ ] Tested location verification
- [ ] Tested funds release

**Ready to deploy!** 🚀
