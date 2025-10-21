# WanderLink AI Agents Setup Guide

## 🤖 AI Agent Implementation - Person B

### What You're Building

Two intelligent AI agents using Fetch.ai uAgents framework:
1. **Matchmaking Agent** - Finds compatible travel companions
2. **Travel Planner Agent** - Generates itineraries and suggestions

---

## 📦 Step 1: Environment Setup

### Create AI Agents Directory Structure

```bash
# From project root
mkdir -p agents/src
cd agents
```

### Initialize Python Project

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows CMD:
.\venv\Scripts\activate.bat

# Create requirements.txt
```

### Install Dependencies

Create `agents/requirements.txt`:
```txt
uagents==0.12.0
uagents-ai-engine==0.4.0
langchain==0.1.0
langchain-openai==0.0.2
python-dotenv==1.0.0
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.0
httpx==0.26.0
numpy==1.24.3
scikit-learn==1.3.2
```

Then install:
```bash
pip install -r requirements.txt
```

---

## 📁 Step 2: Project Structure

Create this structure in `agents/`:

```
agents/
├── venv/                  # Virtual environment
├── src/
│   ├── __init__.py
│   ├── config.py         # Configuration
│   ├── matchmaker.py     # Matchmaking agent
│   ├── planner.py        # Travel planner agent
│   └── utils.py          # Helper functions
├── .env                   # Environment variables
├── requirements.txt
└── README.md
```

---

## 🔑 Step 3: Environment Variables

Create `agents/.env`:

```bash
# Fetch.ai Agent Configuration
AGENT_MAILBOX_KEY="your_mailbox_key_here"
AGENT_SEED="your_agent_seed_here"

# OpenAI API (for LangChain)
OPENAI_API_KEY="sk-..."

# Backend API
BACKEND_API_URL="http://localhost:3001"

# Agent Addresses (will be generated)
MATCHMAKER_ADDRESS=""
PLANNER_ADDRESS=""
```

---

## 🛠️ Step 4: Configuration File

Create `agents/src/config.py`:

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Fetch.ai Configuration
    MAILBOX_KEY = os.getenv("AGENT_MAILBOX_KEY", "")
    AGENT_SEED = os.getenv("AGENT_SEED", "wanderlink_seed_2024")
    
    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Backend API
    BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:3001")
    
    # Agent Configuration
    MATCHMAKER_NAME = "WanderLink Matchmaker"
    PLANNER_NAME = "WanderLink Travel Planner"
    
    # Matching Thresholds
    MIN_COMPATIBILITY_SCORE = 0.6  # 60% minimum match
    
config = Config()
```

---

## 🧠 Step 5: Matchmaking Agent

Create `agents/src/matchmaker.py`:

```python
from uagents import Agent, Context, Model
from typing import List, Dict
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from config import config

# Define message models
class MatchRequest(Model):
    user_id: str
    interests: List[str]
    age: int
    budget: str  # 'budget', 'moderate', 'luxury'
    pace: str    # 'relaxed', 'moderate', 'active'
    vibe: List[str]

class MatchResponse(Model):
    matches: List[Dict]
    compatibility_scores: List[float]

# Create matchmaker agent
matchmaker = Agent(
    name=config.MATCHMAKER_NAME,
    seed=config.AGENT_SEED + "_matchmaker",
    mailbox=config.MAILBOX_KEY,
)

# Utility function: Calculate compatibility
def calculate_compatibility(user1: MatchRequest, user2: Dict) -> float:
    """
    Calculate compatibility score between two users
    Returns: float between 0 and 1
    """
    score = 0.0
    weights = {
        'interests': 0.4,
        'age': 0.2,
        'budget': 0.2,
        'pace': 0.1,
        'vibe': 0.1
    }
    
    # Interest similarity (Jaccard similarity)
    interests1 = set(user1.interests)
    interests2 = set(user2.get('interests', []))
    if interests1 and interests2:
        intersection = len(interests1.intersection(interests2))
        union = len(interests1.union(interests2))
        interest_score = intersection / union if union > 0 else 0
        score += interest_score * weights['interests']
    
    # Age similarity (closer ages = higher score)
    age_diff = abs(user1.age - user2.get('age', 30))
    age_score = max(0, 1 - (age_diff / 20))  # 20 year max diff
    score += age_score * weights['age']
    
    # Budget match
    budget_score = 1.0 if user1.budget == user2.get('budget') else 0.5
    score += budget_score * weights['budget']
    
    # Pace match
    pace_score = 1.0 if user1.pace == user2.get('pace') else 0.5
    score += pace_score * weights['pace']
    
    # Vibe similarity
    vibe1 = set(user1.vibe)
    vibe2 = set(user2.get('vibe', []))
    if vibe1 and vibe2:
        vibe_intersection = len(vibe1.intersection(vibe2))
        vibe_score = vibe_intersection / max(len(vibe1), len(vibe2))
        score += vibe_score * weights['vibe']
    
    return min(1.0, score)  # Cap at 1.0

# Message handler for match requests
@matchmaker.on_message(model=MatchRequest)
async def handle_match_request(ctx: Context, sender: str, msg: MatchRequest):
    ctx.logger.info(f"Received match request from {sender}")
    
    # In production, fetch from backend API
    # For now, use mock data
    mock_users = [
        {
            'id': '1',
            'name': 'Sarah Chen',
            'interests': ['Beach', 'Culture', 'Photography'],
            'age': 28,
            'budget': 'moderate',
            'pace': 'moderate',
            'vibe': ['Chill', 'Social']
        },
        {
            'id': '2',
            'name': 'Alex Rivera',
            'interests': ['Adventure', 'Hiking', 'Nature'],
            'age': 32,
            'budget': 'moderate',
            'pace': 'active',
            'vibe': ['Adventurous']
        },
        # Add more mock users...
    ]
    
    # Calculate compatibility scores
    matches = []
    for user in mock_users:
        if user['id'] != msg.user_id:  # Don't match with self
            score = calculate_compatibility(msg, user)
            if score >= config.MIN_COMPATIBILITY_SCORE:
                matches.append({
                    'user': user,
                    'score': score
                })
    
    # Sort by score (highest first)
    matches.sort(key=lambda x: x['score'], reverse=True)
    
    # Send response
    response = MatchResponse(
        matches=[m['user'] for m in matches[:5]],  # Top 5 matches
        compatibility_scores=[m['score'] for m in matches[:5]]
    )
    
    await ctx.send(sender, response)
    ctx.logger.info(f"Sent {len(matches)} matches to {sender}")

@matchmaker.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Matchmaker agent started with address: {matchmaker.address}")
    ctx.logger.info("Ready to find travel companions!")

if __name__ == "__main__":
    matchmaker.run()
```

---

## 🗺️ Step 6: Travel Planner Agent

Create `agents/src/planner.py`:

```python
from uagents import Agent, Context, Model
from typing import List, Dict
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from config import config

# Define message models
class PlanRequest(Model):
    destination: str
    num_days: int
    interests: List[str]
    budget: str
    pace: str

class PlanResponse(Model):
    itinerary: List[Dict]
    recommendations: List[str]
    estimated_cost: str

# Create planner agent
planner = Agent(
    name=config.PLANNER_NAME,
    seed=config.AGENT_SEED + "_planner",
    mailbox=config.MAILBOX_KEY,
)

# Initialize LangChain LLM
llm = ChatOpenAI(
    temperature=0.7,
    openai_api_key=config.OPENAI_API_KEY,
    model="gpt-3.5-turbo"
)

# Create prompt template
itinerary_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert travel planner. Create detailed, day-by-day 
    itineraries that match the traveler's interests, budget, and pace preferences.
    Format your response as a JSON array of daily activities."""),
    ("human", """Create a {num_days}-day itinerary for {destination}.
    
    Traveler preferences:
    - Interests: {interests}
    - Budget: {budget}
    - Pace: {pace}
    
    Provide specific activities, timing, and local recommendations.""")
])

@planner.on_message(model=PlanRequest)
async def handle_plan_request(ctx: Context, sender: str, msg: PlanRequest):
    ctx.logger.info(f"Received planning request for {msg.destination}")
    
    try:
        # Generate itinerary using LLM
        prompt = itinerary_prompt.format_messages(
            num_days=msg.num_days,
            destination=msg.destination,
            interests=", ".join(msg.interests),
            budget=msg.budget,
            pace=msg.pace
        )
        
        llm_response = llm.predict_messages(prompt)
        
        # Parse and structure the response
        # (In production, add proper JSON parsing)
        
        # Mock response for now
        itinerary = [
            {
                "day": 1,
                "activities": [
                    "Morning: Arrive and check-in",
                    "Afternoon: Local orientation walk",
                    "Evening: Welcome dinner"
                ]
            },
            # Add more days...
        ]
        
        recommendations = [
            "Book accommodations in advance",
            "Try local street food markets",
            "Download offline maps"
        ]
        
        response = PlanResponse(
            itinerary=itinerary,
            recommendations=recommendations,
            estimated_cost=f"${msg.num_days * 100}-${msg.num_days * 200}"
        )
        
        await ctx.send(sender, response)
        ctx.logger.info(f"Sent itinerary to {sender}")
        
    except Exception as e:
        ctx.logger.error(f"Error generating itinerary: {e}")

@planner.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Planner agent started with address: {planner.address}")
    ctx.logger.info("Ready to plan adventures!")

if __name__ == "__main__":
    planner.run()
```

---

## 🚀 Step 7: Running the Agents

### Start Matchmaker Agent
```bash
cd agents
python src/matchmaker.py
```

### Start Planner Agent (in another terminal)
```bash
cd agents
python src/planner.py
```

---

## 🔗 Step 8: Frontend Integration

You'll need to create API endpoints in the frontend to communicate with agents.

Create `frontend/app/api/ai/match/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In production, send to Fetch.ai agent
    // For now, return mock matches
    
    const matches = [
      {
        user: {
          name: 'Sarah Chen',
          avatar: 'https://i.pravatar.cc/150?img=1',
          interests: ['Beach', 'Culture'],
        },
        score: 0.85
      },
      // More matches...
    ]
    
    return NextResponse.json({ matches })
  } catch (error) {
    return NextResponse.json({ error: 'Match failed' }, { status: 500 })
  }
}
```

---

## ✅ Your AI Tasks Checklist

- [ ] **Setup Python environment** (30 mins)
- [ ] **Install dependencies** (10 mins)
- [ ] **Create config.py** (15 mins)
- [ ] **Implement matchmaker.py** (2 hours)
  - [ ] Basic agent setup
  - [ ] Compatibility algorithm
  - [ ] Message handlers
  - [ ] Testing
- [ ] **Implement planner.py** (2 hours)
  - [ ] Agent setup
  - [ ] LangChain integration
  - [ ] Itinerary generation
  - [ ] Testing
- [ ] **Create API routes in frontend** (1 hour)
  - [ ] /api/ai/match
  - [ ] /api/ai/plan
- [ ] **Add AI chat component in frontend** (1.5 hours)
  - [ ] Chat UI
  - [ ] Connect to agents
  - [ ] Display results
- [ ] **Testing & refinement** (1 hour)

**Total Time: ~8-9 hours**

---

## 🎯 Testing Your Agents

### Test Matchmaker
```python
# test_matchmaker.py
from src.matchmaker import MatchRequest, calculate_compatibility

request = MatchRequest(
    user_id="test_user",
    interests=["Beach", "Culture", "Photography"],
    age=28,
    budget="moderate",
    pace="moderate",
    vibe=["Chill", "Social"]
)

# Test with mock user
mock_user = {
    'interests': ['Beach', 'Culture'],
    'age': 30,
    'budget': 'moderate',
    'pace': 'moderate',
    'vibe': ['Social']
}

score = calculate_compatibility(request, mock_user)
print(f"Compatibility Score: {score}")  # Should be > 0.6
```

---

## 📚 Resources

- **Fetch.ai Docs**: https://docs.fetch.ai/
- **uAgents Guide**: https://fetch.ai/docs/guides/agents/
- **LangChain Docs**: https://python.langchain.com/

---

## 🆘 Need Help?

If you get stuck:
1. Check agent logs for errors
2. Verify environment variables are set
3. Test with mock data first
4. Use `ctx.logger.info()` for debugging

---

## 🎉 Done!

Once complete, your AI agents will:
- ✅ Find compatible travel companions
- ✅ Generate personalized itineraries
- ✅ Communicate via Fetch.ai protocol
- ✅ Integrate with your beautiful frontend!

