# Dynamic Agent Chat Integration - Quick Start

## What We Built

Your group chat is now **fully dynamic** with real-time agent communication:
- ✅ Users can send messages after itinerary is delivered
- ✅ Messages are sent to Agentverse-deployed agents
- ✅ Agent responses appear automatically in chat
- ✅ Messages are stored in database for persistence
- ✅ Continuous polling keeps chat updated
- ✅ Loading states and error handling

## Files Modified

### 1. Created: `frontend/app/api/agent-message/route.ts`
API endpoint that connects frontend to Agentverse agents using `uagent-client`.

**Key Features:**
- Communicates with TRAVEL_AGENT, MATCHMAKER, or PLANNER
- Formats messages with groupId, userId, timestamp
- Returns agent responses or error messages
- 60-second timeout with auto-bridge initialization

### 2. Updated: `frontend/app/agent-trips-v2/page.tsx`
Enhanced group chat with agent communication.

**Key Changes:**
- Added `sendingMessage` state for loading indicator
- Updated message send handler to:
  1. Store user message in Planner/Bridge DB
  2. Send message to agent via `/api/agent-message`
  3. Display agent response with special styling
  4. Store agent response in database
- Added message type detection for proper styling:
  - User messages: Green background, "👤 YOU"
  - Agent responses: Blue background, "AGENT RESPONSE" badge
  - System messages: Yellow background
  - Itinerary: Purple background
  - Errors: Red background
- Disabled send button while processing
- Added auto-scroll class for smooth UX

### 3. Updated: `frontend/.env.local`
Added `NEXT_PUBLIC_PLANNER_URL` for consistency.

## How It Works

```
┌─────────────┐
│   User      │ Types "Can you add more activities?"
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Frontend (page.tsx)        │ Optimistic UI update
│  - Shows message instantly  │
│  - Shows "SENDING..."       │
└──────┬──────────────────────┘
       │
       ├──────────────────────────┐
       │                          │
       ▼                          ▼
┌──────────────┐        ┌──────────────────┐
│  Store in DB │        │ /api/agent-       │
│  (Planner)   │        │  message          │
└──────────────┘        └────────┬──────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ uagent-client   │
                        │ Bridge          │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Agentverse      │
                        │ PLANNER Agent   │
                        └────────┬─────────┘
                                 │
                                 ▼
                        Agent processes request
                        Returns: "I'd be happy to help! 
                        Here are 3 additional activities..."
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Frontend        │
                        │ - Adds response │
                        │ - Stores in DB  │
                        │ - Shows badge   │
                        └─────────────────┘
```

## Start Everything

### Terminal 1: Planner Service
```powershell
cd d:\WanderLink\agents\src\services
python planner_service.py
```

### Terminal 2: Agent Bridge
```powershell
cd d:\WanderLink\agents\src
python simple_agent_service.py
```

### Terminal 3: Frontend
```powershell
cd d:\WanderLink\frontend
npm run dev
```

## Test the Integration

1. **Open the page**: `http://localhost:3000/agent-trips-v2`

2. **Get into a matched group**:
   - Either submit a new trip and wait for matching
   - Or use an existing matched group (it checks localStorage)

3. **Open group chat**: Click "OPEN GROUP CHAT" button

4. **Send a message**: 
   - Type: "Can you suggest more activities for day 2?"
   - Click "SEND"
   - Watch the button change to "SENDING..." with spinner

5. **See the response**:
   - Your message appears in green (YOU)
   - Agent response appears in blue with "AGENT RESPONSE" badge
   - Both messages are auto-saved to database
   - Polling will keep fetching new messages every 3 seconds

## Example Messages to Try

- "Can you add more activities to the itinerary?"
- "What's the best time to visit [destination]?"
- "Can you suggest budget-friendly restaurants?"
- "What should I pack for this trip?"
- "Are there any local customs I should know?"

## Message Styling Guide

| Message Type | Background | Badge | Label |
|-------------|-----------|-------|-------|
| Your messages | Green | - | 👤 YOU |
| Agent responses | Blue | AGENT RESPONSE | ✈️ PLANNER AGENT |
| System messages | Yellow | - | 🤖 SYSTEM |
| Itinerary | Purple | - | ✈️ PLANNER AGENT |
| Errors | Red | - | 🤖 SYSTEM |

## Changing Which Agent to Use

In `page.tsx` (around line 415), change the `agentType`:

```typescript
const agentRes = await fetch('/api/agent-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    groupId: groupId,
    userId: userId,
    agentType: 'planner' // Change to 'travel' or 'matchmaker'
  }),
})
```

## Troubleshooting

### "Unable to reach agent" error?
- ✅ Check agent addresses are correct in `.env.local`
- ✅ Verify agents are deployed on Agentverse
- ✅ Check browser console for detailed errors
- ✅ Confirm `uagent-client` is installed: `npm list uagent-client`

### Messages not appearing?
- ✅ Verify Planner service is running (port 8004)
- ✅ Check Agent Bridge is running (port 8001)
- ✅ Open browser DevTools Network tab, check API calls
- ✅ Look for 500/404 errors

### Bridge initialization slow?
Increase the delay in `route.ts`:
```typescript
await new Promise(resolve => setTimeout(resolve, 3000)); // was 2000
```

## What's Next?

Optional enhancements:
- Add typing indicator ("Agent is typing...")
- Support multiple agents in conversation
- Add message reactions/likes
- Implement quick reply suggestions
- Add rich media (maps, images)
- Voice message support
- Real-time WebSocket instead of polling

## Notes

- Messages are stored even if agent fails (resilient)
- Optimistic updates mean instant feedback
- Polling every 3s keeps everyone synchronized
- Fallback to agent bridge if planner fails
- All messages persist across page refreshes
