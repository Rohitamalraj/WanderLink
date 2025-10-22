# 🚀 Quick Start: ASI:One Compatible Agents

## What Changed

Your WanderLink agents now use the **ASI:One compatible chat protocol**! This means:

✅ Discoverable in ASI:One Chat
✅ Natural language conversations
✅ Standardized message format
✅ Ready for Agentverse deployment

## Installation

```bash
# 1. Navigate to agents directory
cd D:\WanderLink\agents

# 2. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 3. Install chat protocol support
pip install uagents-core

# 4. Verify installation
python -c "from uagents_core.contrib.protocols.chat import ChatMessage; print('✅ Chat protocol ready!')"
```

## Test Locally

```bash
# Terminal 1: Start MatchMaker
cd D:\WanderLink\agents
python src\matchmaker_agent.py

# Terminal 2: Start Planner
cd D:\WanderLink\agents
python src\planner_agent.py
```

Expected output:
```
==============================================================
🤝 WanderLink MatchMaker Agent Started!
==============================================================
Agent Name: wanderlink_matchmaker
Agent Address: agent1q...
💬 Chat Protocol: ENABLED
==============================================================
```

## Deploy to Agentverse

### Step 1: Get ASI:One API Key

1. Go to https://asi1.ai/dashboard/api-keys
2. Create account
3. Generate API key
4. Save it (you'll need this!)

### Step 2: Prepare MatchMaker for Agentverse

1. Open Agentverse: https://agentverse.ai
2. Click "Create New Agent"
3. Name: `WanderLink MatchMaker`
4. Copy code from `src/matchmaker_agent.py`
5. **REMOVE these lines** (Agentverse provides these):
   ```python
   port=8001,
   endpoint=["http://localhost:8001/submit"]
   ```
6. Add environment variable in Agentverse:
   - Key: `ASI_API_KEY`
   - Value: your_asi_api_key

7. Update README with:
```markdown
# WanderLink MatchMaker

I specialize in finding compatible travel companions!

**What I do:**
- Match travelers by destination, budget, and interests
- Calculate compatibility scores
- Use AI for intelligent matching

**Example queries:**
- "Find me travel companions for Tokyo in November"
- "Match me with adventure travelers, budget $1500-2500"
- "Looking for culture enthusiasts going to Paris"
```

8. Click "Start Agent"

### Step 3: Prepare Planner for Agentverse

1. Create another agent in Agentverse
2. Name: `WanderLink Planner`
3. Copy code from `src/planner_agent.py`
4. **REMOVE these lines**:
   ```python
   port=8002,
   endpoint=["http://localhost:8002/submit"]
   ```
5. Add ASI_API_KEY environment variable

6. Update README with:
```markdown
# WanderLink Planner

I create personalized travel itineraries!

**What I do:**
- Generate day-by-day travel plans
- Optimize budgets
- Recommend activities and restaurants

**Example queries:**
- "Plan a 7-day Tokyo trip, $150/day, love culture and food"
- "Create a relaxed Bali itinerary for wellness"
- "Plan 10-day adventure trip to Iceland"
```

7. Click "Start Agent"

### Step 4: Test in ASI:One Chat

1. Go to https://chat.asi1.ai
2. Toggle **"Agents"** ON (top right)
3. Ask: *"Connect me to an agent that finds travel companions"*
4. ASI:One will discover your MatchMaker agent!
5. Click "Chat with Agent"

**Test conversation:**
```
You: Looking for Tokyo trip, Nov 15-22, $1000-2000 budget, 
     love culture and food, social traveler

MatchMaker: ✨ Found 3 Compatible Travel Matches!

Match #1 - 87% Compatible
📍 Destination: Tokyo, Japan
💰 Budget: $1200
🎯 Confidence: High
```

## Code Changes Summary

### MatchMaker Agent

**Old (Custom chat):**
```python
class ChatMessage(Model):
    session_id: str
    message: str
    timestamp: str

@chat_protocol.on_message(model=ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    text = msg.message
    # process...
```

**New (ASI:One compatible):**
```python
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    EndSessionContent,
    chat_protocol_spec,
)

chat_protocol = Protocol(name="MatchMakerChat", spec=chat_protocol_spec)

@chat_protocol.on_message(model=ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    # Send acknowledgement
    await ctx.send(
        sender,
        ChatAcknowledgement(timestamp=datetime.now(), acknowledged_msg_id=msg.msg_id),
    )
    
    # Extract text
    text = ''
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text
    
    # Process and respond
    await ctx.send(sender, ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[
            TextContent(type="text", text=response_text),
            EndSessionContent(type="end-session"),
        ]
    ))
```

### Key Changes:

1. **Import chat protocol**: `from uagents_core.contrib.protocols.chat import ...`
2. **Use spec**: `Protocol(spec=chat_protocol_spec)`
3. **Send acknowledgements**: `ChatAcknowledgement(...)`
4. **Extract text from content**: `for item in msg.content`
5. **Wrap response**: `TextContent(type="text", text=...)`
6. **Signal end**: `EndSessionContent(type="end-session")`

## Troubleshooting

### "Module uagents_core not found"
```bash
pip install uagents-core
```

### "Chat protocol not working"
Check imports:
```python
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)
```

### "Agent not discovered in ASI:One"
- Ensure agent is **running** in Agentverse
- Add more **keywords** in README
- Check `publish_manifest=True` in agent.include()

### "ASI:One API error"
- Verify API key is correct
- Check environment variable is set
- Regenerate key if needed

## Files Modified

✅ `src/matchmaker_agent.py`
- Added ASI:One chat protocol
- Updated message handlers
- Added acknowledgements

✅ `src/planner_agent.py`
- Added ASI:One chat protocol
- Updated message handlers
- Added acknowledgements

✅ `requirements.txt`
- Added `uagents-core>=0.1.0`

✅ `AGENTVERSE_DEPLOYMENT.md`
- Updated with ASI:One instructions

## Next Steps

1. ✅ Install uagents-core
2. ✅ Test agents locally
3. 🔜 Deploy to Agentverse
4. 🔜 Test in ASI:One Chat
5. 🔜 Monitor usage

## Resources

- **ASI:One Docs**: https://docs.fetch.ai/guides/agents/intermediate/ai-engine-compatible-agent
- **Agentverse**: https://agentverse.ai
- **ASI:One Chat**: https://chat.asi1.ai
- **uAgents**: https://docs.fetch.ai/guides/agents/getting-started/whats-an-agent

---

**🎉 Your agents are now ASI:One compatible!**

Ready to be discovered by users worldwide through natural conversation! 🌍✨
