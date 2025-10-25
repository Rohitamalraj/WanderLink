# 🚀 WanderLink - ASI-1 Agent Implementation

## ✅ IMPLEMENTATION COMPLETE!

You now have a **working ASI-1 powered agent system** for WanderLink!

---

## 🎯 What's Built

### 1. **MatchMaker Agent** (`agents/src/agents/matchmaker_agent_asi.py`)
- Receives trip proposals from multiple users
- Pools travelers (min 3 people)
- Uses greedy-swap algorithm to form compatible groups
- Generates combined itineraries using ASI-1 LLM
- Sends itineraries to all group members

### 2. **Travel Agent** (`agents/src/agents/travel_agent_asi.py`)
- Receives natural language trip requests
- Uses ASI-1 to extract structured preferences
- Forwards to MatchMaker agent
- Waits for group formation

### 3. **Agent Service API** (`agents/src/agent_service.py`)
- REST API for frontend integration
- `/api/extract-preferences` - Extract structured data from NLP
- `/api/find-matches-nlp` - Find matches using ASI-1

---

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
cd D:\WanderLink\agents
pip install -r requirements.txt
```

### 2. Set Environment Variables
Create/update `.env` file:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# ASI-1 API (already configured)
ASI_API_KEY=sk_7aa8a96be59b426695dcd1a2ee00e5807c2903f9c43b4f1c8d84d8fb52ac62a4
```

### 3. Start Agent Service
```powershell
cd D:\WanderLink\agents
python src\agent_service.py
```

### 4. Start MatchMaker Agent (Optional - for full agent-to-agent)
```powershell
cd D:\WanderLink\agents
python src\agents\matchmaker_agent_asi.py
```

### 5. Start Travel Agent (Optional - for full agent-to-agent)
```powershell
cd D:\WanderLink\agents
python src\agents\travel_agent_asi.py
```

---

## 📡 API Endpoints

### Extract Preferences (NLP)
```bash
POST http://localhost:8000/api/extract-preferences
Content-Type: application/json

{
  "userId": "user123",
  "nlpInput": "I want a relaxing beach vacation in Bali for 7 days with yoga and good food"
}

# Response:
{
  "success": true,
  "preferences": {
    "destination": "Bali",
    "duration": "7 days",
    "budget": "$2000-3000",
    "travel_type": "relaxation",
    "group_type": "small group",
    "interests": ["beach", "yoga", "food"]
  }
}
```

### Find Matches
```bash
POST http://localhost:8000/api/find-matches-nlp
Content-Type: application/json

{
  "userId": "user123",
  "nlpInput": "I want adventure in Thailand for 10 days"
}

# Response:
{
  "matches": [...],
  "parsed_preferences": {...}
}
```

---

## 🔄 How It Works

### Scenario: 3 Users Want to Travel

**User 1**: "I want beach vacation in Bali for 7 days"
**User 2**: "Looking for Bali trip, love beaches and food"
**User 3**: "Beach holiday in Bali, 1 week"

### Step 1: Users Submit Requests
```
User 1 → Travel Agent → ASI-1 Extracts Preferences → MatchMaker
User 2 → Travel Agent → ASI-1 Extracts Preferences → MatchMaker
User 3 → Travel Agent → ASI-1 Extracts Preferences → MatchMaker
```

### Step 2: MatchMaker Pools & Groups
```
MatchMaker receives 3 trips:
1. {destination: "Bali", travel_type: "beach", duration: "7 days"}
2. {destination: "Bali", travel_type: "beach", duration: "7 days"}
3. {destination: "Bali", travel_type: "beach", duration: "7 days"}

Similarity scores:
- Trip 1 ↔ Trip 2: 0.85 ✅
- Trip 1 ↔ Trip 3: 0.90 ✅
- Trip 2 ↔ Trip 3: 0.88 ✅

✅ Group formed! (all 3 compatible)
```

### Step 3: ASI-1 Generates Itinerary
```
MatchMaker calls ASI-1:
"Generate combined itinerary for 3 travelers going to Bali for 7 days, 
all interested in beach activities and food..."

ASI-1 returns:
📋 7-Day Bali Beach & Food Adventure
Day 1: Arrival & Seminyak Beach
Day 2: Surfing lessons at Canggu
Day 3: Food tour in Ubud
...
Day 7: Sunset at Tanah Lot
```

### Step 4: Users Receive Itinerary
```
User 1 ← "✅ Group formed! Here's your itinerary..."
User 2 ← "✅ Group formed! Here's your itinerary..."
User 3 ← "✅ Group formed! Here's your itinerary..."
```

---

## 🎨 Matching Algorithm

### Greedy-Swap Grouping

Similarity score based on:
- **Destination** (0.5 weight) - Same destination = high match
- **Travel Type** (0.3 weight) - Adventure, relaxation, culture, etc.
- **Duration** (0.2 weight) - Within 2 days = compatible

**Threshold**: 0.6 (60% similarity minimum)

Example:
```python
Trip A: {destination: "Bali", type: "beach", duration: 7}
Trip B: {destination: "Bali", type: "beach", duration: 8}

Similarity = 0.5 (destination) + 0.3 (type) + 0.2 (duration) = 1.0 ✅
```

---

## 🔧 Configuration

### Minimum Group Size
In `matchmaker_agent_asi.py`:
```python
MIN_GROUP_SIZE = 3  # Change this to require more/fewer people
```

### Similarity Threshold
In `matchmaker_agent_asi.py`:
```python
def greedy_swap_grouping(trips, threshold=0.6):  # Adjust threshold
```

### ASI-1 Model
In both agent files:
```python
model="asi1-mini"  # Use "asi1-mini" for speed or other models
```

---

## 📊 Frontend Integration

### 1. Update Trip Search Component

```typescript
// frontend/app/trips/page.tsx

async function handleFindMatches(nlpInput: string) {
  const response = await fetch('http://localhost:8000/api/extract-preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      nlpInput: nlpInput
    })
  });
  
  const data = await response.json();
  
  // Use extracted preferences to find matches
  const matches = await fetch('http://localhost:8000/api/find-matches-nlp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      nlpInput: nlpInput
    })
  });
  
  // Display matches
  setMatches(matches.data.matches);
}
```

### 2. Add NLP Input Modal

```typescript
// frontend/components/NLPTripModal.tsx (already exists!)

<textarea 
  placeholder="Describe your dream trip...
  
Example: I want a relaxing beach vacation in Bali for 7 days with yoga and good food"
  onChange={(e) => setNlpInput(e.target.value)}
/>

<button onClick={() => handleFindMatches(nlpInput)}>
  Find My Travel Tribe
</button>
```

---

## 🧪 Testing

### Test 1: Extract Preferences
```powershell
curl -X POST http://localhost:8000/api/extract-preferences `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test123",
    "nlpInput": "I want adventure in Thailand for 10 days, love hiking and street food"
  }'
```

Expected output:
```json
{
  "success": true,
  "preferences": {
    "destination": "Thailand",
    "duration": "10 days",
    "travel_type": "adventure",
    "interests": ["hiking", "street food"]
  }
}
```

### Test 2: Find Matches
```powershell
curl -X POST http://localhost:8000/api/find-matches-nlp `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test123",
    "nlpInput": "Beach vacation in Bali, 1 week"
  }'
```

---

## 🎯 Next Steps

### Phase 1: Current Implementation ✅
- ✅ ASI-1 preference extraction
- ✅ Greedy-swap matching
- ✅ Combined itinerary generation
- ✅ Agent-to-agent communication

### Phase 2: Web3 Integration (Next)
- [ ] Deploy smart contracts (TripFactory, WanderToken)
- [ ] Integrate Avail Network for staking
- [ ] Add Lit Protocol KYC
- [ ] Blockchain transaction logging

### Phase 3: Production Ready
- [ ] Deploy agents to Fetch.ai Agentverse
- [ ] Add real-time notifications
- [ ] Implement payment escrow
- [ ] Launch! 🚀

---

## 📝 Files Created

1. `agents/src/agents/matchmaker_agent_asi.py` - MatchMaker agent
2. `agents/src/agents/travel_agent_asi.py` - Travel agent
3. `agents/src/agent_service.py` - Updated with ASI-1 endpoints

---

## 🎉 You're Ready!

**The ASI-1 agent system is fully implemented and ready to use!**

Start the agent service and test the `/api/extract-preferences` endpoint! 🚀

---

**Status**: ✅ **READY TO TEST**  
**Next**: Start agent service and try the API endpoints!
