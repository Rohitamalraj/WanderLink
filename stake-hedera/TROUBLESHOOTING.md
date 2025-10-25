# 🔧 Troubleshooting Guide

## Issue: "Need at least 3 participants" Error

### **What Happened:**
You see 3 participants (3/3) but get error "Need at least 3 participants"

### **Why:**
The pool was reset while browsers were still polling, causing a race condition.

### **Solution:**

#### **Option 1: Refresh All Browsers (Recommended)**
```
1. Click "Reset Pool" in ONE browser
2. Wait 2 seconds
3. Refresh ALL 3 browsers (F5 or Ctrl+R)
4. Join again in each browser
5. Should work! ✅
```

#### **Option 2: Start Fresh**
```
1. Close all browser tabs
2. Restart dev server:
   - Stop: Ctrl+C
   - Start: npm run dev
3. Open 3 new browsers
4. Join in each
5. Should work! ✅
```

---

## How to Test Properly

### **Step-by-Step:**

**1. Make sure server is running:**
```bash
npm run dev
```

**2. Open Browser 1 (Chrome):**
```
http://localhost:3000/simple-stake
Connect wallet
Enter: Rohit, $2300, Goa
Click "Join Pool"
See: "Waiting 1/3"
```

**3. Open Browser 2 (Firefox or Chrome Incognito):**
```
http://localhost:3000/simple-stake
Connect wallet (different wallet!)
Enter: Yuvan, $700, Goa
Click "Join Pool"
See: "Waiting 2/3"
```

**4. Open Browser 3 (Edge or another Incognito):**
```
http://localhost:3000/simple-stake
Connect wallet (different wallet!)
Enter: Azar, $1200, Goa
Click "Join Pool"
See: "AI Negotiating..." 🤖
```

**5. Wait 10-15 seconds:**
```
All 3 browsers should show:
✅ AI Negotiation Complete!
Agreed Budget: $XXXX
Your Stake: $XX (≈ XXX HBAR)
```

---

## Common Issues

### **Issue 1: Pool shows 3/3 but won't negotiate**

**Solution:**
```
1. Click "Reset Pool"
2. Refresh ALL browsers
3. Join again
```

### **Issue 2: Error appears in 2 browsers but not the first**

**Cause:** Race condition during auto-negotiation

**Solution:**
```
1. Don't click "Reset Pool" while negotiating
2. Wait for negotiation to complete OR
3. Reset and refresh ALL browsers
```

### **Issue 3: Negotiation takes too long**

**Cause:** AI agents are slow (normal)

**Solution:**
```
Wait 15-20 seconds
If still stuck after 30 seconds:
1. Check terminal for errors
2. Reset pool
3. Try again
```

### **Issue 4: Can't connect wallet in multiple browsers**

**Solution:**
```
Use different browsers:
- Chrome
- Firefox
- Edge
- Chrome Incognito
- Firefox Private

Each needs different MetaMask wallet!
```

---

## Best Practices

### **✅ DO:**
- Wait for each browser to fully load before joining
- Use different wallets in each browser
- Wait for negotiation to complete (10-15 sec)
- Refresh ALL browsers after reset

### **❌ DON'T:**
- Click "Reset Pool" while negotiating
- Use same wallet in multiple browsers
- Save files during testing (triggers reload)
- Close browsers before negotiation completes

---

## Debug Checklist

- [ ] Server is running (`npm run dev`)
- [ ] 3 different browsers open
- [ ] 3 different wallets connected
- [ ] Each browser joined successfully
- [ ] Saw "3/3 participants"
- [ ] Waited 15+ seconds
- [ ] Checked terminal for errors

---

## If Still Not Working

### **Nuclear Option (Fresh Start):**

```bash
# 1. Stop server
Ctrl+C

# 2. Restart server
npm run dev

# 3. Close ALL browser tabs

# 4. Open 3 NEW browsers

# 5. Join in order:
Browser 1 → Join
Browser 2 → Join
Browser 3 → Join

# 6. Wait and watch! ✨
```

---

## Expected Behavior

### **Timeline:**
```
0:00 - Browser 1 joins (1/3)
0:10 - Browser 2 joins (2/3)
0:20 - Browser 3 joins (3/3)
0:21 - "AI Negotiating..." appears
0:35 - Negotiation complete!
0:36 - All browsers show result
✅ Success!
```

### **What You Should See:**

**All 3 browsers:**
```
✅ AI Negotiation Complete!

Agreed Budget: $1400
Your Stake: $70 (≈ 1,400 HBAR)

AI Reasoning: "After AI negotiation, we've agreed 
on a trip budget of $1400 with a 5% stake ($70 per 
person = 1400.00 HBAR). This ensures fair commitment 
from all 3 participants. Total pool: $210."

[Stake 1,400 HBAR]
```

---

## Success! 🎉

If you see the negotiation result in all 3 browsers, you're done!

Click "Stake X HBAR" in each browser to complete the flow.
