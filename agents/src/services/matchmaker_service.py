"""
WanderLink MatchMaker Agent - FastAPI Service
Pools travelers with similar preferences and generates group itineraries
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import json
from datetime import datetime
from typing import List, Dict
from uuid import uuid4

load_dotenv()

app = FastAPI(title="WanderLink MatchMaker Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
PLANNER_SERVICE_URL = os.getenv("PLANNER_SERVICE_URL", "http://localhost:8003")
ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY", "")
MIN_GROUP_SIZE = 3

# In-memory traveler pool
traveler_pool: List[Dict] = []

class TravelerData(BaseModel):
    user_id: str
    preferences: dict
    original_message: str
    timestamp: str

@app.post("/add-traveler")
async def add_traveler(traveler: TravelerData):
    """
    Add traveler to pool and check if we can form a group
    """
    global traveler_pool
    
    try:
        print(f"\n{'='*60}")
        print(f"🎯 MATCHMAKER - New Traveler Added")
        print(f"{'='*60}")
        print(f"👤 User: {traveler.user_id}")
        print(f"📍 Destination: {traveler.preferences.get('destination')}")
        print(f"🎨 Type: {traveler.preferences.get('travel_type')}")
        print(f"{'='*60}\n")
        
        # Add to pool
        traveler_pool.append(traveler.dict())
        
        print(f"📊 Pool Status: {len(traveler_pool)} travelers waiting")
        
        # Check if we can form a group
        if len(traveler_pool) >= MIN_GROUP_SIZE:
            print(f"\n🎉 Pool reached minimum size ({MIN_GROUP_SIZE})! Forming group...")
            
            # Get compatible travelers
            group_travelers = find_compatible_group()
            
            if group_travelers and len(group_travelers) >= MIN_GROUP_SIZE:
                # Generate itinerary
                itinerary = await generate_itinerary(group_travelers)
                
                # Create group data
                group_data = {
                    "group_id": str(uuid4()),
                    "user_ids": [t["user_id"] for t in group_travelers],
                    "travelers": group_travelers,
                    "itinerary": itinerary,
                    "group_info": extract_group_info(group_travelers),
                    "created_at": datetime.utcnow().isoformat()
                }
                
                print(f"\n{'='*60}")
                print(f"✅ GROUP FORMED!")
                print(f"{'='*60}")
                print(f"🆔 Group ID: {group_data['group_id'][:16]}...")
                print(f"👥 Members: {len(group_data['user_ids'])}")
                print(f"📍 Destination: {group_data['group_info'].get('destination')}")
                print(f"📋 Itinerary: {len(itinerary)} characters")
                print(f"{'='*60}\n")
                
                # Remove matched travelers from pool
                matched_ids = set(t["user_id"] for t in group_travelers)
                traveler_pool = [t for t in traveler_pool if t["user_id"] not in matched_ids]
                
                print(f"📊 Remaining in pool: {len(traveler_pool)} travelers")
                
                # Forward to Planner
                await forward_to_planner(group_data)
                
                return {
                    "success": True,
                    "message": "Group formed and sent to Planner",
                    "group_id": group_data["group_id"],
                    "pool_size": len(traveler_pool)
                }
            else:
                print(f"⚠️ No compatible group found yet, waiting for more travelers...")
        
        return {
            "success": True,
            "message": f"Traveler added to pool ({len(traveler_pool)}/{MIN_GROUP_SIZE})",
            "pool_size": len(traveler_pool),
            "needs": max(0, MIN_GROUP_SIZE - len(traveler_pool))
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def find_compatible_group() -> List[Dict]:
    """
    Find a compatible group of travelers
    For now, just take the first N travelers (can add similarity logic later)
    """
    if len(traveler_pool) < MIN_GROUP_SIZE:
        return []
    
    # Simple approach: take first 3 travelers
    # TODO: Add similarity scoring based on destinations, interests, budget
    return traveler_pool[:MIN_GROUP_SIZE]

def extract_group_info(travelers: List[Dict]) -> Dict:
    """
    Extract common group information
    """
    # Get most common destination
    destinations = [t["preferences"].get("destination", "Unknown") for t in travelers]
    destination = max(set(destinations), key=destinations.count)
    
    # Get travel types
    travel_types = list(set(t["preferences"].get("travel_type", "relaxation") for t in travelers))
    
    # Get average duration
    durations = [t["preferences"].get("duration", 5) for t in travelers]
    avg_duration = sum(durations) // len(durations)
    
    return {
        "destination": destination,
        "travel_types": travel_types,
        "duration": avg_duration,
        "member_count": len(travelers)
    }

async def generate_itinerary(travelers: List[Dict]) -> str:
    """
    Generate a combined itinerary using ASI:One AI
    """
    
    # Extract preferences
    prefs_summary = []
    for i, traveler in enumerate(travelers, 1):
        p = traveler["preferences"]
        prefs_summary.append(
            f"Traveler {i}: {p.get('destination')} - {p.get('travel_type')} - "
            f"{p.get('duration')} days - {p.get('budget')} budget"
        )
    
    prefs_text = "\n".join(prefs_summary)
    
    prompt = f"""Create a combined travel itinerary for this group of travelers:

{prefs_text}

Generate a day-by-day itinerary that:
1. Balances everyone's preferences
2. Includes activities for all travel types mentioned
3. Fits within the average budget level
4. Covers the destination comprehensively

Format as a detailed itinerary with daily activities, estimated costs, and tips.
Keep it exciting and practical!"""

    try:
        if not ASI_ONE_API_KEY:
            return generate_fallback_itinerary(travelers)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://agentverse.ai/v1/completion",
                headers={
                    "Authorization": f"Bearer {ASI_ONE_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": prompt,
                    "max_tokens": 1000,
                    "temperature": 0.7
                },
                timeout=20.0
            )
            
            if response.status_code == 200:
                result = response.json()
                itinerary = result.get("text", "").strip()
                return itinerary if itinerary else generate_fallback_itinerary(travelers)
            else:
                print(f"⚠️ AI API error: {response.status_code}, using fallback")
                return generate_fallback_itinerary(travelers)
                
    except Exception as e:
        print(f"⚠️ Itinerary generation failed: {e}, using fallback")
        return generate_fallback_itinerary(travelers)

def generate_fallback_itinerary(travelers: List[Dict]) -> str:
    """
    Generate a simple fallback itinerary
    """
    group_info = extract_group_info(travelers)
    destination = group_info["destination"]
    duration = group_info["duration"]
    travel_types = ", ".join(group_info["travel_types"])
    
    itinerary = f"""🌟 {destination} Group Adventure - {duration} Days

📋 GROUP PREFERENCES:
- Travel Styles: {travel_types}
- Duration: {duration} days
- Group Size: {len(travelers)} travelers

🗓️ SUGGESTED ITINERARY:

Day 1: Arrival & Orientation
- Meet at hotel lobby
- Welcome dinner at local restaurant
- Group briefing and plan review

Day 2-{duration-1}: {destination} Exploration
- Morning: Guided city tour
- Afternoon: {travel_types} activities
- Evening: Group dinner and planning

Day {duration}: Departure
- Final breakfast together
- Exchange contacts
- Shared memories and photos

💰 ESTIMATED BUDGET:
- Accommodation: $30-50/night
- Food: $20-30/day  
- Activities: $15-25/day
- Transportation: $10-20/day

✨ This itinerary balances everyone's preferences. Adjust based on group consensus!
"""
    
    return itinerary

async def forward_to_planner(group_data: Dict):
    """
    Forward formed group to Planner service
    """
    try:
        print(f"\n📤 Forwarding to Planner Service...")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PLANNER_SERVICE_URL}/create-group",
                json=group_data,
                timeout=15.0
            )
            
            if response.status_code == 200:
                print(f"✅ Successfully sent to Planner")
                result = response.json()
                print(f"📊 Planner Response: {result.get('message', 'Success')}")
            else:
                print(f"⚠️ Planner returned status: {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"⚠️ Error forwarding to Planner: {e}")

@app.get("/pool-status")
async def get_pool_status():
    """Get current pool status"""
    return {
        "pool_size": len(traveler_pool),
        "min_group_size": MIN_GROUP_SIZE,
        "travelers": [
            {
                "user_id": t["user_id"][:20],
                "destination": t["preferences"].get("destination"),
                "type": t["preferences"].get("travel_type")
            }
            for t in traveler_pool
        ]
    }

@app.post("/reset-pool")
async def reset_pool():
    """Reset traveler pool (for testing)"""
    global traveler_pool
    count = len(traveler_pool)
    traveler_pool = []
    return {
        "success": True,
        "message": f"Pool reset. Removed {count} travelers."
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "service": "MatchMaker",
        "status": "healthy",
        "pool_size": len(traveler_pool),
        "planner_url": PLANNER_SERVICE_URL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
