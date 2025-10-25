# 🎯 WanderLink Agents - Visual Guide

## 🏗️ **Agent Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      WANDERLINK PLATFORM                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Alice's     │      │  Bob's       │      │  Charlie's   │
│ TravelAgent  │      │ TravelAgent  │      │ TravelAgent  │
├──────────────┤      ├──────────────┤      ├──────────────┤
│ Tokyo        │      │ Tokyo        │      │ Paris        │
│ Mar 15-25    │      │ Mar 18-28    │      │ Apr 1-10     │
│ $2000-3500   │      │ $2500-4000   │      │ $1500-2500   │
│ Culture: 0.9 │      │ Foodie: 0.9  │      │ Art: 0.9     │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │    "Find Matches"   │                     │
       └──────────┬──────────┘                     │
                  │                                │
                  ▼                                │
         ┌─────────────────┐                       │
         │  MatchMaker     │◄──────────────────────┘
         │     Agent       │
         └────────┬────────┘
                  │
                  │ Runs Algorithm
                  │
                  ▼
      ┌──────────────────────┐
      │   SYNERGY SCORES     │
      ├──────────────────────┤
      │ Alice ↔ Bob: 85%  ✅ │
      │ Alice ↔ Charlie: 45% │
      │ Bob ↔ Charlie: 42%   │
      └──────────┬───────────┘
                 │
                 │ Create Groups
                 │
                 ▼
       ┌──────────────────┐
       │   MATCH FOUND!   │
       ├──────────────────┤
       │ Group: Alice+Bob │
       │ Score: 85%       │
       │ Tokyo, Japan     │
       │ Mar 18-25        │
       └──────────────────┘
```

---

## 🔄 **Agent Flow (What Happens)**

### Step 1: User Signs Up
```
USER CREATES ACCOUNT
        ↓
Frontend collects preferences:
  - Where do you want to go? → Tokyo
  - When? → March 15-25
  - Budget? → $2000-3500
  - Interests? → Culture, Food, Photos
        ↓
CREATE TravelAgent with these preferences
        ↓
Store in database
```

### Step 2: User Clicks "Find Matches"
```
USER: "Find my travel buddies!"
        ↓
Frontend calls: POST /api/ai/match
        ↓
Backend:
  1. Load user's TravelAgent
  2. Load other active TravelAgents
  3. Create MatchMakerAgent
  4. Run matching algorithm
        ↓
RESULTS: [
  { users: [Alice, Bob], score: 85% },
  { users: [Alice, Carol], score: 72% }
]
        ↓
Frontend displays matches
```

### Step 3: Agents Negotiate
```
MatchMaker: "Alice & Bob, you're 85% compatible!"
        ↓
Alice's Agent evaluates:
  ✓ Same destination
  ✓ Good date overlap (7 days)
  ✓ Compatible budget
  ✓ Both love food & culture
  → ACCEPT!
        ↓
Bob's Agent evaluates:
  ✓ High reputation (85/100)
  ✓ Similar travel style
  ✓ Flexible schedule
  → ACCEPT!
        ↓
MATCH CONFIRMED! 🎉
```

---

## 🧮 **Synergy Score Calculation**

### Example: Alice ↔ Bob

```javascript
// Alice's Preferences
{
  destination: "Tokyo, Japan",
  startDate: Mar 15,
  endDate: Mar 25,
  budget: { min: 2000, max: 3500 },
  activities: {
    culture: 0.9,   // 90% interest
    foodie: 0.8,    // 80% interest
    adventure: 0.6,
    nightlife: 0.5
  }
}

// Bob's Preferences
{
  destination: "Tokyo, Japan",
  startDate: Mar 18,
  endDate: Mar 28,
  budget: { min: 2500, max: 4000 },
  activities: {
    culture: 0.8,
    foodie: 0.9,
    adventure: 0.7,
    nightlife: 0.7
  }
}

// CALCULATION:
────────────────────────────────────────────────
1. Destination Match (30%)
   Both want Tokyo → 100% × 30% = 30 points

2. Date Overlap (20%)
   Mar 18-25 = 7 days overlap out of 10 days
   70% overlap × 20% = 14 points

3. Budget Compatibility (15%)
   Alice: $2000-3500, Bob: $2500-4000
   Overlap: $2500-3500 = good
   85% compatible × 15% = 12.75 points

4. Activity Match (20%)
   culture: |0.9 - 0.8| = 0.1 diff → 90% match
   foodie: |0.8 - 0.9| = 0.1 diff → 90% match
   adventure: |0.6 - 0.7| = 0.1 diff → 90% match
   Average: 90% × 20% = 18 points

5. Travel Style (15%)
   Similar preferences → 80% × 15% = 12 points
────────────────────────────────────────────────
TOTAL SYNERGY: 30+14+12.75+18+12 = 86.75%
✅ EXCELLENT MATCH!
```

---

## 🎭 **Agent Types & Their Roles**

### 1️⃣ **TravelAgent** (Individual)

**Job:** Represent ONE user

**Knows:**
- What the user wants (destination, dates, budget)
- User's interests (beach, culture, adventure)
- User's travel style (luxury vs budget)
- User's reputation score

**Can Do:**
- Calculate compatibility with other agents
- Accept or reject match proposals
- Negotiate group composition
- Update preferences

**Cannot Do:**
- Find matches on its own (needs MatchMaker)
- Talk to other agents directly
- Make decisions for other users

**Code Location:** `agents/src/TravelAgent.ts`

---

### 2️⃣ **MatchMakerAgent** (Coordinator)

**Job:** Find compatible groups

**Knows:**
- All active TravelAgents
- All pending match requests
- Matching algorithms
- Success rates

**Can Do:**
- Register new agents
- Run 3 matching algorithms:
  - Greedy (fast, highest scores)
  - Optimal (best overall groups)
  - Balanced (synergy + diversity)
- Manage multi-round negotiation
- Create final matches

**Cannot Do:**
- Make decisions for users
- Force agents to accept matches
- Access user's private data

**Code Location:** `agents/src/MatchMakerAgent.ts`

---

## 🔮 **Optional Agents (You Could Add)**

### 3️⃣ **PlannerAgent** (NEW - Optional)

**Job:** Generate trip itineraries

**Would Do:**
- Take group preferences
- Call ChatGPT/Claude API
- Generate day-by-day plans
- Estimate costs
- Suggest restaurants

**Code You'd Write:**
```typescript
class PlannerAgent {
  async generateItinerary(trip: Trip, group: TravelAgent[]) {
    const combinedInterests = this.mergePreferences(group)
    const itinerary = await this.callAI(combinedInterests)
    return itinerary
  }
}
```

**Priority:** LOW (nice to have, not essential)

---

### 4️⃣ **ChatAgent** (NEW - Optional)

**Job:** Smart group chat suggestions

**Would Do:**
- Monitor group chat
- Suggest activities based on discussion
- Answer trip questions
- Resolve conflicts

**Code You'd Write:**
```typescript
class ChatAgent {
  async analyzeChat(messages: Message[]) {
    // If users mention "food", suggest restaurants
    // If users mention "budget", recalculate costs
  }
}
```

**Priority:** LOW (nice to have, not essential)

---

## 📊 **Data Flow**

### Frontend → Agents → Frontend

```
┌─────────────────┐
│   FRONTEND      │
│   (Next.js)     │
└────────┬────────┘
         │
         │ 1. User clicks "Find Matches"
         │    POST /api/ai/match
         │    Body: { userId, preferences }
         │
         ▼
┌─────────────────┐
│   API ROUTE     │
│   (route.ts)    │
└────────┬────────┘
         │
         │ 2. Import agents
         │    import { TravelAgentImpl, MatchMakerAgent }
         │
         ▼
┌─────────────────┐
│   AGENTS        │
│   (TypeScript)  │
├─────────────────┤
│ • Create agent  │
│ • Register      │
│ • Find matches  │
│ • Negotiate     │
└────────┬────────┘
         │
         │ 3. Return results
         │    { matches: [...], scores: [...] }
         │
         ▼
┌─────────────────┐
│   API ROUTE     │
│   (route.ts)    │
└────────┬────────┘
         │
         │ 4. Send JSON response
         │    NextResponse.json(matches)
         │
         ▼
┌─────────────────┐
│   FRONTEND      │
│   (React)       │
├─────────────────┤
│ Display:        │
│ • Match cards   │
│ • Scores        │
│ • User profiles │
└─────────────────┘
```

---

## ⚡ **Quick Reference**

### When to Use Which Agent

| Scenario | Use This Agent | Code Example |
|----------|----------------|--------------|
| User signs up | Create TravelAgent | `new TravelAgentImpl(userId, prefs)` |
| User wants matches | Use MatchMaker | `matchMaker.findMatches(userId)` |
| Show compatibility | Use TravelAgent | `agent1.calculateSynergy(agent2)` |
| Generate itinerary | (NEW) PlannerAgent | `planner.generatePlan(trip)` |
| Smart chat | (NEW) ChatAgent | `chat.analyzeMentions(msgs)` |

---

## 🎯 **Summary for Person B**

### ✅ **What Exists (Already Built):**
1. **TravelAgent** - Each user's personal AI agent
2. **MatchMakerAgent** - Finds compatible groups
3. **Demo** - Working example with 2 agents matching

### 📝 **What You Need to Do:**
1. **Test** agents locally (`npm run dev`)
2. **Create** API routes in frontend
3. **Build** UI components with neobrutalism
4. **Connect** everything together

### ❌ **What You DON'T Need:**
1. Create new agents
2. Learn Fetch.ai Python SDK
3. Deploy to blockchain (mock works)
4. Complex AI training

### ⏱️ **Time Estimate:**
- Understanding: 30 mins
- Testing: 30 mins  
- Integration: 3 hours
- **Total: ~4 hours**

---

## 🚀 **Start Here**

```powershell
# Step 1: Go to agents folder
cd d:\WanderLink\agents

# Step 2: Install dependencies
npm install

# Step 3: Run the demo
npm run dev

# You'll see agents matching! 🎉
```

Then follow **PERSON_B_AI_GUIDE.md** for frontend integration!
