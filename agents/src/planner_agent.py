"""
WanderLink Planner Agent
Autonomous agent for generating AI-powered travel itineraries
"""

from uagents import Agent, Context, Model
from typing import List, Dict, Optional
import json
from datetime import datetime

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
# For Agentverse deployment: remove port and endpoint
planner = Agent(
    name="wanderlink_planner",
    seed="wanderlink_planner_secret_2025"
)

@planner.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("🗺️  WanderLink Planner Agent Started!")
    ctx.logger.info("=" * 60)
    ctx.logger.info(f"Agent Name: {planner.name}")
    ctx.logger.info(f"Agent Address: {planner.address}")
    ctx.logger.info("=" * 60)

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

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Starting WanderLink Planner Agent...")
    print("=" * 60 + "\n")
    planner.run()
