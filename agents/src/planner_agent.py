"""
WanderLink Planner Agent
Autonomous agent for generating AI-powered travel itineraries
Supports both direct messaging and chat protocol
"""

from uagents import Agent, Context, Model, Protocol
from typing import List, Dict, Optional
import json
from datetime import datetime
from uuid import uuid4

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
# For local testing: use port and endpoint
# For Agentverse: remove port and endpoint
planner = Agent(
    name="wanderlink_planner",
    seed="wanderlink_planner_secret_2025",
    port=8002,
    endpoint=["http://localhost:8002/submit"]
)

# Chat protocol for conversational interface
chat_protocol = Protocol(name="PlannerChat", version="1.0")

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
    """Handle conversational chat messages"""
    ctx.logger.info(f"💬 Chat from {sender[:16]}...: {msg.message[:50]}...")
    
    # Get or create conversation state
    if msg.session_id not in conversation_states:
        conversation_states[msg.session_id] = {
            "step": "welcome",
            "data": {}
        }
    
    state = conversation_states[msg.session_id]
    message_lower = msg.message.lower()
    
    # Process based on current step
    if state["step"] == "welcome":
        response_text = """🗺️ **Welcome to WanderLink AI Planner!**

I'll help you create the perfect travel itinerary.

Please tell me:
1. Your destination
2. Number of days
3. Your interests (culture, adventure, food, etc.)
4. Daily budget
5. Travel pace (relaxed/moderate/packed)

Example: "Plan a 7-day Tokyo trip with $150/day, interested in culture and food, moderate pace"

What would you like to plan?"""
        state["step"] = "collecting"
    
    elif state["step"] == "collecting":
        # Try to extract information
        extracted = extract_trip_info(msg.message)
        
        if extracted.get("destination") and extracted.get("num_days"):
            # Generate itinerary
            request = ItineraryRequest(
                destination=extracted["destination"],
                num_days=extracted["num_days"],
                interests=extracted.get("interests", ["sightseeing"]),
                budget_per_day=extracted.get("budget_per_day", 100),
                pace=extracted.get("pace", "moderate")
            )
            
            itinerary = generate_itinerary(request)
            recommendations = generate_recommendations(request)
            total_cost = request.budget_per_day * request.num_days
            
            # Format response
            response_text = f"""✅ **Your {request.num_days}-Day {request.destination} Itinerary!**

📍 **Destination:** {request.destination}
📅 **Duration:** {request.num_days} days
💰 **Budget:** ${request.budget_per_day}/day
⏰ **Pace:** {request.pace}

---

"""
            for day in itinerary[:3]:  # Show first 3 days
                response_text += f"**{day['title']}**\n"
                for activity in day['activities'][:2]:
                    response_text += f"• {activity}\n"
                response_text += f"💵 {day['budget_range']}\n\n"
            
            if len(itinerary) > 3:
                response_text += f"*...and {len(itinerary) - 3} more days*\n\n"
            
            response_text += "**🎯 Pro Tips:**\n"
            for rec in recommendations[:3]:
                response_text += f"✅ {rec}\n"
            
            response_text += f"\n**Total Estimated Cost:** ${int(total_cost - 200)}-${int(total_cost + 200)}\n\n"
            response_text += "Would you like to plan another trip?"
            
            state["step"] = "welcome"
            state["data"] = {"last_itinerary": itinerary}
        else:
            response_text = """I need a bit more information! Please include:

• **Destination**: Where do you want to go?
• **Duration**: How many days?
• **Budget**: How much per day?
• **Interests**: What do you enjoy?
• **Pace**: Relaxed, moderate, or packed?

Example: "Tokyo for 5 days, $120/day, love food and culture, moderate pace" """
    
    else:
        response_text = "Let's start planning! What destination interests you?"
        state["step"] = "collecting"
    
    # Send response
    response = ChatResponse(
        session_id=msg.session_id,
        message=response_text,
        timestamp=datetime.utcnow().isoformat()
    )
    
    await ctx.send(sender, response)

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
    
    # Generate itinerary
    ctx.logger.info("📝 Generating itinerary...")
    itinerary = generate_itinerary(msg)
    
    # Calculate costs
    total_cost = msg.budget_per_day * msg.num_days
    
    # Generate recommendations
    recommendations = generate_recommendations(msg)
    
    response = ItineraryResponse(
        itinerary=itinerary,
        recommendations=recommendations,
        estimated_cost=f"${int(total_cost - 200)}-${int(total_cost + 200)}",
        message=f"Generated {msg.num_days}-day itinerary for {msg.destination}"
    )
    
    ctx.logger.info(f"✅ Itinerary generated successfully!")
    await ctx.send(sender, response)

def generate_itinerary(request: ItineraryRequest) -> List[Dict]:
    """Generate itinerary based on preferences"""
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
