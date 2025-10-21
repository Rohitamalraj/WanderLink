"""
WanderLink MatchMaker Agent
Autonomous agent for finding compatible travel groups using Fetch.ai
"""

from uagents import Agent, Context, Model
from typing import List, Dict, Optional
import json
from datetime import datetime
import numpy as np

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
# For Agentverse deployment: remove port and endpoint
matchmaker = Agent(
    name="wanderlink_matchmaker",
    seed="wanderlink_matchmaker_secret_2025"
)

# Storage for registered travelers
travelers_pool: Dict[str, TravelPreferences] = {}

@matchmaker.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("🤝 WanderLink MatchMaker Agent Started!")
    ctx.logger.info("=" * 60)
    ctx.logger.info(f"Agent Name: {matchmaker.name}")
    ctx.logger.info(f"Agent Address: {matchmaker.address}")
    ctx.logger.info("=" * 60)

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

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Starting WanderLink MatchMaker Agent...")
    print("=" * 60 + "\n")
    matchmaker.run()
