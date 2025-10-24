from datetime import datetime
from uuid import uuid4
import json
import os
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

# Agent Service URL (for Supabase proxy)
AGENT_SERVICE_URL = os.getenv("AGENT_SERVICE_URL", "http://localhost:8000")

agent = Agent(name=AGENT_NAME)
protocol = Protocol(spec=chat_protocol_spec)

GROUPS_KEY = "active_groups"

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
        
        # Store group in Supabase via Agent Service API
        try:
            import urllib.request
            import urllib.error
            
            # Prepare group data for API
            group_data_payload = {
                'group_id': group_id,
                'name': f"{group_info.get('destination', 'Unknown')} Adventure Group - {datetime.now().strftime('%b %Y')}",
                'destination': group_info.get('destination', 'Unknown'),
                'itinerary': itinerary,
                'member_count': len(user_ids),
                'members': user_ids,
                'travelers': travelers,
                'group_info': group_info
            }
            
            # Call agent service to store group in Supabase
            api_url = f"{AGENT_SERVICE_URL}/api/store-group"
            req = urllib.request.Request(
                api_url,
                data=json.dumps(group_data_payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    ctx.logger.info(f"💾 Group stored in Supabase via API: {group_id}")
                    ctx.logger.info(f"👥 Added {len(user_ids)} members to database")
                    ctx.logger.info(f"💬 Stored welcome message and itinerary")
            except urllib.error.HTTPError as http_err:
                ctx.logger.warning(f"⚠️ API error storing group: {http_err.code}")
            except urllib.error.URLError as url_err:
                ctx.logger.warning(f"⚠️ Cannot reach agent service: {url_err.reason}")
            except Exception as api_err:
                ctx.logger.warning(f"⚠️ Error calling API: {api_err}")
                
        except Exception as db_error:
            ctx.logger.error(f"❌ Group storage error: {db_error}")
            # Continue without database - use local storage
        
        # Also store in local storage as backup
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

You've been matched with {len(user_ids) - 1} other traveler(s)!

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