# 🧪 Testing Guide - Collaborative Trip Staking

## ⚠️ Important: Session Storage

**Sessions are stored in-memory and will be lost when:**
- You restart the dev server (`npm run dev`)
- You save files (triggers hot reload)
- The server crashes

**Solution:** Keep the server running and test in the same session!

---

## 🚀 Step-by-Step Testing

### **Step 1: Start Server (KEEP IT RUNNING!)**

```bash
npm run dev
```

⚠️ **DO NOT restart the server during testing!**

---

### **Step 2: Browser 1 - Create Session**

1. Open **Chrome**: http://localhost:3000/collab-trip
2. Connect MetaMask
3. Fill form:
   ```
   Trip Name: Goa Weekend
   Date: 2025-12-25
   Location: Goa, India
   Your Name: Alice
   Budget: 1000
   ```
4. Click **"Create Trip Session"**
5. **COPY THE SESSION ID** (e.g., `trip_1761376049449_huqpm99zg`)
6. Keep this browser tab open!

---

### **Step 3: Browser 2 - Join Session**

1. Open **Firefox** (or Chrome Incognito): http://localhost:3000/collab-trip
2. Connect MetaMask (different wallet)
3. Click **"Or join existing session"**
4. You should see the session in "Available Sessions"
5. Click on it OR paste the Session ID
6. Fill form:
   ```
   Your Name: Bob
   Budget: 1500
   ```
7. Click **"Join Trip"**
8. Keep this browser tab open!

---

### **Step 4: Browser 3 - Join Session**

1. Open **Edge** (or another Incognito): http://localhost:3000/collab-trip
2. Connect MetaMask (different wallet)
3. Click **"Or join existing session"**
4. Click the session or paste Session ID
5. Fill form:
   ```
   Your Name: Charlie
   Budget: 800
   ```
6. Click **"Join Trip"**

---

### **Step 5: All Browsers - Watch Updates**

All 3 browsers should now show:
```
┌─────────────────────────────────────┐
│ Waiting for Participants      3/3   │
├─────────────────────────────────────┤
│ 👤 Alice    | $1000                 │
│ 👤 Bob      | $1500                 │
│ 👤 Charlie  | $800                  │
│                                     │
│ [Start AI Negotiation] ✅           │
└─────────────────────────────────────┘
```

---

### **Step 6: Start Negotiation**

1. In **any browser**, click **"Start AI Negotiation"**
2. Wait 10-15 seconds for AI agents
3. All browsers will update to show results:
   ```
   Agreed Budget: $1200
   Your Stake: $60 (≈ 1,200 HBAR)
   ```

---

### **Step 7: Individual Staking**

Each browser:
1. Click **"Stake 1,200 HBAR"**
2. Approve MetaMask transaction
3. See success message
4. Other browsers update to show who staked

---

## 🐛 Troubleshooting

### **Problem: "Session not found"**

**Causes:**
1. ✅ Server was restarted
2. ✅ Files were saved (hot reload)
3. ✅ Session ID is wrong

**Solutions:**

#### **Option 1: Quick Test (Recommended)**
```bash
# Keep server running
# In Browser 1: Create session
# Immediately in Browser 2: Join session
# Don't save any files during test!
```

#### **Option 2: Check Active Sessions**
Visit: http://localhost:3000/api/trip-session/list

You'll see:
```json
{
  "success": true,
  "count": 1,
  "sessions": [
    {
      "sessionId": "trip_1761376049449_huqpm99zg",
      "tripName": "Goa Weekend",
      "participants": 1,
      "status": "waiting"
    }
  ]
}
```

If `count: 0`, the session was lost. Create a new one!

#### **Option 3: Use Available Sessions List**
When you click "Join existing session", you'll see:
- **Available Sessions** (if any exist)
- Click on a session to auto-fill the ID
- If empty, create a new session first!

---

### **Problem: Sessions disappear**

**Cause:** Server restart or hot reload

**Solution:**
1. Don't save files during testing
2. Complete the test in one go
3. For production, use a database (PostgreSQL/MongoDB)

---

### **Problem: Can't connect wallet in multiple browsers**

**Solution:**
- Use different browsers (Chrome, Firefox, Edge)
- Or use Incognito/Private windows
- Each needs a different MetaMask wallet

---

## 📝 Quick Test Checklist

- [ ] Server running (`npm run dev`)
- [ ] Browser 1: Create session
- [ ] Copy Session ID
- [ ] Browser 2: Join with ID (immediately!)
- [ ] Browser 3: Join with ID (immediately!)
- [ ] See 3/3 participants
- [ ] Start negotiation
- [ ] All stake individually
- [ ] ✅ Success!

---

## 🎯 Pro Tips

### **1. Test Quickly**
```
Create → Join → Join → Negotiate → Stake
Do it all in 2-3 minutes without saving files!
```

### **2. Check Sessions First**
```
Visit: http://localhost:3000/api/trip-session/list
See what sessions exist before joining
```

### **3. Use Available Sessions**
```
The join page now shows active sessions
Just click on one instead of pasting ID
```

### **4. Keep Tabs Open**
```
Don't close browser tabs during test
They auto-update every 2 seconds
```

---

## 🔧 For Production

To make sessions persistent:

### **Option 1: File-based Storage**
```typescript
// src/lib/trip-sessions.ts
import fs from 'fs';

class TripSessionStore {
  private sessionsFile = './sessions.json';
  
  private loadSessions() {
    if (fs.existsSync(this.sessionsFile)) {
      const data = fs.readFileSync(this.sessionsFile, 'utf-8');
      return new Map(JSON.parse(data));
    }
    return new Map();
  }
  
  private saveSessions() {
    fs.writeFileSync(
      this.sessionsFile,
      JSON.stringify(Array.from(this.sessions.entries()))
    );
  }
}
```

### **Option 2: Database (Recommended)**
```typescript
// Use Prisma + PostgreSQL
model TripSession {
  id            String   @id @default(cuid())
  sessionId     String   @unique
  tripName      String
  tripDate      String
  location      String
  participants  Json
  status        String
  createdAt     DateTime @default(now())
}
```

---

## ✅ Expected Behavior

### **Timeline:**
```
0:00 - Browser 1 creates session
0:30 - Browser 2 joins (sees 2/3)
1:00 - Browser 3 joins (sees 3/3)
1:10 - Start negotiation
1:25 - AI completes (all see results)
1:30 - Browser 1 stakes
1:45 - Browser 2 stakes
2:00 - Browser 3 stakes
2:05 - All complete! 🎉
```

### **What You Should See:**

**Browser 1 (Alice):**
```
✅ Created session
✅ Sees Bob join
✅ Sees Charlie join
✅ Starts negotiation
✅ Stakes 1,200 HBAR
✅ Sees others stake
```

**Browser 2 (Bob):**
```
✅ Joins session
✅ Sees Alice & Charlie
✅ Sees negotiation start
✅ Stakes 1,200 HBAR
✅ Sees others stake
```

**Browser 3 (Charlie):**
```
✅ Joins session
✅ Sees Alice & Bob
✅ Sees negotiation start
✅ Stakes 1,200 HBAR
✅ Sees others stake
```

---

## 🎊 Success Criteria

You've successfully tested when:
- ✅ 3 users joined from different browsers
- ✅ All saw each other in waiting room
- ✅ AI negotiation completed
- ✅ All 3 staked individually
- ✅ Each transaction succeeded
- ✅ Pool created with 3,600 HBAR

**Congratulations!** 🚀
