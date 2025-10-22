"""
ASI:One LLM Integration for WanderLink
Provides AI-powered reasoning for agents
"""

import json
import os
from openai import OpenAI
from typing import Dict, List, Any, Optional


class ASILLM:
    """ASI:One Language Model wrapper for intelligent agent reasoning"""
    
    def __init__(self, api_key: str = None):
        """
        Initialize ASI:One LLM client
        
        Args:
            api_key: ASI:One API key (defaults to env variable)
        """
        self.api_key = api_key or os.environ.get("ASI_ONE_API_KEY")
        if not self.api_key:
            raise ValueError("ASI_ONE_API_KEY not found in environment variables")
        
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.asi1.ai/v1"
        )
        self.model = "asi1-mini"
    
    def create_completion(self, prompt: str, json_mode: bool = False) -> str:
        """
        Create a completion using ASI:One
        
        Args:
            prompt: The prompt to send to the model
            json_mode: Whether to expect JSON response
            
        Returns:
            The model's response as a string
        """
        try:
            completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                response_format={"type": "json_object"} if json_mode else None
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"❌ ASI:One API Error: {e}")
            raise
    
    def analyze_compatibility(
        self,
        user1_prefs: Dict,
        user2_prefs: Dict
    ) -> Dict[str, Any]:
        """
        Analyze compatibility between two users using AI
        
        Args:
            user1_prefs: First user's preferences
            user2_prefs: Second user's preferences
            
        Returns:
            Compatibility analysis with scores and reasoning
        """
        prompt = f"""
Analyze travel compatibility between two users and return detailed compatibility metrics.

USER 1 PREFERENCES:
- Destinations: {user1_prefs.get('preferred_destinations', [])}
- Budget: ${user1_prefs.get('budget_min', 0)} - ${user1_prefs.get('budget_max', 10000)}
- Travel Style: {user1_prefs.get('travel_style', {})}
- Activities: {user1_prefs.get('activities', {})}
- Travel Pace: {user1_prefs.get('travel_pace', 'moderate')}
- Interests: {user1_prefs.get('interests', [])}

USER 2 PREFERENCES:
- Destinations: {user2_prefs.get('preferred_destinations', [])}
- Budget: ${user2_prefs.get('budget_min', 0)} - ${user2_prefs.get('budget_max', 10000)}
- Travel Style: {user2_prefs.get('travel_style', {})}
- Activities: {user2_prefs.get('activities', {})}
- Travel Pace: {user2_prefs.get('travel_pace', 'moderate')}
- Interests: {user2_prefs.get('interests', [])}

TASK: Calculate comprehensive compatibility and return JSON with:
{{
    "overall_score": <0-100>,
    "destination_match": <0-1>,
    "budget_match": <0-1>,
    "activity_match": <0-1>,
    "pace_match": <0-1>,
    "interests_match": <0-1>,
    "style_match": <0-1>,
    "reasoning": "<brief explanation of compatibility>",
    "strengths": ["strength1", "strength2", "strength3"],
    "concerns": ["concern1", "concern2"]
}}

Be precise with decimal scores (e.g., 0.85, not 85).
"""
        
        try:
            response = self.create_completion(prompt, json_mode=True)
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback to basic compatibility
            return {
                "overall_score": 70,
                "destination_match": 0.7,
                "budget_match": 0.7,
                "activity_match": 0.7,
                "pace_match": 0.7,
                "interests_match": 0.7,
                "style_match": 0.7,
                "reasoning": "Moderate compatibility based on shared preferences",
                "strengths": ["Similar interests", "Compatible budget"],
                "concerns": ["Different travel pace"]
            }
    
    def generate_itinerary(
        self,
        destination: str,
        num_days: int,
        interests: List[str],
        budget_per_day: float,
        pace: str,
        group_preferences: Dict = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered travel itinerary
        
        Args:
            destination: Travel destination
            num_days: Number of days
            interests: List of interests
            budget_per_day: Budget per day
            pace: Travel pace (relaxed/moderate/packed)
            group_preferences: Combined group preferences
            
        Returns:
            Detailed itinerary with activities, tips, and budget breakdown
        """
        prompt = f"""
Create a detailed {num_days}-day travel itinerary for {destination}.

REQUIREMENTS:
- Travel Pace: {pace}
- Interests: {', '.join(interests)}
- Budget per Day: ${budget_per_day}
- Group Preferences: {group_preferences or 'Not specified'}

ITINERARY STRUCTURE:
For each day, provide:
1. Morning (9 AM - 12 PM): Activity with description, estimated cost, duration
2. Afternoon (1 PM - 5 PM): Activity with description, estimated cost, duration
3. Evening (6 PM - 10 PM): Activity with description, estimated cost, duration

Also include:
- Recommended restaurants (with price range)
- Local tips and cultural insights
- Transportation suggestions
- Safety tips
- Total estimated cost per day

Return JSON:
{{
    "destination": "{destination}",
    "duration": {num_days},
    "pace": "{pace}",
    "total_estimated_cost": <total_cost>,
    "days": [
        {{
            "day": 1,
            "title": "Day title",
            "morning": {{
                "time": "9:00 AM - 12:00 PM",
                "activity": "Activity name",
                "description": "Detailed description",
                "estimated_cost": 50,
                "duration": "3 hours"
            }},
            "afternoon": {{"time": "...", "activity": "...", ...}},
            "evening": {{"time": "...", "activity": "...", ...}},
            "meals": [
                {{"type": "lunch", "suggestion": "Restaurant name", "cost": 20}},
                {{"type": "dinner", "suggestion": "Restaurant name", "cost": 30}}
            ],
            "daily_cost": 150
        }},
        ...
    ],
    "tips": ["tip1", "tip2", "tip3"],
    "transportation": ["suggestion1", "suggestion2"],
    "safety_notes": ["note1", "note2"],
    "packing_suggestions": ["item1", "item2"]
}}
"""
        
        try:
            response = self.create_completion(prompt, json_mode=True)
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback basic itinerary
            return {
                "destination": destination,
                "duration": num_days,
                "pace": pace,
                "total_estimated_cost": budget_per_day * num_days,
                "days": [
                    {
                        "day": i + 1,
                        "title": f"Day {i + 1} - Exploring {destination}",
                        "morning": {
                            "time": "9:00 AM - 12:00 PM",
                            "activity": "Local exploration",
                            "description": "Explore local attractions",
                            "estimated_cost": budget_per_day * 0.3,
                            "duration": "3 hours"
                        },
                        "afternoon": {
                            "time": "1:00 PM - 5:00 PM",
                            "activity": "Main attraction",
                            "description": "Visit popular sites",
                            "estimated_cost": budget_per_day * 0.4,
                            "duration": "4 hours"
                        },
                        "evening": {
                            "time": "6:00 PM - 10:00 PM",
                            "activity": "Dining and relaxation",
                            "description": "Enjoy local cuisine",
                            "estimated_cost": budget_per_day * 0.3,
                            "duration": "4 hours"
                        },
                        "daily_cost": budget_per_day
                    }
                    for i in range(num_days)
                ],
                "tips": ["Stay hydrated", "Respect local customs", "Keep valuables safe"],
                "transportation": ["Use local transport", "Book rides in advance"],
                "safety_notes": ["Keep emergency contacts handy"],
                "packing_suggestions": ["Comfortable shoes", "Weather-appropriate clothing"]
            }
    
    def analyze_trip_verification(
        self,
        trip_description: str,
        image_description: str
    ) -> Dict[str, Any]:
        """
        Analyze if trip completion proof is valid
        
        Args:
            trip_description: Description of the trip
            image_description: Description of submitted proof image
            
        Returns:
            Verification result with confidence score
        """
        prompt = f"""
Verify if the submitted proof matches the trip requirements.

TRIP DETAILS:
{trip_description}

SUBMITTED PROOF:
{image_description}

TASK: Analyze if the proof validates trip completion and return JSON:
{{
    "verified": true/false,
    "confidence": <0-100>,
    "reasoning": "<explanation>",
    "concerns": ["concern1", "concern2"] or [],
    "verdict": "VERIFIED" or "NOT_VERIFIED" or "NEEDS_REVIEW"
}}
"""
        
        try:
            response = self.create_completion(prompt, json_mode=True)
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "verified": False,
                "confidence": 50,
                "reasoning": "Unable to verify automatically",
                "concerns": ["Verification failed"],
                "verdict": "NEEDS_REVIEW"
            }
    
    def extract_travel_patterns(
        self,
        user_history: List[Dict]
    ) -> Dict[str, Any]:
        """
        Extract travel patterns from user history using AI
        
        Args:
            user_history: List of past trips
            
        Returns:
            Analyzed travel patterns and preferences
        """
        prompt = f"""
Analyze travel history and extract patterns.

TRAVEL HISTORY:
{json.dumps(user_history, indent=2)}

TASK: Identify patterns and return JSON:
{{
    "favorite_destinations": ["dest1", "dest2", "dest3"],
    "preferred_season": "spring/summer/fall/winter",
    "average_budget": <amount>,
    "travel_frequency": "frequent/occasional/rare",
    "preferred_activities": ["activity1", "activity2", "activity3"],
    "travel_style": "adventure/relaxation/cultural/mixed",
    "group_preference": "solo/couples/groups",
    "insights": ["insight1", "insight2", "insight3"]
}}
"""
        
        try:
            response = self.create_completion(prompt, json_mode=True)
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "favorite_destinations": [],
                "preferred_season": "summer",
                "average_budget": 1000,
                "travel_frequency": "occasional",
                "preferred_activities": [],
                "travel_style": "mixed",
                "group_preference": "groups",
                "insights": []
            }


# Singleton instance
_asi_llm_instance = None


def get_asi_llm() -> ASILLM:
    """Get or create ASI:One LLM singleton instance"""
    global _asi_llm_instance
    if _asi_llm_instance is None:
        _asi_llm_instance = ASILLM()
    return _asi_llm_instance
