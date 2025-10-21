"""
WanderLink Planner Agent
Autonomous agent for generating AI-powered travel itineraries
Supports both direct messaging and conversational chat interface
"""

from uagents import Agent, Context, Protocol, Model
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    EndSessionContent,
    chat_protocol_spec,
)
from typing import List, Dict
from datetime import datetime
from uuid import uuid4
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import Google Gemini (optional)
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-pro')
    else:
        gemini_model = None
except ImportError:
    gemini_model = None

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
planner = Agent(
    name="wanderlink_planner",
    seed="wanderlink_planner_secret_2025",
    port=8002,
    endpoint=["http://localhost:8002/submit"]
)

# Initialize chat protocol
chat_protocol = Protocol(spec=chat_protocol_spec)

# ============================================================================
# CONVERSATION STATE MANAGEMENT
# ============================================================================

# Store conversation states per user
conversation_states = {}

class ItineraryConversationState:
    """Track conversation state for itinerary planning"""
    def __init__(self):
        self.destination = None
        self.num_days = None
        self.interests = []
        self.budget_per_day = None
        self.pace = None
        self.current_step = "welcome"
        self.context = {}

def get_or_create_state(user_id: str) -> ItineraryConversationState:
    """Get or create conversation state for user"""
    if user_id not in conversation_states:
        conversation_states[user_id] = ItineraryConversationState()
    return conversation_states[user_id]

# ============================================================================
# NLP HELPERS
# ============================================================================

def detect_intent(text: str) -> dict:
    """Detect user intent from natural language"""
    text_lower = text.lower()
    
    # Itinerary planning intents
    if any(word in text_lower for word in ['plan', 'itinerary', 'trip', 'travel', 'vacation']):
        return {'intent': 'plan_itinerary', 'confidence': 0.9}
    
    # Help
    if any(word in text_lower for word in ['help', 'what can', 'how do', 'guide']):
        return {'intent': 'help', 'confidence': 0.9}
    
    return {'intent': 'conversational', 'confidence': 0.5}

def extract_destination(text: str) -> str:
    """Extract destination from text"""
    destinations = ['tokyo', 'paris', 'london', 'new york', 'bali', 'rome', 'barcelona', 
                   'dubai', 'bangkok', 'singapore', 'iceland', 'switzerland', 'japan', 
                   'italy', 'spain', 'france', 'greece', 'maldives', 'hawaii']
    
    text_lower = text.lower()
    for dest in destinations:
        if dest in text_lower:
            return dest.title()
    
    return None

def extract_days(text: str) -> int:
    """Extract number of days from text"""
    import re
    patterns = [
        r'(\d+)\s*days?',
        r'(\d+)\s*nights?',
        r'(\d+)[-]day',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return int(match.group(1))
    
    return None

def extract_interests(text: str) -> list:
    """Extract interests from text"""
    interest_keywords = {
        'culture': ['culture', 'museum', 'history', 'heritage', 'art'],
        'adventure': ['adventure', 'hiking', 'trekking', 'climbing', 'extreme'],
        'food': ['food', 'cuisine', 'dining', 'restaurant', 'foodie'],
        'beach': ['beach', 'ocean', 'sea', 'swimming', 'snorkeling'],
        'nightlife': ['nightlife', 'party', 'club', 'bar', 'evening'],
        'shopping': ['shopping', 'market', 'boutique', 'mall'],
        'nature': ['nature', 'wildlife', 'parks', 'scenery', 'outdoors'],
        'photography': ['photo', 'photography', 'instagram', 'scenic'],
    }
    
    text_lower = text.lower()
    found_interests = []
    
    for interest, keywords in interest_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            found_interests.append(interest)
    
    return found_interests

def extract_budget(text: str) -> float:
    """Extract budget from text"""
    import re
    patterns = [
        r'\$\s*(\d+)',
        r'(\d+)\s*(?:dollars|usd)',
        r'budget.*?(\d+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return float(match.group(1))
    
    return None

def extract_pace(text: str) -> str:
    """Extract travel pace from text"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['relaxed', 'slow', 'leisure', 'chill', 'easy']):
        return 'relaxed'
    elif any(word in text_lower for word in ['packed', 'busy', 'full', 'intense', 'action']):
        return 'packed'
    else:
        return 'moderate'

# ============================================================================
# CONVERSATIONAL HANDLERS
# ============================================================================

def handle_plan_itinerary_chat(state: ItineraryConversationState, text: str, ctx: Context) -> str:
    """Handle itinerary planning conversation"""
    
    if state.current_step == "welcome":
        state.current_step = "destination"
        return """🗺️ *Welcome to WanderLink AI Itinerary Planner!*

I'll help you create the perfect travel itinerary.

*Let's start with your destination!*

Where would you like to travel?

For example:
- "I want to visit Tokyo"
- "Planning a trip to Paris"
- "Bali vacation"

What's your destination?"""
    
    elif state.current_step == "destination":
        destination = extract_destination(text)
        if destination:
            state.destination = destination
            state.current_step = "duration"
            return f"""✈️ *{destination} - Great choice!*

*How many days will you be there?*

For example:
- "5 days"
- "One week"
- "10 days"

How long is your trip?"""
        else:
            return """I couldn't detect the destination. 

Please mention a specific place like:
- Tokyo, Paris, New York, Bali

Where would you like to go?"""
    
    elif state.current_step == "duration":
        days = extract_days(text)
        if days:
            state.num_days = days
            state.current_step = "interests"
            return f"""📅 *Perfect! {days} days in {state.destination}*

*What are your interests?*

Tell me what you enjoy:

For example:
- "I love culture, museums, and history"
- "Adventure and hiking"
- "Food, beaches, and nightlife"

What are you interested in?"""
        else:
            return """I couldn't find the number of days.

Please specify like: "5 days" or "One week"

How many days?"""
    
    elif state.current_step == "interests":
        interests = extract_interests(text)
        if interests:
            state.interests = interests
            state.current_step = "budget"
            return f"""🎯 *Awesome! You're into {', '.join(interests)}*

*What's your daily budget?*

For example:
- "$100 per day"
- "Budget is $150"

What's your budget per day?"""
        else:
            return """Tell me about your interests!

Examples: "Culture and museums" or "Adventure activities"

What do you enjoy?"""
    
    elif state.current_step == "budget":
        budget = extract_budget(text)
        if budget:
            state.budget_per_day = budget
            state.current_step = "pace"
            return f"""💰 *Got it! ${budget} per day*

*What's your travel pace?*

Choose:
- "Relaxed" - Take it easy
- "Moderate" - Balanced mix
- "Packed" - See everything

What pace suits you?"""
        else:
            return """Please specify your daily budget:

Example: "$100 per day"

What's your budget?"""
    
    elif state.current_step == "pace":
        pace = extract_pace(text)
        state.pace = pace
        state.current_step = "complete"
        
        # Generate itinerary
        ctx.logger.info("🤖 Generating AI itinerary from chat...")
        
        # Create request object
        request = ItineraryRequest(
            destination=state.destination,
            num_days=state.num_days,
            interests=state.interests,
            budget_per_day=state.budget_per_day,
            pace=state.pace
        )
        
        # Generate itinerary
        if gemini_model:
            import asyncio
            try:
                itinerary = asyncio.run(generate_ai_itinerary(ctx, request))
            except:
                itinerary = generate_mock_itinerary(request)
        else:
            itinerary = generate_mock_itinerary(request)
        
        # Format response
        total_cost = state.budget_per_day * state.num_days
        
        response = f"""✅ *Your {state.num_days}-Day {state.destination} Itinerary!*

*Trip Summary:*
📍 Destination: {state.destination}
📅 Duration: {state.num_days} days
🎯 Interests: {', '.join(state.interests)}
💰 Budget: ${state.budget_per_day}/day
⏰ Pace: {state.pace.title()}

---

"""
        
        # Add daily plans
        for day_plan in itinerary:
            response += f"""*{day_plan['title']}*

"""
            for activity in day_plan['activities']:
                response += f"• {activity}\n"
            
            response += f"\n💵 {day_plan['budget_range']}\n\n---\n\n"
        
        # Add recommendations
        recommendations = generate_recommendations(request)
        response += "*🎯 Pro Tips:*\n\n"
        for rec in recommendations:
            response += f"✅ {rec}\n"
        
        response += f"""

*Total: ${int(total_cost - 200)}-${int(total_cost + 200)}*

Enjoy your trip! 🎉

Say "plan another trip" to start over!"""
        
        # Reset state for next planning
        state.current_step = "welcome"
        
        return response
    
    return "Let's continue planning!"

def handle_help_chat(state: ItineraryConversationState, text: str) -> str:
    """Provide help"""
    return """💡 *WanderLink AI Planner*

I create personalized travel itineraries!

*Just say:*
- "Plan a trip"
- "Create an itinerary"

*I'll ask about:*
✈️ Destination
📅 Duration
🎯 Interests
💰 Budget
⏰ Pace

Ready to plan? 🌍"""

def handle_conversational_chat(state: ItineraryConversationState, text: str) -> str:
    """Handle general conversation"""
    return """👋 *Hello! I'm your AI Travel Planner.*

Say "Plan a trip" to get started!

Where would you like to travel? 🌍"""

def process_chat_conversation(user_id: str, text: str, ctx: Context) -> str:
    """Process conversational input and generate response"""
    
    # Get or create conversation state
    state = get_or_create_state(user_id)
    
    # Detect intent
    intent_result = detect_intent(text)
    intent = intent_result['intent']
    
    # Route to appropriate handler
    if intent == 'plan_itinerary' or state.current_step != "welcome":
        return handle_plan_itinerary_chat(state, text, ctx)
    elif intent == 'help':
        return handle_help_chat(state, text)
    else:
        return handle_conversational_chat(state, text)

# ============================================================================
# AGENT STARTUP AND MESSAGE HANDLERS
# ============================================================================

@planner.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("🗺️  WanderLink Planner Agent Started!")
    ctx.logger.info("=" * 60)
    ctx.logger.info(f"Agent Name: {planner.name}")
    ctx.logger.info(f"Agent Address: {planner.address}")
    ctx.logger.info(f"Port: 8002")
    
    if gemini_model:
        ctx.logger.info("✅ Google Gemini integration enabled")
    else:
        ctx.logger.info("⚠️  Running without Gemini AI (mock mode)")
    
    ctx.logger.info("💬 Chat protocol enabled - supports conversational interface")
    ctx.logger.info("=" * 60)

# ============================================================================
# CHAT PROTOCOL HANDLERS
# ============================================================================

@chat_protocol.on_message(ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    """Handle chat messages with NLP processing"""
    try:
        # Send acknowledgement
        await ctx.send(
            sender,
            ChatAcknowledgement(
                timestamp=datetime.now(),
                acknowledged_msg_id=msg.msg_id
            ),
        )
        
        # Extract text from message content
        text = ''
        for item in msg.content:
            if isinstance(item, TextContent):
                text += item.text
        
        ctx.logger.info(f"💬 Chat from {sender[:10]}...: {text[:50]}...")
        
        # Process conversation
        response = process_chat_conversation(sender, text, ctx)
        
        ctx.logger.info(f"✅ Generated response ({len(response)} chars)")
        
        # Send response back with chat protocol
        await ctx.send(
            sender,
            ChatMessage(
                timestamp=datetime.utcnow(),
                msg_id=uuid4(),
                content=[
                    TextContent(type="text", text=response),
                ]
            )
        )
        
    except Exception as e:
        ctx.logger.error(f"Error processing chat: {e}")
        error_response = "❌ Sorry, I encountered an error. Please try again!"
        await ctx.send(
            sender,
            ChatMessage(
                timestamp=datetime.utcnow(),
                msg_id=uuid4(),
                content=[
                    TextContent(type="text", text=error_response),
                ]
            )
        )

@chat_protocol.on_message(ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle chat acknowledgements"""
    ctx.logger.info(f"✅ Chat acknowledged by {sender[:10]}...")

# ============================================================================
# DIRECT MESSAGE HANDLERS (Original functionality)
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
    
    if gemini_model:
        # Use Gemini AI to generate itinerary
        ctx.logger.info("🤖 Generating Gemini AI-powered itinerary...")
        itinerary = await generate_ai_itinerary(ctx, msg)
    else:
        # Generate mock itinerary
        ctx.logger.info("📝 Generating mock itinerary...")
        itinerary = generate_mock_itinerary(msg)
        itinerary = generate_mock_itinerary(msg)
    
    # Calculate costs
    total_cost = msg.budget_per_day * msg.num_days
    
    recommendations = generate_recommendations(msg)
    
    response = ItineraryResponse(
        itinerary=itinerary,
        recommendations=recommendations,
        estimated_cost=f"${int(total_cost - 200)}-${int(total_cost + 200)}",
        message=f"Generated {msg.num_days}-day itinerary for {msg.destination}"
    )
    
    ctx.logger.info(f"✅ Itinerary generated successfully!")
    await ctx.send(sender, response)

async def generate_ai_itinerary(ctx: Context, request: ItineraryRequest) -> List[Dict]:
    """Use OpenAI to generate smart itinerary"""
    prompt = f"""
Create a {request.num_days}-day travel itinerary for {request.destination}.

Traveler interests: {', '.join(request.interests)}
Budget per day: ${request.budget_per_day}
Travel pace: {request.pace}

Generate a detailed daily plan with:
- Morning activities
- Lunch recommendations
- Afternoon activities
- Evening activities
- Estimated costs

Return ONLY a JSON array with this exact format:
[
  {{
    "day": 1,
    "title": "Day 1 - Arrival & Introduction",
    "activities": ["Morning: Airport pickup", "Lunch: Local cafe", "Afternoon: City walking tour", "Evening: Welcome dinner"],
    "budget_range": "$100-150"
  }}
]
"""
    
    try:
        response = gemini_model.generate_content(prompt)
        content = response.text
        ctx.logger.info("📄 Received Gemini AI response")
        
        # Parse JSON response (extract JSON from markdown if present)
        import json
        # Remove markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        itinerary = json.loads(content)
        return itinerary
        
    except Exception as e:
        ctx.logger.warning(f"⚠️  AI generation failed: {str(e)}")
        ctx.logger.info("📝 Falling back to mock itinerary")
        return generate_mock_itinerary(request)

def generate_mock_itinerary(request: ItineraryRequest) -> List[Dict]:
    """Generate mock itinerary without AI"""
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

# ============================================================================
# ATTACH CHAT PROTOCOL TO AGENT
# ============================================================================

# Attach the chat protocol to the planner agent
planner.include(chat_protocol, publish_manifest=True)

# ============================================================================
# RUN AGENT
# ============================================================================

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Starting WanderLink Planner Agent...")
    print("💬 Chat Protocol: ENABLED")
    print("🤖 Gemini AI: " + ("ENABLED" if gemini_model else "DISABLED (Mock Mode)"))
    print("=" * 60 + "\n")
    planner.run()
