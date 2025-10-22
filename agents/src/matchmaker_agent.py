"""
WanderLink MatchMaker Agent
Autonomous agent for finding compatible travel groups using Fetch.ai
Supports both direct messaging and chat protocol
"""

from uagents import Agent, Context, Model, Protocol
from typing import List, Dict, Optional
import json
from datetime import datetime
import numpy as np
from uuid import uuid4

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
# For local testing: use port and endpoint
# For Agentverse: remove port and endpoint
matchmaker = Agent(
    name="wanderlink_matchmaker",
    seed="wanderlink_matchmaker_secret_2025",
    port=8001,
    endpoint=["http://localhost:8001/submit"]
)

# Chat protocol for conversational interface
chat_protocol = Protocol(name="MatchMakerChat", version="1.0")

# Storage for registered travelers
travelers_pool: Dict[str, TravelPreferences] = {}

# Conversation state storage
conversation_states: Dict[str, Dict] = {}

@matchmaker.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("🤝 WanderLink MatchMaker Agent Started!")
    ctx.logger.info("=" * 60)
    ctx.logger.info(f"Agent Name: {matchmaker.name}")
    ctx.logger.info(f"Agent Address: {matchmaker.address}")
    ctx.logger.info("💬 Chat Protocol: ENABLED")
    ctx.logger.info("=" * 60)

# ============================================================================
# CHAT PROTOCOL HANDLERS
# ============================================================================

class ChatMessage(Model):
    """Chat message model"""
    session_id: str
    message: str
    timestamp: str

class ChatResponse(Model):
    """Chat response model"""
    session_id: str
    message: str
    timestamp: str
    data: Optional[Dict] = None

@chat_protocol.on_message(model=ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    """Handle conversational chat for finding travel matches"""
    ctx.logger.info(f"💬 Chat from {sender[:16]}...: {msg.message[:50]}...")
    
    # Get or create conversation state
    if msg.session_id not in conversation_states:
        conversation_states[msg.session_id] = {
            "step": "welcome",
            "user_id": f"user_{msg.session_id[:8]}",
            "data": {}
        }
    
    state = conversation_states[msg.session_id]
    message_lower = msg.message.lower()
    
    # Process based on current step
    if state["step"] == "welcome":
        response_text = """🤝 **Welcome to WanderLink MatchMaker!**

I'll help you find compatible travel companions.

Tell me about your travel plans:
• Where do you want to go?
• When (dates)?
• Your budget range?
• What activities interest you?
• Your travel style?

Example: "Looking for Tokyo trip, Nov 15-22, $1000-2000 budget, love culture and food, social traveler"

What are you looking for?"""
        state["step"] = "collecting"
    
    elif state["step"] == "collecting":
        # Extract preferences
        prefs = extract_travel_preferences(msg.message, state["user_id"])
        
        if prefs:
            # Store in traveler pool
            travelers_pool[state["user_id"]] = prefs
            
            # Find matches
            matches = find_compatible_matches(ctx, state["user_id"], prefs)
            
            if matches:
                response_text = f"""✨ **Found {len(matches)} Compatible Travel Matches!**

"""
                for i, match in enumerate(matches[:3], 1):
                    response_text += f"""**Match #{i}** - {match['compatibility']}% Compatible
📍 Destination: {match['destination']}
💰 Budget: ${match['estimated_cost']}
🎯 Confidence: {match['confidence']}

"""
                
                response_text += """

Want to see more matches or refine your search?"""
                state["data"]["matches"] = matches
            else:
                response_text = """😔 No matches found yet, but you're now in our traveler pool!

As more travelers join with similar preferences, we'll notify you.

Would you like to:
1. Adjust your preferences
2. Browse all available trips
3. Create your own trip"""
            
            state["step"] = "results"
        else:
            response_text = """I need more details! Please include:

• **Destination**: Where?
• **Dates**: When?
• **Budget**: How much?
• **Interests**: What activities?
• **Style**: How do you travel?

Example: "Bali Dec 1-10, $800-1500, beach and wellness, relaxed pace" """
    
    elif state["step"] == "results":
        if "more" in message_lower or "show" in message_lower:
            matches = state["data"].get("matches", [])
            response_text = f"""Here are all {len(matches)} matches:

"""
            for i, match in enumerate(matches, 1):
                response_text += f"{i}. {match['destination']} - {match['compatibility']}% match\n"
            
            response_text += "\nWant to search again? Just tell me your new preferences!"
        else:
            response_text = "Let's find another match! What are you looking for?"
            state["step"] = "collecting"
    
    else:
        response_text = "Ready to find travel companions? Tell me your plans!"
        state["step"] = "collecting"
    
    # Send response
    response = ChatResponse(
        session_id=msg.session_id,
        message=response_text,
        timestamp=datetime.utcnow().isoformat()
    )
    
    await ctx.send(sender, response)

def extract_travel_preferences(message: str, user_id: str) -> Optional[TravelPreferences]:
    """Extract travel preferences from natural language"""
    import re
    
    message_lower = message.lower()
    
    # Extract destination
    destinations = ['tokyo', 'paris', 'london', 'bali', 'rome', 'barcelona', 'dubai', 'bangkok']
    destination = None
    for dest in destinations:
        if dest in message_lower:
            destination = dest.title()
            break
    
    if not destination:
        return None
    
    # Extract dates (simple pattern)
    start_date = "2025-11-15"  # Default
    end_date = "2025-11-22"
    
    # Extract budget
    budget_match = re.search(r'\$?(\d+)[-\s]*(?:to|-)?\s*\$?(\d+)', message)
    if budget_match:
        budget_min = float(budget_match.group(1))
        budget_max = float(budget_match.group(2))
    else:
        budget_min, budget_max = 500, 2000
    
    # Extract interests
    interest_keywords = ['culture', 'adventure', 'food', 'beach', 'nightlife', 'shopping', 'nature']
    activities = {}
    for interest in interest_keywords:
        if interest in message_lower:
            activities[interest] = 0.9
        else:
            activities[interest] = 0.3
    
    # Extract travel style
    style = {}
    if any(word in message_lower for word in ['luxury', 'high-end', 'fancy']):
        style['luxury'] = 0.9
    else:
        style['luxury'] = 0.4
    
    if any(word in message_lower for word in ['social', 'group', 'meet people']):
        style['social'] = 0.9
    else:
        style['social'] = 0.5
    
    # Create preferences object
    return TravelPreferences(
        user_id=user_id,
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        budget_min=budget_min,
        budget_max=budget_max,
        activities=activities,
        travel_style=style
    )

# ============================================================================
# DIRECT MESSAGE HANDLERS
# ============================================================================

@matchmaker.on_message(model=MatchRequest)
async def handle_match_request(ctx: Context, sender: str, msg: MatchRequest):
    """Handle incoming match requests from users"""
    ctx.logger.info(f"📨 Received match request from user: {msg.user_id}")
    ctx.logger.info(f"   Destination: {msg.preferences.destination}")
    ctx.logger.info(f"   Budget: ${msg.preferences.budget_min}-${msg.preferences.budget_max}")
    
    # Store user preferences
    travelers_pool[msg.user_id] = msg.preferences
    ctx.logger.info(f"✅ Registered {msg.user_id} in traveler pool")
    ctx.logger.info(f"👥 Total travelers in pool: {len(travelers_pool)}")
    
    # Find matches
    matches = find_compatible_matches(ctx, msg.user_id, msg.preferences)
    
    # Send response
    response = MatchResponse(
        matches=matches,
        confidence="High" if len(matches) > 0 else "Low",
        message=f"Found {len(matches)} compatible match(es)"
    )
    
    ctx.logger.info(f"✨ Found {len(matches)} matches for {msg.user_id}")
    await ctx.send(sender, response)

def calculate_synergy(user1: TravelPreferences, user2: TravelPreferences) -> float:
    """Calculate compatibility score between two travelers (0-100)"""
    score = 0.0
    
    # 1. Destination match (30%)
    if user1.destination.lower() == user2.destination.lower():
        score += 30
    
    # 2. Date overlap (20%)
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

def calculate_date_overlap(start1: str, end1: str, start2: str, end2: str) -> float:
    """Calculate percentage of date overlap"""
    try:
        # Parse dates
        s1 = datetime.fromisoformat(start1.replace('Z', '+00:00'))
        e1 = datetime.fromisoformat(end1.replace('Z', '+00:00'))
        s2 = datetime.fromisoformat(start2.replace('Z', '+00:00'))
        e2 = datetime.fromisoformat(end2.replace('Z', '+00:00'))
        
        # Calculate overlap
        overlap_start = max(s1, s2)
        overlap_end = min(e1, e2)
        
        if overlap_end < overlap_start:
            return 0.0
        
        overlap_days = (overlap_end - overlap_start).days
        total_days = max((e1 - s1).days, (e2 - s2).days)
        
        return overlap_days / total_days if total_days > 0 else 0
    except:
        return 0.7  # Default 70% if date parsing fails

def calculate_budget_overlap(min1: float, max1: float, min2: float, max2: float) -> float:
    """Calculate budget compatibility (0-1)"""
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

def find_compatible_matches(ctx: Context, user_id: str, preferences: TravelPreferences) -> List[Dict]:
    """Find top compatible matches for a user"""
    matches = []
    
    ctx.logger.info(f"🔍 Searching for matches among {len(travelers_pool)} travelers...")
    
    for other_id, other_prefs in travelers_pool.items():
        if other_id == user_id:
            continue
        
        synergy = calculate_synergy(preferences, other_prefs)
        
        ctx.logger.info(f"   {user_id} <-> {other_id}: {synergy}% compatibility")
        
        if synergy >= 60:  # Minimum 60% compatibility
            matches.append({
                "user_id": other_id,
                "compatibility": synergy,
                "destination": other_prefs.destination,
                "estimated_cost": (other_prefs.budget_min + other_prefs.budget_max) / 2,
                "confidence": "High" if synergy >= 80 else "Medium"
            })
    
    # Sort by compatibility (highest first)
    matches.sort(key=lambda x: x["compatibility"], reverse=True)
    
    ctx.logger.info(f"✅ Found {len(matches)} compatible matches (≥60% synergy)")
    
    return matches[:5]  # Return top 5 matches

# Include chat protocol
matchmaker.include(chat_protocol, publish_manifest=True)

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Starting WanderLink MatchMaker Agent...")
    print("💬 Chat Protocol: ENABLED")
    print("=" * 60 + "\n")
    matchmaker.run()
