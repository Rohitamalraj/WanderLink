# 🤖 How to Create & Use WanderLink Agents

## 📊 **GOOD NEWS: Agents Already Exist!**

You **DON'T need to create agents from scratch**. They're already built in `agents/src/`. You just need to:
1. Understand what each agent does
2. Test them locally
3. Connect them to your frontend

---

## 🏗️ **What Agents Already Exist**

### ✅ 1. **TravelAgent** (`src/TravelAgent.ts`)
**Purpose:** Represents ONE individual traveler

**What it does:**
- Stores user's travel preferences (destination, dates, budget)
- Stores activity preferences (culture, adventure, food, etc.)
- Calculates compatibility with other travelers (synergy score)
- Negotiates to join groups
- Makes decisions (accept/reject matches)

**Real-world analogy:** Your personal AI assistant that knows what kind of trip you want and finds compatible travel buddies.

**Example:**
```typescript
const alice = new TravelAgentImpl(
  'agent-alice',              // Unique ID
  '0x1234...alice',           // Wallet address
  {
    destination: 'Tokyo, Japan',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-25'),
    budget: { min: 2000, max: 3500, currency: 'USD' },
    activities: {
      culture: 0.9,    // LOVES culture (0-1 scale)
      foodie: 0.8,     // Loves food
      adventure: 0.6,  // Moderate adventure
      nightlife: 0.5,  // Some nightlife
    },
    travelStyle: {
      luxury: 0.6,       // Mid-luxury
      flexibility: 0.7,  // Pretty flexible
      socialLevel: 0.8,  // Very social
    }
  },
  85  // Reputation score (0-100)
);
```

---

### ✅ 2. **MatchMakerAgent** (`src/MatchMakerAgent.ts`)
**Purpose:** The "dating app algorithm" for travel groups

**What it does:**
- Collects all TravelAgents looking for matches
- Runs smart algorithms to find compatible groups
- Manages negotiation between agents
- Creates optimal groups based on:
  - Destination match
  - Date overlap
  - Budget compatibility
  - Activity preferences
  - Travel style

**Real-world analogy:** Like Tinder, but for travel groups - it finds your perfect trip companions.

**Example:**
```typescript
const matchMaker = new MatchMakerAgent({
  minGroupSize: 2,           // At least 2 people
  maxGroupSize: 6,           // Max 6 people per group
  minSynergyScore: 60,       // Must have 60%+ compatibility
  maxNegotiationRounds: 5,   // Try 5 times to find match
  matchingAlgorithm: 'balanced'  // Use balanced algorithm
});

// Register travelers
await matchMaker.registerAgent(alice);
await matchMaker.registerAgent(bob);
await matchMaker.registerAgent(charlie);

// Find matches for Alice
const matches = await matchMaker.findMatches('agent-alice');
// Returns: [{ agents: [alice, bob], synergyScore: 85 }]
```

---

## 🎯 **What Agents Should You Create?**

### Answer: **NONE! Just use what exists.**

But here's what you CAN add if you want (optional enhancements):

### 🔮 Optional: AI Planning Agent (NEW)
**Purpose:** Generate smart travel itineraries

```typescript
// You could create this in: src/PlannerAgent.ts
export class PlannerAgent {
  async generateItinerary(trip: Trip, groupPreferences: TravelPreferences[]) {
    // Use ChatGPT/Claude API to create daily plans
    // Based on group's combined preferences
    return {
      days: [
        { day: 1, activities: [...], estimatedCost: 150 },
        { day: 2, activities: [...], estimatedCost: 200 },
      ]
    }
  }
}
```

### 💬 Optional: Chat Agent (NEW)
**Purpose:** Handle real-time group chat with AI suggestions

```typescript
// You could create this in: src/ChatAgent.ts
export class ChatAgent {
  async suggestActivities(chat: Message[], groupPrefs: TravelPreferences) {
    // Analyze chat messages
    // Suggest activities the group might like
  }
}
```

---

## 🚀 **How to Use Existing Agents (Step-by-Step)**

### Step 1: Install Dependencies (5 mins)

```powershell
cd d:\WanderLink\agents
npm install
```

### Step 2: Test the Agents (10 mins)

**Run the demo:**
```powershell
npm run dev
```

This runs `demo-fetchai.ts` which shows:
- Creating 2 travel agents (Alice & Bob)
- Calculating their compatibility
- MatchMaker finding them a group
- Negotiation process
- Final match result

**You should see output like:**
```
🌍 WanderLink - Mock Agent Demo
✓ Created Alice (wants Tokyo, culture lover)
✓ Created Bob (wants Tokyo, foodie)
🔍 Synergy: 85% - Great match!
✅ Match successful!
```

### Step 3: Understand the Agent Flow

```
USER SIGNS UP
    ↓
CREATE TravelAgent (stores preferences)
    ↓
USER CLICKS "FIND MATCHES"
    ↓
TravelAgent → MatchMakerAgent
    ↓
MatchMaker runs algorithm
    ↓
Finds compatible groups
    ↓
Agents negotiate (accept/reject)
    ↓
MATCH CREATED
    ↓
Frontend shows: "You matched with Bob & Charlie!"
```

---

## 🔗 **How to Connect Agents to Frontend**

### Architecture:

```
FRONTEND (Next.js)
    ↓ HTTP Request
API ROUTE (/api/ai/match)
    ↓ Import & Call
AGENTS (TypeScript)
    ↓ Return Results
API ROUTE
    ↓ JSON Response
FRONTEND (Display matches)
```

### Step-by-Step Integration:

#### 1. Create API Route (frontend)

**File:** `frontend/app/api/ai/match/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { TravelAgentImpl } from '@/../agents/src/TravelAgent'
import { MatchMakerAgent } from '@/../agents/src/MatchMakerAgent'

export async function POST(request: NextRequest) {
  const { userId, preferences } = await request.json()
  
  // Create user's travel agent
  const userAgent = new TravelAgentImpl(
    `agent-${userId}`,
    preferences.walletAddress,
    preferences,
    preferences.reputation || 50
  )
  
  // Create matchmaker
  const matchMaker = new MatchMakerAgent({
    minGroupSize: 2,
    maxGroupSize: 6,
    minSynergyScore: 60,
  })
  
  // Register agent and find matches
  await matchMaker.registerAgent(userAgent)
  
  // In production, load other agents from database
  // For now, use mock data
  const matches = await matchMaker.findMatches(`agent-${userId}`)
  
  return NextResponse.json({
    success: true,
    matches: matches.map(m => ({
      users: m.agents.map(a => a.id),
      compatibility: m.synergyScore,
      destination: m.destination,
      estimatedCost: m.estimatedCost
    }))
  })
}
```

#### 2. Call from Frontend

**File:** `frontend/components/FindMatches.tsx`

```typescript
'use client'
import { useState } from 'react'

export default function FindMatches({ userId, preferences }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  const findMatches = async () => {
    setLoading(true)
    
    const response = await fetch('/api/ai/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, preferences })
    })
    
    const data = await response.json()
    setMatches(data.matches)
    setLoading(false)
  }

  return (
    <div>
      <button onClick={findMatches} disabled={loading}>
        {loading ? 'Finding matches...' : 'FIND MY TRAVEL BUDDIES'}
      </button>
      
      {matches.map((match, i) => (
        <div key={i}>
          <h3>Match #{i + 1}</h3>
          <p>Compatibility: {match.compatibility}%</p>
          <p>Destination: {match.destination}</p>
          <p>Estimated Cost: ${match.estimatedCost}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 📝 **Your Task Checklist**

### Phase 1: Understanding (30 mins)
- [ ] Read `agents/README.md`
- [ ] Read `agents/src/TravelAgent.ts` (first 100 lines)
- [ ] Read `agents/src/MatchMakerAgent.ts` (first 100 lines)
- [ ] Understand: 1 TravelAgent per user, 1 MatchMaker for everyone

### Phase 2: Testing (30 mins)
- [ ] Run `cd agents && npm install`
- [ ] Run `npm run dev` to see demo
- [ ] Modify demo to add your own test traveler
- [ ] See how synergy score changes

### Phase 3: Integration (3 hours)
- [ ] Create `frontend/app/api/ai/match/route.ts`
- [ ] Create `frontend/components/ai/AiMatchFinder.tsx`
- [ ] Add "Find Matches" button to trip page
- [ ] Display results with neobrutalism styling
- [ ] Test end-to-end flow

---

## 🎨 **Agent Properties Explained**

### When Creating a TravelAgent, You Need:

| Property | Type | Example | What It Means |
|----------|------|---------|---------------|
| `destination` | string | "Tokyo, Japan" | Where they want to go |
| `startDate` | Date | March 15, 2025 | Trip start |
| `endDate` | Date | March 25, 2025 | Trip end |
| `budget.min/max` | number | $2000-$3500 | Budget range |
| `activities.*` | 0-1 | `culture: 0.9` | 0=hate, 1=love |
| `travelStyle.luxury` | 0-1 | `0.6` | 0=budget, 1=luxury |
| `travelStyle.flexibility` | 0-1 | `0.7` | 0=rigid, 1=flexible |
| `travelStyle.socialLevel` | 0-1 | `0.8` | 0=quiet, 1=social |

### Synergy Score Calculation:

```
SYNERGY = 
  30% × Destination Match (same city = 100%)
+ 20% × Date Overlap (more overlap = higher)
+ 15% × Budget Compatibility (similar budget = higher)
+ 20% × Activity Match (similar interests = higher)
+ 15% × Travel Style Match (similar style = higher)
```

---

## 🔥 **Quick Start (5 Minutes)**

```powershell
# 1. Go to agents folder
cd d:\WanderLink\agents

# 2. Install
npm install

# 3. Run demo
npm run dev

# 4. See agents in action! ✨
```

---

## 🎯 **Summary**

### ✅ What You Have:
- TravelAgent (individual traveler agent)
- MatchMakerAgent (group matching coordinator)
- Working demo with negotiation
- Complete TypeScript implementation

### 🎨 What You Need to Do:
1. **Test** the existing agents (30 mins)
2. **Create API routes** in frontend to call agents (2 hours)
3. **Build UI components** to display matches (2 hours)
4. **Style** with your neobrutalism design (1 hour)

### ❌ What You DON'T Need:
- Create new agents from scratch
- Learn Python (already TypeScript)
- Set up Fetch.ai network (mock works for demo)

---

## 🆘 **Troubleshooting**

### Problem: "Cannot find module 'TravelAgent'"
**Solution:**
```powershell
cd agents
npm run build  # Compile TypeScript
```

### Problem: "Import error in frontend"
**Solution:**
Agents are in separate folder. Either:
1. Import relatively: `import { ... } from '@/../agents/src/...'`
2. Or copy agent logic to frontend lib folder

### Problem: "Agents not finding matches"
**Solution:**
- Matchmaker needs at least 2 registered agents
- Check `minSynergyScore` isn't too high
- Ensure preferences overlap (same destination helps)

---

## 🚀 **Next Steps**

1. Read this guide
2. Run the demo (`npm run dev`)
3. Follow **PERSON_B_AI_GUIDE.md** for frontend integration
4. Build your AI-powered travel platform! 🌍✨

**You're almost done - the hard part (AI agents) is already built!**
