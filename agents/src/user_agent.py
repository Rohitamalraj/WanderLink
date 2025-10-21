"""
WanderLink User Agent
Individual autonomous agent for each user that manages their travel preferences
and communicates with matchmaker agent to find compatible trips
"""

from uagents import Agent, Context, Model
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# ============================================================================
# MESSAGE MODELS
# ============================================================================

class UserPreferences(Model):
    """User travel preferences"""
    user_id: str
    name: str
    email: str
    age: Optional[int]
    gender: Optional[str]
    location: Optional[str]
    
    # Travel preferences
    preferred_destinations: List[str]
    budget_min: float
    budget_max: float
    travel_pace: str  # relaxed, moderate, packed
    group_size_preference: Optional[str]
    
    # Interests
    interests: List[str]
    
    # Additional
    accommodation_types: List[str]
    dietary_restrictions: List[str]
    languages_spoken: List[str]
    travel_experience: str  # beginner, intermediate, expert
    smoking_preference: Optional[str]
    drinking_preference: Optional[str]

class MatchRequest(Model):
    """Request to find matching trips"""
    user_id: str
    agent_address: str
    preferences: Dict
    search_criteria: Optional[Dict]

class MatchResponse(Model):
    """Response with matching trips"""
    user_id: str
    matches: List[Dict]
    total_matches: int
    message: str

class JoinTripRequest(Model):
    """Request to join a specific trip"""
    user_id: str
    trip_id: str
    user_message: Optional[str]
    preferences: Dict

class JoinTripResponse(Model):
    """Response to join request"""
    success: bool
    match_request_id: str
    compatibility_score: float
    message: str

# ============================================================================
# USER AGENT CLASS
# ============================================================================

class WanderLinkUserAgent:
    """User agent manager"""
    
    def __init__(self, user_id: str, user_seed: str):
        self.user_id = user_id
        self.agent = Agent(
            name=f"wanderlink_user_{user_id[:8]}",
            seed=user_seed,
            port=8100 + hash(user_id) % 900,  # Dynamic port based on user_id
            endpoint=[f"http://localhost:{8100 + hash(user_id) % 900}/submit"]
        )
        
        # Setup handlers
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup agent message handlers"""
        
        @self.agent.on_event("startup")
        async def startup(ctx: Context):
            ctx.logger.info("=" * 60)
            ctx.logger.info(f"👤 WanderLink User Agent Started!")
            ctx.logger.info(f"User ID: {self.user_id[:16]}...")
            ctx.logger.info(f"Agent Address: {self.agent.address}")
            ctx.logger.info("=" * 60)
            
            # Update agent state in database
            if supabase:
                try:
                    supabase.table('user_agent_states').upsert({
                        'user_id': self.user_id,
                        'agent_address': str(self.agent.address),
                        'is_active': True,
                        'last_active_at': datetime.utcnow().isoformat()
                    }).execute()
                except Exception as e:
                    ctx.logger.error(f"Failed to update agent state: {e}")
        
        @self.agent.on_message(model=MatchRequest)
        async def handle_match_request(ctx: Context, sender: str, msg: MatchRequest):
            """Handle match request - forward to matchmaker agent"""
            ctx.logger.info(f"📨 Received match request for user {msg.user_id[:8]}...")
            
            # Get user preferences from database
            if supabase:
                try:
                    result = supabase.table('user_preferences')\
                        .select('*')\
                        .eq('user_id', msg.user_id)\
                        .single()\
                        .execute()
                    
                    preferences = result.data if result.data else msg.preferences
                    
                    # Forward to matchmaker agent
                    matchmaker_address = "agent1q2e9kfdrxfa5dxn6zeyw47287ca36cdur9xevhmdzzfmf4cwlmahv42sqph"  # Matchmaker agent address
                    
                    # Prepare match request for matchmaker
                    match_data = {
                        'user_id': msg.user_id,
                        'destination': preferences.get('preferred_destinations', [])[0] if preferences.get('preferred_destinations') else 'any',
                        'budget': {
                            'min': preferences.get('budget_min', 0),
                            'max': preferences.get('budget_max', 10000)
                        },
                        'interests': preferences.get('interests', []),
                        'pace': preferences.get('travel_pace', 'moderate'),
                        'search_criteria': msg.search_criteria or {}
                    }
                    
                    ctx.logger.info(f"🔄 Forwarding to matchmaker agent...")
                    # In production, send to actual matchmaker agent
                    # await ctx.send(matchmaker_address, match_data)
                    
                    # For now, generate mock matches
                    matches = await self.generate_mock_matches(ctx, match_data)
                    
                    # Save matches to database
                    for match in matches:
                        try:
                            supabase.table('match_requests').insert({
                                'user_id': msg.user_id,
                                'trip_id': match['trip_id'],
                                'compatibility_score': match['compatibility_score'],
                                'match_factors': json.dumps(match['compatibility']),
                                'status': 'pending'
                            }).execute()
                        except Exception as e:
                            ctx.logger.error(f"Failed to save match: {e}")
                    
                    # Send response back
                    response = MatchResponse(
                        user_id=msg.user_id,
                        matches=matches,
                        total_matches=len(matches),
                        message=f"Found {len(matches)} matching trips"
                    )
                    
                    await ctx.send(sender, response)
                    
                except Exception as e:
                    ctx.logger.error(f"Error processing match request: {e}")
                    # Send error response
                    response = MatchResponse(
                        user_id=msg.user_id,
                        matches=[],
                        total_matches=0,
                        message=f"Error: {str(e)}"
                    )
                    await ctx.send(sender, response)
        
        @self.agent.on_message(model=JoinTripRequest)
        async def handle_join_request(ctx: Context, sender: str, msg: JoinTripRequest):
            """Handle request to join a specific trip"""
            ctx.logger.info(f"🎫 Join request for trip {msg.trip_id}")
            
            # Calculate compatibility score
            # In production, this would query the matchmaker agent
            compatibility_score = 85.5  # Mock score
            
            # Save join request to database
            if supabase:
                try:
                    result = supabase.table('match_requests').insert({
                        'user_id': msg.user_id,
                        'trip_id': msg.trip_id,
                        'compatibility_score': compatibility_score,
                        'match_factors': json.dumps(msg.preferences),
                        'status': 'pending',
                        'user_message': msg.user_message
                    }).execute()
                    
                    match_request_id = result.data[0]['id'] if result.data else 'unknown'
                    
                    response = JoinTripResponse(
                        success=True,
                        match_request_id=match_request_id,
                        compatibility_score=compatibility_score,
                        message="Join request submitted successfully! The host will review your profile."
                    )
                    
                    await ctx.send(sender, response)
                    
                except Exception as e:
                    ctx.logger.error(f"Failed to save join request: {e}")
                    response = JoinTripResponse(
                        success=False,
                        match_request_id='',
                        compatibility_score=0,
                        message=f"Error: {str(e)}"
                    )
                    await ctx.send(sender, response)
    
    async def generate_mock_matches(self, ctx: Context, match_data: Dict) -> List[Dict]:
        """Generate mock matching trips"""
        # Mock trips data
        mock_trips = [
            {
                'trip_id': 'trip_001',
                'title': 'Tokyo Adventure',
                'destination': 'Tokyo',
                'host': 'Sarah Chen',
                'dates': {'start': '2025-11-15', 'end': '2025-11-22'},
                'price': 1200,
                'group_size': {'current': 3, 'max': 8},
                'interests': ['culture', 'food', 'photography'],
                'pace': 'moderate'
            },
            {
                'trip_id': 'trip_002',
                'title': 'Bali Retreat',
                'destination': 'Bali',
                'host': 'Michael Torres',
                'dates': {'start': '2025-12-01', 'end': '2025-12-10'},
                'price': 950,
                'group_size': {'current': 2, 'max': 6},
                'interests': ['beach', 'wellness', 'nature'],
                'pace': 'relaxed'
            },
            {
                'trip_id': 'trip_003',
                'title': 'Iceland Expedition',
                'destination': 'Iceland',
                'host': 'Emma Larson',
                'dates': {'start': '2025-11-20', 'end': '2025-11-28'},
                'price': 2100,
                'group_size': {'current': 4, 'max': 10},
                'interests': ['adventure', 'nature', 'photography'],
                'pace': 'packed'
            }
        ]
        
        # Calculate compatibility scores
        matches = []
        user_interests = set(match_data.get('interests', []))
        user_budget = match_data['budget']['max']
        user_pace = match_data.get('pace', 'moderate')
        
        for trip in mock_trips:
            trip_interests = set(trip['interests'])
            
            # Interest match
            interest_match = len(user_interests.intersection(trip_interests)) / max(len(user_interests), 1)
            
            # Budget match
            budget_match = 1.0 if trip['price'] <= user_budget else max(0, 1 - (trip['price'] - user_budget) / user_budget)
            
            # Pace match
            pace_match = 1.0 if trip['pace'] == user_pace else 0.5
            
            # Overall compatibility
            compatibility_score = (interest_match * 0.4 + budget_match * 0.4 + pace_match * 0.2) * 100
            
            if compatibility_score > 50:  # Only include decent matches
                matches.append({
                    'trip_id': trip['trip_id'],
                    'trip': trip,
                    'compatibility_score': round(compatibility_score, 1),
                    'compatibility': {
                        'interests': round(interest_match, 2),
                        'budget': round(budget_match, 2),
                        'pace': round(pace_match, 2),
                        'overall': round(compatibility_score / 100, 2)
                    }
                })
        
        # Sort by compatibility score
        matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
        
        return matches
    
    def run(self):
        """Run the user agent"""
        self.agent.run()

# ============================================================================
# AGENT FACTORY
# ============================================================================

def create_user_agent(user_id: str, user_seed: str = None) -> WanderLinkUserAgent:
    """Create a new user agent"""
    if not user_seed:
        user_seed = f"wanderlink_user_{user_id}_seed_2025"
    
    return WanderLinkUserAgent(user_id, user_seed)

# ============================================================================
# MAIN (For testing)
# ============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python user_agent.py <user_id>")
        sys.exit(1)
    
    user_id = sys.argv[1]
    print(f"\n🚀 Starting User Agent for user: {user_id[:16]}...\n")
    
    agent = create_user_agent(user_id)
    agent.run()
