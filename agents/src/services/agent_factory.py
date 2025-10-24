"""
WanderLink PersonalAgent Factory

Creates a personalized travel agent for each user at signup.
The agent represents the user's travel personality and negotiates with trip groups.

Based on: ASI Alliance autonomous agent architecture
Integrated with: Supabase, AgentVerse
"""

from typing import Dict, Any, List, Optional
import json
import os
from datetime import datetime
from supabase import Client
import uuid

class PersonalAgentFactory:
    """
    Creates and manages PersonalAgents for users
    Each agent has a unique personality profile and negotiation strategy
    """
    
    def __init__(self, supabase_client: Client, config: Dict):
        self.supabase = supabase_client
        self.config = config
        self.template_path = os.path.join(
            os.path.dirname(__file__), 
            '../agents/personal_agent_template.py'
        )
    
    async def create_personal_agent(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a PersonalAgent for a user
        
        Args:
            user_data: {
                'user_id': str,
                'email': str,
                'preferences': Dict (optional - can be added later),
                'travel_history': List (optional)
            }
        
        Returns:
            {
                'agent_id': str,
                'agent_address': str,
                'personality': Dict,
                'status': 'active',
                'created_at': str
            }
        """
        print(f"🤖 Creating PersonalAgent for user: {user_data['user_id']}")
        
        # Step 1: Build travel personality profile
        personality = await self.build_travel_personality(user_data)
        
        # Step 2: Generate unique agent ID
        agent_id = f"personal_agent_{user_data['user_id']}"
        agent_address = f"agent_{uuid.uuid4().hex[:16]}"
        
        # Step 3: Create agent record
        agent = {
            'agent_id': agent_id,
            'agent_address': agent_address,
            'user_id': user_data['user_id'],
            'personality': personality,
            'status': 'active',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Step 4: Store in database
        await self.store_agent(agent)
        
        print(f"✅ PersonalAgent created: {agent_id}")
        print(f"   Address: {agent_address}")
        print(f"   Personality: Adventure={personality['adventure_level']:.2f}, Social={personality['social_level']:.2f}")
        
        return agent
    
    async def build_travel_personality(self, user_data: Dict) -> Dict[str, Any]:
        """
        Build a 6-dimensional travel personality profile
        
        Dimensions:
        - adventure_level (0.0-1.0): comfort seeker → thrill seeker
        - social_level (0.0-1.0): solo traveler → group enthusiast
        - budget_flexibility (0.0-1.0): strict budget → flexible
        - planning_style (0.0-1.0): spontaneous → detailed planner
        - pace_preference (0.0-1.0): relaxed → fast-paced
        - cultural_immersion (0.0-1.0): tourist spots → local experiences
        
        Returns: Complete personality profile
        """
        
        prefs = user_data.get('preferences', {})
        history = user_data.get('travel_history', [])
        
        # Calculate personality dimensions
        personality = {
            # Core dimensions (0.0 to 1.0)
            'adventure_level': self._calculate_adventure_level(prefs, history),
            'social_level': self._calculate_social_level(prefs, history),
            'budget_flexibility': self._calculate_budget_flexibility(prefs),
            'planning_style': self._calculate_planning_style(prefs),
            'pace_preference': self._map_pace_to_score(prefs.get('pace', 'moderate')),
            'cultural_immersion': self._calculate_cultural_level(prefs),
            
            # Preferences
            'preferred_destinations': prefs.get('destinations', []),
            'interests': prefs.get('interests', []),
            'budget_range': {
                'min': prefs.get('budgetMin', 1000),
                'max': prefs.get('budgetMax', 5000)
            },
            'group_size_preference': prefs.get('groupType', 'small'),
            'experience_level': prefs.get('experienceLevel', 'intermediate'),
            
            # Metadata
            'created_at': datetime.utcnow().isoformat(),
            'source': 'user_preferences',
            'version': '1.0'
        }
        
        return personality
    
    def _calculate_adventure_level(self, prefs: Dict, history: List) -> float:
        """
        Calculate how adventurous the traveler is
        
        Indicators:
        - Adventure-related interests (hiking, trekking, diving)
        - Fast pace preference
        - Past exotic destinations
        
        Returns: 0.0 (comfort seeker) to 1.0 (thrill seeker)
        """
        score = 0.5  # Default: moderate
        
        interests = prefs.get('interests', [])
        adventure_keywords = [
            'hiking', 'trekking', 'adventure', 'camping', 'skiing', 
            'diving', 'surfing', 'rafting', 'climbing', 'safari'
        ]
        
        # Check interests for adventure keywords
        adventure_count = sum(
            1 for interest in interests 
            if any(kw in interest.lower() for kw in adventure_keywords)
        )
        score += min(0.3, adventure_count * 0.1)
        
        # Check pace preference
        pace = prefs.get('pace', 'moderate')
        if pace == 'fast':
            score += 0.2
        elif pace == 'relaxed':
            score -= 0.2
        
        # Check travel history
        if history:
            exotic_count = sum(
                1 for trip in history 
                if trip.get('destination_type') == 'exotic'
            )
            score += min(0.2, exotic_count * 0.05)
        
        return min(1.0, max(0.0, score))
    
    def _calculate_social_level(self, prefs: Dict, history: List) -> float:
        """
        Calculate preference for group vs solo travel
        
        Returns: 0.0 (solo traveler) to 1.0 (group enthusiast)
        """
        group_type = prefs.get('groupType', 'small')
        
        mapping = {
            'solo': 0.2,
            'small': 0.5,
            'medium': 0.7,
            'large': 0.9
        }
        
        base_score = mapping.get(group_type, 0.5)
        
        # Adjust based on history
        if history:
            group_trips = sum(1 for trip in history if trip.get('group_size', 1) > 1)
            history_factor = min(0.2, (group_trips / len(history)) * 0.2)
            base_score += history_factor
        
        return min(1.0, max(0.0, base_score))
    
    def _calculate_budget_flexibility(self, prefs: Dict) -> float:
        """
        Calculate how flexible the budget is
        
        Returns: 0.0 (strict) to 1.0 (very flexible)
        """
        budget_min = prefs.get('budgetMin', 1000)
        budget_max = prefs.get('budgetMax', 5000)
        
        if budget_max == 0 or budget_min == 0:
            return 0.5  # Default moderate
        
        # Calculate ratio
        ratio = budget_max / budget_min
        
        if ratio > 3:
            return 0.9  # Very flexible
        elif ratio > 2:
            return 0.7
        elif ratio > 1.5:
            return 0.5
        else:
            return 0.3  # Strict budget
    
    def _calculate_planning_style(self, prefs: Dict) -> float:
        """
        Calculate planning preference
        
        Returns: 0.0 (spontaneous) to 1.0 (detailed planner)
        """
        # Use experience level as proxy
        exp = prefs.get('experienceLevel', 'intermediate')
        
        mapping = {
            'beginner': 0.8,      # Prefer detailed plans
            'intermediate': 0.5,   # Balanced
            'expert': 0.3          # More spontaneous
        }
        
        return mapping.get(exp, 0.5)
    
    def _map_pace_to_score(self, pace: str) -> float:
        """
        Map pace preference to 0-1 score
        
        Returns: 0.0 (relaxed) to 1.0 (fast-paced)
        """
        pace_map = {
            'relaxed': 0.2,
            'moderate': 0.5,
            'fast': 0.8
        }
        return pace_map.get(pace, 0.5)
    
    def _calculate_cultural_level(self, prefs: Dict) -> float:
        """
        Calculate interest in cultural immersion
        
        Returns: 0.0 (tourist spots) to 1.0 (deep local experiences)
        """
        interests = prefs.get('interests', [])
        cultural_keywords = [
            'culture', 'history', 'local', 'traditional', 
            'museums', 'heritage', 'authentic', 'temples'
        ]
        
        cultural_count = sum(
            1 for interest in interests 
            if any(kw in interest.lower() for kw in cultural_keywords)
        )
        
        return min(1.0, 0.5 + (0.15 * cultural_count))
    
    async def store_agent(self, agent: Dict):
        """
        Store PersonalAgent in database
        
        Table: personal_agents
        Columns: agent_id, agent_address, user_id, personality, status, created_at, updated_at
        """
        if not self.supabase:
            print("⚠️  Supabase not configured, agent not stored")
            return
        
        try:
            # Insert into personal_agents table
            result = self.supabase.table('personal_agents').insert({
                'agent_id': agent['agent_id'],
                'agent_address': agent['agent_address'],
                'user_id': agent['user_id'],
                'personality': agent['personality'],
                'status': agent['status'],
                'created_at': agent['created_at'],
                'updated_at': agent['updated_at']
            }).execute()
            
            print(f"💾 Agent stored in database: {agent['agent_id']}")
            
        except Exception as e:
            print(f"❌ Error storing agent: {str(e)}")
            raise
    
    async def get_agent(self, user_id: str) -> Optional[Dict]:
        """
        Retrieve PersonalAgent for a user
        
        Returns: Agent data or None if not found
        """
        if not self.supabase:
            return None
        
        try:
            result = self.supabase.table('personal_agents')\
                .select('*')\
                .eq('user_id', user_id)\
                .eq('status', 'active')\
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            return None
            
        except Exception as e:
            print(f"❌ Error retrieving agent: {str(e)}")
            return None
    
    async def update_personality(self, user_id: str, new_preferences: Dict):
        """
        Update agent personality when user preferences change
        
        This allows the agent to evolve over time
        """
        agent = await self.get_agent(user_id)
        
        if not agent:
            print(f"⚠️  No agent found for user: {user_id}")
            return
        
        # Rebuild personality with new preferences
        updated_personality = await self.build_travel_personality({
            'user_id': user_id,
            'preferences': new_preferences,
            'travel_history': []  # TODO: Fetch from database
        })
        
        # Update in database
        try:
            self.supabase.table('personal_agents')\
                .update({
                    'personality': updated_personality,
                    'updated_at': datetime.utcnow().isoformat()
                })\
                .eq('user_id', user_id)\
                .execute()
            
            print(f"✅ Agent personality updated for user: {user_id}")
            
        except Exception as e:
            print(f"❌ Error updating personality: {str(e)}")


# Helper function for easy access
async def create_agent_for_user(supabase: Client, user_id: str, user_data: Dict) -> Dict:
    """
    Convenience function to create a PersonalAgent
    
    Usage:
        agent = await create_agent_for_user(supabase, "user_123", {
            "email": "user@example.com",
            "preferences": {...}
        })
    """
    factory = PersonalAgentFactory(supabase, {})
    
    user_data['user_id'] = user_id
    agent = await factory.create_personal_agent(user_data)
    
    return agent
