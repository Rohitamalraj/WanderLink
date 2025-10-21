"""
WanderLink User Agent
Autonomous agent for managing user profiles and preferences
"""

from uagents import Agent, Context, Model
from typing import List, Dict, Optional
import json
from datetime import datetime

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
# For Agentverse deployment: remove port and endpoint
user_agent = Agent(
    name="wanderlink_user",
    seed="wanderlink_user_secret_2025"
)

# Storage for user profiles
user_profiles: Dict[str, UserProfile] = {}
user_travel_history: Dict[str, List[Dict]] = {}
user_preferences: Dict[str, Dict] = {}

@user_agent.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("👤 WanderLink User Agent Started!")
    ctx.logger.info("=" * 60)
    ctx.logger.info(f"Agent Name: {user_agent.name}")
    ctx.logger.info(f"Agent Address: {user_agent.address}")
    ctx.logger.info("=" * 60)

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

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Starting WanderLink User Agent...")
    print("=" * 60 + "\n")
    user_agent.run()

