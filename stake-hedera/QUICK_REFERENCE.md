# Quick Reference - Enhanced Staking Flow

## 📍 Current Contract (Oct 25, 2025)

**Contract Address:** `0xbE342d304FBc06FB371FC9833F4597118ec383Bf`  
**HashScan:** https://hashscan.io/testnet/contract/0xbE342d304FBc06FB371FC9833F4597118ec383Bf  
**Status:** ✅ Working (msg.value check removed, manual withdrawal enabled)

## 🎯 Your Flow (Implemented)

```
USER → AGENTS NEGOTIATE → SMALLER AMOUNT → STAKE → LOCATION VERIFY → RELEASE
```

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Add: HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, VALIDATOR_ACCOUNT_ID, VALIDATOR_PRIVATE_KEY, OPENAI_API_KEY

# 3. Run
npm run dev

# 4. Test
# Open: http://localhost:3000
# Enter: 1000 HBAR + "New York"
# Watch: Agents negotiate to ~850 HBAR
```

---

## 📊 Negotiation Examples

| Input | Validator Suggests | Coordinator Counters | Final |
|-------|-------------------|---------------------|-------|
| 100 HBAR | ✅ Approve | - | 100 HBAR |
| 500 HBAR | 400 HBAR | 450 HBAR | 450 HBAR |
| 1000 HBAR | 700 HBAR | 850 HBAR | 850 HBAR |
| 5000 HBAR | 3500 HBAR | 4250 HBAR | 4250 HBAR |

---

## 💬 A2A Message Types

1. **STAKE_REQUEST** - Initial request
2. **STAKE_COUNTER_OFFER** - Negotiation offer
3. **STAKE_NEGOTIATION** - Acceptance message
4. **STAKE_APPROVAL** - Final approval
5. **STAKE_CONFIRMATION** - Escrow locked
6. **LOCATION_VERIFICATION** - Location check
7. **FUNDS_RELEASE** - Escrow released

---

## 🔑 Key Files

### Core Logic
- `src/lib/agents/coordinator-agent.ts` - Negotiation & execution
- `src/lib/agents/validator-agent.ts` - AI validation & offers
- `src/lib/escrow-service.ts` - Escrow management
- `src/lib/location-service.ts` - Location verification

### API & UI
- `src/app/api/stake/route.ts` - Main API endpoint
- `src/app/page.tsx` - User interface

### Documentation
- `ENHANCED_FLOW.md` - Technical details
- `README_ENHANCED.md` - User guide
- `IMPLEMENTATION_SUMMARY.md` - What was built

---

## 🎮 Test Commands

```bash
# Test negotiation (high amount)
curl -X POST http://localhost:3000/api/stake \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "location": "New York"}'

# Test direct approval (low amount)
curl -X POST http://localhost:3000/api/stake \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "location": "London"}'
```

---

## 🔍 Console Output

```
Step 1: Coordinator initiating stake request...
Step 2: Validator processing request...
Validator AI Analysis: NEGOTIATE | 700 HBAR

🤝 Negotiation Round 1:
   Original: 1000 HBAR
   Proposed: 700 HBAR
   🤖 Coordinator AI Decision: COUNTER
   🔄 Counter-offering 850 HBAR

Validator AI Analysis: APPROVE | 850 HBAR

💰 Executing Stake:
   Original Request: 1000 HBAR
   Final Amount: 850 HBAR
   🔒 Escrow Account Created: 0.0.12345
   ✅ Balance Check: Sufficient funds
```

---

## 📱 UI Features

### Input Fields
- **Amount** - HBAR to stake (try 1000 to see negotiation)
- **Location** - Required location for release

### Display
- **Requested** - Original amount
- **Final Amount** - After negotiation (green)
- **Messages** - All A2A communication
- **Escrow Info** - Account ID & location

---

## 🎯 API Response

```json
{
  "success": true,
  "summary": {
    "requestedAmount": 1000,
    "finalAmount": 850,
    "escrowAccountId": "0.0.12345",
    "location": "New York",
    "status": "COMPLETED"
  }
}
```

---

## ✅ Checklist

- [x] User enters amount
- [x] User sets location
- [x] Agents communicate via A2A
- [x] Negotiation for smaller amount
- [x] Agent stakes automatically
- [x] Funds locked in escrow
- [x] Location verification required
- [x] Funds released after verification

---

## 🚨 Troubleshooting

**No negotiation happening?**
- Try amount > 500 HBAR

**Lint errors?**
- Run `npm install` first

**API errors?**
- Check `.env` has all variables
- Verify Hedera accounts are valid
- Confirm OpenAI API key works

---

## 📚 Documentation

- **ENHANCED_FLOW.md** - Complete technical flow
- **README_ENHANCED.md** - User guide
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **QUICK_REFERENCE.md** - This file

---

**Ready to stake with AI negotiation!** 🚀
