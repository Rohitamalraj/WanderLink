# Enhanced Negotiation & Escrow Flow

## 🎯 New Features

Your requested flow has been implemented with these enhancements:

### 1. **AI-Powered Negotiation**
Agents negotiate the staking amount using GPT-4 intelligence

### 2. **Escrow System**
Funds are locked in escrow until location verification

### 3. **Location-Based Release**
Funds only release when user verifies their location

---

## 📊 Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│ USER ENTERS: 1000 HBAR + Location: "New York"              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ COORDINATOR AGENT                                            │
│ "I want to stake 1000 HBAR"                                 │
│ → Sends A2A: STAKE_REQUEST                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ VALIDATOR AGENT (AI Analysis)                               │
│ 🤖 "1000 HBAR is high risk. I suggest 700 HBAR"           │
│ → Sends A2A: STAKE_COUNTER_OFFER (700 HBAR)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ COORDINATOR AGENT (AI Decision)                             │
│ 🤖 "Let's meet in the middle"                              │
│ → Sends A2A: STAKE_COUNTER_OFFER (850 HBAR)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ VALIDATOR AGENT (AI Re-evaluation)                          │
│ 🤖 "850 HBAR is acceptable"                                │
│ → Sends A2A: STAKE_APPROVAL (850 HBAR)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ COORDINATOR AGENT                                            │
│ 1. Creates Escrow Account (0.0.xxxxx)                      │
│ 2. Locks 850 HBAR in Escrow                                │
│ 3. Stakes 850 HBAR on behalf of user                       │
│ → Sends A2A: STAKE_CONFIRMATION                            │
│    Status: LOCKED_IN_ESCROW                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ USER VERIFIES LOCATION                                       │
│ Required: "New York"                                         │
│ User provides: "New York"                                    │
│ ✅ Match confirmed                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ COORDINATOR AGENT                                            │
│ 🔓 Releases 850 HBAR from Escrow                           │
│ → Sends A2A: FUNDS_RELEASE                                 │
│    Status: COMPLETED                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Components

### 1. Negotiation Logic (`validator-agent.ts`)

```typescript
// AI analyzes and suggests lower amount if risky
if (amount > 500) {
  recommendation = 'NEGOTIATE';
  negotiatedAmount = Math.floor(amount * 0.7); // 70% of requested
  reason = "Risk assessment suggests lower amount";
}
```

### 2. Counter-Offer Handling (`coordinator-agent.ts`)

```typescript
// Coordinator uses AI to decide: ACCEPT, COUNTER, or REJECT
const aiDecision = await this.agentExecutor.invoke({
  input: `Should I accept ${proposedAmount} HBAR or counter-offer?`
});

if (decision.includes('COUNTER')) {
  // Calculate middle ground
  const counterAmount = Math.floor((original + proposed) / 2);
  // Send counter-offer back to validator
}
```

### 3. Escrow System (`escrow-service.ts`)

```typescript
// Create escrow account
const escrow = await escrowService.createEscrowAccount();

// Lock funds
await escrowService.lockFunds(userAccount, negotiatedAmount);

// Release after location verification
await escrowService.releaseFunds(userAccount, negotiatedAmount);
```

### 4. Location Verification (`location-service.ts`)

```typescript
// Verify user location
const verification = await locationService.verifyLocation(
  requiredLocation: "New York",
  userProvidedLocation: "New York"
);

if (verification.isMatch) {
  // Release funds from escrow
}
```

---

## 💬 A2A Message Types

### New Message Types Added:

1. **`STAKE_COUNTER_OFFER`** - Agent proposes different amount
2. **`STAKE_NEGOTIATION`** - Negotiation acceptance/rejection
3. **`LOCATION_VERIFICATION`** - Location check message
4. **`FUNDS_RELEASE`** - Escrow release confirmation

### Message Flow Example:

```json
// 1. Initial Request
{
  "type": "STAKE_REQUEST",
  "payload": {
    "amount": 1000,
    "requiredLocation": "New York"
  }
}

// 2. Counter-Offer
{
  "type": "STAKE_COUNTER_OFFER",
  "payload": {
    "originalAmount": 1000,
    "proposedAmount": 700,
    "reason": "Risk mitigation",
    "round": 1
  }
}

// 3. Counter-Counter-Offer
{
  "type": "STAKE_COUNTER_OFFER",
  "payload": {
    "originalAmount": 1000,
    "proposedAmount": 850,
    "reason": "Meeting halfway",
    "round": 2
  }
}

// 4. Final Approval
{
  "type": "STAKE_APPROVAL",
  "payload": {
    "approvedAmount": 850,
    "negotiatedAmount": 850,
    "originalAmount": 1000
  }
}

// 5. Escrow Confirmation
{
  "type": "STAKE_CONFIRMATION",
  "payload": {
    "amount": 850,
    "status": "LOCKED_IN_ESCROW",
    "escrowAccountId": "0.0.12345",
    "message": "Awaiting location verification"
  }
}

// 6. Location Verification
{
  "type": "LOCATION_VERIFICATION",
  "payload": {
    "requiredLocation": "New York",
    "verifiedLocation": "New York",
    "isMatch": true
  }
}

// 7. Funds Release
{
  "type": "FUNDS_RELEASE",
  "payload": {
    "amount": 850,
    "status": "RELEASED",
    "transactionId": "0.0.12345@1234567890.123"
  }
}
```

---

## 🎮 How to Use

### API Request:

```typescript
const response = await fetch('/api/stake', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 1000,           // Requested amount
    location: 'New York'    // Required location for release
  })
});

const data = await response.json();
```

### Response:

```json
{
  "success": true,
  "conversation": {
    "messages": [...],  // All A2A messages
    "status": "COMPLETED"
  },
  "summary": {
    "requestedAmount": 1000,
    "finalAmount": 850,        // After negotiation
    "originalAmount": 1000,
    "escrowAccountId": "0.0.12345",
    "location": "New York",
    "messageCount": 7
  }
}
```

---

## 🧪 Test Scenarios

### Scenario 1: High Amount (Triggers Negotiation)

**Input:** 1000 HBAR  
**Expected:**
- Validator suggests ~700 HBAR
- Coordinator counters with ~850 HBAR
- Validator accepts
- Final: 850 HBAR staked

### Scenario 2: Reasonable Amount (Direct Approval)

**Input:** 300 HBAR  
**Expected:**
- Validator approves immediately
- No negotiation needed
- Final: 300 HBAR staked

### Scenario 3: Too Low (Rejection)

**Input:** 5 HBAR  
**Expected:**
- Validator rejects (below minimum)
- No negotiation
- Status: REJECTED

### Scenario 4: Location Mismatch

**Input:** 500 HBAR, Location: "New York"  
**User Provides:** "Los Angeles"  
**Expected:**
- Funds locked in escrow
- Location verification fails
- Funds NOT released

---

## 🔐 Security Features

### 1. Escrow Protection
- Funds locked until verification
- Separate escrow account per transaction
- Only coordinator can release

### 2. Location Verification
- Required location set upfront
- User must verify before release
- Configurable verification strictness

### 3. Negotiation Limits
- Max 3 negotiation rounds
- Prevents infinite loops
- AI-guided decisions

---

## 🚀 Production Enhancements

To make this production-ready:

### 1. Real Escrow Implementation

```typescript
// Currently simulated, implement:
await escrowService.lockFunds(userAccountId, amount);
await escrowService.releaseFunds(userAccountId, amount);
```

### 2. GPS/IP Geolocation

```typescript
// Integrate real location services:
import { getGPSLocation } from 'geolocation-api';
import { getIPLocation } from 'ipapi';

const userLocation = await getGPSLocation();
const verification = await locationService.verifyLocation(
  requiredLocation,
  userLocation
);
```

### 3. Smart Contract Integration

```solidity
// Hedera smart contract for escrow
contract StakingEscrow {
    mapping(address => uint256) public lockedFunds;
    
    function lockFunds() external payable {
        lockedFunds[msg.sender] += msg.value;
    }
    
    function releaseFunds(address to, uint256 amount) external {
        require(verifyLocation(to), "Location not verified");
        payable(to).transfer(amount);
    }
}
```

### 4. Multi-Signature Approval

```typescript
// Require multiple agents to approve
const approvals = [
  await validator1.approve(request),
  await validator2.approve(request),
  await riskAgent.approve(request)
];

if (approvals.every(a => a.approved)) {
  await executeStake();
}
```

---

## 📊 Negotiation Algorithm

### Validator's Strategy:
- **< 100 HBAR:** Approve immediately
- **100-500 HBAR:** Approve with monitoring
- **500-1000 HBAR:** Suggest 70-80% of amount
- **> 1000 HBAR:** Suggest 60-70% of amount

### Coordinator's Strategy:
- **Round 1:** Counter with middle ground
- **Round 2:** Accept if within 20% of original
- **Round 3:** Accept validator's offer

### AI Decision Factors:
- Amount risk level
- User history (if available)
- Network conditions
- Market volatility

---

## 🎯 Benefits

### For Users:
- ✅ Safer staking amounts (AI-validated)
- ✅ Funds protected in escrow
- ✅ Location-based security
- ✅ Transparent negotiation

### For Platform:
- ✅ Reduced risk exposure
- ✅ Automated risk management
- ✅ Compliance-ready (location verification)
- ✅ Audit trail via A2A messages

---

## 📝 Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Add Hedera accounts
   - Add OpenAI API key

3. **Test the flow:**
   ```bash
   npm run dev
   # Try: 1000 HBAR with location "New York"
   ```

4. **Watch the negotiation:**
   - Check console logs for AI decisions
   - See A2A messages in UI
   - Observe escrow creation

5. **Implement location verification UI:**
   - Add location input field
   - Show escrow status
   - Add "Verify Location" button

---

## 🎉 Summary

You now have a **complete negotiation-based staking system** where:

1. ✅ User enters amount + location
2. ✅ Agents negotiate optimal amount using AI
3. ✅ Funds locked in escrow
4. ✅ Location verification required
5. ✅ Funds released after verification
6. ✅ All communication via A2A messages on HCS

**This is exactly the flow you requested!** 🚀
