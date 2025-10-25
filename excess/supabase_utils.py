"""
Supabase utility for WanderLink agents
Handles database operations for user agents, preferences, and matches
"""

import os
from supabase import create_client, Client
from typing import Dict, List, Optional
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================================
# USER OPERATIONS
# ============================================================================

def create_user(email: str, name: str, agent_address: str = None) -> Dict:
    """Create a new user"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    data = {
        'email': email,
        'name': name,
        'agent_address': agent_address
    }
    
    result = supabase.table('users').insert(data).execute()
    return result.data[0] if result.data else None

def get_user_by_email(email: str) -> Dict:
    """Get user by email"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    result = supabase.table('users').select('*').eq('email', email).single().execute()
    return result.data if result.data else None

def get_user_by_id(user_id: str) -> Dict:
    """Get user by ID"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    result = supabase.table('users').select('*').eq('id', user_id).single().execute()
    return result.data if result.data else None

def update_user_agent_address(user_id: str, agent_address: str) -> Dict:
    """Update user's agent address"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    result = supabase.table('users').update({
        'agent_address': agent_address
    }).eq('id', user_id).execute()
    return result.data[0] if result.data else None

# ============================================================================
# USER PREFERENCES OPERATIONS
# ============================================================================

def save_user_preferences(user_id: str, preferences: Dict) -> Dict:
    """Save or update user preferences"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    # Check if preferences exist
    existing = supabase.table('user_preferences').select('id').eq('user_id', user_id).execute()
    
    data = {
        'user_id': user_id,
        **preferences
    }
    
    if existing.data:
        # Update existing
        result = supabase.table('user_preferences').update(data).eq('user_id', user_id).execute()
    else:
        # Insert new
        result = supabase.table('user_preferences').insert(data).execute()
    
    return result.data[0] if result.data else None

def get_user_preferences(user_id: str) -> Dict:
    """Get user preferences"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    result = supabase.table('user_preferences').select('*').eq('user_id', user_id).single().execute()
    return result.data if result.data else None

# ============================================================================
# AGENT STATE OPERATIONS
# ============================================================================

def save_agent_state(user_id: str, agent_address: str, agent_seed: str, config: Dict = None) -> Dict:
    """Save user agent state"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    data = {
        'user_id': user_id,
        'agent_address': agent_address,
        'agent_seed': agent_seed,
        'is_active': True,
        'last_active_at': datetime.utcnow().isoformat(),
        'agent_config': json.dumps(config) if config else None
    }
    
    # Upsert (insert or update)
    result = supabase.table('user_agent_states').upsert(data).execute()
    return result.data[0] if result.data else None

def get_agent_state(user_id: str) -> Dict:
    """Get user agent state"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    result = supabase.table('user_agent_states').select('*').eq('user_id', user_id).single().execute()
    return result.data if result.data else None

def deactivate_agent(user_id: str) -> Dict:
    """Deactivate user agent"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    result = supabase.table('user_agent_states').update({
        'is_active': False
    }).eq('user_id', user_id).execute()
    return result.data[0] if result.data else None

# ============================================================================
# MATCH OPERATIONS
# ============================================================================

def create_match_request(user_id: str, trip_id: str, compatibility_score: float, 
                        match_factors: Dict, user_message: str = None) -> Dict:
    """Create a match request"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    data = {
        'user_id': user_id,
        'trip_id': trip_id,
        'compatibility_score': compatibility_score,
        'match_factors': json.dumps(match_factors),
        'status': 'pending',
        'user_message': user_message
    }
    
    result = supabase.table('match_requests').insert(data).execute()
    return result.data[0] if result.data else None

def get_user_match_requests(user_id: str, status: str = None) -> List[Dict]:
    """Get all match requests for a user"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    query = supabase.table('match_requests').select('*').eq('user_id', user_id)
    
    if status:
        query = query.eq('status', status)
    
    query = query.order('created_at', desc=True)
    result = query.execute()
    return result.data if result.data else []

def update_match_request_status(request_id: str, status: str, host_response: str = None) -> Dict:
    """Update match request status"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    data = {'status': status}
    if host_response:
        data['host_response'] = host_response
    
    result = supabase.table('match_requests').update(data).eq('id', request_id).execute()
    return result.data[0] if result.data else None

# ============================================================================
# SAVED MATCHES OPERATIONS
# ============================================================================

def save_match(user_id: str, trip_id: str, compatibility_score: float, notes: str = None) -> Dict:
    """Save a match (favorite)"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    data = {
        'user_id': user_id,
        'trip_id': trip_id,
        'compatibility_score': compatibility_score,
        'notes': notes
    }
    
    # Upsert to handle duplicates
    result = supabase.table('saved_matches').upsert(data).execute()
    return result.data[0] if result.data else None

def get_saved_matches(user_id: str) -> List[Dict]:
    """Get all saved matches for a user"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    result = supabase.table('saved_matches').select('*').eq('user_id', user_id)\
        .order('created_at', desc=True).execute()
    return result.data if result.data else []

def delete_saved_match(user_id: str, trip_id: str) -> bool:
    """Delete a saved match"""
    if not supabase:
        raise Exception("Supabase not configured")
    
    result = supabase.table('saved_matches').delete()\
        .eq('user_id', user_id).eq('trip_id', trip_id).execute()
    return True if result.data else False

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def is_supabase_configured() -> bool:
    """Check if Supabase is properly configured"""
    return supabase is not None

def test_connection() -> bool:
    """Test database connection"""
    if not supabase:
        return False
    
    try:
        # Try to query users table
        supabase.table('users').select('id').limit(1).execute()
        return True
    except Exception as e:
        print(f"Supabase connection test failed: {e}")
        return False
