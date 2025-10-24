"""
WanderLink Agent Service - Simple Frontend Integration
This service provides a bridge between the Next.js frontend and Agentverse agents
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from uuid import uuid4
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from uagents import Agent, Context
from uagents_core.contrib.protocols.chat import ChatMessage, TextContent

load_dotenv()

# Initialize a bridge agent to send messages
BRIDGE_AGENT_SEED = "wanderlink_bridge_agent_seed_2025"
bridge_agent = Agent(name="WanderLink_Bridge", seed=BRIDGE_AGENT_SEED)

# Agent addresses from Agentverse
TRAVEL_AGENT_ADDRESS = os.getenv("TRAVEL_AGENT_ADDRESS", "agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey")
MATCHMAKER_ADDRESS = os.getenv("MATCHMAKER_ADDRESS", "agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt")
PLANNER_ADDRESS = os.getenv("PLANNER_ADDRESS", "agent1qdp7kupk4agz8nnevejljzdskur5x9nrqy8eec2t42hnqpca2mdmzscfdpj")

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xbspnzviiefekzosukfa.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Initialize Supabase
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized")
    except Exception as e:
        print(f"⚠️ Supabase init failed: {e}")

app = FastAPI(
    title="WanderLink Agent Service",
    description="Frontend → Agentverse Agent Integration",
    version="3.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === REQUEST MODELS ===

class TripRequest(BaseModel):
    userId: str
    message: str

# === STARTUP ===

@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 80)
    print("🚀 WanderLink Agent Service - Agentverse Integration")
    print("=" * 80)
    print(f"FastAPI Server: http://localhost:8001")
    print(f"Docs: http://localhost:8001/docs")
    print("")
    print("🤖 Connected Agents:")
    print(f"  Travel Agent:  {TRAVEL_AGENT_ADDRESS[:20]}...")
    print(f"  MatchMaker:    {MATCHMAKER_ADDRESS[:20]}...")
    print(f"  Planner:       {PLANNER_ADDRESS[:20]}...")
    print("")
    print("📡 Frontend Integration Flow:")
    print("  1. User submits trip description via frontend")
    print("  2. Frontend calls /api/submit-trip")
    print("  3. User manually chats with Travel Agent on Agentverse")
    print("  4. Travel Agent → MatchMaker → Planner (automatic)")
    print("  5. User receives itinerary in Agentverse chat")
    print("")
    print("=" * 80 + "\n")

# === ENDPOINTS ===

@app.get("/")
async def root():
    return {
        "service": "WanderLink Agent Service",
        "version": "3.0.0",
        "status": "running",
        "agentverse_integration": True,
        "agents": {
            "travel": TRAVEL_AGENT_ADDRESS,
            "matchmaker": MATCHMAKER_ADDRESS,
            "planner": PLANNER_ADDRESS
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "WanderLink Agent Service",
        "agentverse": "connected"
    }

@app.post("/api/submit-trip")
async def submit_trip(request: TripRequest):
    """
    Submit a trip request - Now forwards to Travel Agent FastAPI service
    
    Flow:
    1. User submits trip description
    2. Forward to Travel Agent service for preference extraction
    3. Travel Agent → MatchMaker → Planner (all automatic FastAPI services)
    4. Planner stores group in database
    5. Frontend polls for group status
    """
    print(f"\n🔔 /api/submit-trip endpoint HIT!")
    print(f"📥 Request received at: {datetime.now()}")
    
    try:
        print(f"\n{'='*60}")
        print(f"📝 NEW TRIP REQUEST")
        print(f"{'='*60}")
        print(f"👤 User ID: {request.userId}")
        print(f"💬 Message: {request.message}")
        print(f"{'='*60}\n")
        
        # Forward to Travel Agent FastAPI service
        import httpx
        
        travel_agent_url = os.getenv("TRAVEL_AGENT_SERVICE_URL", "http://localhost:8002")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{travel_agent_url}/extract-preferences",
                    json={
                        "user_id": request.userId,
                        "message": request.message
                    },
                    timeout=30.0
                )
                
                print(f"📡 Travel Agent Response Status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Successfully sent to Travel Agent service")
                    print(f"📤 Preferences extracted and forwarded to MatchMaker")
                    
                    return {
                        "success": True,
                        "message": "Trip submitted successfully. You will be matched with other travelers automatically!",
                        "user_id": request.userId,
                        "preferences": result.get("preferences", {})
                    }
                else:
                    print(f"⚠️ Travel Agent service returned status: {response.status_code}")
                    print(f"Response: {response.text}")
                    raise HTTPException(status_code=response.status_code, detail="Travel Agent service error")
                    
        except httpx.TimeoutException:
            print(f"⚠️ Timeout connecting to Travel Agent service")
            raise HTTPException(status_code=504, detail="Travel Agent service timeout")
        except Exception as api_err:
            print(f"⚠️ Error calling Travel Agent service: {api_err}")
            raise HTTPException(status_code=500, detail=f"Travel Agent service error: {str(api_err)}")
        
        return {
            "success": True,
            "message": "Trip request sent to Travel Agent automatically!",
            "user_id": request.userId,
            "travel_agent_address": TRAVEL_AGENT_ADDRESS,
            "status": "processing",
            "next_steps": {
                "step_1": "Travel Agent is extracting your preferences",
                "step_2": "MatchMaker will pool compatible travelers (needs 3 total)",
                "step_3": "Planner will create your group when ready",
                "step_4": "Frontend will detect group formation via polling"
            }
        }
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/agent-info")
async def get_agent_info():
    """
    Get information about all connected agents
    """
    return {
        "agents": {
            "travel_agent": {
                "address": TRAVEL_AGENT_ADDRESS,
                "name": "WanderLink Travel Agent",
                "role": "Extract user preferences from natural language",
                "chat_url": f"https://agentverse.ai/agents/{TRAVEL_AGENT_ADDRESS}/chat"
            },
            "matchmaker": {
                "address": MATCHMAKER_ADDRESS,
                "name": "WanderLink MatchMaker",
                "role": "Group compatible travelers and generate itineraries",
                "minimum_group_size": 3
            },
            "planner": {
                "address": PLANNER_ADDRESS,
                "name": "WanderLink Planner",
                "role": "Create group chats and distribute itineraries"
            }
        },
        "flow": [
            "User → Travel Agent (via Agentverse chat)",
            "Travel Agent → MatchMaker (automatic)",
            "MatchMaker → Planner (automatic, when 3+ travelers)",
            "Planner → Users (sends itinerary to all group members)"
        ]
    }

@app.post("/api/store-user-trip")
async def store_user_trip(request: TripRequest):
    """
    Store user trip preferences in Supabase
    """
    print(f"\n🔔 /api/store-user-trip endpoint HIT!")
    print(f"👤 User ID: {request.userId}")
    print(f"💬 Message: {request.message}")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        # Store in Supabase
        result = supabase.table('user_trip_preferences').upsert({
            'user_id': request.userId,
            'user_agent_address': request.userId,
            'preferences': {"raw_message": request.message},
            'original_input': request.message,
            'status': 'pending'
        }, on_conflict='user_id').execute()
        
        print(f"✅ Stored trip for user: {request.userId}")
        
        return {
            "success": True,
            "user_id": request.userId,
            "message": "Trip preferences stored.",
            "status": "pending"
        }
        
    except Exception as e:
        print(f"❌ Error storing trip: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/check-group-status/{user_id}")
async def check_group_status(user_id: str):
    """
    Check if user has been matched to a group
    Frontend polls this endpoint to detect group formation
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        # Check user's trip preferences
        pref_result = supabase.table('user_trip_preferences')\
            .select('*')\
            .eq('user_id', user_id)\
            .execute()
        
        if not pref_result.data or len(pref_result.data) == 0:
            return {
                "status": "not_found",
                "message": "No trip preferences found for this user"
            }
        
        user_pref = pref_result.data[0]
        
        if user_pref['status'] == 'in_group' and user_pref.get('group_id'):
            # User is in a group! Fetch group details
            group_id = user_pref['group_id']
            
            group_result = supabase.table('groups')\
                .select('*')\
                .eq('id', group_id)\
                .execute()
            
            if group_result.data and len(group_result.data) > 0:
                group = group_result.data[0]
                
                # Fetch group members
                members_result = supabase.table('group_members')\
                    .select('*')\
                    .eq('group_id', group_id)\
                    .execute()
                
                # Fetch messages
                messages_result = supabase.table('group_messages')\
                    .select('*')\
                    .eq('group_id', group_id)\
                    .order('created_at')\
                    .execute()
                
                return {
                    "status": "in_group",
                    "message": "Group formed! You're matched with travelers.",
                    "group": group,
                    "members": members_result.data,
                    "messages": messages_result.data,
                    "group_id": group_id
                }
        
        return {
            "status": user_pref['status'],
            "message": "Waiting for more travelers to form a group..."
        }
        
    except Exception as e:
        print(f"❌ Error checking group status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/group/{group_id}/messages")
async def get_group_messages(group_id: str):
    """
    Get all messages for a specific group
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        result = supabase.table('group_messages')\
            .select('*')\
            .eq('group_id', group_id)\
            .order('created_at')\
            .execute()
        
        return {
            "success": True,
            "messages": result.data
        }
        
    except Exception as e:
        print(f"❌ Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/store-group")
async def store_group(request: dict):
    """
    Store complete group data in Supabase
    Called by Planner agent when group is formed
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        group_id = request.get('group_id')
        user_ids = request.get('members', [])
        itinerary = request.get('itinerary', '')
        group_info = request.get('group_info', {})
        
        # Create group record
        supabase.table('groups').insert({
            'id': group_id,
            'name': request.get('name'),
            'destination': request.get('destination'),
            'itinerary': itinerary,
            'member_count': request.get('member_count'),
            'status': 'active'
        }).execute()
        
        print(f"💾 Group created in Supabase: {group_id}")
        
        # Add all members
        for user_id in user_ids:
            supabase.table('group_members').insert({
                'group_id': group_id,
                'user_id': user_id,
                'user_agent_address': user_id,
                'status': 'active'
            }).execute()
        
        print(f"👥 Added {len(user_ids)} members to Supabase")
        
        # Add welcome message
        welcome_text = f"""🎉 Welcome to your travel group!

You've been matched with {len(user_ids) - 1} other traveler(s) who share similar interests!

📍 Destination: {request.get('destination', 'Unknown')}
👤 Total Members: {len(user_ids)}
🗓️ Created: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}

Your custom itinerary has been generated. Check the messages below!"""
        
        supabase.table('group_messages').insert({
            'group_id': group_id,
            'sender_id': 'system',
            'sender_type': 'system',
            'message': welcome_text,
            'message_type': 'system'
        }).execute()
        
        # Add itinerary as separate message
        supabase.table('group_messages').insert({
            'group_id': group_id,
            'sender_id': 'planner_agent',
            'sender_type': 'agent',
            'message': itinerary,
            'message_type': 'itinerary'
        }).execute()
        
        print(f"💬 Stored welcome message and itinerary in Supabase")
        
        # Update user preferences to mark as matched
        for user_id in user_ids:
            try:
                supabase.table('user_trip_preferences').update({
                    'status': 'in_group',
                    'group_id': group_id
                }).eq('user_id', user_id).execute()
            except:
                pass  # User might not have preference record
        
        print(f"✅ Group storage complete: {group_id}")
        
        return {
            "success": True,
            "group_id": group_id,
            "message": "Group stored successfully"
        }
        
    except Exception as e:
        print(f"❌ Error storing group: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
