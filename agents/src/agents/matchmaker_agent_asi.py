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
DESTINATION_POOLS_KEY = "destination_pools"

# -------------------------
# HELPER FUNCTIONS
# -------------------------
def normalize_destination(dest):
    """Normalize destination name for matching"""
    if not dest:
        return "unknown"
    return dest.lower().strip()

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
        if not dest or dest.lower() in ["unknown", "no destination specified", ""]:
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
    Collect trips by DESTINATION, wait for 3 users per destination, then generate itinerary
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
            ctx.logger.warning(f"⚠️  Invalid trip data (no valid destination)")
            return
        
        # Get destination
        destination = trip_data['preferences'].get('destination', '')
        normalized_dest = normalize_destination(destination)
        
        ctx.logger.info(f"📍 Destination: {destination} (normalized: {normalized_dest})")
        
        # Get all destination pools
        destination_pools = ctx.storage.get(DESTINATION_POOLS_KEY)
        if destination_pools is None:
            destination_pools = {}
        else:
            if isinstance(destination_pools, str):
                destination_pools = json.loads(destination_pools)
        
        # Add trip to the correct destination pool
        if normalized_dest not in destination_pools:
            destination_pools[normalized_dest] = []
        
        destination_pools[normalized_dest].append(trip_data)
        
        # Save updated pools
        ctx.storage.set(DESTINATION_POOLS_KEY, json.dumps(destination_pools))
        
        current_pool = destination_pools[normalized_dest]
        ctx.logger.info(f"✓ Added to {destination} pool. Count: {len(current_pool)}/{MIN_GROUP_SIZE}")
        
        # Show all destination pools
        ctx.logger.info(f"\n{'='*60}")
        ctx.logger.info(f"📊 CURRENT DESTINATION POOLS:")
        ctx.logger.info(f"{'='*60}")
        for dest, pool in destination_pools.items():
            ctx.logger.info(f"  • {dest.title()}: {len(pool)} traveler(s)")
        ctx.logger.info(f"{'='*60}\n")

        # Check if this destination pool has enough travelers
        if len(current_pool) < MIN_GROUP_SIZE:
            ctx.logger.info(f"⏳ Waiting for more travelers to {destination}...")
            ctx.logger.info(f"   Need {MIN_GROUP_SIZE - len(current_pool)} more for this destination\n")
            return

        ctx.logger.info(f"🎉 {destination} group is ready! Processing {len(current_pool)} travelers...")

        # Take exactly MIN_GROUP_SIZE trips from this destination
        group_members = current_pool[:MIN_GROUP_SIZE]
        remaining_in_pool = current_pool[MIN_GROUP_SIZE:]
        
        # Update the destination pool
        if remaining_in_pool:
            destination_pools[normalized_dest] = remaining_in_pool
            ctx.logger.info(f"📋 {len(remaining_in_pool)} travelers still waiting for {destination}")
        else:
            # Remove empty pool
            del destination_pools[normalized_dest]
            ctx.logger.info(f"🧹 {destination} pool cleared (no remaining travelers)")
        
        ctx.storage.set(DESTINATION_POOLS_KEY, json.dumps(destination_pools))
        
        ctx.logger.info(f"\n{'='*60}")
        ctx.logger.info(f"👥 GROUP MEMBERS FOR {destination.upper()}:")
        ctx.logger.info(f"{'='*60}")
        for i, member in enumerate(group_members):
            prefs = member['preferences']
            ctx.logger.info(f"  {i+1}. Traveler:")
            ctx.logger.info(f"     - Travel Type: {prefs.get('travel_type', 'Unknown')}")
            ctx.logger.info(f"     - Duration: {prefs.get('duration', 'Unknown')} days")
            ctx.logger.info(f"     - Budget: ${prefs.get('budget', 'Unknown')}")
            ctx.logger.info(f"     - Interests: {', '.join(prefs.get('interests', []))}")
        ctx.logger.info(f"{'='*60}\n")
        
        # Generate itinerary using ASI-1
        try:
            group_prompt = f"""
You are an expert travel planner. Generate a detailed combined itinerary for these {len(group_members)} travelers going to {destination}:

{json.dumps(group_members, indent=2)}

Create a comprehensive plan including:
1. **Destination Overview**: Brief intro to {destination}
2. **Day-by-Day Itinerary**: 4-7 days with morning/afternoon/evening activities
3. **Budget Breakdown**: Estimated costs per person (considering their budgets)
4. **Group Activities**: Activities that work for everyone's interests
5. **Compromises**: How different preferences are balanced
6. **Tips**: Travel tips, best time to visit, what to pack

IMPORTANT: All travelers are going to {destination}, so focus the entire itinerary on this destination only.
Make it exciting, detailed, and practical for a group of {len(group_members)} travelers!
"""

            ctx.logger.info(f"🤖 Calling ASI-1 to generate {destination} itinerary...")
            r = client.chat.completions.create(
                model="asi1-mini",
                messages=[
                    {"role": "system", "content": f"You are an expert travel planner creating detailed group itineraries for {destination}."},
                    {"role": "user", "content": group_prompt},
                ],
            )
            itinerary = r.choices[0].message.content

            ctx.logger.info(f"✅ Generated {destination} itinerary ({len(itinerary)} characters)")
            ctx.logger.info(f"\n{'='*60}\n📋 ITINERARY PREVIEW:\n{'='*60}")
            preview_length = min(500, len(itinerary))
            ctx.logger.info(itinerary[:preview_length] + ("..." if len(itinerary) > 500 else ""))
            ctx.logger.info(f"{'='*60}\n")

            # Extract user IDs
            user_ids = [member["user_id"] for member in group_members]
            
            # Prepare data for Planner (WITH itinerary)
            planner_data = {
                "group_id": str(uuid4()),
                "user_ids": user_ids,
                "itinerary": itinerary,
                "travelers": group_members,
                "group_info": {
                    "destination": destination,  # Original destination name
                    "members_count": len(group_members),
                    "travel_types": [t["preferences"].get("travel_type") for t in group_members],
                    "created_at": datetime.utcnow().isoformat()
                }
            }
            
            ctx.logger.info(f"📤 Sending {destination} group to Planner...")
            ctx.logger.info(f"   Group ID: {planner_data['group_id'][:12]}...")
            ctx.logger.info(f"   Destination: {destination}")
            ctx.logger.info(f"   Members: {len(user_ids)}")
            ctx.logger.info(f"   Itinerary: {len(itinerary)} chars")
            
            await ctx.send(PLANNER_ADDRESS, ChatMessage(
                timestamp=datetime.utcnow(),
                msg_id=uuid4(),
                content=[TextContent(type="text", text=json.dumps(planner_data))]
            ))
            
            ctx.logger.info(f"✅ Sent {destination} group to Planner!\n")

        except Exception as e:
            ctx.logger.exception(f"❌ Error generating itinerary: {e}")
            # Put trips back in pool if itinerary generation fails
            destination_pools[normalized_dest] = group_members + remaining_in_pool
            ctx.storage.set(DESTINATION_POOLS_KEY, json.dumps(destination_pools))
            return

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
    ctx.logger.info(f"👥 Min Group: {MIN_GROUP_SIZE} per destination")
    ctx.logger.info(f"🤖 ASI-1: Connected")
    ctx.logger.info(f"📍 Matching: By Destination")
    ctx.logger.info(f"📤 Planner: {PLANNER_ADDRESS[:20]}...")
    ctx.logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

agent.include(protocol, publish_manifest=True)