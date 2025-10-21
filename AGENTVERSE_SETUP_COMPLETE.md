# 🌐 WanderLink Agentverse.ai Setup Guide

## 🎯 **You're Building Real Fetch.ai Agents!**

This guide will walk you through creating Python-based autonomous agents on Agentverse.ai from scratch.

**Estimated Time: 5-8 hours**

---

## 📋 **Prerequisites Checklist**

Before starting, make sure you have:

- [ ] Python 3.9+ installed
- [ ] Basic Python knowledge
- [ ] OpenAI API key (for AI planning features)
- [ ] Agentverse.ai account (free)
- [ ] 4-8 hours of focused time

---

## 🚀 **Phase 1: Environment Setup (30 mins)**

### Step 1: Install Python & Dependencies

```powershell
# Check Python version
python --version
# Should be 3.9 or higher

# Navigate to agents folder
cd d:\WanderLink\agents

# Create virtual environment
python -m venv venv

# Activate it (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Create Agentverse Account

1. **Go to:** https://agentverse.ai
2. **Sign up** with email
3. **Verify** your email
4. **Login** to dashboard

### Step 3: Get OpenAI API Key (Optional but Recommended)

1. Go to: https://platform.openai.com/api-keys
2. Create account if needed
3. Click "Create new secret key"
4. Copy key: `sk-...`
5. Save it securely

### Step 4: Create Environment File

**Create:** `agents/.env`

```bash
# Agentverse
AGENTVERSE_API_KEY=your_key_here  # We'll get this after creating agents

# OpenAI (Optional - for smart itinerary planning)
OPENAI_API_KEY=sk-your_openai_key_here

# Agent Seeds (random strings for security)
MATCHMAKER_SEED=wanderlink_matchmaker_secret_2025
PLANNER_SEED=wanderlink_planner_secret_2025

# Frontend connection
AGENT_SERVICE_URL=http://localhost:8000
```

---

## 🏗️ **Phase 2: Create Agents (3-4 hours)**

You need to create **2 main agents:**

### Agent 1: MatchMaker Agent 🤝

**Purpose:** Finds compatible travel groups using AI

**File:** `agents/src/matchmaker_agent.py`

```python
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
import json
from typing import List, Dict
import numpy as np
from sklearn.cluster import KMeans

# Define message models
class TravelPreferences(Model):
    user_id: str
    destination: str
    start_date: str
    end_date: str
    budget_min: float
    budget_max: float
    activities: Dict[str, float]  # e.g., {"culture": 0.9, "adventure": 0.6}
    travel_style: Dict[str, float]  # e.g., {"luxury": 0.6, "social": 0.8}

class MatchRequest(Model):
    user_id: str
    preferences: TravelPreferences

class MatchResponse(Model):
    matches: List[Dict]
    confidence: str
    message: str

# Create agent with unique seed
matchmaker = Agent(
    name="wanderlink_matchmaker",
    seed="wanderlink_matchmaker_secret_2025",  # Use from .env
    port=8001,
    endpoint=["http://localhost:8001/submit"]
)

# Storage for registered travelers
travelers_pool: Dict[str, TravelPreferences] = {}

@matchmaker.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info(f"MatchMaker Agent started!")
    ctx.logger.info(f"Agent address: {matchmaker.address}")

@matchmaker.on_message(model=MatchRequest)
async def handle_match_request(ctx: Context, sender: str, msg: MatchRequest):
    """Handle incoming match requests from users"""
    ctx.logger.info(f"Received match request from {msg.user_id}")
    
    # Store user preferences
    travelers_pool[msg.user_id] = msg.preferences
    
    # Find matches
    matches = find_compatible_matches(msg.user_id, msg.preferences)
    
    # Send response
    response = MatchResponse(
        matches=matches,
        confidence="High" if len(matches) > 0 else "Low",
        message=f"Found {len(matches)} compatible match(es)"
    )
    
    await ctx.send(sender, response)

def calculate_synergy(user1: TravelPreferences, user2: TravelPreferences) -> float:
    """Calculate compatibility score between two travelers"""
    score = 0.0
    
    # 1. Destination match (30%)
    if user1.destination.lower() == user2.destination.lower():
        score += 30
    
    # 2. Date overlap (20%)
    # Convert dates and calculate overlap
    date_overlap = calculate_date_overlap(
        user1.start_date, user1.end_date,
        user2.start_date, user2.end_date
    )
    score += date_overlap * 20
    
    # 3. Budget compatibility (15%)
    budget_compat = calculate_budget_overlap(
        user1.budget_min, user1.budget_max,
        user2.budget_min, user2.budget_max
    )
    score += budget_compat * 15
    
    # 4. Activity preferences (20%)
    activity_sim = calculate_cosine_similarity(
        user1.activities,
        user2.activities
    )
    score += activity_sim * 20
    
    # 5. Travel style (15%)
    style_sim = calculate_cosine_similarity(
        user1.travel_style,
        user2.travel_style
    )
    score += style_sim * 15
    
    return round(score, 2)

def calculate_date_overlap(start1, end1, start2, end2):
    """Calculate percentage of date overlap"""
    # Simplified - implement proper date parsing
    return 0.7  # 70% overlap

def calculate_budget_overlap(min1, max1, min2, max2):
    """Calculate budget compatibility"""
    overlap_start = max(min1, min2)
    overlap_end = min(max1, max2)
    
    if overlap_end < overlap_start:
        return 0.0
    
    total_range = max(max1, max2) - min(min1, min2)
    overlap_range = overlap_end - overlap_start
    
    return overlap_range / total_range if total_range > 0 else 0

def calculate_cosine_similarity(dict1: Dict, dict2: Dict) -> float:
    """Calculate cosine similarity between two preference dictionaries"""
    # Get common keys
    common_keys = set(dict1.keys()) & set(dict2.keys())
    
    if not common_keys:
        return 0.0
    
    # Calculate vectors
    vec1 = [dict1[k] for k in common_keys]
    vec2 = [dict2[k] for k in common_keys]
    
    # Cosine similarity
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = sum(a ** 2 for a in vec1) ** 0.5
    magnitude2 = sum(b ** 2 for b in vec2) ** 0.5
    
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    
    return dot_product / (magnitude1 * magnitude2)

def find_compatible_matches(user_id: str, preferences: TravelPreferences) -> List[Dict]:
    """Find top compatible matches for a user"""
    matches = []
    
    for other_id, other_prefs in travelers_pool.items():
        if other_id == user_id:
            continue
        
        synergy = calculate_synergy(preferences, other_prefs)
        
        if synergy >= 60:  # Minimum 60% compatibility
            matches.append({
                "user_id": other_id,
                "compatibility": synergy,
                "destination": other_prefs.destination,
                "estimated_cost": (other_prefs.budget_min + other_prefs.budget_max) / 2
            })
    
    # Sort by compatibility (highest first)
    matches.sort(key=lambda x: x["compatibility"], reverse=True)
    
    return matches[:5]  # Return top 5 matches

if __name__ == "__main__":
    matchmaker.run()
```

---

### Agent 2: Planner Agent 🗺️

**Purpose:** Generates AI-powered travel itineraries

**File:** `agents/src/planner_agent.py`

```python
from uagents import Agent, Context, Model
from typing import List, Dict
import os
from openai import OpenAI

# Message models
class ItineraryRequest(Model):
    destination: str
    num_days: int
    interests: List[str]
    budget_per_day: float
    pace: str  # "relaxed", "moderate", "packed"

class ItineraryResponse(Model):
    itinerary: List[Dict]
    recommendations: List[str]
    estimated_cost: str
    message: str

# Create planner agent
planner = Agent(
    name="wanderlink_planner",
    seed="wanderlink_planner_secret_2025",
    port=8002,
    endpoint=["http://localhost:8002/submit"]
)

# Initialize OpenAI (if key provided)
client = None
if os.getenv("OPENAI_API_KEY"):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@planner.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info(f"Planner Agent started!")
    ctx.logger.info(f"Agent address: {planner.address}")
    
    if client:
        ctx.logger.info("OpenAI integration enabled")
    else:
        ctx.logger.info("Running without OpenAI (mock mode)")

@planner.on_message(model=ItineraryRequest)
async def handle_itinerary_request(ctx: Context, sender: str, msg: ItineraryRequest):
    """Generate travel itinerary based on preferences"""
    ctx.logger.info(f"Generating itinerary for {msg.destination}")
    
    if client:
        # Use AI to generate itinerary
        itinerary = await generate_ai_itinerary(msg)
    else:
        # Generate mock itinerary
        itinerary = generate_mock_itinerary(msg)
    
    # Calculate costs
    total_cost = msg.budget_per_day * msg.num_days
    
    response = ItineraryResponse(
        itinerary=itinerary,
        recommendations=[
            "Book accommodations early for better rates",
            f"Best time to visit {msg.destination}",
            "Try local street food markets"
        ],
        estimated_cost=f"${total_cost - 200}-${total_cost + 200}",
        message=f"Generated {msg.num_days}-day itinerary"
    )
    
    await ctx.send(sender, response)

async def generate_ai_itinerary(request: ItineraryRequest) -> List[Dict]:
    """Use OpenAI to generate smart itinerary"""
    prompt = f"""
    Create a {request.num_days}-day travel itinerary for {request.destination}.
    
    Traveler interests: {', '.join(request.interests)}
    Budget per day: ${request.budget_per_day}
    Pace: {request.pace}
    
    Return a detailed daily plan with activities, timing, and estimated costs.
    Format as JSON array with: day, title, activities, budget_range
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a travel planning expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        # Parse response (simplified)
        return parse_ai_response(response.choices[0].message.content)
    except Exception as e:
        return generate_mock_itinerary(request)

def generate_mock_itinerary(request: ItineraryRequest) -> List[Dict]:
    """Generate mock itinerary without AI"""
    activities = {
        "relaxed": ["Morning coffee", "Leisurely sightseeing", "Lunch break", "Afternoon rest", "Sunset viewing"],
        "moderate": ["Breakfast", "Main attraction visit", "Lunch", "Secondary activity", "Dinner & evening walk"],
        "packed": ["Early breakfast", "Morning activities", "Lunch on-the-go", "Afternoon tours", "Evening activities", "Late dinner"]
    }
    
    itinerary = []
    for day in range(1, request.num_days + 1):
        itinerary.append({
            "day": day,
            "title": f"Day {day} - Explore {request.destination}",
            "activities": activities.get(request.pace, activities["moderate"]),
            "budget_range": f"${request.budget_per_day - 20}-${request.budget_per_day + 20}"
        })
    
    return itinerary

def parse_ai_response(content: str) -> List[Dict]:
    """Parse OpenAI response into structured itinerary"""
    # Implement JSON parsing
    # For now, return structured format
    import json
    try:
        return json.loads(content)
    except:
        return []

if __name__ == "__main__":
    planner.run()
```

---

## 📡 **Phase 3: Deploy to Agentverse (1 hour)**

### Step 1: Create Agents on Agentverse Dashboard

1. **Login to Agentverse.ai**
2. **Click "Create Agent"**
3. **Create MatchMaker Agent:**
   - Name: `wanderlink-matchmaker`
   - Description: "AI matchmaking for travel groups"
   - Copy the agent code from `matchmaker_agent.py`
   - Click "Deploy"
   - **Copy agent address:** `agent1q...`

4. **Create Planner Agent:**
   - Name: `wanderlink-planner`
   - Description: "AI travel itinerary generator"
   - Copy code from `planner_agent.py`
   - Click "Deploy"
   - **Copy agent address:** `agent1q...`

### Step 2: Get API Keys

1. Go to **Settings** in Agentverse
2. Generate **API Key**
3. Copy and save to `.env`:

```bash
AGENTVERSE_API_KEY=your_actual_api_key_here
MATCHMAKER_ADDRESS=agent1q...your_matchmaker_address
PLANNER_ADDRESS=agent1q...your_planner_address
```

---

## 🔗 **Phase 4: Connect to Frontend (2 hours)**

### Create Backend Service

**File:** `agents/src/agent_service.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="WanderLink Agent Service")

AGENTVERSE_API_KEY = os.getenv("AGENTVERSE_API_KEY")
MATCHMAKER_ADDRESS = os.getenv("MATCHMAKER_ADDRESS")
PLANNER_ADDRESS = os.getenv("PLANNER_ADDRESS")

class MatchRequestAPI(BaseModel):
    user_id: str
    destination: str
    start_date: str
    end_date: str
    budget_min: float
    budget_max: float
    activities: dict
    travel_style: dict

class ItineraryRequestAPI(BaseModel):
    destination: str
    num_days: int
    interests: list
    budget_per_day: float
    pace: str

@app.post("/api/find-matches")
async def find_matches(request: MatchRequestAPI):
    """Send match request to Agentverse MatchMaker agent"""
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"https://agentverse.ai/v1/agents/{MATCHMAKER_ADDRESS}/messages",
                headers={
                    "Authorization": f"Bearer {AGENTVERSE_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "user_id": request.user_id,
                    "preferences": request.dict()
                },
                timeout=30.0
            )
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-itinerary")
async def generate_itinerary(request: ItineraryRequestAPI):
    """Send itinerary request to Planner agent"""
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"https://agentverse.ai/v1/agents/{PLANNER_ADDRESS}/messages",
                headers={
                    "Authorization": f"Bearer {AGENTVERSE_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=request.dict(),
                timeout=30.0
            )
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "WanderLink Agent Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Run the Service

```powershell
# In agents folder
python src/agent_service.py

# Service runs on http://localhost:8000
```

---

### Create Frontend API Routes

**File:** `frontend/app/api/ai/match/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Call agent service
    const response = await fetch(`${AGENT_SERVICE_URL}/api/find-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: body.userId,
        destination: body.preferences.destination,
        start_date: body.preferences.startDate,
        end_date: body.preferences.endDate,
        budget_min: body.preferences.budget.min,
        budget_max: body.preferences.budget.max,
        activities: body.preferences.activities,
        travel_style: body.preferences.travelStyle
      })
    })
    
    if (!response.ok) {
      throw new Error('Agent service error')
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      matches: data.matches
    })
  } catch (error) {
    console.error('Match error:', error)
    return NextResponse.json(
      { error: 'Failed to find matches' },
      { status: 500 }
    )
  }
}
```

---

## ✅ **Phase 5: Testing (1 hour)**

### Test Agents Locally

```powershell
# Terminal 1: Run MatchMaker
cd d:\WanderLink\agents
.\venv\Scripts\Activate.ps1
python src/matchmaker_agent.py

# Terminal 2: Run Planner
python src/planner_agent.py

# Terminal 3: Run Agent Service
python src/agent_service.py

# Terminal 4: Run Frontend
cd ..\frontend
npm run dev
```

### Test API Endpoints

```powershell
# Test health check
curl http://localhost:8000/health

# Test match endpoint
curl -X POST http://localhost:8000/api/find-matches `
  -H "Content-Type: application/json" `
  -d '{
    "user_id": "test-user",
    "destination": "Tokyo",
    "start_date": "2025-03-15",
    "end_date": "2025-03-25",
    "budget_min": 2000,
    "budget_max": 3500,
    "activities": {"culture": 0.9, "food": 0.8},
    "travel_style": {"luxury": 0.6, "social": 0.8}
  }'
```

---

## 📚 **Additional Files Needed**

**Update:** `agents/requirements.txt`

```txt
uagents==0.12.0
fastapi==0.104.1
uvicorn==0.24.0
httpx==0.25.1
python-dotenv==1.0.0
openai==1.3.5
numpy==1.24.3
scikit-learn==1.3.2
pydantic==2.5.0
```

---

## 🎯 **Checklist: Complete Setup**

### Environment
- [ ] Python 3.9+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] `.env` file configured

### Agentverse
- [ ] Account created
- [ ] MatchMaker agent deployed
- [ ] Planner agent deployed
- [ ] Agent addresses copied
- [ ] API key generated

### Code
- [ ] `matchmaker_agent.py` created
- [ ] `planner_agent.py` created
- [ ] `agent_service.py` created
- [ ] Frontend API routes created

### Testing
- [ ] Agents run locally
- [ ] Agent service responds
- [ ] Frontend connects successfully
- [ ] End-to-end flow works

---

## 🆘 **Troubleshooting**

### "Module not found: uagents"
```powershell
pip install uagents
```

### "Agent address not found"
Check `.env` has correct addresses from Agentverse dashboard

### "Connection refused"
Make sure agent service is running on port 8000

### "OpenAI API error"
OpenAI key is optional - agents work without it using mock data

---

## 📊 **Architecture Diagram**

```
USER (Browser)
    ↓
NEXT.JS FRONTEND (localhost:3000)
    ↓ HTTP
API ROUTES (/api/ai/match)
    ↓ HTTP
AGENT SERVICE (localhost:8000)
    ↓ Fetch.ai Protocol
AGENTVERSE.AI
    ↓
MATCHMAKER AGENT (agent1q...)
PLANNER AGENT (agent1q...)
```

---

## 🎉 **What You'll Have**

- ✅ Real autonomous agents on Fetch.ai
- ✅ Blockchain-based agent addresses
- ✅ AI-powered matching & planning
- ✅ Production-ready architecture
- ✅ Impressive hackathon demo

**Good luck! This is going to be amazing!** 🚀

---

**Next Steps:**
1. Start with Phase 1 (Environment Setup)
2. Follow each phase step-by-step
3. Test thoroughly at each stage
4. Ask questions if stuck!
