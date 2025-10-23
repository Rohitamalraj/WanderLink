"""
WanderLink Agent Service
FastAPI service to connect frontend with Fetch.ai agents
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import httpx
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
supabase: Client = None

if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("✅ Supabase client initialized")

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

class MatchRequestAPI(BaseModel):
    userId: str  # Match frontend structure
    preferences: Dict[str, Any]  # Full preferences object from frontend

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

def calculate_ai_compatibility(user_prefs: Dict[str, Any], group: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate AI-powered compatibility between user preferences and a travel group
    Uses multi-dimensional analysis: destination, budget, interests, pace
    """
    scores = {}
    
    # 1. Destination Match (30% weight)
    user_destinations = user_prefs.get('destinations', [])
    if isinstance(user_destinations, str):
        user_destinations = [user_destinations]
    group_destination = group.get('destination', '')
    
    destination_match = 0.0
    if group_destination:
        # Exact match
        if group_destination in user_destinations:
            destination_match = 1.0
        # Partial match (same region/country)
        else:
            for user_dest in user_destinations:
                if user_dest and group_destination:
                    # Simple similarity check
                    if user_dest.lower() in group_destination.lower() or \
                       group_destination.lower() in user_dest.lower():
                        destination_match = 0.7
                        break
    
    scores['destination_match'] = destination_match
    
    # 2. Budget Compatibility (20% weight)
    user_budget_min = float(user_prefs.get('budgetMin', 0))
    user_budget_max = float(user_prefs.get('budgetMax', 10000))
    group_budget = float(group.get('estimated_budget', 1000))
    
    budget_match = 0.0
    if user_budget_min <= group_budget <= user_budget_max:
        # Perfect fit
        budget_match = 1.0
    elif group_budget < user_budget_min:
        # Under budget - calculate distance
        diff = user_budget_min - group_budget
        budget_match = max(0.0, 1.0 - (diff / user_budget_min))
    else:  # group_budget > user_budget_max
        # Over budget - calculate distance
        diff = group_budget - user_budget_max
        budget_match = max(0.0, 1.0 - (diff / user_budget_max))
    
    scores['budget_match'] = budget_match
    
    # 3. Interests/Activities Match (25% weight)
    user_interests = user_prefs.get('interests', [])
    if isinstance(user_interests, str):
        user_interests = [user_interests]
    group_activities = group.get('activities', [])
    if isinstance(group_activities, str):
        import json
        try:
            group_activities = json.loads(group_activities)
        except:
            group_activities = [group_activities]
    
    interests_match = 0.0
    if user_interests and group_activities:
        # Calculate intersection
        user_interests_lower = [str(i).lower() for i in user_interests]
        group_activities_lower = [str(a).lower() for a in group_activities]
        
        matching = sum(1 for interest in user_interests_lower 
                      if any(interest in activity or activity in interest 
                            for activity in group_activities_lower))
        
        if len(user_interests) > 0:
            interests_match = matching / len(user_interests)
    else:
        interests_match = 0.5  # Neutral if no data
    
    scores['interests_match'] = interests_match
    
    # 4. Travel Pace Match (15% weight)
    user_pace = user_prefs.get('travelPace', 'moderate')
    # Groups don't have pace, so we use a heuristic based on activities
    group_activity_count = len(group_activities) if isinstance(group_activities, list) else 1
    
    pace_match = 0.7  # Default neutral
    if user_pace == 'relaxed' and group_activity_count <= 3:
        pace_match = 0.9
    elif user_pace == 'moderate' and 3 <= group_activity_count <= 6:
        pace_match = 0.9
    elif user_pace == 'packed' and group_activity_count >= 6:
        pace_match = 0.9
    
    scores['pace_match'] = pace_match
    
    # 5. Travel Experience Match (10% weight)
    user_experience = user_prefs.get('travelExperience', 'intermediate')
    # Simple heuristic: budget correlates with experience
    experience_match = 0.7  # Default
    if user_experience == 'beginner' and group_budget < 1500:
        experience_match = 0.85
    elif user_experience == 'expert' and group_budget > 2000:
        experience_match = 0.85
    
    scores['experience_match'] = experience_match
    
    # Calculate overall weighted score
    overall_score = (
        scores['destination_match'] * 0.30 +
        scores['budget_match'] * 0.20 +
        scores['interests_match'] * 0.25 +
        scores['pace_match'] * 0.15 +
        scores['experience_match'] * 0.10
    ) * 100  # Convert to percentage
    
    scores['overall_score'] = round(overall_score, 1)
    
    # Generate reasoning
    reasons = []
    if scores['destination_match'] >= 0.7:
        reasons.append("Destination match")
    if scores['budget_match'] >= 0.8:
        reasons.append("Budget compatible")
    if scores['interests_match'] >= 0.7:
        reasons.append("Shared interests")
    
    scores['reasoning'] = ', '.join(reasons) if reasons else "Some compatibility"
    
    return scores

@app.post("/api/find-matches")
async def find_matches(request: MatchRequestAPI):
    """
    Find travel matches using AI-powered matching:
    1. Query Supabase for available travel groups
    2. Calculate real compatibility using AI
    3. Return personalized matches
    """
    try:
        print(f"\n{'='*60}")
        print(f"📨 Received match request from user: {request.userId}")
        print(f"📍 Preferences: {request.preferences.get('destinations', 'N/A')}")
        print(f"💰 Budget: ${request.preferences.get('budgetMin', 0)}-${request.preferences.get('budgetMax', 0)}")
        print(f"{'='*60}\n")
        
        # Query Supabase for available travel groups
        if not supabase:
            print("⚠️  Supabase not configured, returning empty matches")
            return {"matches": [], "total": 0, "error": "Database not configured"}
        
        # Query database for available groups
        response = supabase.from_('travel_groups') \
            .select('*, creator:users!travel_groups_creator_id_fkey(full_name, avatar_url)') \
            .eq('status', 'forming') \
            .execute()
        
        if not response.data:
            print("⚠️  No groups found in database")
            return {"matches": [], "total": 0}
        
        groups = response.data
        print(f"📊 Found {len(groups)} groups in database")
        
        # Filter for available groups (not full)
        available_groups = [g for g in groups if g.get('current_members', 0) < g.get('max_members', 1)]
        print(f"✅ {len(available_groups)} groups have available space")
        
        # Calculate AI-powered compatibility for each group
        matches = []
        user_prefs = request.preferences
        
        for group in available_groups:
            # Calculate real compatibility using AI
            compatibility_result = calculate_ai_compatibility(user_prefs, group)
            
            # Only include matches above 60% compatibility
            if compatibility_result['overall_score'] >= 60:
                match = {
                    "trip_id": group.get('id'),
                    "compatibility_score": compatibility_result['overall_score'],
                    "trip": {
                        "id": group.get('id'),
                        "title": group.get('title'),
                        "destination": group.get('destination'),
                        "start_date": group.get('start_date'),
                        "end_date": group.get('end_date'),
                        "max_members": group.get('max_members'),
                        "current_members": group.get('current_members'),
                        "group_image": group.get('group_image'),
                        "description": group.get('description'),
                        "creator": group.get('creator'),
                        "activities": group.get('activities', []),
                        "estimated_budget": group.get('estimated_budget')
                    },
                    "compatibility": {
                        "interests": compatibility_result.get('interests_match', 0.70),
                        "budget": compatibility_result.get('budget_match', 0.70),
                        "pace": compatibility_result.get('pace_match', 0.70),
                        "destination": compatibility_result.get('destination_match', 0.70)
                    },
                    "reasoning": compatibility_result.get('reasoning', 'AI-powered matching')
                }
                matches.append(match)
        
        # Sort by compatibility score (highest first)
        matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
        
        print(f"✨ Returning {len(matches)} compatible matches (≥60%)")
        for i, m in enumerate(matches[:3], 1):
            print(f"   #{i}: {m['trip']['title']} - {m['compatibility_score']}% compatible")
        print()
        
        return {
            "matches": matches,
            "total": len(matches)
        }
                
    except Exception as e:
        print(f"❌ Error in find_matches: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return empty matches instead of error
        return {"matches": [], "total": 0, "error": str(e)}

class NLPMatchRequest(BaseModel):
    userId: str
    nlpInput: str
    timestamp: str

@app.post("/api/find-matches-nlp")
async def find_matches_nlp(request: NLPMatchRequest):
    """
    Process natural language trip description and find matches
    1. Parse NLP input to extract structured preferences
    2. Query Supabase for available travel groups
    3. Calculate AI compatibility
    4. Return personalized matches
    """
    try:
        print(f"\n{'='*60}")
        print(f"📨 Received NLP match request from user: {request.userId}")
        print(f"💬 NLP Input: {request.nlpInput[:100]}...")
        print(f"{'='*60}\n")
        
        # Extract structured preferences from NLP input
        print("🧠 Parsing natural language input...")
        preferences = parse_nlp_to_preferences(request.nlpInput)
        print(f"✅ Extracted preferences: {preferences}")
        
        # Query Supabase for available travel groups
        if not supabase:
            print("⚠️  Supabase not configured, returning empty matches")
            return {"matches": [], "total": 0, "error": "Database not configured"}
        
        # Query database for available groups
        response = supabase.from_('travel_groups') \
            .select('*, creator:users!travel_groups_creator_id_fkey(full_name, avatar_url)') \
            .eq('status', 'forming') \
            .execute()
        
        if not response.data:
            print("⚠️  No groups found in database")
            return {"matches": [], "total": 0}
        
        groups = response.data
        print(f"📊 Found {len(groups)} groups in database")
        
        # Filter for available groups (not full)
        available_groups = [g for g in groups if g.get('current_members', 0) < g.get('max_members', 1)]
        print(f"✅ {len(available_groups)} groups have available space")
        
        # Calculate AI-powered compatibility for each group
        matches = []
        
        for group in available_groups:
            # Calculate real compatibility using AI
            compatibility_result = calculate_ai_compatibility(preferences, group)
            
            # Only include matches above 60% compatibility
            if compatibility_result['overall_score'] >= 60:
                match = {
                    "trip_id": group.get('id'),
                    "compatibility_score": compatibility_result['overall_score'],
                    "trip": {
                        "id": group.get('id'),
                        "title": group.get('title'),
                        "destination": group.get('destination'),
                        "start_date": group.get('start_date'),
                        "end_date": group.get('end_date'),
                        "max_members": group.get('max_members'),
                        "current_members": group.get('current_members'),
                        "group_image": group.get('group_image'),
                        "description": group.get('description'),
                        "creator": group.get('creator'),
                        "activities": group.get('activities', []),
                        "estimated_budget": group.get('estimated_budget')
                    },
                    "compatibility": {
                        "interests": compatibility_result.get('interests_match', 0.70),
                        "budget": compatibility_result.get('budget_match', 0.70),
                        "pace": compatibility_result.get('pace_match', 0.70),
                        "destination": compatibility_result.get('destination_match', 0.70)
                    },
                    "reasoning": compatibility_result.get('reasoning', 'AI-powered matching'),
                    "nlp_insights": {
                        "original_input": request.nlpInput[:200],
                        "extracted_destination": preferences.get('destinations', []),
                        "extracted_budget": f"${preferences.get('budgetMin', 0)}-${preferences.get('budgetMax', 0)}",
                        "extracted_interests": preferences.get('interests', [])
                    }
                }
                matches.append(match)
        
        # Sort by compatibility score (highest first)
        matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
        
        print(f"✨ Returning {len(matches)} compatible matches (≥60%)")
        for i, m in enumerate(matches[:3], 1):
            print(f"   #{i}: {m['trip']['title']} - {m['compatibility_score']}% compatible")
        print()
        
        return {
            "matches": matches,
            "total": len(matches),
            "parsed_preferences": preferences
        }
                
    except Exception as e:
        print(f"❌ Error in find_matches_nlp: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"matches": [], "total": 0, "error": str(e)}

def parse_nlp_to_preferences(nlp_input: str) -> Dict[str, Any]:
    """
    Parse natural language input to extract structured travel preferences
    Uses keyword matching and simple NLP patterns
    """
    import re
    
    nlp_lower = nlp_input.lower()
    preferences = {}
    
    # Extract destinations (common travel destinations)
    destinations = ['tokyo', 'goa', 'bali', 'paris', 'london', 'iceland', 'thailand', 'morocco', 
                   'new zealand', 'italy', 'spain', 'greece', 'maldives', 'dubai', 'singapore']
    extracted_destinations = []
    for dest in destinations:
        if dest in nlp_lower:
            extracted_destinations.append(dest.title())
    preferences['destinations'] = extracted_destinations if extracted_destinations else ['Any']
    
    # Extract budget (look for $ amounts)
    budget_match = re.search(r'\$?\s*(\d+)[\s\-]*(?:to|-)?\s*\$?\s*(\d+)?', nlp_input)
    if budget_match:
        budget = int(budget_match.group(1))
        preferences['budgetMin'] = max(budget - 200, 100)  # Flexible range
        preferences['budgetMax'] = budget + 300 if not budget_match.group(2) else int(budget_match.group(2))
    else:
        # Default budget range
        preferences['budgetMin'] = 500
        preferences['budgetMax'] = 3000
    
    # Extract interests/activities
    interest_keywords = {
        'sunbathing': 'Beach', 'beach': 'Beach', 'sunbath': 'Beach',
        'seafood': 'Food', 'food': 'Food', 'cuisine': 'Food', 'eating': 'Food',
        'boat': 'Adventure', 'kayak': 'Adventure', 'hiking': 'Adventure', 'trek': 'Adventure',
        'culture': 'Culture', 'temple': 'Culture', 'museum': 'Culture', 'history': 'History',
        'photography': 'Photography', 'photo': 'Photography',
        'yoga': 'Wellness', 'meditation': 'Wellness', 'spa': 'Wellness', 'wellness': 'Wellness',
        'shopping': 'Shopping', 'market': 'Shopping',
        'nightlife': 'Nightlife', 'party': 'Nightlife', 'bar': 'Nightlife',
        'nature': 'Nature', 'wildlife': 'Wildlife', 'safari': 'Wildlife',
        'sports': 'Sports', 'diving': 'Sports', 'surf': 'Sports'
    }
    
    interests = set()
    for keyword, interest in interest_keywords.items():
        if keyword in nlp_lower:
            interests.add(interest)
    preferences['interests'] = list(interests) if interests else ['General']
    
    # Extract travel pace
    if any(word in nlp_lower for word in ['relaxing', 'relax', 'slow', 'leisurely', 'chill']):
        preferences['travelPace'] = 'relaxed'
    elif any(word in nlp_lower for word in ['packed', 'busy', 'active', 'fast', 'adventure']):
        preferences['travelPace'] = 'packed'
    else:
        preferences['travelPace'] = 'moderate'
    
    # Extract duration (days)
    duration_match = re.search(r'(\d+)\s*days?', nlp_lower)
    if duration_match:
        preferences['duration'] = int(duration_match.group(1))
    else:
        preferences['duration'] = 5  # Default
    
    # Extract group type
    if any(word in nlp_lower for word in ['friend', 'friends']):
        preferences['groupType'] = 'Friends'
    elif any(word in nlp_lower for word in ['solo', 'alone', 'myself']):
        preferences['groupType'] = 'Solo'
    elif any(word in nlp_lower for word in ['couple', 'partner', 'spouse']):
        preferences['groupType'] = 'Couple'
    elif any(word in nlp_lower for word in ['family', 'kids']):
        preferences['groupType'] = 'Family'
    else:
        preferences['groupType'] = 'Any'
    
    # Extract experience level
    if any(word in nlp_lower for word in ['first time', 'beginner', 'new to']):
        preferences['travelExperience'] = 'beginner'
    elif any(word in nlp_lower for word in ['experienced', 'expert', 'veteran']):
        preferences['travelExperience'] = 'expert'
    else:
        preferences['travelExperience'] = 'intermediate'
    
    return preferences

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
                "trip_id": "trip_001",
                "user_id": "user-mock-1",
                "compatibility_score": 85,
                "destination": request.destination,
                "estimated_cost": (request.budget_min + request.budget_max) / 2,
                "confidence": "High",
                "compatibility": {
                    "interests": 0.85,
                    "budget": 0.90,
                    "pace": 0.80,
                    "overall": 0.85
                }
            },
            {
                "trip_id": "trip_002",
                "user_id": "user-mock-2",
                "compatibility_score": 72,
                "destination": request.destination,
                "estimated_cost": (request.budget_min + request.budget_max) / 2 + 300,
                "confidence": "Medium",
                "compatibility": {
                    "interests": 0.70,
                    "budget": 0.75,
                    "pace": 0.70,
                    "overall": 0.72
                }
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
