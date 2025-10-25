# 🤖 Person B - AI Implementation Guide

## ✅ What You've Completed

Great job on finishing the frontend! Now let's integrate the AI agents.

---

## 📊 Current AI Status

✅ **Already exists in `/agents`:**
- TravelAgent.ts (individual traveler agents)
- MatchMakerAgent.ts (coordinator agent)
- Demo files and integration guides

⏭️ **What you need to do:**
1. Set up the AI environment
2. Test the existing agents
3. Connect agents to your frontend
4. Add AI features to the UI

---

## 🚀 Step-by-Step Tasks

### Task 1: Setup & Test Agents (30 mins)

#### 1.1 Install Dependencies

```bash
cd agents
npm install
```

#### 1.2 Check What Exists

```bash
# List all files
ls src/

# You should see:
# - TravelAgent.ts
# - MatchMakerAgent.ts
# - fetchai-api.ts
# - demo-fetchai.ts
```

#### 1.3 Run the Demo

```bash
npm run dev
```

This should run the demo and show you how the agents work!

---

### Task 2: Understand the AI System (15 mins)

Read these files in order:

1. **`README.md`** - Overview of the agent system
2. **`src/TravelAgent.ts`** - Individual traveler agent
3. **`src/MatchMakerAgent.ts`** - Matchmaking coordinator
4. **`AI_SETUP_GUIDE.md`** - Your detailed implementation guide

**Key Concepts:**

- **TravelAgent**: Each user has one, stores preferences
- **MatchMakerAgent**: Finds compatible groups
- **Synergy Score**: Compatibility calculation (0-100)
- **Negotiation**: Multi-round matching process

---

### Task 3: Connect AI to Frontend (2-3 hours)

You need to create API routes in the frontend that call the AI agents.

#### 3.1 Create AI API Routes

**Create:** `frontend/app/api/ai/match/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { MatchMakerAgent } from '@/../../agents/src/MatchMakerAgent'

export async function POST(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json()
    
    // Create matchmaker instance
    const matchMaker = new MatchMakerAgent({
      minGroupSize: 2,
      maxGroupSize: 6,
      minSynergyScore: 60,
      maxNegotiationRounds: 5,
      matchingAlgorithm: 'balanced'
    })
    
    // Find matches (using mock data for now)
    // In production, fetch real user preferences from backend
    const matches = await matchMaker.findMatches(userId)
    
    return NextResponse.json({
      success: true,
      matches: matches.map(m => ({
        users: m.agents.map(a => a.userId),
        score: m.synergyScore,
        confidence: m.matchStrength
      }))
    })
  } catch (error) {
    console.error('AI matching error:', error)
    return NextResponse.json(
      { error: 'Matching failed' },
      { status: 500 }
    )
  }
}
```

**Create:** `frontend/app/api/ai/plan/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { destination, numDays, interests, budget, pace } = await request.json()
    
    // For now, return mock itinerary
    // TODO: Integrate with LangChain/OpenAI for real planning
    
    const mockItinerary = [
      {
        day: 1,
        title: "Arrival & Orientation",
        activities: [
          "Morning: Airport pickup and hotel check-in",
          "Afternoon: Walking tour of main attractions",
          "Evening: Welcome dinner at local restaurant"
        ],
        budget: "$150-200"
      },
      {
        day: 2,
        title: "Cultural Immersion",
        activities: [
          "Morning: Visit historical landmarks",
          "Lunch: Try authentic local cuisine",
          "Afternoon: Museum or gallery tour",
          "Evening: Sunset viewpoint"
        ],
        budget: "$100-150"
      },
      // Add more days based on numDays...
    ]
    
    return NextResponse.json({
      success: true,
      itinerary: mockItinerary,
      recommendations: [
        "Book accommodations in the city center",
        "Download offline maps before traveling",
        "Try the local street food markets"
      ],
      estimatedCost: `$${numDays * 100}-${numDays * 200}`
    })
  } catch (error) {
    console.error('AI planning error:', error)
    return NextResponse.json(
      { error: 'Planning failed' },
      { status: 500 }
    )
  }
}
```

---

### Task 4: Add AI Features to Frontend UI (2-3 hours)

#### 4.1 Create AI Chat Component

**Create:** `frontend/components/ai/AiMatchChat.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Sparkles, Users, Send } from 'lucide-react'

export default function AiMatchChat({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [message, setMessage] = useState('')

  const findMatches = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          preferences: {
            interests: ['Beach', 'Culture', 'Photography'],
            age: 28,
            budget: 'moderate',
            pace: 'moderate'
          }
        })
      })
      
      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Failed to find matches:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-400 to-pink-500 w-12 h-12 rounded-xl border-4 border-black flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black">AI MATCHMAKER</h3>
          <p className="text-sm text-gray-600 font-semibold">Find your perfect travel companions</p>
        </div>
      </div>

      {/* Find Matches Button */}
      <button
        onClick={findMatches}
        disabled={loading}
        className="w-full bg-black text-white px-6 py-4 rounded-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 mb-6"
      >
        {loading ? 'FINDING MATCHES...' : 'FIND MY MATCHES'}
      </button>

      {/* Matches List */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-black text-lg">YOUR TOP MATCHES</h4>
          {matches.map((match, idx) => (
            <div key={idx} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-2 border-black">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-bold">{match.users.length} travelers</span>
                </div>
                <span className="bg-green-400 px-3 py-1 rounded-full border-2 border-black font-black text-sm">
                  {Math.round(match.score)}% MATCH
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-600">
                Compatibility: {match.confidence}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

#### 4.2 Add AI to Trip Details Page

**Update:** `frontend/app/trips/[id]/page.tsx` (create if doesn't exist)

```typescript
'use client'

import { useParams } from 'next/navigation'
import { mockTrips } from '@/lib/mock-data'
import AiMatchChat from '@/components/ai/AiMatchChat'

export default function TripDetailsPage() {
  const params = useParams()
  const trip = mockTrips.find(t => t.id === params.id)

  if (!trip) {
    return <div>Trip not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left 2/3 */}
        <div className="lg:col-span-2">
          {/* Trip details here */}
          <h1 className="text-5xl font-black mb-4">{trip.title}</h1>
          {/* ... rest of trip details ... */}
        </div>

        {/* AI Sidebar - Right 1/3 */}
        <div className="lg:col-span-1">
          <AiMatchChat userId="current-user-id" />
        </div>
      </div>
    </div>
  )
}
```

---

### Task 5: Test Everything (1 hour)

#### 5.1 Test AI Agents Locally

```bash
cd agents
npm run dev
```

You should see agent matchmaking in action!

#### 5.2 Test Frontend Integration

```bash
cd frontend
npm run dev
```

Then:
1. Go to a trip details page
2. Click "FIND MY MATCHES"
3. See AI-generated matches appear

---

## 📋 Your AI Implementation Checklist

### Setup & Testing
- [ ] Run `cd agents && npm install`
- [ ] Run `npm run dev` to test agents
- [ ] Read TravelAgent.ts and MatchMakerAgent.ts
- [ ] Understand synergy calculation algorithm

### Frontend Integration
- [ ] Create `frontend/app/api/ai/match/route.ts`
- [ ] Create `frontend/app/api/ai/plan/route.ts`
- [ ] Create `frontend/components/ai/AiMatchChat.tsx`
- [ ] Add AI component to trip details page

### Optional Enhancements
- [ ] Add AI itinerary planner component
- [ ] Integrate OpenAI for smarter planning
- [ ] Add real-time agent status indicators
- [ ] Create AI recommendations on home page

---

## 🎯 Expected Time

- **Setup & Testing**: 30 mins
- **API Routes**: 1 hour
- **UI Components**: 2 hours
- **Integration & Testing**: 1 hour

**Total: ~4-5 hours**

---

## 🆘 Troubleshooting

### Agent Import Errors
```bash
# Make sure you're in agents folder
cd agents
npm install
npm run build  # Build TypeScript
```

### Frontend Can't Import Agents
The agents are in a separate folder. You have two options:

**Option 1: Copy agent logic to frontend**
```bash
cp -r agents/src frontend/lib/agents
```

**Option 2: Make API calls to separate agent service**
Run agents as a separate service and call via HTTP.

---

## 📚 Documentation to Read

1. **`agents/README.md`** - Current agent overview
2. **`agents/AI_SETUP_GUIDE.md`** - Detailed Fetch.ai setup
3. **`agents/REAL_FETCHAI_INTEGRATION.md`** - Production integration

---

## 🎉 You're Almost Done!

After completing these AI tasks, you'll have:
- ✅ Beautiful neobrutalism frontend
- ✅ AI-powered matchmaking
- ✅ Intelligent travel planning
- ✅ Complete user experience

Then you can help Person A with:
- Backend API integration
- Smart contract connection
- Final testing and deployment

**You're doing great! The AI part is actually mostly built - you just need to connect it to your beautiful frontend!** 🚀
