# Debugging Agent Communication - Step by Step

## Problem
Frontend messages are not reaching the Agentverse agents and are falling back to local storage only.

## What I've Added

### 1. Enhanced Logging
- ✅ Frontend (`page.tsx`): Added console logs for message sending and agent responses
- ✅ API Route (`route.ts`): Added detailed logging for every step of agent communication
- ✅ Error details: Now logs exact error messages when agent communication fails

### 2. Test Tools
- ✅ Test page: `http://localhost:3000/test-agent` - Interactive agent tester
- ✅ Test script: `frontend/test-agent-api.js` - Node.js test script

## Debugging Steps

### Step 1: Check Environment Variables
Open `frontend/.env.local` and verify:
```env
TRAVEL_AGENT_ADDRESS=agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey
MATCHMAKER_ADDRESS=agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt
PLANNER_ADDRESS=agent1qdp7kupk4agz8nnevejljzdskur5x9nrqy8eec2t42hnqpca2mdmzscfdpj
```

**Important:** These are SERVER-SIDE environment variables. They should NOT have `NEXT_PUBLIC_` prefix.

### Step 2: Restart Next.js Dev Server
```powershell
# Stop the current dev server (Ctrl+C)
cd d:\WanderLink\frontend
npm run dev
```

The API route only reads environment variables on startup, so you MUST restart after changing `.env.local`.

### Step 3: Open Test Page
1. Go to: `http://localhost:3000/test-agent`
2. Select "Planner Agent"
3. Type: "Hello, can you help me plan a trip?"
4. Click "Send to Agent"
5. Watch the response

### Step 4: Check Browser Console
Press F12 to open DevTools, then:
1. Click the "Console" tab
2. Look for logs starting with 🚀, 📥, ✅, or ❌
3. Copy any error messages

Expected logs:
```
🚀 Sending message to agent: { userMessage: "...", groupId: "...", userId: "..." }
📥 Agent response status: 200
✅ Agent data received: { success: true, response: "...", ... }
```

### Step 5: Check Server Console
Look at the terminal where `npm run dev` is running. You should see:
```
🎯 Agent API called with: { message: "...", agentType: "planner", ... }
📍 Selected agent address: { agentType: "planner", agentAddress: "agent1qdp7..." }
🔌 Initializing uagent client...
✅ Client initialized
📤 Sending query to agent: { message: "...", groupId: "...", ... }
📥 Agent result: { success: true, response: "..." }
```

## Common Issues & Fixes

### Issue 1: "Agent address not configured"
**Symptom:** Error message says agent address is empty
**Cause:** Environment variables not loaded
**Fix:** 
1. Verify `.env.local` has the agent addresses WITHOUT `NEXT_PUBLIC_` prefix
2. Restart Next.js dev server
3. Clear browser cache (Ctrl+Shift+R)

### Issue 2: "uagent-client" not found
**Symptom:** `Cannot find module 'uagent-client'`
**Fix:**
```powershell
cd d:\WanderLink\frontend
npm install uagent-client --legacy-peer-deps
```

### Issue 3: Bridge initialization timeout
**Symptom:** Long delay, then timeout error
**Cause:** uagent-client bridge not starting properly
**Fix:** Increase timeout in `route.ts` line 21:
```typescript
await new Promise(resolve => setTimeout(resolve, 5000)); // Increase from 2000
```

### Issue 4: Agent not responding
**Symptom:** Request succeeds but `result.success` is false
**Cause:** Agent may be offline or not responding
**Fix:**
1. Verify agents are deployed on Agentverse
2. Check agent addresses are correct
3. Try different agent type (change from 'planner' to 'travel')

### Issue 5: CORS error
**Symptom:** `Cross-Origin Request Blocked`
**Cause:** Browser security blocking request
**Fix:** This shouldn't happen with Next.js API routes, but if it does:
- Ensure you're calling `/api/agent-message` (relative URL)
- NOT `http://localhost:3000/api/agent-message` (absolute URL)

## Testing Checklist

Run through these tests:

- [ ] Environment variables are set in `.env.local` (without NEXT_PUBLIC_ prefix)
- [ ] Next.js dev server restarted after env changes
- [ ] Test page loads: `http://localhost:3000/test-agent`
- [ ] Test page shows environment variables as "✅ Set"
- [ ] Sending message shows "🚀 Sending message..." in console
- [ ] Server console shows "🎯 Agent API called with..."
- [ ] Server console shows "📍 Selected agent address: { agentAddress: 'agent1q...' }"
- [ ] Server console shows "📥 Agent result: { success: true }"
- [ ] Browser console shows "✅ Agent data received"
- [ ] Response appears in UI with blue badge "AGENT RESPONSE"

## Quick Test Commands

### Test 1: Check if API route exists
```powershell
Test-Path "d:\WanderLink\frontend\app\api\agent-message\route.ts"
# Should return: True
```

### Test 2: Check if uagent-client is installed
```powershell
cd d:\WanderLink\frontend
npm list uagent-client
# Should show: uagent-client@1.0.6
```

### Test 3: Test API route directly (after server is running)
```powershell
$body = @{ message='test'; groupId='123'; userId='456'; agentType='planner' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/agent-message' -Method Post -Body $body -ContentType 'application/json'
```

## Next Steps After Debugging

Once you identify the issue from the logs:

1. **If environment variables are missing:** Add them to `.env.local` and restart
2. **If uagent-client fails:** Check the bridge initialization delay
3. **If agent doesn't respond:** Verify agent is deployed and address is correct
4. **If it works on test page but not main page:** Check the main page is using the same agentType

## Getting Help

If still stuck, provide:
1. Screenshot of test page response
2. Browser console logs (copy all logs with 🚀, 📥, ✅, ❌)
3. Server console logs (from terminal running npm run dev)
4. Contents of `.env.local` (just the agent address lines)
