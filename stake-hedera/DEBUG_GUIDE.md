# 🔍 Debug Guide - Negotiation Issues

## ✅ What I Fixed

### **1. Added Detailed Logging**
The negotiate endpoint now logs:
- Number of participants
- Pool status
- Participant details
- Error messages with stack traces

### **2. Suppressed Handlebars Warning**
Updated `next.config.mjs` to ignore the webpack warning (it's harmless).

---

## 🐛 How to Debug

### **Step 1: Check Terminal Logs**

When you try to negotiate, you'll now see:

```
=== Negotiation Request ===
Participants: 3
Status: waiting
Participants: [
  { name: 'Rohit', budget: 2300 },
  { name: 'Yuvan', budget: 700 },
  { name: 'Azar', budget: 1200 }
]
✅ Starting negotiation...
```

### **Step 2: If You See Error**

```
❌ Not enough participants: 0
```

**This means the pool was reset!**

**Solution:**
1. Click "Reset Pool" in ONE browser
2. Wait for page reload
3. Join again in all 3 browsers

---

## 🧪 Testing Steps

### **Fresh Test:**

```bash
# 1. Restart server (to clear pool)
Ctrl+C
npm run dev

# 2. Browser 1
http://localhost:3000/simple-stake
Join: Rohit, $2300, Goa

# 3. Browser 2
http://localhost:3000/simple-stake
Join: Yuvan, $700, Goa

# 4. Browser 3
http://localhost:3000/simple-stake
Join: Azar, $1200, Goa

# 5. Watch terminal logs!
```

---

## 📊 Expected Terminal Output

### **Successful Flow:**

```
=== Negotiation Request ===
Participants: 3
Status: waiting
Participants: [
  { name: 'Rohit', budget: 2300 },
  { name: 'Yuvan', budget: 700 },
  { name: 'Azar', budget: 1200 }
]
✅ Starting negotiation...

[AI agent logs...]

✅ Negotiation complete!
```

### **Failed Flow (Pool Reset):**

```
=== Negotiation Request ===
Participants: 0
Status: waiting
Participants: []
❌ Not enough participants: 0
```

**Fix:** Reset and rejoin!

---

## 🔧 Common Issues

### **Issue 1: "Need at least 3 participants" but shows 3/3**

**Cause:** Race condition - pool was reset while browsers were polling

**Solution:**
```
1. Click "Reset Pool" button
2. All browsers reload automatically
3. Join again in each browser
4. Should work!
```

### **Issue 2: Negotiation stuck**

**Cause:** AI agents taking too long or error occurred

**Check terminal for:**
```
❌ Negotiation Error: [error message]
Error stack: [stack trace]
```

**Common errors:**
- `Missing Hedera configuration` → Check `.env` file
- `OpenAI API error` → Check API key
- `Network error` → Check internet connection

### **Issue 3: Handlebars warning**

**Status:** ⚠️ Warning only (not an error)

**Impact:** None - system works fine

**Fixed:** Updated `next.config.mjs` to suppress warning

---

## 🎯 Debugging Checklist

When negotiation fails, check:

- [ ] Terminal shows "=== Negotiation Request ===" log
- [ ] Participants count is 3
- [ ] Status is "waiting"
- [ ] All 3 participants listed
- [ ] No error messages in terminal
- [ ] `.env` file has all required variables
- [ ] OpenAI API key is valid
- [ ] Hedera credentials are correct

---

## 📝 Environment Variables Check

```bash
# Check if .env exists
ls -la .env

# Verify it has these (don't show actual values):
grep "HEDERA_ACCOUNT_ID" .env
grep "HEDERA_PRIVATE_KEY" .env
grep "VALIDATOR_ACCOUNT_ID" .env
grep "VALIDATOR_PRIVATE_KEY" .env
grep "OPENAI_API_KEY" .env
```

**All should return a line!**

---

## 🚀 Quick Fix Commands

### **Nuclear Reset:**

```bash
# Stop server
Ctrl+C

# Restart
npm run dev

# Open 3 new browsers
# Join in each
# Watch terminal!
```

### **Check Pool Status:**

```bash
# In browser console:
fetch('/api/pool/status?wallet=YOUR_WALLET_ADDRESS')
  .then(r => r.json())
  .then(console.log)
```

### **Manual Reset:**

```bash
# In browser console:
fetch('/api/pool/reset', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

---

## 💡 Pro Tips

### **Tip 1: Watch Terminal**
Always keep terminal visible to see logs in real-time.

### **Tip 2: Test Quickly**
Join all 3 browsers within 10-20 seconds to avoid timeouts.

### **Tip 3: Use Different Wallets**
Each browser needs a different MetaMask wallet.

### **Tip 4: Don't Save Files**
Saving files triggers hot reload and resets the pool.

---

## ✅ Success Indicators

You'll know it's working when you see:

**Terminal:**
```
=== Negotiation Request ===
Participants: 3
Status: waiting
✅ Starting negotiation...
[AI processing...]
✅ Negotiation complete!
```

**Browser:**
```
✅ AI Negotiation Complete!
Agreed Budget: $1400
Your Stake: $70 (≈ 1,400 HBAR)
```

---

## 🎊 Next Steps

Once negotiation works:
1. Each user clicks "Stake X HBAR"
2. Approve MetaMask transaction
3. See success message
4. Check HashScan for transaction

**You're all set!** 🚀
