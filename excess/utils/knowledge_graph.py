"""
Travel Knowledge Graph using MeTTa (Hyperon)
Stores travel patterns, preferences, and history
"""

from hyperon import MeTTa, E, S, ValueAtom
from typing import Dict, List, Any, Optional
import json
from datetime import datetime


class TravelKnowledgeGraph:
    """Knowledge graph for storing travel data and relationships"""
    
    def __init__(self):
        """Initialize the knowledge graph"""
        self.metta = MeTTa()
        self.initialize_schema()
    
    def initialize_schema(self):
        """Initialize the knowledge graph schema"""
        # User relationships
        self.metta.space().add_atom(E(S("user_has"), S("user"), S("preferences")))
        self.metta.space().add_atom(E(S("user_has"), S("user"), S("travel_history")))
        self.metta.space().add_atom(E(S("user_has"), S("user"), S("matches")))
        
        # Match relationships
        self.metta.space().add_atom(E(S("matched_with"), S("user"), S("user")))
        self.metta.space().add_atom(E(S("compatibility_score"), S("match"), S("score")))
        
        # Trip relationships
        self.metta.space().add_atom(E(S("trip_to"), S("trip"), S("destination")))
        self.metta.space().add_atom(E(S("trip_has"), S("trip"), S("participants")))
        self.metta.space().add_atom(E(S("trip_status"), S("trip"), S("status")))
        
        # Preference relationships
        self.metta.space().add_atom(E(S("prefers"), S("user"), S("activity")))
        self.metta.space().add_atom(E(S("budget_range"), S("user"), S("min"), S("max")))
    
    def add_user_preferences(self, user_id: str, preferences: Dict):
        """
        Add or update user preferences in the knowledge graph
        
        Args:
            user_id: Unique user identifier
            preferences: User preferences dictionary
        """
        user_key = user_id.replace("-", "_")
        
        # Add user
        self.metta.space().add_atom(E(S("user"), S(user_key)))
        
        # Add preferred destinations
        if preferences.get('preferred_destinations'):
            for dest in preferences['preferred_destinations']:
                self.metta.space().add_atom(
                    E(S("prefers_destination"), S(user_key), ValueAtom(dest))
                )
        
        # Add budget range
        if preferences.get('budget_min') and preferences.get('budget_max'):
            self.metta.space().add_atom(
                E(S("budget_range"), S(user_key), 
                  ValueAtom(preferences['budget_min']), 
                  ValueAtom(preferences['budget_max']))
            )
        
        # Add travel pace
        if preferences.get('travel_pace'):
            self.metta.space().add_atom(
                E(S("travel_pace"), S(user_key), ValueAtom(preferences['travel_pace']))
            )
        
        # Add interests
        if preferences.get('interests'):
            for interest in preferences['interests']:
                self.metta.space().add_atom(
                    E(S("interested_in"), S(user_key), ValueAtom(interest))
                )
        
        # Add activities (store as JSON)
        if preferences.get('activities'):
            self.metta.space().add_atom(
                E(S("activities"), S(user_key), ValueAtom(json.dumps(preferences['activities'])))
            )
        
        # Add travel style (store as JSON)
        if preferences.get('travel_style'):
            self.metta.space().add_atom(
                E(S("travel_style"), S(user_key), ValueAtom(json.dumps(preferences['travel_style'])))
            )
        
        print(f"✅ Added preferences for user: {user_id}")
    
    def add_match(self, user1_id: str, user2_id: str, compatibility_data: Dict):
        """
        Add a match between two users
        
        Args:
            user1_id: First user ID
            user2_id: Second user ID
            compatibility_data: Compatibility analysis data
        """
        user1_key = user1_id.replace("-", "_")
        user2_key = user2_id.replace("-", "_")
        match_id = f"{user1_key}_{user2_key}"
        
        # Add match relationship
        self.metta.space().add_atom(
            E(S("matched_with"), S(user1_key), S(user2_key))
        )
        
        # Add compatibility score
        score = compatibility_data.get('overall_score', 70)
        self.metta.space().add_atom(
            E(S("compatibility_score"), S(match_id), ValueAtom(score))
        )
        
        # Add match details (store as JSON)
        self.metta.space().add_atom(
            E(S("match_details"), S(match_id), ValueAtom(json.dumps(compatibility_data)))
        )
        
        # Add timestamp
        timestamp = datetime.now().isoformat()
        self.metta.space().add_atom(
            E(S("match_timestamp"), S(match_id), ValueAtom(timestamp))
        )
        
        print(f"✅ Added match: {user1_id} ↔ {user2_id} (score: {score})")
    
    def add_trip(self, trip_id: str, trip_data: Dict):
        """
        Add a trip to the knowledge graph
        
        Args:
            trip_id: Unique trip identifier
            trip_data: Trip details
        """
        trip_key = trip_id.replace("-", "_")
        
        # Add trip
        self.metta.space().add_atom(E(S("trip"), S(trip_key)))
        
        # Add destination
        if trip_data.get('destination'):
            self.metta.space().add_atom(
                E(S("trip_to"), S(trip_key), ValueAtom(trip_data['destination']))
            )
        
        # Add participants
        if trip_data.get('participants'):
            for participant in trip_data['participants']:
                participant_key = participant.replace("-", "_")
                self.metta.space().add_atom(
                    E(S("trip_has_participant"), S(trip_key), S(participant_key))
                )
        
        # Add status
        if trip_data.get('status'):
            self.metta.space().add_atom(
                E(S("trip_status"), S(trip_key), ValueAtom(trip_data['status']))
            )
        
        # Add trip details (store as JSON)
        self.metta.space().add_atom(
            E(S("trip_details"), S(trip_key), ValueAtom(json.dumps(trip_data)))
        )
        
        print(f"✅ Added trip: {trip_id} to {trip_data.get('destination', 'unknown')}")
    
    def add_trip_history(self, user_id: str, trip_id: str, completed: bool = True):
        """
        Add trip to user's travel history
        
        Args:
            user_id: User identifier
            trip_id: Trip identifier
            completed: Whether trip was completed
        """
        user_key = user_id.replace("-", "_")
        trip_key = trip_id.replace("-", "_")
        
        # Add travel history relationship
        self.metta.space().add_atom(
            E(S("traveled_to"), S(user_key), S(trip_key))
        )
        
        # Add completion status
        status = "completed" if completed else "cancelled"
        self.metta.space().add_atom(
            E(S("trip_completion"), S(user_key), S(trip_key), ValueAtom(status))
        )
        
        print(f"✅ Added trip history: {user_id} → {trip_id} ({status})")
    
    def query_user_preferences(self, user_id: str) -> Dict:
        """
        Query user preferences from knowledge graph
        
        Args:
            user_id: User identifier
            
        Returns:
            User preferences dictionary
        """
        user_key = user_id.replace("-", "_")
        preferences = {}
        
        # Query destinations
        query = f'!(match &self (prefers_destination {user_key} $dest) $dest)'
        results = self.metta.run(query)
        if results:
            preferences['preferred_destinations'] = [
                r[0].get_object().value for r in results if r
            ]
        
        # Query budget
        query = f'!(match &self (budget_range {user_key} $min $max) ($min $max))'
        results = self.metta.run(query)
        if results and results[0]:
            preferences['budget_min'] = results[0][0].get_children()[0].get_object().value
            preferences['budget_max'] = results[0][0].get_children()[1].get_object().value
        
        # Query travel pace
        query = f'!(match &self (travel_pace {user_key} $pace) $pace)'
        results = self.metta.run(query)
        if results and results[0]:
            preferences['travel_pace'] = results[0][0].get_object().value
        
        # Query interests
        query = f'!(match &self (interested_in {user_key} $interest) $interest)'
        results = self.metta.run(query)
        if results:
            preferences['interests'] = [
                r[0].get_object().value for r in results if r
            ]
        
        # Query activities (stored as JSON)
        query = f'!(match &self (activities {user_key} $activities) $activities)'
        results = self.metta.run(query)
        if results and results[0]:
            try:
                preferences['activities'] = json.loads(results[0][0].get_object().value)
            except:
                preferences['activities'] = {}
        
        # Query travel style (stored as JSON)
        query = f'!(match &self (travel_style {user_key} $style) $style)'
        results = self.metta.run(query)
        if results and results[0]:
            try:
                preferences['travel_style'] = json.loads(results[0][0].get_object().value)
            except:
                preferences['travel_style'] = {}
        
        return preferences
    
    def query_user_matches(self, user_id: str) -> List[Dict]:
        """
        Query all matches for a user
        
        Args:
            user_id: User identifier
            
        Returns:
            List of matches with compatibility data
        """
        user_key = user_id.replace("-", "_")
        matches = []
        
        # Query matches where user1 is this user
        query = f'!(match &self (matched_with {user_key} $other) $other)'
        results = self.metta.run(query)
        
        if results:
            for result in results:
                if result:
                    other_user = result[0].get_name()
                    match_id = f"{user_key}_{other_user}"
                    
                    # Get compatibility score
                    score_query = f'!(match &self (compatibility_score {match_id} $score) $score)'
                    score_results = self.metta.run(score_query)
                    score = score_results[0][0].get_object().value if score_results and score_results[0] else 0
                    
                    # Get match details
                    details_query = f'!(match &self (match_details {match_id} $details) $details)'
                    details_results = self.metta.run(details_query)
                    details = {}
                    if details_results and details_results[0]:
                        try:
                            details = json.loads(details_results[0][0].get_object().value)
                        except:
                            pass
                    
                    matches.append({
                        "user_id": other_user.replace("_", "-"),
                        "compatibility_score": score,
                        "details": details
                    })
        
        return matches
    
    def query_user_trips(self, user_id: str) -> List[Dict]:
        """
        Query user's travel history
        
        Args:
            user_id: User identifier
            
        Returns:
            List of trips
        """
        user_key = user_id.replace("-", "_")
        trips = []
        
        # Query trips
        query = f'!(match &self (traveled_to {user_key} $trip) $trip)'
        results = self.metta.run(query)
        
        if results:
            for result in results:
                if result:
                    trip_key = result[0].get_name()
                    
                    # Get trip details
                    details_query = f'!(match &self (trip_details {trip_key} $details) $details)'
                    details_results = self.metta.run(details_query)
                    
                    if details_results and details_results[0]:
                        try:
                            trip_data = json.loads(details_results[0][0].get_object().value)
                            trips.append(trip_data)
                        except:
                            pass
        
        return trips
    
    def get_all_users(self) -> List[str]:
        """
        Get all users in the knowledge graph
        
        Returns:
            List of user IDs
        """
        query = '!(match &self (user $user) $user)'
        results = self.metta.run(query)
        
        if results:
            return [r[0].get_name().replace("_", "-") for r in results if r]
        return []
    
    def get_travel_statistics(self, user_id: str) -> Dict:
        """
        Get travel statistics for a user
        
        Args:
            user_id: User identifier
            
        Returns:
            Statistics dictionary
        """
        trips = self.query_user_trips(user_id)
        matches = self.query_user_matches(user_id)
        
        return {
            "total_trips": len(trips),
            "total_matches": len(matches),
            "destinations_visited": list(set([t.get('destination') for t in trips if t.get('destination')])),
            "average_compatibility": sum([m['compatibility_score'] for m in matches]) / len(matches) if matches else 0
        }


# Singleton instance
_kg_instance = None


def get_knowledge_graph() -> TravelKnowledgeGraph:
    """Get or create knowledge graph singleton instance"""
    global _kg_instance
    if _kg_instance is None:
        _kg_instance = TravelKnowledgeGraph()
    return _kg_instance
