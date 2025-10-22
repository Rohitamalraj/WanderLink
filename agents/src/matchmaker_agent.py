"""
WanderLink MatchMaker Agent
Autonomous agent for finding compatible travel groups using Fetch.ai
NOW WITH: ASI:One AI, A2A Communication, Knowledge Graph
"""

from uagents import Agent, Context, Model, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)
from typing import List, Dict, Optional
import json
from datetime import datetime, timezone
import numpy as np
from uuid import uuid4
import os
import sys

# Add utils to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'utils'))

try:
    from utils.asi_llm import get_asi_llm
    from utils.knowledge_graph import get_knowledge_graph
    ASI_ENABLED = True
    KG_ENABLED = True
except ImportError as e:
    print(f"⚠️  Warning: ASI/KG not available: {e}")
    ASI_ENABLED = False
    KG_ENABLED = False

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

# A2A Communication Models (Agent-to-Agent)
class MatchesFoundNotification(Model):
    """Sent to Planner Agent when matches are found"""
    user_id: str
    matches: List[Dict]
    request_itinerary: bool = True
    timestamp: str
    source_agent: str

class ItineraryRequest(Model):
    """Request sent to Planner Agent"""
    user_id: str
    matched_user_ids: List[str]
    destination: str
    num_days: int
    combined_interests: List[str]
    combined_budget: float
    travel_pace: str
    timestamp: str
    source_agent: str

# Create agent with unique seed
# For local testing: use port and endpoint
# For Agentverse: remove port and endpoint
matchmaker = Agent(
    name="wanderlink_matchmaker",
    seed="wanderlink_matchmaker_secret_2025",
    port=8001,
    endpoint=["http://localhost:8001/submit"]
)

# Chat protocol for ASI:One compatibility
# IMPORTANT: Do NOT provide a name when using chat_protocol_spec
chat_protocol = Protocol(spec=chat_protocol_spec)

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
# CHAT PROTOCOL HANDLERS (ASI:One Compatible)
# ============================================================================

@chat_protocol.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    """Handle ASI:One compatible chat messages for finding travel matches"""
    ctx.logger.info(f"💬 Chat from {sender[:16]}...: {msg.content[0].text if msg.content else 'empty'}...")
    
    # Send acknowledgement
    await ctx.send(
        sender,
        ChatAcknowledgement(timestamp=datetime.now(), acknowledged_msg_id=msg.msg_id),
    )
    
    # Collect text from message content
    text = ''
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text
    
    # Extract user preferences from natural language
    session_id = str(msg.msg_id)
    
    # Get or create conversation state
    if session_id not in conversation_states:
        conversation_states[session_id] = {
            "step": "collecting",
            "user_id": f"user_{session_id[:8]}",
            "data": {}
        }
    
    state = conversation_states[session_id]
    
    # Extract preferences from message
    prefs = extract_travel_preferences(text, state["user_id"])
    
    response_text = ""
    
    if prefs:
        # Store in traveler pool
        travelers_pool[state["user_id"]] = prefs
        ctx.logger.info(f"✅ Registered {state['user_id']} in traveler pool")
        
        # Find matches
        matches = find_compatible_matches(ctx, state["user_id"], prefs)
        
        if matches:
            response_text = f"""✨ Found {len(matches)} Compatible Travel Matches!

"""
            for i, match in enumerate(matches[:3], 1):
                response_text += f"""**Match #{i}** - {match['compatibility']}% Compatible
📍 Destination: {match['destination']}
💰 Budget: ${match['estimated_cost']}
🎯 Confidence: {match['confidence']}

"""
            
            response_text += """

I specialize in finding travel companions! Ask me about:
• Compatible travelers for specific destinations
• Group travel recommendations
• Budget-friendly travel partners
• Adventure travel matches"""
            
            state["data"]["matches"] = matches
        else:
            response_text = """� No matches found yet, but you're now in our traveler pool!

As more travelers join with similar preferences, we'll notify you automatically.

I can help you:
• Find travel companions
• Match you with compatible groups
• Recommend destinations based on your interests

What would you like to know?"""
    else:
        response_text = """👋 Hi! I'm the WanderLink MatchMaker Agent - I specialize in finding compatible travel companions!

Tell me about your travel plans and I'll find perfect matches:

**Example:** "Looking for Tokyo trip, Nov 15-22, $1000-2000 budget, love culture and food, social traveler"

Include:
• 📍 **Destination**: Where do you want to go?
• 📅 **Dates**: When are you traveling?
• 💰 **Budget**: Your budget range?
• 🎯 **Interests**: What activities do you enjoy?
• 👥 **Style**: How do you like to travel?

What are your travel plans?"""
    
    # Send response back using chat protocol
    await ctx.send(sender, ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[
            TextContent(type="text", text=response_text),
            EndSessionContent(type="end-session"),
        ]
    ))

@chat_protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle acknowledgements (read receipts)"""
    # Not used in this example, but can be useful for tracking
    pass

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
    
    # A2A Communication: Send to Planner Agent for itinerary generation
    if matches:
        await send_matches_to_planner(ctx, msg.user_id, matches, msg.preferences)

def calculate_synergy_asi(user1_prefs: Dict, user2_prefs: Dict) -> Dict:
    """
    ASI-powered compatibility calculation with detailed reasoning
    Falls back to traditional method if ASI not available
    """
    if not ASI_ENABLED:
        # Fallback to traditional calculation
        user1 = TravelPreferences(**user1_prefs) if isinstance(user1_prefs, dict) else user1_prefs
        user2 = TravelPreferences(**user2_prefs) if isinstance(user2_prefs, dict) else user2_prefs
        score = calculate_synergy(user1, user2)
        return {
            "overall_score": score,
            "destination_match": 0.8 if user1_prefs.get('destination') == user2_prefs.get('destination') else 0.3,
            "budget_match": 0.7,
            "activity_match": 0.7,
            "pace_match": 0.7,
            "interests_match": 0.7,
            "style_match": 0.7,
            "reasoning": "Compatibility calculated using traditional algorithm",
            "strengths": ["Compatible preferences"],
            "concerns": []
        }
    
    try:
        # Use ASI:One for intelligent compatibility analysis
        asi = get_asi_llm()
        result = asi.analyze_compatibility(user1_prefs, user2_prefs)
        
        # Store in knowledge graph if available
        if KG_ENABLED:
            kg = get_knowledge_graph()
            kg.add_match(
                user1_prefs.get('user_id'),
                user2_prefs.get('user_id'),
                result
            )
        
        return result
    except Exception as e:
        print(f"❌ ASI matching error: {e}")
        # Fallback
        user1 = TravelPreferences(**user1_prefs) if isinstance(user1_prefs, dict) else user1_prefs
        user2 = TravelPreferences(**user2_prefs) if isinstance(user2_prefs, dict) else user2_prefs
        score = calculate_synergy(user1, user2)
        return {
            "overall_score": score,
            "reasoning": "Using fallback algorithm",
            "strengths": [],
            "concerns": []
        }

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
    """Find top compatible matches for a user with ASI-powered analysis"""
    matches = []
    
    ctx.logger.info(f"🔍 Searching for matches among {len(travelers_pool)} travelers...")
    ctx.logger.info(f"   ASI:One AI: {'ENABLED ✨' if ASI_ENABLED else 'DISABLED'}")
    ctx.logger.info(f"   Knowledge Graph: {'ENABLED 🧠' if KG_ENABLED else 'DISABLED'}")
    
    # Store user preferences in knowledge graph
    if KG_ENABLED:
        try:
            kg = get_knowledge_graph()
            user_prefs_dict = {
                "preferred_destinations": [preferences.destination],
                "budget_min": preferences.budget_min,
                "budget_max": preferences.budget_max,
                "activities": preferences.activities,
                "travel_style": preferences.travel_style
            }
            kg.add_user_preferences(user_id, user_prefs_dict)
        except Exception as e:
            ctx.logger.error(f"KG Error: {e}")
    
    for other_id, other_prefs in travelers_pool.items():
        if other_id == user_id:
            continue
        
        # Use ASI if available, otherwise fallback
        if ASI_ENABLED:
            try:
                user1_dict = {
                    "user_id": user_id,
                    "preferred_destinations": [preferences.destination],
                    "budget_min": preferences.budget_min,
                    "budget_max": preferences.budget_max,
                    "activities": preferences.activities,
                    "travel_style": preferences.travel_style,
                    "travel_pace": "moderate"  # default
                }
                user2_dict = {
                    "user_id": other_id,
                    "preferred_destinations": [other_prefs.destination],
                    "budget_min": other_prefs.budget_min,
                    "budget_max": other_prefs.budget_max,
                    "activities": other_prefs.activities,
                    "travel_style": other_prefs.travel_style,
                    "travel_pace": "moderate"
                }
                
                result = calculate_synergy_asi(user1_dict, user2_dict)
                synergy = result.get('overall_score', 70)
                
                ctx.logger.info(f"   ✨ ASI: {user_id} <-> {other_id}: {synergy}% - {result.get('reasoning', '')[:50]}...")
            except Exception as e:
                ctx.logger.error(f"ASI Error: {e}, falling back...")
                synergy = calculate_synergy(preferences, other_prefs)
        else:
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

async def send_matches_to_planner(ctx: Context, user_id: str, matches: List[Dict], preferences: TravelPreferences):
    """
    A2A Communication: Send match results to Planner Agent for itinerary generation
    """
    if not matches:
        return
    
    # Get planner agent address from environment or use default
    planner_address = os.environ.get("PLANNER_ADDRESS", "agent1qw...")
    
    if planner_address == "agent1qw...":
        ctx.logger.warning("⚠️  Planner agent address not configured. Skipping A2A communication.")
        return
    
    try:
        # Prepare itinerary request
        matched_ids = [m['user_id'] for m in matches[:3]]  # Top 3 matches
        combined_interests = list(preferences.activities.keys())
        avg_budget = (preferences.budget_min + preferences.budget_max) / 2
        
        request = ItineraryRequest(
            user_id=user_id,
            matched_user_ids=matched_ids,
            destination=preferences.destination,
            num_days=7,  # Default 1 week
            combined_interests=combined_interests,
            combined_budget=avg_budget,
            travel_pace="moderate",
            timestamp=datetime.now(timezone.utc).isoformat(),
            source_agent=ctx.agent.address
        )
        
        ctx.logger.info(f"📤 A2A: Sending itinerary request to Planner Agent...")
        await ctx.send(planner_address, request)
        ctx.logger.info(f"✅ A2A: Itinerary request sent!")
        
    except Exception as e:
        ctx.logger.error(f"❌ A2A Communication failed: {e}")

# Include chat protocol
matchmaker.include(chat_protocol, publish_manifest=True)

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Starting WanderLink MatchMaker Agent...")
    print("💬 Chat Protocol: ENABLED")
    print("=" * 60 + "\n")
    matchmaker.run()
