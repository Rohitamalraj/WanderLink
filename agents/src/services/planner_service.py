"""
WanderLink Planner Agent - FastAPI Service
Creates groups and stores them in Supabase database
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
from typing import List, Dict
import uuid
import hashlib

load_dotenv()

app = FastAPI(title="WanderLink Planner Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xbspnzviiefekzosukfa.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Initialize Supabase
supabase: Client = None
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client initialized")
except Exception as e:
    print(f"⚠️ Supabase initialization error: {e}")

class GroupData(BaseModel):
    group_id: str
    user_ids: List[str]
    travelers: List[Dict]
    itinerary: str
    group_info: Dict
    created_at: str

def user_id_to_uuid(user_id: str) -> str:
    """Convert user_id string to deterministic UUID"""
    # Create UUID from hash of user_id
    hash_digest = hashlib.md5(user_id.encode()).digest()
    return str(uuid.UUID(bytes=hash_digest))

@app.post("/create-group")
async def create_group(group_data: GroupData):
    """
    Create a travel group and store in Supabase
    """
    try:
        print(f"\n{'='*60}")
        print(f"🗓️  PLANNER - Creating Group")
        print(f"{'='*60}")
        print(f"🆔 Group ID: {group_data.group_id[:16]}...")
        print(f"📍 Destination: {group_data.group_info.get('destination')}")
        print(f"👥 Members: {len(group_data.user_ids)}")
        print(f"📋 Itinerary: {len(group_data.itinerary)} characters")
        print(f"{'='*60}\n")
        
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured")
        
        # 1. Create group record
        group_result = supabase.table('groups').insert({
            'id': group_data.group_id,
            'name': f"{group_data.group_info.get('destination', 'Unknown')} Adventure Group - {datetime.now().strftime('%b %Y')}",
            'destination': group_data.group_info.get('destination', 'Unknown'),
            'itinerary': group_data.itinerary,
            'member_count': len(group_data.user_ids),
            'status': 'active'
        }).execute()
        
        print(f"✅ Group created: {group_data.group_id[:12]}...")
        
        # 2. Add group members
        members_data = []
        for user_id in group_data.user_ids:
            # Convert user_id to UUID format for database
            user_uuid = user_id_to_uuid(user_id)
            members_data.append({
                'group_id': group_data.group_id,
                'user_id': user_uuid,  # Use UUID format
                'joined_at': datetime.utcnow().isoformat()
            })
        
        members_result = supabase.table('group_members').insert(members_data).execute()
        print(f"👥 Added {len(members_data)} members to group")
        
        # 3. Store welcome message
        welcome_message = f"""╔═══════════════════════════════════════════════════════════╗
║          🎉 WANDERLINK TRAVEL GROUP FORMED! 🎉            ║
╚═══════════════════════════════════════════════════════════╝

You've been matched with {len(group_data.user_ids) - 1} other traveler(s)!

📋 GROUP DETAILS:
   • Group ID: {group_data.group_id[:16]}...
   • Destination: {group_data.group_info.get('destination', 'Unknown')}
   • Total Members: {len(group_data.user_ids)} travelers
   • Created: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

👥 YOUR TRAVEL COMPANIONS:
"""
        
        # Add member details
        for i, traveler in enumerate(group_data.travelers, 1):
            prefs = traveler.get("preferences", {})
            welcome_message += f"   {i}. {prefs.get('destination')} - {prefs.get('travel_type')} - {prefs.get('duration')} days\n"
        
        welcome_message += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 YOUR COMBINED ITINERARY:

{group_data.itinerary}

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
        
        # Store welcome message
        welcome_msg_result = supabase.table('group_messages').insert({
            'group_id': group_data.group_id,
            'sender_id': 'system',
            'message': welcome_message,
            'message_type': 'system',
            'created_at': datetime.utcnow().isoformat()
        }).execute()
        
        # Store itinerary as separate message
        itinerary_msg_result = supabase.table('group_messages').insert({
            'group_id': group_data.group_id,
            'sender_id': 'agent',
            'message': group_data.itinerary,
            'message_type': 'itinerary',
            'created_at': datetime.utcnow().isoformat()
        }).execute()
        
        print(f"💬 Stored welcome message and itinerary")
        
        # 4. Update user preferences to mark as grouped
        for user_id in group_data.user_ids:
            try:
                supabase.table('user_trip_preferences').update({
                    'status': 'in_group',
                    'group_id': group_data.group_id
                }).eq('user_id', user_id).execute()
            except:
                pass  # User might not have preference record
        
        print(f"\n{'='*60}")
        print(f"✅ GROUP CREATION COMPLETE")
        print(f"{'='*60}")
        print(f"🆔 Group ID: {group_data.group_id[:12]}...")
        print(f"👥 Members: {len(group_data.user_ids)}")
        print(f"💾 Database: All records stored")
        print(f"{'='*60}\n")
        
        return {
            "success": True,
            "message": "Group created successfully",
            "group_id": group_data.group_id,
            "member_count": len(group_data.user_ids)
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "service": "Planner",
        "status": "healthy",
        "supabase_connected": supabase is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
