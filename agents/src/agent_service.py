"""
WanderLink Agent Service
FastAPI service to connect frontend with Fetch.ai agents
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="WanderLink Agent Service",
    description="Connect frontend to Fetch.ai autonomous agents",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
AGENTVERSE_API_KEY = os.getenv("AGENTVERSE_API_KEY", "")
MATCHMAKER_ADDRESS = os.getenv("MATCHMAKER_ADDRESS", "")
PLANNER_ADDRESS = os.getenv("PLANNER_ADDRESS", "")

# Use local agents if Agentverse not configured
USE_LOCAL_AGENTS = not AGENTVERSE_API_KEY or not MATCHMAKER_ADDRESS

# Request/Response Models
class MatchRequestAPI(BaseModel):
    user_id: str
    destination: str
    start_date: str
    end_date: str
    budget_min: float
    budget_max: float
    activities: Dict[str, float]
    travel_style: Dict[str, float]

class ItineraryRequestAPI(BaseModel):
    destination: str
    num_days: int
    interests: List[str]
    budget_per_day: float
    pace: str

# Startup event
@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 60)
    print("🚀 WanderLink Agent Service Started!")
    print("=" * 60)
    print(f"FastAPI Server: http://localhost:8000")
    print(f"Docs: http://localhost:8000/docs")
    
    if USE_LOCAL_AGENTS:
        print("⚠️  Using LOCAL agents (Agentverse not configured)")
        print("   Make sure matchmaker_agent.py and planner_agent.py are running!")
    else:
        print("✅ Using AGENTVERSE agents")
        print(f"   MatchMaker: {MATCHMAKER_ADDRESS[:20]}...")
        print(f"   Planner: {PLANNER_ADDRESS[:20]}...")
    
    print("=" * 60 + "\n")

@app.get("/")
async def root():
    return {
        "service": "WanderLink Agent Service",
        "version": "1.0.0",
        "status": "running",
        "mode": "local" if USE_LOCAL_AGENTS else "agentverse"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "WanderLink Agent Service",
        "agents": {
            "matchmaker": "connected" if MATCHMAKER_ADDRESS else "local",
            "planner": "connected" if PLANNER_ADDRESS else "local"
        }
    }

@app.post("/api/find-matches")
async def find_matches(request: MatchRequestAPI):
    """
    Send match request to MatchMaker agent
    """
    try:
        if USE_LOCAL_AGENTS:
            # Call local agent
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:8001/submit",
                    json={
                        "user_id": request.user_id,
                        "preferences": {
                            "user_id": request.user_id,
                            "destination": request.destination,
                            "start_date": request.start_date,
                            "end_date": request.end_date,
                            "budget_min": request.budget_min,
                            "budget_max": request.budget_max,
                            "activities": request.activities,
                            "travel_style": request.travel_style
                        }
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    # Return mock data if agent not running
                    return generate_mock_matches(request)
                
        else:
            # Call Agentverse
            async with httpx.AsyncClient() as client:
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
                
    except httpx.ConnectError:
        print("⚠️  Agent not responding, returning mock data")
        return generate_mock_matches(request)
    except httpx.HTTPError as e:
        print(f"❌ HTTP Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-itinerary")
async def generate_itinerary(request: ItineraryRequestAPI):
    """
    Send itinerary request to Planner agent
    """
    try:
        if USE_LOCAL_AGENTS:
            # Call local agent
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:8002/submit",
                    json=request.dict(),
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return generate_mock_itinerary(request)
                
        else:
            # Call Agentverse
            async with httpx.AsyncClient() as client:
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
                
    except httpx.ConnectError:
        print("⚠️  Agent not responding, returning mock data")
        return generate_mock_itinerary(request)
    except httpx.HTTPError as e:
        print(f"❌ HTTP Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_mock_matches(request: MatchRequestAPI):
    """Generate mock matches when agents are unavailable"""
    return {
        "matches": [
            {
                "user_id": "user-mock-1",
                "compatibility": 85,
                "destination": request.destination,
                "estimated_cost": (request.budget_min + request.budget_max) / 2,
                "confidence": "High"
            },
            {
                "user_id": "user-mock-2",
                "compatibility": 72,
                "destination": request.destination,
                "estimated_cost": (request.budget_min + request.budget_max) / 2 + 300,
                "confidence": "Medium"
            }
        ],
        "confidence": "Medium",
        "message": "Mock data (agents not connected)"
    }

def generate_mock_itinerary(request: ItineraryRequestAPI):
    """Generate mock itinerary when agents are unavailable"""
    itinerary = []
    for day in range(1, request.num_days + 1):
        itinerary.append({
            "day": day,
            "title": f"Day {day} - Explore {request.destination}",
            "activities": [
                "Morning: Main attraction visit",
                "Lunch: Local cuisine",
                "Afternoon: Cultural experience",
                "Evening: Sunset and dinner"
            ],
            "budget_range": f"${int(request.budget_per_day - 20)}-${int(request.budget_per_day + 20)}"
        })
    
    return {
        "itinerary": itinerary,
        "recommendations": [
            f"Book accommodations in {request.destination} early",
            "Download offline maps",
            "Try local street food"
        ],
        "estimated_cost": f"${request.budget_per_day * request.num_days}",
        "message": "Mock itinerary (agent not connected)"
    }

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting WanderLink Agent Service...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
