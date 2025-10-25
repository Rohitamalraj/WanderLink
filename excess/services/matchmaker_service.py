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

# In-memory destination-specific pools (like Agentverse agent)
# Key: normalized destination, Value: list of travelers
destination_pools: Dict[str, List[Dict]] = {}

def normalize_destination(destination: str) -> str:
    """
    Normalize destination name for consistent matching
    - Convert to lowercase
    - Strip whitespace
    - Remove extra spaces
    """
    if not destination:
        return "unknown"
    return " ".join(destination.lower().strip().split())

class TravelerData(BaseModel):
    user_id: str
    preferences: dict
    original_message: str
    timestamp: str

@app.post("/add-traveler")
async def add_traveler(traveler: TravelerData):
    """
    Add traveler to destination-specific pool and check if we can form a group
    """
    global destination_pools
    
    try:
        # Get and normalize destination
        destination = traveler.preferences.get('destination', 'Unknown')
        normalized_dest = normalize_destination(destination)
        
        print(f"\n{'='*60}")
        print(f"🎯 MATCHMAKER - New Traveler Added")
        print(f"{'='*60}")
        print(f"👤 User: {traveler.user_id}")
        print(f"📍 Destination: {destination} (normalized: {normalized_dest})")
        print(f"🎨 Type: {traveler.preferences.get('travel_type')}")
        print(f"{'='*60}\n")
        
        # Add to destination-specific pool
        if normalized_dest not in destination_pools:
            destination_pools[normalized_dest] = []
        
        destination_pools[normalized_dest].append(traveler.dict())
        
        # Display current pools status
        print(f"📊 CURRENT DESTINATION POOLS:")
        for dest, travelers in destination_pools.items():
            print(f"  • {dest.title()}: {len(travelers)} traveler(s)")
        print()
        
        # Check if THIS destination has enough travelers to form a group
        dest_pool_size = len(destination_pools[normalized_dest])
        
        if dest_pool_size >= MIN_GROUP_SIZE:
            print(f"\n🎉 {normalized_dest.title()} pool reached minimum size ({MIN_GROUP_SIZE})! Forming group...")
            
            # Get compatible travelers from THIS destination pool
            group_travelers = find_compatible_group(normalized_dest)
            
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
                
                # Remove matched travelers from THIS destination pool
                matched_ids = set(t["user_id"] for t in group_travelers)
                destination_pools[normalized_dest] = [
                    t for t in destination_pools[normalized_dest] 
                    if t["user_id"] not in matched_ids
                ]
                
                # Clean up empty pools
                if len(destination_pools[normalized_dest]) == 0:
                    del destination_pools[normalized_dest]
                
                # Display updated pools
                print(f"📊 UPDATED DESTINATION POOLS:")
                for dest, travelers in destination_pools.items():
                    print(f"  • {dest.title()}: {len(travelers)} traveler(s)")
                print()
                
                # Forward to Planner
                await forward_to_planner(group_data)
                
                return {
                    "success": True,
                    "message": "Group formed and sent to Planner",
                    "group_id": group_data["group_id"],
                    "destination": normalized_dest,
                    "pool_size": len(destination_pools.get(normalized_dest, []))
                }
            else:
                print(f"⚠️ No compatible group found yet for {normalized_dest.title()}, waiting for more travelers...")
        else:
            print(f"⏳ Waiting for more travelers to {normalized_dest.title()}...")
            print(f"Need {MIN_GROUP_SIZE - dest_pool_size} more for this destination\n")
        
        return {
            "success": True,
            "message": f"Traveler added to {normalized_dest.title()} pool",
            "destination": normalized_dest,
            "pool_size": dest_pool_size,
            "needs": max(0, MIN_GROUP_SIZE - dest_pool_size)
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def find_compatible_group(destination: str) -> List[Dict]:
    """
    Find a compatible group of travelers from a specific destination pool
    
    Args:
        destination: Normalized destination name
    
    Returns:
        List of traveler dicts from the same destination pool
    """
    if destination not in destination_pools:
        return []
    
    dest_pool = destination_pools[destination]
    
    if len(dest_pool) < MIN_GROUP_SIZE:
        return []
    
    # Take first MIN_GROUP_SIZE travelers from this destination pool
    # All travelers in this pool already have the same destination
    # TODO: Add additional similarity scoring based on interests, budget, dates
    return dest_pool[:MIN_GROUP_SIZE]

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
    # Build a richer, agent-like itinerary similar to Agentverse output
    # Destination overview
    overview = f"""
Destination Overview: {destination}
{destination} is a popular spot that offers a mix of {travel_types}. This itinerary blends activities for the group while leaving space for relaxation and personal time.
"""

    # Normalize duration to at least 1
    duration_days = max(1, int(duration))

    # Day-by-day plan
    days_sections = []
    for day in range(1, duration_days + 1):
        if day == 1:
            section = (
                "Day 1: Arrival & Orientation\n"
                "- Arrive at the destination and check in to your accommodation.\n"
                "- Meet in the hotel lobby for a quick welcome and introductions.\n"
                "- Enjoy a welcome meal at a local restaurant and review the group's plan.\n"
            )
        elif day == duration_days:
            section = (
                f"Day {day}: Departure\n"
                "- Have a final group breakfast.\n"
                "- Exchange contact details and photos.\n"
                "- Depart or continue personal travels.\n"
            )
        else:
            # Middle days: combine activities based on travel types
            activities = []
            if "adventure" in travel_types:
                activities.append("adventure activities (hiking, water sports)")
            if "beach" in travel_types or "relaxation" in travel_types:
                activities.append("beach time and relaxation")
            if "cultural" in travel_types:
                activities.append("local cultural visits and temples/museums")

            activities_text = ", ".join(activities) if activities else "sightseeing and local experiences"
            section = (
                f"Day {day}: {destination} Exploration\n"
                f"- Morning: {activities_text}.\n"
                "- Afternoon: Free time to split into small groups or rest.\n"
                "- Evening: Group dinner and recap; optional night activity.\n"
            )

        days_sections.append(section)

    days_text = "\n".join(days_sections)

    # Budget estimates (simple heuristic)
    budget_text = (
        "💰 ESTIMATED BUDGET PER PERSON:\n"
        "- Accommodation: $25-60/night (budget to mid-range)\n"
        "- Food: $10-30/day\n"
        "- Activities: $10-40/day depending on choices\n"
        "- Local transport: $5-20/day\n"
    )

    tips = (
        "TIPS:\n- Pack sunscreen, comfortable shoes, and a light jacket for evenings.\n"
        "- Respect local customs when visiting religious sites.\n"
        "- Keep copies of important documents and share contact details with the group.\n"
    )

    next_steps = (
        "WHAT'S NEXT?:\n"
        "✅ Review the itinerary and suggest any adjustments.\n"
        "✅ Coordinate exact travel dates with your group.\n"
        "✅ Share preferred accommodation type and budgets.\n"
    )

    # Add agent-like signature and friendly narrative tone
    timestamp = datetime.utcnow().strftime('%m/%d/%Y, %I:%M:%S %p')
    header = (
        f"✈️ PLANNER AGENT\n{timestamp} UTC\n"
        f"╔{'═'*59}╗\n"
        f"║          🎉 WANDERLINK TRAVEL GROUP ITINERARY 🎉          ║\n"
        f"╚{'═'*59}╝\n\n"
    )

    intro = (
        f"Hello! I’ve crafted a detailed, practical, and exciting itinerary for your group in {destination}. "
        f"This plan balances the group's interests — {travel_types} — while leaving room for personal time. "
        "Below is a day-by-day schedule, estimated costs, and tips to help you coordinate.\n\n"
    )

    itinerary = (
        header
        + f"You've been matched with {len(travelers)} traveler(s).\n\n"
        + f"📋 GROUP PREFERENCES:\n- Travel Styles: {travel_types}\n- Duration: {duration_days} days\n- Group Size: {len(travelers)} travelers\n\n"
        + intro
        + f"📍 DESTINATION OVERVIEW:\n{overview}\n"
        + f"🗓️ DETAILED DAY-BY-DAY ITINERARY:\n\n"
        + days_text
        + "\n"
        + f"{budget_text}\n\n"
        + f"{tips}\n\n"
        + f"{next_steps}\n\n"
        + "Safe travels and enjoy — Reply here if you want tweaks and I’ll update the plan! ✨\n"
    )

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
    """Get current pool status with destination breakdown"""
    total_travelers = sum(len(travelers) for travelers in destination_pools.values())
    
    destinations_detail = []
    for dest, travelers in destination_pools.items():
        destinations_detail.append({
            "destination": dest.title(),
            "count": len(travelers),
            "needs": max(0, MIN_GROUP_SIZE - len(travelers)),
            "travelers": [
                {
                    "user_id": t["user_id"][:20],
                    "type": t["preferences"].get("travel_type")
                }
                for t in travelers
            ]
        })
    
    return {
        "total_travelers": total_travelers,
        "min_group_size": MIN_GROUP_SIZE,
        "destination_count": len(destination_pools),
        "destinations": destinations_detail
    }

@app.post("/reset-pool")
async def reset_pool():
    """Reset all traveler pools (for testing)"""
    global destination_pools
    total_count = sum(len(travelers) for travelers in destination_pools.values())
    destination_pools = {}
    return {
        "success": True,
        "message": f"All pools reset. Removed {total_count} travelers."
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    total_travelers = sum(len(travelers) for travelers in destination_pools.values())
    return {
        "service": "MatchMaker",
        "status": "healthy",
        "total_travelers": total_travelers,
        "destination_pools": len(destination_pools),
        "planner_url": PLANNER_SERVICE_URL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
