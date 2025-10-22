"""
WanderLink User Agent
Autonomous agent for managing user profiles and preferences
Supports both direct messaging and chat protocol
"""

from uagents import Agent, Context, Model, Protocol
from typing import List, Dict, Optional
import json
from datetime import datetime
from uuid import uuid4

# Message models
class UserProfile(Model):
    user_id: str
    name: str
    email: str
    age: Optional[int]
    location: Optional[str]
    bio: Optional[str]

class ProfileRequest(Model):
    user_id: str

class ProfileResponse(Model):
    profile: Dict
    travel_history: List[Dict]
    preferences: Dict
    message: str

class UpdateProfileRequest(Model):
    user_id: str
    updates: Dict

# Create user agent
# For local testing: use port and endpoint
# For Agentverse: remove port and endpoint
user_agent = Agent(
    name="wanderlink_user",
    seed="wanderlink_user_secret_2025",
    port=8003,
    endpoint=["http://localhost:8003/submit"]
)

# Chat protocol for conversational interface
chat_protocol = Protocol(name="UserChat", version="1.0")

# Storage for user profiles
user_profiles: Dict[str, UserProfile] = {}
user_travel_history: Dict[str, List[Dict]] = {}
user_preferences: Dict[str, Dict] = {}

# Conversation state storage
conversation_states: Dict[str, Dict] = {}

@user_agent.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("👤 WanderLink User Agent Started!")
    ctx.logger.info("=" * 60)
    ctx.logger.info(f"Agent Name: {user_agent.name}")
    ctx.logger.info(f"Agent Address: {user_agent.address}")
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
    """Handle conversational profile management"""
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
        user_id = state["user_id"]
        profile = user_profiles.get(user_id)
        
        if profile:
            response_text = f"""👋 **Welcome back, {profile.name}!**

Your profile is all set up. What would you like to do?

1. 🔍 Find travel matches
2. 📋 View my profile
3. ⚙️  Update preferences
4. 🗺️  Plan a trip
5. 📊 View travel stats

Just tell me what you'd like!"""
        else:
            response_text = """👋 **Welcome to WanderLink!**

I'm your personal travel assistant. Let's set up your profile first!

Please tell me:
• Your name
• Email address
• Age (optional)
• Location (optional)
• A bit about yourself

Example: "Hi, I'm Sarah, sarah@email.com, 28 years old from NYC. Love adventure travel!"

What's your info?"""
            state["step"] = "profile_setup"
    
    elif state["step"] == "profile_setup":
        # Extract profile info
        profile_info = extract_profile_info(msg.message, state["user_id"])
        
        if profile_info:
            # Create profile
            profile = UserProfile(**profile_info)
            user_profiles[state["user_id"]] = profile
            user_preferences[state["user_id"]] = initialize_default_preferences()
            user_travel_history[state["user_id"]] = []
            
            response_text = f"""✅ **Profile Created Successfully!**

Welcome aboard, {profile.name}! 🎉

Your profile is ready:
• Name: {profile.name}
• Email: {profile.email}
{"• Age: " + str(profile.age) if profile.age else ""}
{"• Location: " + profile.location if profile.location else ""}

What would you like to do next?
1. Set your travel preferences
2. Find travel matches
3. Plan a trip

Just ask!"""
            state["step"] = "welcome"
        else:
            response_text = """I need at least your name and email to create your profile.

Example: "I'm John, john@email.com, 30 from SF"

What's your information?"""
    
    elif state["step"] == "view_profile":
        user_id = state["user_id"]
        profile = user_profiles.get(user_id)
        
        if profile:
            prefs = user_preferences.get(user_id, {})
            stats = calculate_user_stats(user_id)
            
            response_text = f"""👤 **Your Profile**

**Basic Info:**
• Name: {profile.name}
• Email: {profile.email}
{"• Age: " + str(profile.age) if profile.age else ""}
{"• Location: " + profile.location if profile.location else ""}
{"• Bio: " + profile.bio if profile.bio else ""}

**Travel Stats:**
• Total Trips: {stats['total_trips']}
• Destinations Visited: {stats['unique_destinations']}
• Total Travel Days: {stats['total_travel_days']}

**Preferences:**
• Travel Pace: {prefs.get('travel_pace', 'moderate')}
• Budget Range: ${prefs.get('budget_range', {}).get('min', 50)}-${prefs.get('budget_range', {}).get('max', 200)}/day

Want to update anything?"""
        else:
            response_text = "Let's set up your profile first!"
            state["step"] = "profile_setup"
        
        state["step"] = "welcome"
    
    else:
        # Route based on message content
        if any(word in message_lower for word in ['profile', 'my info', 'about me']):
            state["step"] = "view_profile"
            response_text = "Let me get your profile..."
        elif any(word in message_lower for word in ['match', 'find', 'companion']):
            response_text = "Great! I'll connect you with the MatchMaker agent to find travel companions. One moment..."
            state["step"] = "welcome"
        elif any(word in message_lower for word in ['plan', 'itinerary', 'trip']):
            response_text = "Awesome! I'll connect you with the Planner agent to create your itinerary. Just a sec..."
            state["step"] = "welcome"
        else:
            response_text = "I can help you with:\n• Finding travel matches\n• Planning trips\n• Managing your profile\n\nWhat would you like to do?"
            state["step"] = "welcome"
    
    # Send response
    response = ChatResponse(
        session_id=msg.session_id,
        message=response_text,
        timestamp=datetime.utcnow().isoformat()
    )
    
    await ctx.send(sender, response)

def extract_profile_info(message: str, user_id: str) -> Optional[Dict]:
    """Extract profile information from natural language"""
    import re
    
    # Extract email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', message)
    if not email_match:
        return None
    
    email = email_match.group(0)
    
    # Extract name (common patterns)
    name_patterns = [
        r"(?:i'm|i am|name is|name's|call me)\s+([A-Z][a-z]+)",
        r"^([A-Z][a-z]+),",
        r"^Hi,?\s*(?:I'm|I am)\s+([A-Z][a-z]+)"
    ]
    
    name = None
    for pattern in name_patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            name = match.group(1).capitalize()
            break
    
    if not name:
        name = "User"
    
    # Extract age
    age_match = re.search(r'(\d{2})\s*(?:years?\s*old|yo)', message)
    age = int(age_match.group(1)) if age_match else None
    
    # Extract location
    location_patterns = [
        r'from\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|$)',
        r'in\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|$)',
        r'live\s+in\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|$)'
    ]
    
    location = None
    for pattern in location_patterns:
        match = re.search(pattern, message)
        if match:
            location = match.group(1).strip()
            break
    
    return {
        "user_id": user_id,
        "name": name,
        "email": email,
        "age": age,
        "location": location,
        "bio": None
    }

# ============================================================================
# DIRECT MESSAGE HANDLERS
# ============================================================================

@user_agent.on_message(model=ProfileRequest)
async def handle_profile_request(ctx: Context, sender: str, msg: ProfileRequest):
    """Retrieve user profile and travel history"""
    ctx.logger.info(f"📨 Received profile request for user: {msg.user_id}")
    
    # Get user data
    profile = user_profiles.get(msg.user_id)
    travel_history = user_travel_history.get(msg.user_id, [])
    preferences = user_preferences.get(msg.user_id, {})
    
    if profile:
        response = ProfileResponse(
            profile={
                "user_id": profile.user_id,
                "name": profile.name,
                "email": profile.email,
                "age": profile.age,
                "location": profile.location,
                "bio": profile.bio
            },
            travel_history=travel_history,
            preferences=preferences,
            message=f"Profile found for {msg.user_id}"
        )
        ctx.logger.info(f"✅ Profile sent for {msg.user_id}")
    else:
        response = ProfileResponse(
            profile={},
            travel_history=[],
            preferences={},
            message=f"No profile found for {msg.user_id}"
        )
        ctx.logger.info(f"⚠️  No profile found for {msg.user_id}")
    
    await ctx.send(sender, response)

@user_agent.on_message(model=UserProfile)
async def handle_profile_update(ctx: Context, sender: str, msg: UserProfile):
    """Create or update user profile"""
    ctx.logger.info(f"📝 Updating profile for user: {msg.user_id}")
    
    # Store profile
    user_profiles[msg.user_id] = msg
    
    # Initialize travel history and preferences if new user
    if msg.user_id not in user_travel_history:
        user_travel_history[msg.user_id] = []
    if msg.user_id not in user_preferences:
        user_preferences[msg.user_id] = initialize_default_preferences()
    
    ctx.logger.info(f"✅ Profile updated for {msg.user_id}")
    ctx.logger.info(f"👥 Total users: {len(user_profiles)}")
    
    # Send confirmation
    response = ProfileResponse(
        profile={
            "user_id": msg.user_id,
            "name": msg.name,
            "email": msg.email,
            "age": msg.age,
            "location": msg.location,
            "bio": msg.bio
        },
        travel_history=user_travel_history[msg.user_id],
        preferences=user_preferences[msg.user_id],
        message=f"Profile updated successfully for {msg.user_id}"
    )
    
    await ctx.send(sender, response)

@user_agent.on_message(model=UpdateProfileRequest)
async def handle_preference_update(ctx: Context, sender: str, msg: UpdateProfileRequest):
    """Update user preferences"""
    ctx.logger.info(f"⚙️  Updating preferences for user: {msg.user_id}")
    
    if msg.user_id in user_preferences:
        # Merge updates
        user_preferences[msg.user_id].update(msg.updates)
        ctx.logger.info(f"✅ Preferences updated for {msg.user_id}")
        message = "Preferences updated successfully"
    else:
        # Create new preferences
        user_preferences[msg.user_id] = msg.updates
        ctx.logger.info(f"✅ New preferences created for {msg.user_id}")
        message = "Preferences created successfully"
    
    # Get profile for response
    profile = user_profiles.get(msg.user_id, {})
    travel_history = user_travel_history.get(msg.user_id, [])
    
    response = ProfileResponse(
        profile=profile.__dict__ if hasattr(profile, '__dict__') else {},
        travel_history=travel_history,
        preferences=user_preferences[msg.user_id],
        message=message
    )
    
    await ctx.send(sender, response)

def initialize_default_preferences() -> Dict:
    """Initialize default user preferences"""
    return {
        "activities": {
            "culture": 0.5,
            "adventure": 0.5,
            "food": 0.5,
            "beach": 0.5,
            "nightlife": 0.5,
            "shopping": 0.5,
            "nature": 0.5
        },
        "travel_style": {
            "luxury": 0.5,
            "budget": 0.5,
            "social": 0.5,
            "solo": 0.5
        },
        "budget_range": {
            "min": 50,
            "max": 200
        },
        "preferred_destinations": [],
        "travel_pace": "moderate"
    }

def calculate_user_stats(user_id: str) -> Dict:
    """Calculate user travel statistics"""
    history = user_travel_history.get(user_id, [])
    
    total_trips = len(history)
    total_destinations = len(set([trip.get("destination") for trip in history]))
    total_days = sum([trip.get("duration", 0) for trip in history])
    
    return {
        "total_trips": total_trips,
        "unique_destinations": total_destinations,
        "total_travel_days": total_days,
        "average_trip_length": total_days / total_trips if total_trips > 0 else 0
    }

# Register chat protocol
user_agent.include(chat_protocol, publish_manifest=True)

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Starting WanderLink User Agent...")
    print("=" * 60 + "\n")
    user_agent.run()

