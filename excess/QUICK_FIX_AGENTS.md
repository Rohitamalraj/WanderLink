# 🔧 QUICK FIX: Agent Not Receiving Messages

## The Problem
Your messages are being stored in the database (fallback) but NOT being sent to Agentverse agents.

## Root Cause
The Next.js dev server needs to be **restarted** after:
1. Installing `uagent-client` package
2. Adding the API route
3. Changing environment variables

## ✅ Step-by-Step Fix

### Step 1: Stop the Next.js Dev Server
In the terminal running `npm run dev`, press **Ctrl+C** to stop it.

### Step 2: Verify Environment Variables
Check `frontend/.env.local` has these lines (WITHOUT `NEXT_PUBLIC_` prefix):
```env
TRAVEL_AGENT_ADDRESS=agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey
MATCHMAKER_ADDRESS=agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt
PLANNER_ADDRESS=agent1qdp7kupk4agz8nnevejljzdskur5x9nrqy8eec2t42hnqpca2mdmzscfdpj
```
✅ These are already correct in your file!

### Step 3: Restart Next.js Dev Server
```powershell
cd d:\WanderLink\frontend
npm run dev
```

Wait for:
```
✓ Ready in 3.2s
✓ Compiled / in 1.2s
```

### Step 4: Test the Integration

#### Option A: Use Test Page (Recommended)
1. Open: `http://localhost:3000/test-agent`
2. Select "Planner Agent"
3. Type: "Can you help me with my trip?"
4. Click "Send to Agent"
5. Check the response

#### Option B: Use Main Chat
1. Open: `http://localhost:3000/agent-trips-v2`
2. If not matched, submit a trip
3. Once matched, open "GROUP CHAT"
4. Type a message
5. Click "SEND"
6. Watch for agent response (blue badge)

### Step 5: Check the Logs

#### Browser Console (F12):
You should see:
```
🚀 Sending message to agent: { userMessage: "...", groupId: "...", userId: "..." }
📥 Agent response status: 200
✅ Agent data received: { success: true, response: "...", ... }
```

#### Server Console (Terminal):
You should see:
```
🎯 Agent API called with: { message: "...", agentType: "planner", ... }
📍 Selected agent address: { agentType: "planner", agentAddress: "agent1qdp7..." }
🔌 Initializing uagent client...
✅ Client initialized
📤 Sending query to agent: { ... }
📥 Agent result: { success: true, response: "..." }
```

## What to Expect

### ✅ Success Indicators:
- Message sent instantly (green "YOU" message)
- Button shows "SENDING..." with spinner
- After ~2-5 seconds, agent response appears
- Agent response has **blue background** + **"AGENT RESPONSE" badge**
- Response is saved to database
- No error messages

### ❌ Failure Indicators:
- Red error message: "⚠️ Unable to reach agent..."
- Console shows errors with ❌
- Server console shows "Agent address not configured"
- No agent response after 60 seconds

## Common Issues

### Issue: "Module not found: Can't resolve 'uagent-client'"
**Fix:**
```powershell
cd d:\WanderLink\frontend
npm install uagent-client --legacy-peer-deps
# Then restart dev server
```

### Issue: "Agent address not configured"
**Fix:**
1. Verify `.env.local` has agent addresses (without NEXT_PUBLIC_)
2. Restart dev server (Step 3 above)
3. Hard refresh browser (Ctrl+Shift+R)

### Issue: Timeout after 60 seconds
**Possible causes:**
- Agent is offline on Agentverse
- Agent address is incorrect
- Network connectivity issue
- uagent-client bridge not initializing

**Fix:** Try test page first to isolate the issue.

## Testing with Different Agents

To test with **Travel Agent** instead of Planner:

In `page.tsx`, change line 480:
```typescript
agentType: 'travel' // Changed from 'planner'
```

Or use the test page which has a dropdown to select any agent!

## Files Modified
- ✅ `frontend/app/api/agent-message/route.ts` - API route with logging
- ✅ `frontend/app/agent-trips-v2/page.tsx` - Chat with logging
- ✅ `frontend/app/test-agent/page.tsx` - Test page
- ✅ `frontend/.env.local` - Environment variables (already correct)
- ✅ `frontend/package.json` - uagent-client installed

## Next Steps After It Works

1. Remove or reduce console.log statements for production
2. Add better error messages for users
3. Add typing indicator while waiting for agent
4. Consider switching between agents based on message content
5. Add message retry functionality

## Still Not Working?

Run the test script:
```powershell
cd d:\WanderLink\frontend
node test-agent-api.js
```

Then provide:
1. Screenshot of test page
2. Browser console logs
3. Server terminal logs
4. Any error messages

---

**TL;DR:** Restart Next.js dev server, open test page, send a message, check logs! 🚀
