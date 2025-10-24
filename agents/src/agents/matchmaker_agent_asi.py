from datetime import datetime
from uuid import uuid4
import json
from openai import OpenAI
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    TextContent,
    chat_protocol_spec,
)

# -------------------------
# MATCHMAKER CONFIGURATION
# -------------------------
AGENT_NAME = "WanderLink_MatchMaker"
PLANNER_ADDRESS = "agent1qdp7kupk4agz8nnevejljzdskur5x9nrqy8eec2t42hnqpca2mdmzscfdpj"
API_KEY = "sk_7aa8a96be59b426695dcd1a2ee00e5807c2903f9c43b4f1c8d84d8fb52ac62a4"

client = OpenAI(
    base_url="https://api.asi1.ai/v1",
    api_key=API_KEY,
)

agent = Agent(name=AGENT_NAME)
protocol = Protocol(spec=chat_protocol_spec)

MIN_GROUP_SIZE = 3
TRIP_POOL_KEY = "trip_pool"

# -------------------------
# HELPER FUNCTIONS
# -------------------------
def extract_duration_days(duration):
    if duration is None or duration == "":
        return 0
    if isinstance(duration, int):
        return duration
    if isinstance(duration, str):
        import re
        numbers = re.findall(r'\d+', duration)
        return int(numbers[0]) if numbers else 0
    return 0

def is_valid_trip(trip_data):
    try:
        prefs = trip_data.get("preferences", {})
        dest = prefs.get("destination", "")
        if not dest or dest.lower() == "unknown":
            return False
        return True
    except:
        return False

# -------------------------
# MESSAGE HANDLERS
# -------------------------
@protocol.on_message(ChatMessage)
async def handle_trip(ctx: Context, sender: str, msg: ChatMessage):
    """
    Collect 3 trips, generate itinerary using ASI-1, send to Planner
    """
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.now(),
        acknowledged_msg_id=msg.msg_id,
    ))

    text = ""
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text.strip() + " "

    ctx.logger.info(f"📨 Received trip proposal")

    try:
        trip_data = json.loads(text)
        
        if not is_valid_trip(trip_data):
            ctx.logger.warning(f"⚠️  Invalid trip data")
            return
        
        # Get trip pool
        trip_pool = ctx.storage.get(TRIP_POOL_KEY)
        if trip_pool is None:
            trip_pool = []
        else:
            if isinstance(trip_pool, str):
                trip_pool = json.loads(trip_pool)
        
        trip_pool.append(trip_data)
        ctx.storage.set(TRIP_POOL_KEY, json.dumps(trip_pool))
        
        ctx.logger.info(f"✓ Stored trip. Total: {len(trip_pool)}/{MIN_GROUP_SIZE}")

        if len(trip_pool) < MIN_GROUP_SIZE:
            ctx.logger.info(f"⏳ Waiting for more travelers...")
            return

        ctx.logger.info(f"🎉 Minimum reached! Processing {len(trip_pool)} trips...")

        # Take exactly 3 trips
        current_group = trip_pool[:MIN_GROUP_SIZE]
        remaining_trips = trip_pool[MIN_GROUP_SIZE:]
        
        ctx.logger.info(f"👥 Group members:")
        for i, member in enumerate(current_group):
            dest = member['preferences'].get('destination', 'Unknown')
            ttype = member['preferences'].get('travel_type', 'Unknown')
            duration = member['preferences'].get('duration', 'Unknown')
            ctx.logger.info(f"  {i+1}. {dest} - {ttype} - {duration} days")
        
        # Generate itinerary using ASI-1
        try:
            group_prompt = f"""
You are an expert travel planner. Generate a detailed combined itinerary for these {len(current_group)} travelers:

{json.dumps(current_group, indent=2)}

Create a comprehensive plan including:
1. **Destination Overview**: Brief intro to the destination
2. **Day-by-Day Itinerary**: 4-7 days with morning/afternoon/evening activities
3. **Budget Breakdown**: Estimated costs per person
4. **Group Activities**: Activities that work for everyone
5. **Compromises**: How different preferences are balanced
6. **Tips**: Travel tips, best time to visit, what to pack

Make it exciting, detailed, and practical for a group of {len(current_group)} travelers!
"""

            ctx.logger.info("🤖 Calling ASI-1 to generate itinerary...")
            r = client.chat.completions.create(
                model="asi1-mini",
                messages=[
                    {"role": "system", "content": "You are an expert travel planner creating detailed group itineraries."},
                    {"role": "user", "content": group_prompt},
                ],
            )
            itinerary = r.choices[0].message.content

            ctx.logger.info(f"✅ Generated itinerary ({len(itinerary)} characters)")
            ctx.logger.info(f"\n{'='*60}\n📋 ITINERARY PREVIEW:\n{'='*60}")
            ctx.logger.info(itinerary[:500] + "..." if len(itinerary) > 500 else itinerary)
            ctx.logger.info(f"{'='*60}\n")

            # Extract user IDs
            user_ids = [member["user_id"] for member in current_group]
            
            # Prepare data for Planner (WITH itinerary)
            planner_data = {
                "group_id": str(uuid4()),
                "user_ids": user_ids,
                "itinerary": itinerary,  # ✅ Itinerary included
                "travelers": current_group,  # Full trip data for Planner
                "group_info": {
                    "destination": current_group[0]["preferences"].get("destination"),
                    "members_count": len(current_group),
                    "travel_types": [t["preferences"].get("travel_type") for t in current_group],
                    "created_at": datetime.utcnow().isoformat()
                }
            }
            
            ctx.logger.info(f"📤 Sending to Planner Agent...")
            ctx.logger.info(f"   Group ID: {planner_data['group_id'][:12]}...")
            ctx.logger.info(f"   Members: {len(user_ids)}")
            ctx.logger.info(f"   Itinerary: {len(itinerary)} chars")
            
            await ctx.send(PLANNER_ADDRESS, ChatMessage(
                timestamp=datetime.utcnow(),
                msg_id=uuid4(),
                content=[TextContent(type="text", text=json.dumps(planner_data))]
            ))
            
            ctx.logger.info(f"✅ Sent complete data to Planner!\n")

        except Exception as e:
            ctx.logger.exception(f"❌ Error generating itinerary: {e}")
            return

        # Update pool
        ctx.storage.set(TRIP_POOL_KEY, json.dumps(remaining_trips))
        ctx.logger.info(f"🧹 Pool cleared. Remaining: {len(remaining_trips)}\n")

    except Exception as e:
        ctx.logger.exception(f"❌ Error: {e}")

@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass

@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    ctx.logger.info("🎯 MatchMaker Agent Started!")
    ctx.logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    ctx.logger.info(f"📬 Address: {agent.address}")
    ctx.logger.info(f"👥 Min Group: {MIN_GROUP_SIZE}")
    ctx.logger.info(f"🤖 ASI-1: Connected")
    ctx.logger.info(f"📤 Planner: {PLANNER_ADDRESS[:20]}...")
    ctx.logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

agent.include(protocol, publish_manifest=True)