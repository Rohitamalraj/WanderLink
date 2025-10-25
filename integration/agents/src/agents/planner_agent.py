from datetime import datetime
from uuid import uuid4
import json
import os
import aiohttp
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    TextContent,
    chat_protocol_spec,
)

# -------------------------
# PLANNER CONFIGURATION
# -------------------------
AGENT_NAME = "WanderLink_Planner"
# Webhook URL from environment variable (set in Agentverse secrets)
# Example: https://wanderlink.vercel.app/api/agent-webhook
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")

# Supabase configuration
# TEMPORARY: Hardcoded for testing - REMOVE BEFORE PRODUCTION!
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xbspnzviiefekzosukfa.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhic3BuenZpaWVmZWt6b3N1a2ZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA2MTA1OSwiZXhwIjoyMDc2NjM3MDU5fQ.L1Wx7upo7-BFG8d_1Vm2belPBNDIcXfUU4jwlAI6Wdw")

agent = Agent(name=AGENT_NAME)
protocol = Protocol(spec=chat_protocol_spec)

GROUPS_KEY = "active_groups"

# -------------------------
# HELPER FUNCTIONS
# -------------------------
async def store_in_supabase(ctx: Context, group_data: dict):
    """Store group directly in Supabase database"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        ctx.logger.warning(f"⚠️ Supabase not configured, skipping database storage")
        return False
    
    ctx.logger.info(f"💾 Storing group in Supabase...")
    
    try:
        # Prepare data for travel_groups table
        supabase_data = {
            "group_id": group_data["group_id"],
            "destination": group_data.get("destination") or group_data.get("group_info", {}).get("destination"),
            "members": group_data["members"],
            "member_count": len(group_data["members"]),
            "itinerary": group_data["itinerary"],
            "travelers": group_data.get("travelers", []),
            "status": "matched",
            "created_at": group_data["created_at"]
        }
        
        # Insert into Supabase using REST API
        url = f"{SUPABASE_URL}/rest/v1/travel_groups"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=supabase_data, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                response_text = await response.text()
                
                if response.status in [200, 201]:
                    ctx.logger.info(f"✅ Group stored in Supabase successfully!")
                    return True
                else:
                    ctx.logger.warning(f"⚠️ Supabase storage failed with status {response.status}")
                    ctx.logger.warning(f"📄 Response: {response_text[:200]}")
                    return False
                    
    except Exception as e:
        ctx.logger.error(f"❌ Supabase storage error: {type(e).__name__}: {str(e)}")
        return False

async def send_webhook(ctx: Context, webhook_data: dict):
    """Send group creation data to frontend webhook"""
    if not WEBHOOK_URL:
        ctx.logger.warning(f"⚠️ WEBHOOK_URL not configured, skipping webhook")
        return False
    
    ctx.logger.info(f"🌐 Attempting webhook to: {WEBHOOK_URL}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                WEBHOOK_URL,
                json=webhook_data,
                headers={'Content-Type': 'application/json'},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                response_text = await response.text()
                ctx.logger.info(f"📡 Webhook response status: {response.status}")
                
                if response.status == 200:
                    ctx.logger.info(f"✅ Webhook sent successfully!")
                    ctx.logger.info(f"📄 Response: {response_text[:200]}")
                    return True
                else:
                    ctx.logger.warning(f"⚠️ Webhook failed with status {response.status}")
                    ctx.logger.warning(f"📄 Response: {response_text[:200]}")
                    return False
    except aiohttp.ClientError as e:
        ctx.logger.error(f"❌ Webhook network error: {type(e).__name__}: {str(e)}")
        return False
    except Exception as e:
        ctx.logger.error(f"❌ Webhook unexpected error: {type(e).__name__}: {str(e)}")
        ctx.logger.exception(e)
        return False

# -------------------------
# MESSAGE HANDLERS
# -------------------------
@protocol.on_message(ChatMessage)
async def handle_group_creation(ctx: Context, sender: str, msg: ChatMessage):
    """
    Receive itinerary from MatchMaker, create group, distribute to all members
    """
    
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.now(), 
            acknowledged_msg_id=msg.msg_id
        ),
    )

    text = ""
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text.strip() + " "

    ctx.logger.info(f"📨 Received group data from MatchMaker")

    try:
        group_data = json.loads(text)
        
        group_id = group_data.get("group_id")
        user_ids = group_data.get("user_ids", [])
        itinerary = group_data.get("itinerary", "")
        travelers = group_data.get("travelers", [])
        group_info = group_data.get("group_info", {})
        
        ctx.logger.info(f"\n{'='*60}")
        ctx.logger.info(f"👥 CREATING TRAVEL GROUP")
        ctx.logger.info(f"{'='*60}")
        ctx.logger.info(f"🆔 Group ID: {group_id[:12]}...")
        ctx.logger.info(f"📍 Destination: {group_info.get('destination')}")
        ctx.logger.info(f"👤 Members: {len(user_ids)}")
        ctx.logger.info(f"📋 Itinerary: {len(itinerary)} characters")
        ctx.logger.info(f"{'='*60}\n")
        
        # Store group in database
        groups = ctx.storage.get(GROUPS_KEY)
        if groups is None:
            groups = {}
        else:
            if isinstance(groups, str):
                groups = json.loads(groups)
        
        groups[group_id] = {
            "created_at": datetime.utcnow().isoformat(),
            "members": user_ids,
            "destination": group_info.get("destination"),
            "travel_types": group_info.get("travel_types", []),
            "members_count": len(user_ids),
            "travelers": travelers,
            "itinerary_length": len(itinerary)
        }
        ctx.storage.set(GROUPS_KEY, json.dumps(groups))
        
        ctx.logger.info(f"💾 Group stored in database")
        
        # Create member summaries
        member_list = []
        for i, traveler in enumerate(travelers):
            prefs = traveler.get("preferences", {})
            member_list.append(
                f"   {i+1}. {prefs.get('destination')} - {prefs.get('travel_type')} - {prefs.get('duration')} days"
            )
        
        members_summary = "\n".join(member_list)
        
        # Create formatted group message
        group_message = f"""
╔═══════════════════════════════════════════════════════════╗
║          🎉 WANDERLINK TRAVEL GROUP FORMED! 🎉            ║
╚═══════════════════════════════════════════════════════════╝

You've been matched with {len(user_ids) - 1} other traveler(s) for {group_info.get('destination', 'Unknown')}!

📋 GROUP DETAILS:
   • Group ID: {group_id[:16]}...
   • Destination: {group_info.get('destination', 'Unknown')}
   • Total Members: {len(user_ids)} travelers
   • Created: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

👥 YOUR TRAVEL COMPANIONS:
{members_summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 YOUR COMBINED ITINERARY:

{itinerary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 WHAT'S NEXT?

✅ Review the itinerary
✅ Coordinate travel dates with your group
✅ Share contact information
✅ Discuss accommodation preferences
✅ Plan additional activities together

This itinerary balances everyone's preferences and budget. Feel free to 
adjust based on your group's needs!

Happy travels! 🚀✈️🌍

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """
        
        # Send to all group members
        ctx.logger.info(f"📤 Distributing itinerary to {len(user_ids)} members...\n")
        
        success_count = 0
        for idx, user_id in enumerate(user_ids):
            try:
                await ctx.send(
                    user_id, 
                    ChatMessage(
                        timestamp=datetime.utcnow(),
                        msg_id=uuid4(),
                        content=[
                            TextContent(type="text", text=group_message)
                        ]
                    )
                )
                ctx.logger.info(f"   ✅ [{idx+1}/{len(user_ids)}] Sent to: {user_id[:16]}...")
                success_count += 1
                
            except Exception as e:
                ctx.logger.error(f"   ❌ [{idx+1}/{len(user_ids)}] Failed for {user_id[:16]}: {e}")
        
        # Update group status
        groups[group_id]["itinerary_sent"] = True
        groups[group_id]["sent_at"] = datetime.utcnow().isoformat()
        groups[group_id]["delivery_success"] = success_count
        groups[group_id]["delivery_failed"] = len(user_ids) - success_count
        ctx.storage.set(GROUPS_KEY, json.dumps(groups))
        
        ctx.logger.info(f"\n{'='*60}")
        ctx.logger.info(f"✅ GROUP CREATION COMPLETE")
        ctx.logger.info(f"{'='*60}")
        ctx.logger.info(f"📊 Delivery: {success_count}/{len(user_ids)} successful")
        ctx.logger.info(f"🆔 Group ID: {group_id[:12]}...")
        ctx.logger.info(f"{'='*60}\n")
        
        # Store group in Supabase database
        group_storage_data = {
            "group_id": group_id,
            "destination": group_info.get("destination"),
            "members": user_ids,
            "travelers": travelers,
            "itinerary": itinerary,
            "group_info": group_info,
            "created_at": datetime.utcnow().isoformat(),
            "sender": "planner_agent",
            "type": "group_created"
        }
        
        ctx.logger.info(f"💾 Storing group in database...")
        supabase_success = await store_in_supabase(ctx, group_storage_data)
        
        if supabase_success:
            ctx.logger.info(f"✅ Group successfully stored in Supabase!")
            ctx.logger.info(f"📱 Frontend will automatically detect the new group")
        else:
            ctx.logger.error(f"❌ Failed to store group in Supabase")
            ctx.logger.error(f"⚠️ Group members were notified but group may not appear in frontend")
        
    except json.JSONDecodeError as e:
        ctx.logger.error(f"❌ Invalid JSON from MatchMaker")
        ctx.logger.exception(e)
    except Exception as e:
        ctx.logger.exception(f"❌ Error creating group: {e}")

@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass

@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("\n" + "="*60)
    ctx.logger.info("🗓️  WANDERLINK PLANNER AGENT")
    ctx.logger.info("="*60)
    ctx.logger.info(f"📬 Agent Address: {agent.address}")
    ctx.logger.info(f"💬 Chat Protocol: ✅ Enabled")
    ctx.logger.info(f"👥 Group Formation: ✅ Active")
    ctx.logger.info("="*60)
    ctx.logger.info("✨ Ready to create travel groups!")
    ctx.logger.info("="*60 + "\n")

agent.include(protocol, publish_manifest=True)