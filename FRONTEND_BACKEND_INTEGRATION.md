# WanderLink Frontend-Backend Integration Guide

## Overview
This guide explains how the WanderLink frontend connects with the AI-powered agent backend for intelligent travel matching and itinerary generation.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Trips      │  │  Dashboard   │  │   Verify     │          │
│  │   Page       │  │    Page      │  │   Page       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                    ┌───────▼────────┐                           │
│                    │   API Routes   │                           │
│                    └───────┬────────┘                           │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Agent Service   │
                    │  (Port 8000)     │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼─────┐    ┌────────▼──────┐   ┌────────▼──────┐
│ MatchMaker  │◄──►│    Planner    │   │ Verification  │
│  Agent      │    │    Agent      │   │    Agent      │
│ (Port 8001) │    │  (Port 8002)  │   │ (Port 8004)   │
└─────┬───────┘    └───────┬───────┘   └───────────────┘
      │                    │
      │  ASI:One API       │  ASI:One API
      │  Knowledge Graph   │  Knowledge Graph
      └────────────────────┘
```

## Current Backend Status

### ✅ Completed
- **MatchMaker Agent** (Port 8001)
  - ASI-powered compatibility analysis
  - Knowledge Graph integration
  - A2A communication with Planner
  - Traditional fallback algorithm

- **Planner Agent** (Port 8002)
  - ASI-powered itinerary generation
  - Knowledge Graph storage
  - Enhanced with intelligent recommendations

- **Verification Agent** (Port 8004)
  - GPT-4o Vision for trip proof
  - A2A communication protocol
  - REST API endpoint

- **Agent Service** (Port 8000)
  - FastAPI proxy server
  - Mock data endpoints

### ⏳ Needs Frontend Integration
- Create trip matching flow
- Display ASI compatibility reasoning
- Show AI-generated itineraries
- Add trip verification UI

## API Endpoints

### 1. Find Matches (Enhanced with ASI)

**Endpoint:** `POST /api/match/find`

**Request:**
```typescript
{
  user_id: string;
  preferences: {
    destination: string;
    start_date: string;  // ISO format
    end_date: string;
    budget_min: number;
    budget_max: number;
    activities: {
      [key: string]: number;  // 0-1 score
    };
    travel_style: {
      [key: string]: number;
    };
  };
}
```

**Response:**
```typescript
{
  matches: Array<{
    user_id: string;
    compatibility_score: number;
    compatibility: {
      overall_score: number;
      destination_match: number;
      budget_match: number;
      activity_match: number;
      reasoning: string;
      strengths: string[];
      concerns: string[];
    };
  }>;
  asi_powered: boolean;
}
```

### 2. Generate Itinerary (Enhanced with ASI)

**Endpoint:** `POST /api/itinerary/generate`

**Request:**
```typescript
{
  destination: string;
  num_days: number;
  interests: string[];
  budget_per_day: number;
  pace: 'relaxed' | 'moderate' | 'packed';
  user_id?: string;
  matched_user_ids?: string[];
}
```

**Response:**
```typescript
{
  itinerary: Array<{
    day: number;
    title: string;
    activities: string[];
    budget_range: string;
  }>;
  recommendations: string[];
  estimated_cost: string;
  message: string;
  asi_powered: boolean;
  timestamp: string;
}
```

### 3. Verify Trip Completion (NEW)

**Endpoint:** `POST /api/verify/trip`

**Request:**
```typescript
{
  trip_id: string;
  user_id: string;
  destination: string;
  image_url?: string;
  image_base64?: string;
}
```

**Response:**
```typescript
{
  verified: boolean;
  confidence: number;  // 0-1
  verdict: string;
  reasoning: string;
  concerns: string[];
  timestamp: string;
}
```

## Frontend Components to Create

### 1. Match Results with ASI Insights

**File:** `frontend/components/MatchResults.tsx`

```typescript
interface MatchResultsProps {
  matches: Match[];
  asiPowered: boolean;
}

export function MatchResults({ matches, asiPowered }: MatchResultsProps) {
  return (
    <div className="space-y-4">
      {asiPowered && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <p className="font-semibold">AI-Powered Matches</p>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            Analyzed by ASI:One for intelligent compatibility
          </p>
        </div>
      )}

      {matches.map((match) => (
        <div key={match.user_id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold">{match.user_id}</h3>
              <div className="flex gap-2 mt-2">
                <Badge>
                  {match.compatibility_score}% Compatible
                </Badge>
              </div>
            </div>
            <CircularProgress value={match.compatibility_score} />
          </div>

          {match.compatibility && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                {match.compatibility.reasoning}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <CompatibilityBar 
                  label="Destination" 
                  value={match.compatibility.destination_match}
                />
                <CompatibilityBar 
                  label="Budget" 
                  value={match.compatibility.budget_match}
                />
                <CompatibilityBar 
                  label="Activities" 
                  value={match.compatibility.activity_match}
                />
              </div>

              {match.compatibility.strengths.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-green-600">Strengths:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {match.compatibility.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {match.compatibility.concerns.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-orange-600">Considerations:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {match.compatibility.concerns.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 2. AI Itinerary Display

**File:** `frontend/components/AIItinerary.tsx`

```typescript
interface AIItineraryProps {
  itinerary: ItineraryDay[];
  asiPowered: boolean;
  recommendations: string[];
}

export function AIItinerary({ itinerary, asiPowered, recommendations }: AIItineraryProps) {
  return (
    <div className="space-y-6">
      {asiPowered && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            <p className="font-semibold">AI-Generated Itinerary</p>
          </div>
          <p className="text-sm text-purple-100 mt-1">
            Personalized by ASI:One based on your preferences
          </p>
        </div>
      )}

      <div className="space-y-4">
        {itinerary.map((day) => (
          <div key={day.day} className="border rounded-lg p-4">
            <h3 className="font-bold text-lg">{day.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{day.budget_range}</p>
            
            <ul className="mt-3 space-y-2">
              {day.activities.map((activity, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-bold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Pro Tips
          </h3>
          <ul className="mt-3 space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 3. Trip Verification Component

**File:** `frontend/components/TripVerification.tsx`

```typescript
interface TripVerificationProps {
  tripId: string;
  destination: string;
}

export function TripVerification({ tripId, destination }: TripVerificationProps) {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!image) return;
    
    setLoading(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      const response = await fetch('/api/verify/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          destination: destination,
          image_base64: base64
        })
      });
      
      const data = await response.json();
      setResult(data);
      setLoading(false);
    };
    
    reader.readAsDataURL(image);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="hidden"
          id="trip-image"
        />
        <label htmlFor="trip-image" className="cursor-pointer">
          <Camera className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Upload photo from your trip to {destination}
          </p>
        </label>
      </div>

      {image && (
        <Button onClick={handleVerify} disabled={loading} className="w-full">
          {loading ? 'Verifying with AI...' : 'Verify Trip Completion'}
        </Button>
      )}

      {result && (
        <div className={`border rounded-lg p-4 ${
          result.verified ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center gap-2">
            {result.verified ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600" />
            )}
            <p className="font-semibold">
              {result.verdict}
            </p>
          </div>

          <p className="text-sm mt-2 text-gray-600">
            {result.reasoning}
          </p>

          <div className="mt-3">
            <p className="text-sm font-medium">Confidence: {Math.round(result.confidence * 100)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${
                  result.verified ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          </div>

          {result.concerns.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-orange-600">Concerns:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                {result.concerns.map((concern, i) => (
                  <li key={i}>{concern}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Frontend API Routes to Create

### 1. Match Finding Route

**File:** `frontend/app/api/match/find/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Call agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Match API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 2. Itinerary Generation Route

**File:** `frontend/app/api/itinerary/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Call planner agent via agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/api/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Itinerary API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 3. Verification Route

**File:** `frontend/app/api/verify/trip/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const VERIFICATION_AGENT_URL = 'http://localhost:8004';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Call verification agent directly
    const response = await fetch(`${VERIFICATION_AGENT_URL}/api/verify-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Verification API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## Testing the Integration

### 1. Start All Agents
```powershell
# Terminal 1: Agent Service
cd agents
python src/agent_service.py

# Terminal 2: MatchMaker Agent
cd agents
python src/matchmaker_agent.py

# Terminal 3: Planner Agent
cd agents
python src/planner_agent.py

# Terminal 4: Verification Agent
cd agents
python src/verification_agent.py

# Terminal 5: Frontend
cd frontend
npm run dev
```

### 2. Test Match Finding
1. Go to `/trips` page
2. Click "JOIN A TRIP" button
3. Fill in preferences
4. Submit and see ASI-powered matches
5. Check for compatibility breakdown

### 3. Test Itinerary Generation
1. View a trip details page
2. Generate itinerary
3. See AI-powered day-by-day plan
4. Check for personalized recommendations

### 4. Test Trip Verification
1. Go to `/verify` page
2. Upload trip photo
3. Get AI verification result
4. See confidence score and reasoning

## Environment Variables

### Backend (agents/.env)
```properties
ASI_ONE_API_KEY=sk_675e22c10000478886c8ed320354d866679a65354ecd4a50bf93928249f774c5
GEMINI_API_KEY=AIzaSyAQevDYh8-cFF4w2l71Z7LUWKj8f-EN6jE
AGENT_SERVICE_URL=http://localhost:8000
```

### Frontend (frontend/.env.local)
```properties
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_VERIFICATION_URL=http://localhost:8004
```

## Key Features

### 🤖 ASI-Powered Intelligence
- **Compatibility Analysis**: AI reasoning for match quality
- **Itinerary Generation**: Personalized travel plans
- **Trip Verification**: GPT-4o Vision for proof validation

### 💾 Knowledge Graph
- **Persistent Storage**: User preferences and travel history
- **Pattern Recognition**: Learn from past trips
- **Query Capabilities**: Retrieve travel statistics

### 🔗 A2A Communication
- **Autonomous Coordination**: Agents talk to each other
- **Automatic Workflows**: Match → Plan → Verify
- **Event-Driven**: Real-time agent communication

## Next Steps

1. ✅ **ASI Integration** - Complete
2. ✅ **Knowledge Graph** - Complete
3. ✅ **Verification Agent** - Complete
4. ⏳ **Frontend Components** - Need to create
5. ⏳ **API Routes** - Need to create
6. ⏳ **UI/UX Polish** - Need to enhance

## Resources

- **ASI:One API**: https://fetch.ai/docs/asi-one
- **Knowledge Graphs**: https://hyperon.github.io
- **uAgents Framework**: https://fetch.ai/docs/guides/agents
- **GPT-4o Vision**: https://platform.openai.com/docs/guides/vision
