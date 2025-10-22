"""
WanderLink Planner Agent
Autonomous agent for generating AI-powered travel itineraries
Supports both direct messaging, chat protocol, and A2A communication
Enhanced with ASI:One AI and Knowledge Graph
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
from uuid import uuid4
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

# Try to import ASI and Knowledge Graph utilities
try:
    from utils.asi_llm import get_asi_llm
    ASI_ENABLED = True
    print("✅ ASI:One integration enabled")
except ImportError as e:
    ASI_ENABLED = False
    print(f"⚠️  ASI:One not available: {e}")

try:
    from utils.knowledge_graph import get_knowledge_graph
    KG_ENABLED = True
    print("✅ Knowledge Graph enabled")
except ImportError as e:
    KG_ENABLED = False
    print(f"⚠️  Knowledge Graph not available: {e}")

# ============================================================================
# MESSAGE MODELS
# ============================================================================

# Direct messaging models
class ItineraryRequest(Model):
    """Request for itinerary generation"""
    destination: str
    num_days: int
    interests: List[str]
    budget_per_day: float
    pace: str  # "relaxed", "moderate", "packed"
    user_id: Optional[str] = None
    matched_user_ids: Optional[List[str]] = None
    timestamp: Optional[str] = None
    source_agent: Optional[str] = None

class ItineraryResponse(Model):
    """Response with generated itinerary"""
    itinerary: List[Dict]
    recommendations: List[str]
    estimated_cost: str
    message: str
    user_id: Optional[str] = None
    timestamp: Optional[str] = None
    asi_powered: bool = False

# Create planner agent
# For local testing: use port and endpoint
# For Agentverse: remove port and endpoint
planner = Agent(
    name="wanderlink_planner",
    seed="wanderlink_planner_secret_2025",
    port=8002,
    endpoint=["http://localhost:8002/submit"]
)

# Chat protocol for ASI:One compatibility
# IMPORTANT: Do NOT provide a name when using chat_protocol_spec
chat_protocol = Protocol(spec=chat_protocol_spec)

# Conversation state storage
conversation_states: Dict[str, Dict] = {}

@planner.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("🗺️  WanderLink Planner Agent Started!")
    ctx.logger.info("=" * 60)
    ctx.logger.info(f"Agent Name: {planner.name}")
    ctx.logger.info(f"Agent Address: {planner.address}")
    ctx.logger.info("💬 Chat Protocol: ENABLED")
    ctx.logger.info("=" * 60)

# ============================================================================
# CHAT PROTOCOL HANDLERS (ASI:One Compatible)
# ============================================================================

@chat_protocol.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    """Handle ASI:One compatible chat messages for itinerary planning"""
    ctx.logger.info(f"💬 Chat from {sender[:16]}...")
    
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
    
    ctx.logger.info(f"📝 Message: {text[:50]}...")
    
    # Extract trip information from natural language
    extracted = extract_trip_info(text)
    
    response_text = ""
    
    if extracted.get("destination") and extracted.get("num_days"):
        # Generate itinerary
        request = ItineraryRequest(
            destination=extracted["destination"],
            num_days=extracted["num_days"],
            interests=extracted.get("interests", ["sightseeing"]),
            budget_per_day=extracted.get("budget_per_day", 100),
            pace=extracted.get("pace", "moderate")
        )
        
        ctx.logger.info(f"🗺️  Generating itinerary for {request.destination}...")
        itinerary, asi_powered = generate_itinerary_asi(request, ctx)
        recommendations = generate_recommendations(request)
        total_cost = request.budget_per_day * request.num_days
        
        # Format response
        response_text = f"""✅ **Your {request.num_days}-Day {request.destination} Itinerary!**
{"✨ AI-Powered by ASI:One" if asi_powered else ""}

📍 **Destination:** {request.destination}
📅 **Duration:** {request.num_days} days
💰 **Budget:** ${request.budget_per_day}/day (Total: ${total_cost})
⏰ **Pace:** {request.pace}

---

"""
        for i, day in enumerate(itinerary[:5], 1):  # Show first 5 days
            response_text += f"**Day {i}: {day['title']}**\n"
            for activity in day['activities'][:3]:
                response_text += f"• {activity}\n"
            response_text += f"💵 {day['budget_range']}\n\n"
        
        if len(itinerary) > 5:
            response_text += f"\n... and {len(itinerary) - 5} more days!\n\n"
        
        response_text += """

🎯 **Travel Tips:**
"""
        for rec in recommendations[:3]:
            response_text += f"• {rec}\n"
        
        response_text += """

I specialize in creating personalized travel itineraries! Ask me about:
• Day-by-day activity planning
• Budget optimization
• Must-visit attractions
• Local experiences"""
        
    else:
        response_text = """👋 Hi! I'm the WanderLink Planner Agent - I specialize in creating personalized travel itineraries!

Tell me about your trip and I'll plan the perfect itinerary:

**Example:** "Plan a 7-day Tokyo trip with $150/day, interested in culture and food, moderate pace"

Include:
• 📍 **Destination**: Where are you going?
• 📅 **Duration**: How many days?
• 🎯 **Interests**: What do you enjoy? (culture, adventure, food, nature, etc.)
• 💰 **Budget**: Daily budget?
• ⏰ **Pace**: Relaxed, moderate, or packed schedule?

What trip would you like me to plan?"""
    
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

def extract_trip_info(message: str) -> Dict:
    """Extract trip information from natural language"""
    import re
    
    info = {}
    message_lower = message.lower()
    
    # Extract destination (common cities)
    destinations = ['tokyo', 'paris', 'london', 'new york', 'bali', 'rome', 'barcelona',
                   'dubai', 'bangkok', 'singapore', 'iceland', 'japan', 'italy', 'spain']
    for dest in destinations:
        if dest in message_lower:
            info["destination"] = dest.title()
            break
    
    # Extract number of days
    day_patterns = [r'(\d+)\s*days?', r'(\d+)\s*day', r'(\d+)[-]day']
    for pattern in day_patterns:
        match = re.search(pattern, message_lower)
        if match:
            info["num_days"] = int(match.group(1))
            break
    
    # Extract budget
    budget_patterns = [r'\$\s*(\d+)', r'(\d+)\s*dollars?', r'(\d+)\s*usd']
    for pattern in budget_patterns:
        match = re.search(pattern, message_lower)
        if match:
            info["budget_per_day"] = float(match.group(1))
            break
    
    # Extract interests
    interest_keywords = {
        'culture': ['culture', 'museum', 'history', 'art'],
        'adventure': ['adventure', 'hiking', 'climbing'],
        'food': ['food', 'cuisine', 'dining', 'restaurant'],
        'beach': ['beach', 'ocean', 'swimming'],
        'nightlife': ['nightlife', 'party', 'club'],
        'shopping': ['shopping', 'market'],
        'nature': ['nature', 'wildlife', 'parks']
    }
    
    interests = []
    for interest, keywords in interest_keywords.items():
        if any(keyword in message_lower for keyword in keywords):
            interests.append(interest)
    
    if interests:
        info["interests"] = interests
    
    # Extract pace
    if any(word in message_lower for word in ['relaxed', 'slow', 'chill', 'easy']):
        info["pace"] = "relaxed"
    elif any(word in message_lower for word in ['packed', 'busy', 'full', 'intense']):
        info["pace"] = "packed"
    else:
        info["pace"] = "moderate"
    
    return info

# ============================================================================
# DIRECT MESSAGE HANDLERS
# ============================================================================

@planner.on_message(model=ItineraryRequest)
async def handle_itinerary_request(ctx: Context, sender: str, msg: ItineraryRequest):
    """Generate travel itinerary based on preferences"""
    ctx.logger.info(f"📨 Received itinerary request")
    ctx.logger.info(f"   Destination: {msg.destination}")
    ctx.logger.info(f"   Duration: {msg.num_days} days")
    ctx.logger.info(f"   Interests: {', '.join(msg.interests)}")
    ctx.logger.info(f"   Budget/day: ${msg.budget_per_day}")
    ctx.logger.info(f"   Pace: {msg.pace}")
    
    # Generate itinerary with ASI
    ctx.logger.info("📝 Generating itinerary...")
    itinerary, asi_powered = generate_itinerary_asi(msg, ctx)
    
    # Calculate costs
    total_cost = msg.budget_per_day * msg.num_days
    
    # Generate recommendations
    recommendations = generate_recommendations(msg)
    
    response = ItineraryResponse(
        itinerary=itinerary,
        recommendations=recommendations,
        estimated_cost=f"${int(total_cost - 200)}-${int(total_cost + 200)}",
        message=f"Generated {msg.num_days}-day itinerary for {msg.destination}",
        user_id=msg.user_id,
        timestamp=datetime.now(timezone.utc).isoformat(),
        asi_powered=asi_powered
    )
    
    ctx.logger.info(f"✅ Itinerary generated successfully!")
    await ctx.send(sender, response)

def generate_itinerary_asi(request: ItineraryRequest, ctx: Context = None) -> tuple[List[Dict], bool]:
    """
    Generate AI-powered itinerary using ASI:One
    Returns: (itinerary, asi_powered)
    """
    if not ASI_ENABLED:
        if ctx:
            ctx.logger.warning("⚠️  ASI not available, using traditional method")
        return generate_itinerary_traditional(request), False
    
    try:
        if ctx:
            ctx.logger.info("🤖 Using ASI:One for intelligent itinerary generation...")
        
        asi = get_asi_llm()
        
        # Generate AI-powered itinerary
        result = asi.generate_itinerary(
            destination=request.destination,
            num_days=request.num_days,
            interests=request.interests,
            budget=request.budget_per_day,
            pace=request.pace
        )
        
        if result and 'itinerary' in result:
            if ctx:
                ctx.logger.info(f"✅ ASI generated {len(result['itinerary'])} days of activities")
            
            # Store in Knowledge Graph if available
            if KG_ENABLED and request.user_id:
                try:
                    kg = get_knowledge_graph()
                    # Store the trip plan
                    kg.add_trip(
                        user_id=request.user_id,
                        trip_id=f"trip_{request.user_id}_{datetime.now(timezone.utc).timestamp()}",
                        destination=request.destination,
                        start_date=datetime.now(timezone.utc).isoformat(),
                        end_date=datetime.now(timezone.utc).isoformat(),
                        budget=request.budget_per_day * request.num_days,
                        activities=request.interests
                    )
                    if ctx:
                        ctx.logger.info("💾 Stored itinerary in Knowledge Graph")
                except Exception as e:
                    if ctx:
                        ctx.logger.error(f"Failed to store in KG: {e}")
            
            return result['itinerary'], True
        else:
            if ctx:
                ctx.logger.warning("ASI returned empty result, falling back")
            return generate_itinerary_traditional(request), False
            
    except Exception as e:
        if ctx:
            ctx.logger.error(f"❌ ASI generation failed: {e}")
        return generate_itinerary_traditional(request), False

def generate_itinerary_traditional(request: ItineraryRequest) -> List[Dict]:
    """Generate itinerary based on preferences (traditional method)"""
    activities_by_pace = {
        "relaxed": [
            "Morning: Leisurely breakfast at hotel",
            "Late morning: Main attraction visit",
            "Lunch: Local restaurant (2 hours)",
            "Afternoon: Free time for shopping or rest",
            "Evening: Sunset viewing and dinner"
        ],
        "moderate": [
            "Morning: Breakfast and early start",
            "Morning activity: Main attraction",
            "Lunch: Quick local spot",
            "Afternoon: Secondary attraction",
            "Evening: Dinner and evening walk"
        ],
        "packed": [
            "Early morning: Breakfast on-the-go",
            "Morning: First attraction",
            "Lunch: Quick bite",
            "Afternoon: Multiple sites",
            "Evening: Night activities and late dinner"
        ]
    }
    
    daily_activities = activities_by_pace.get(request.pace, activities_by_pace["moderate"])
    
    itinerary = []
    for day in range(1, request.num_days + 1):
        if day == 1:
            title = f"Day {day} - Arrival & Orientation"
        elif day == request.num_days:
            title = f"Day {day} - Final Day & Departure"
        else:
            title = f"Day {day} - Explore {request.destination}"
        
        itinerary.append({
            "day": day,
            "title": title,
            "activities": daily_activities,
            "budget_range": f"${int(request.budget_per_day - 20)}-${int(request.budget_per_day + 20)}"
        })
    
    return itinerary

def generate_recommendations(request: ItineraryRequest) -> List[str]:
    """Generate travel recommendations"""
    recommendations = [
        f"Book accommodations in {request.destination} early for better rates",
        "Download offline maps before traveling",
        "Try local street food markets for authentic experience"
    ]
    
    # Add interest-specific recommendations
    if "culture" in request.interests:
        recommendations.append("Visit museums on weekday mornings to avoid crowds")
    if "adventure" in request.interests:
        recommendations.append("Book adventure activities 2-3 days in advance")
    if "food" in request.interests or "foodie" in request.interests:
        recommendations.append("Take a local food tour on your first day")
    
    return recommendations

# Include chat protocol
planner.include(chat_protocol, publish_manifest=True)

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Starting WanderLink Planner Agent...")
    print("💬 Chat Protocol: ENABLED")
    print("=" * 60 + "\n")
    planner.run()
