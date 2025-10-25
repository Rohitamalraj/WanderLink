# WanderLink Agent Integration Guide

## 🎯 Overview

This guide explains how the WanderLink frontend receives group creation responses from the Planner agent and displays them to users.

## 🔄 Complete Flow

```
User → Travel Agent → MatchMaker Agent → Planner Agent → Frontend (via Webhook) → User
```

### Step-by-Step Process:

1. **User sends travel preferences** via frontend
2. **Travel Agent** extracts preferences using ASI-1
3. **MatchMaker Agent** collects 3 users with same destination
4. **MatchMaker Agent** generates itinerary using ASI-1
5. **Planner Agent** receives group data and:
   - Creates the group
   - Distributes itinerary to all members
   - **Sends webhook to frontend** with group data
6. **Frontend** stores group in Supabase
7. **Frontend** polls for group status and displays to user

## 📁 Files Created/Modified

### Frontend Files

#### 1. API Routes

- **`/app/api/planner-listener/route.ts`** - NEW
  - Receives webhook from Planner agent
  - Stores group data in Supabase
  - Provides GET endpoint to poll for group status

- **`/app/api/agent-webhook/route.ts`** - UPDATED
  - Enhanced to handle travelers and group_info data

- **`/app/api/agent-message/route.ts`** - EXISTING
  - Sends messages to agents

#### 2. React Hooks

- **`/hooks/useGroupStatus.ts`** - NEW
  - Custom hook for polling group status
  - Auto-refreshes every 5 seconds
  - Triggers callback when group is found

#### 3. Components

- **`/components/GroupStatusMonitor.tsx`** - NEW
  - Displays group creation status
  - Shows waiting state while matching
  - Displays full group details and itinerary
  - Shows notification when group is created

#### 4. Test Page

- **`/app/test-group-flow/page.tsx`** - NEW
  - Complete testing interface
  - Send messages to Travel Agent
  - Monitor group creation in real-time

#### 5. Types

- **`/lib/supabase.ts`** - UPDATED
  - Added `AgentGroup` interface
  - Added `GroupMessage` interface
  - Added `PlannerBridgeMessage` interface

### Backend (Python Agent) Files

#### 1. Planner Agent

- **`/agents/src/agents/planner_agent.py`** - UPDATED
  - Added `aiohttp` import for webhook calls
  - Added `WEBHOOK_URL` constant
  - Added `send_webhook()` function
  - Sends group data to frontend after creation

## 🗄️ Database Schema

### Required Supabase Tables

#### `agent_groups`
```sql
CREATE TABLE agent_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id TEXT UNIQUE NOT NULL,
  destination TEXT NOT NULL,
  members TEXT[] NOT NULL,
  member_count INTEGER NOT NULL,
  travelers JSONB,
  itinerary TEXT NOT NULL,
  status TEXT DEFAULT 'matched',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `group_messages`
```sql
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_agent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `planner_bridge_messages`
```sql
CREATE TABLE planner_bridge_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_agent BOOLEAN DEFAULT FALSE,
  sender TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
```

## ⚙️ Configuration

### 1. Update Planner Agent Webhook URL

Edit `/agents/src/agents/planner_agent.py`:

```python
WEBHOOK_URL = "https://your-actual-domain.com/api/agent-webhook"
```

Replace with your deployed frontend URL or use ngrok for local testing:

```bash
ngrok http 3000
# Use the ngrok URL: https://xxxx.ngrok.io/api/agent-webhook
```

### 2. Environment Variables

Ensure these are set in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Agent Addresses
TRAVEL_AGENT_ADDRESS=agent1q...
MATCHMAKER_ADDRESS=agent1q...
PLANNER_ADDRESS=agent1qdp7kupk4agz8nnevejljzdskur5x9nrqy8eec2t42hnqpca2mdmzscfdpj
```

### 3. Install Python Dependencies

```bash
cd agents
pip install aiohttp
```

## 🧪 Testing

### Option 1: Use Test Page

1. Navigate to `http://localhost:3000/test-group-flow`
2. Enter your user ID (agent address)
3. Send travel preferences
4. Watch the group status monitor

### Option 2: Manual Testing

```typescript
// Send message to Travel Agent
const response = await fetch('/api/agent-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Summer vacation in Goa, 4 days',
    agentType: 'travel',
    userId: 'your_agent_address'
  })
});

// Poll for group status
const groupStatus = await fetch('/api/planner-listener?userId=your_agent_address');
const data = await groupStatus.json();
console.log(data);
```

### Option 3: Use the Component

```tsx
import { GroupStatusMonitor } from '@/components/GroupStatusMonitor';

function MyPage() {
  return (
    <GroupStatusMonitor 
      userId="your_agent_address"
      onGroupCreated={(group) => {
        console.log('Group created!', group);
      }}
    />
  );
}
```

## 📊 API Endpoints

### POST `/api/agent-message`
Send message to any agent (Travel, MatchMaker, or Planner)

**Request:**
```json
{
  "message": "Summer vacation in Goa, 4 days",
  "agentType": "travel",
  "userId": "agent1q..."
}
```

**Response:**
```json
{
  "response": "✅ Preferences received!",
  "success": true,
  "agentType": "travel",
  "timestamp": "2025-10-25T13:47:17.635Z"
}
```

### POST `/api/agent-webhook`
Receives group creation data from Planner agent (webhook)

**Request:**
```json
{
  "group_id": "uuid",
  "destination": "Goa",
  "members": ["agent1q...", "agent1q...", "agent1q..."],
  "travelers": [...],
  "itinerary": "...",
  "group_info": {...}
}
```

### GET `/api/planner-listener?userId=xxx`
Poll for group status for a specific user

**Response (waiting):**
```json
{
  "status": "waiting",
  "in_group": false,
  "message": "No group found yet"
}
```

**Response (in group):**
```json
{
  "status": "in_group",
  "in_group": true,
  "group": {
    "group_id": "...",
    "destination": "Goa",
    "members": [...],
    "itinerary": "...",
    ...
  },
  "messages": [...]
}
```

## 🔍 Debugging

### Check Agent Logs (Agentverse)

Look for these log messages in the Planner agent:

```
✅ GROUP CREATION COMPLETE
📤 Sending webhook to frontend...
✅ Webhook sent successfully
```

### Check Frontend Console

```javascript
// Enable verbose logging
console.log('🔍 Checking for groups for user:', userId);
console.log('✅ Group found:', groupData);
```

### Check Supabase

```sql
-- Check if group was stored
SELECT * FROM agent_groups ORDER BY created_at DESC LIMIT 5;

-- Check group messages
SELECT * FROM group_messages WHERE group_id = 'your_group_id';

-- Check bridge messages
SELECT * FROM planner_bridge_messages ORDER BY created_at DESC LIMIT 10;
```

## 🚨 Common Issues

### 1. Webhook Not Receiving Data

**Problem:** Planner agent can't reach your frontend

**Solutions:**
- Use ngrok for local development
- Ensure WEBHOOK_URL is correct in planner_agent.py
- Check firewall/CORS settings

### 2. Group Not Showing in Frontend

**Problem:** Data stored but not displayed

**Solutions:**
- Check userId matches exactly (case-sensitive)
- Verify Supabase permissions
- Check browser console for errors

### 3. Agent Communication Failing

**Problem:** Agents not sending/receiving messages

**Solutions:**
- Verify agent addresses in .env.local
- Check Agentverse agent status (running?)
- Ensure agents are published with manifests

## 📝 Next Steps

1. **Deploy Frontend:** Deploy to Vercel/Netlify and update WEBHOOK_URL
2. **Add Authentication:** Secure the webhook endpoint
3. **Add Real-time Updates:** Use Supabase Realtime instead of polling
4. **Add Notifications:** Email/SMS when group is created
5. **Add Group Chat:** Allow members to message each other

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Travel agent responds with "Preferences received"
2. ✅ After 3 users, MatchMaker logs show "Group is ready"
3. ✅ Planner logs show "GROUP CREATION COMPLETE"
4. ✅ Planner logs show "Webhook sent successfully"
5. ✅ Frontend shows group details with itinerary
6. ✅ Supabase has records in agent_groups table

## 📞 Support

If you encounter issues:
1. Check the logs (Agentverse + Browser Console)
2. Verify all environment variables
3. Test each component individually
4. Review this guide step-by-step
