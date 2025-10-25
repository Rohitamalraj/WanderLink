"""
WanderLink Travel Agent - FastAPI Service
Extracts travel preferences from user messages and sends to MatchMaker
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

app = FastAPI(title="WanderLink Travel Agent Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MATCHMAKER_SERVICE_URL = os.getenv("MATCHMAKER_SERVICE_URL", "http://localhost:8002")
ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY", "")

class TripRequest(BaseModel):
    user_id: str
    message: str

class PreferencesResponse(BaseModel):
    user_id: str
    preferences: dict
    original_message: str
    timestamp: str

@app.post("/extract-preferences")
async def extract_preferences(request: TripRequest):
    """
    Extract travel preferences from user message using ASI:One AI
    """
    try:
        print(f"\n{'='*60}")
        print(f"🧳 TRAVEL AGENT - Processing Request")
        print(f"{'='*60}")
        print(f"👤 User: {request.user_id}")
        print(f"💬 Message: {request.message}")
        print(f"{'='*60}\n")
        
        # Use ASI:One to extract preferences
        preferences = await extract_with_ai(request.message)
        
        print(f"✅ Extracted Preferences:")
        print(f"   📍 Destination: {preferences.get('destination')}")
        print(f"   🎯 Travel Type: {preferences.get('travel_type')}")
        print(f"   📅 Duration: {preferences.get('duration')} days")
        print(f"   💰 Budget: {preferences.get('budget')}")
        
        # Create response
        response_data = {
            "user_id": request.user_id,
            "preferences": preferences,
            "original_message": request.message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Forward to MatchMaker
        try:
            print(f"\n📤 Forwarding to MatchMaker...")
            async with httpx.AsyncClient() as client:
                matchmaker_response = await client.post(
                    f"{MATCHMAKER_SERVICE_URL}/add-traveler",
                    json=response_data,
                    timeout=10.0
                )
                
                if matchmaker_response.status_code == 200:
                    print(f"✅ Successfully sent to MatchMaker")
                    matchmaker_data = matchmaker_response.json()
                    print(f"📊 Pool Status: {matchmaker_data.get('message', 'Unknown')}")
                else:
                    print(f"⚠️ MatchMaker returned status: {matchmaker_response.status_code}")
                    
        except Exception as e:
            print(f"⚠️ Error forwarding to MatchMaker: {e}")
            # Don't fail the request - MatchMaker might be down
        
        return response_data
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def extract_with_ai(message: str) -> dict:
    """
    Extract structured travel preferences using ASI:One AI
    """
    
    prompt = f"""Extract travel preferences from this message. Return ONLY a JSON object with these exact fields:

Message: "{message}"

Return format (must be valid JSON):
{{
    "destination": "city/country name",
    "travel_type": "adventure|beach|cultural|business|relaxation",
    "duration": number_of_days,
    "budget": "budget_friendly|moderate|luxury",
    "activities": ["activity1", "activity2"]
}}

Rules:
- If duration not specified, estimate based on trip type
- If budget not mentioned, use "moderate"
- If travel type unclear, infer from activities
- Return ONLY the JSON, no explanations"""

    try:
        if not ASI_ONE_API_KEY:
            # Fallback: Simple keyword extraction
            return extract_with_keywords(message)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://agentverse.ai/v1/completion",
                headers={
                    "Authorization": f"Bearer {ASI_ONE_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": prompt,
                    "max_tokens": 200,
                    "temperature": 0.3
                },
                timeout=15.0
            )
            
            if response.status_code == 200:
                result = response.json()
                text = result.get("text", "").strip()
                
                # Try to parse JSON from response
                try:
                    # Remove markdown code blocks if present
                    if "```json" in text:
                        text = text.split("```json")[1].split("```")[0].strip()
                    elif "```" in text:
                        text = text.split("```")[1].split("```")[0].strip()
                    
                    preferences = json.loads(text)
                    return preferences
                except json.JSONDecodeError:
                    print(f"⚠️ AI returned invalid JSON, using fallback")
                    return extract_with_keywords(message)
            else:
                print(f"⚠️ ASI:One API error: {response.status_code}, using fallback")
                return extract_with_keywords(message)
                
    except Exception as e:
        print(f"⚠️ AI extraction failed: {e}, using fallback")
        return extract_with_keywords(message)

def extract_with_keywords(message: str) -> dict:
    """
    Fallback: Extract preferences using keyword matching
    """
    message_lower = message.lower()
    
    # Extract destination (look for place names)
    destination = "Unknown"
    destinations = ["paris", "tokyo", "bali", "london", "rome", "varkala", "goa", "jaipur", "kerala"]
    for dest in destinations:
        if dest in message_lower:
            destination = dest.capitalize()
            break
    
    # Extract travel type
    travel_type = "relaxation"
    if any(word in message_lower for word in ["adventure", "hiking", "trek", "climb"]):
        travel_type = "adventure"
    elif any(word in message_lower for word in ["beach", "coast", "ocean", "sea"]):
        travel_type = "beach"
    elif any(word in message_lower for word in ["culture", "temple", "museum", "historical"]):
        travel_type = "cultural"
    elif any(word in message_lower for word in ["yoga", "spa", "wellness", "relax"]):
        travel_type = "relaxation"
    
    # Extract duration
    duration = 5  # default
    import re
    duration_match = re.search(r'(\d+)\s*days?', message_lower)
    if duration_match:
        duration = int(duration_match.group(1))
    
    # Extract budget
    budget = "moderate"
    if any(word in message_lower for word in ["budget", "cheap", "affordable", "friendly"]):
        budget = "budget_friendly"
    elif any(word in message_lower for word in ["luxury", "premium", "expensive"]):
        budget = "luxury"
    
    # Extract activities
    activities = []
    activity_keywords = {
        "yoga": "yoga", "hiking": "hiking", "surfing": "surfing",
        "diving": "diving", "shopping": "shopping", "photography": "photography"
    }
    for keyword, activity in activity_keywords.items():
        if keyword in message_lower:
            activities.append(activity)
    
    return {
        "destination": destination,
        "travel_type": travel_type,
        "duration": duration,
        "budget": budget,
        "activities": activities or ["sightseeing"]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "service": "Travel Agent",
        "status": "healthy",
        "matchmaker_url": MATCHMAKER_SERVICE_URL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
