# WanderLink Personalized Agents Implementation Plan

## Overview
Transform WanderLink to use **personalized AI agents** that communicate with each other to form optimal trip plans, inspired by MOFO's agent architecture.

## Architecture Comparison

### Current WanderLink Flow
```
User → Frontend → Agent Service → Supabase → Static Matching
```

### New Personalized Agent Flow
```
User → Frontend → AgentFactory → Create Personal Travel Agent
                                         ↓
                            Deploy to Agentverse/Local
                                         ↓
Personal Agent ←→ Group Agents ←→ Destination Agents
                                         ↓
                            AI Negotiation & Planning
                                         ↓
                            Return Optimized Trip Plans
```

## Implementation Phases

---

## Phase 1: Agent Factory Service (Week 1)

### 1.1 Create AgentFactory Module

**File**: `agents/src/services/agent_factory.py`

```python
"""
WanderLink Agent Factory
Creates personalized travel agents based on user preferences and history
"""

from typing import Dict, Any, List, Optional
import json
import os
from datetime import datetime
from supabase import Client

class TravelAgentFactory:
    def __init__(self, supabase_client: Client, config: Dict):
        self.supabase = supabase_client
        self.config = config
        self.template_path = os.path.join(os.path.dirname(__file__), '../agents/travel_agent_template.py')
    
    async def create_personalized_agent(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a personalized travel agent for a user
        
        Args:
            user_data: {
                'userId': str,
                'preferences': Dict (destinations, budget, interests, pace),
                'travel_history': List (past trips),
                'personality_traits': Dict (optional)
            }
        
        Returns:
            {
                'agent_id': str,
                'agent_address': str,
                'personality': Dict,
                'status': str
            }
        """
        print(f"🏭 Creating personalized agent for user: {user_data['userId']}")
        
        # Step 1: Build travel personality profile
        personality = await self.build_travel_personality(user_data)
        
        # Step 2: Generate agent code with personality
        agent_code = self.generate_agent_code(user_data['userId'], personality)
        
        # Step 3: Deploy agent (Agentverse or local)
        if self.config.get('use_agentverse'):
            agent = await self.deploy_to_agentverse(user_data['userId'], agent_code, personality)
        else:
            agent = await self.deploy_local_agent(user_data['userId'], agent_code, personality)
        
        # Step 4: Store agent info in database
        await self.register_agent(agent)
        
        return agent
    
    async def build_travel_personality(self, user_data: Dict) -> Dict[str, Any]:
        """
        Build a travel personality profile from user data
        
        Personality dimensions:
        - Adventure Level (0.0-1.0): comfort seeker → thrill seeker
        - Social Level (0.0-1.0): solo traveler → group enthusiast
        - Budget Flexibility (0.0-1.0): strict budget → flexible
        - Planning Style (0.0-1.0): spontaneous → detailed planner
        - Pace Preference (0.0-1.0): relaxed → fast-paced
        - Cultural Immersion (0.0-1.0): tourist spots → local experiences
        """
        
        prefs = user_data.get('preferences', {})
        history = user_data.get('travel_history', [])
        
        # Calculate personality traits from preferences and history
        personality = {
            'adventure_level': self._calculate_adventure_level(prefs, history),
            'social_level': self._calculate_social_level(prefs, history),
            'budget_flexibility': self._calculate_budget_flexibility(prefs),
            'planning_style': self._calculate_planning_style(prefs),
            'pace_preference': self._map_pace_to_score(prefs.get('pace', 'moderate')),
            'cultural_immersion': self._calculate_cultural_level(prefs),
            
            # Preferences
            'preferred_destinations': prefs.get('destinations', []),
            'interests': prefs.get('interests', []),
            'budget_range': {
                'min': prefs.get('budgetMin', 1000),
                'max': prefs.get('budgetMax', 5000)
            },
            'group_size_preference': prefs.get('groupType', 'small'),
            'experience_level': prefs.get('experienceLevel', 'intermediate'),
            
            # Metadata
            'created_at': datetime.utcnow().isoformat(),
            'source': 'preferences_and_history'
        }
        
        return personality
    
    def _calculate_adventure_level(self, prefs: Dict, history: List) -> float:
        """Calculate how adventurous the traveler is"""
        score = 0.5  # Default moderate
        
        interests = prefs.get('interests', [])
        adventure_keywords = ['hiking', 'trekking', 'adventure', 'camping', 'skiing', 'diving']
        
        # Check interests
        adventure_count = sum(1 for interest in interests if any(kw in interest.lower() for kw in adventure_keywords))
        if adventure_count > 0:
            score += 0.1 * adventure_count
        
        # Check pace preference
        pace = prefs.get('pace', 'moderate')
        if pace == 'fast':
            score += 0.2
        elif pace == 'relaxed':
            score -= 0.2
        
        # Check past trips
        if history:
            exotic_destinations = sum(1 for trip in history if trip.get('destination_type') == 'exotic')
            score += 0.05 * exotic_destinations
        
        return min(1.0, max(0.0, score))
    
    def _calculate_social_level(self, prefs: Dict, history: List) -> float:
        """Calculate preference for group vs solo travel"""
        group_type = prefs.get('groupType', 'small')
        
        if group_type == 'solo':
            return 0.2
        elif group_type == 'small':
            return 0.5
        elif group_type == 'large':
            return 0.9
        else:
            return 0.5
    
    def _calculate_budget_flexibility(self, prefs: Dict) -> float:
        """Calculate how flexible the budget is"""
        budget_min = prefs.get('budgetMin', 1000)
        budget_max = prefs.get('budgetMax', 5000)
        
        if budget_max == 0 or budget_min == 0:
            return 0.5
        
        # Higher ratio = more flexibility
        ratio = budget_max / budget_min
        
        if ratio > 3:
            return 0.9  # Very flexible
        elif ratio > 2:
            return 0.7
        elif ratio > 1.5:
            return 0.5
        else:
            return 0.3  # Strict budget
    
    def _calculate_planning_style(self, prefs: Dict) -> float:
        """Calculate planning preference"""
        # For now, use experience level as proxy
        exp = prefs.get('experienceLevel', 'intermediate')
        
        if exp == 'beginner':
            return 0.8  # Prefer detailed plans
        elif exp == 'intermediate':
            return 0.5
        else:  # expert
            return 0.3  # More spontaneous
    
    def _map_pace_to_score(self, pace: str) -> float:
        """Map pace preference to 0-1 score"""
        pace_map = {
            'relaxed': 0.2,
            'moderate': 0.5,
            'fast': 0.8
        }
        return pace_map.get(pace, 0.5)
    
    def _calculate_cultural_level(self, prefs: Dict) -> float:
        """Calculate interest in cultural immersion"""
        interests = prefs.get('interests', [])
        cultural_keywords = ['culture', 'history', 'local', 'traditional', 'museums', 'heritage']
        
        cultural_count = sum(1 for interest in interests if any(kw in interest.lower() for kw in cultural_keywords))
        
        return min(1.0, 0.5 + (0.15 * cultural_count))
    
    def generate_agent_code(self, user_id: str, personality: Dict) -> str:
        """Generate Python code for the personalized travel agent"""
        
        # Read template
        with open(self.template_path, 'r') as f:
            template = f.read()
        
        # Inject personality data
        agent_code = template.replace('{{USER_ID}}', user_id)
        agent_code = agent_code.replace('{{PERSONALITY_JSON}}', json.dumps(personality, indent=4))
        
        return agent_code
    
    async def deploy_to_agentverse(self, user_id: str, code: str, personality: Dict) -> Dict:
        """Deploy agent to Fetch.ai Agentverse"""
        # TODO: Implement Agentverse API integration
        raise NotImplementedError("Agentverse deployment coming soon")
    
    async def deploy_local_agent(self, user_id: str, code: str, personality: Dict) -> Dict:
        """Deploy agent locally"""
        
        # Create agent file
        agent_file = f"agents/src/agents/user_agent_{user_id}.py"
        with open(agent_file, 'w') as f:
            f.write(code)
        
        # For now, return mock agent info
        # In production, this would start the agent process
        agent = {
            'agent_id': f"travel_agent_{user_id}",
            'agent_address': f"agent_{user_id}_{datetime.now().timestamp()}",
            'personality': personality,
            'status': 'active',
            'endpoint': f"http://localhost:{8100 + hash(user_id) % 100}",
            'created_at': datetime.utcnow().isoformat()
        }
        
        return agent
    
    async def register_agent(self, agent: Dict):
        """Store agent info in database"""
        
        if not self.supabase:
            print("⚠️  Supabase not configured, skipping agent registration")
            return
        
        # Store in agents table
        result = self.supabase.table('user_agents').insert({
            'agent_id': agent['agent_id'],
            'agent_address': agent['agent_address'],
            'personality': agent['personality'],
            'status': agent['status'],
            'created_at': agent['created_at']
        }).execute()
        
        print(f"✅ Agent registered: {agent['agent_id']}")
```

### 1.2 Create Travel Agent Template

**File**: `agents/src/agents/travel_agent_template.py`

```python
#!/usr/bin/env python3
"""
WanderLink Personalized Travel Agent Template

This agent represents a single user's travel preferences and personality.
It communicates with other agents to:
1. Find compatible travel groups
2. Negotiate trip details (dates, budget, activities)
3. Plan optimized itineraries
4. Coordinate with destination/activity agents
"""

from uagents import Agent, Context, Protocol, Model
from uagents.setup import fund_agent_if_low
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

# Agent Configuration (injected during deployment)
USER_ID = "{{USER_ID}}"
AGENT_PORT = 8100  # Will be assigned dynamically

# Personality Profile (injected from user data)
PERSONALITY = {{PERSONALITY_JSON}}

# Initialize agent
agent = Agent(
    name=f"travel_agent_{USER_ID}",
    seed=f"wanderlink_travel_{USER_ID}",
    port=AGENT_PORT,
    endpoint=[f"http://localhost:{AGENT_PORT}/submit"]
)

fund_agent_if_low(agent.wallet.address())

# Agent state
state = {
    'active_negotiations': [],
    'matched_groups': [],
    'proposed_trips': [],
    'personality': PERSONALITY
}

# === MESSAGE MODELS ===

class GroupMatchProposal(Model):
    """Proposal from a group agent to join their trip"""
    group_id: str
    destination: str
    dates: Dict[str, str]  # start_date, end_date
    budget: float
    activities: List[str]
    current_members: int
    max_members: int
    group_personality: Dict[str, float]

class MatchResponse(Model):
    """Response to group match proposal"""
    interested: bool
    compatibility_score: float
    message: str
    counter_proposal: Optional[Dict[str, Any]] = None

class TripNegotiation(Model):
    """Negotiation message for trip details"""
    negotiation_id: str
    group_id: str
    proposal_type: str  # 'activity', 'budget', 'date', 'itinerary'
    proposal: Dict[str, Any]
    reasoning: str

class NegotiationResponse(Model):
    """Response to negotiation"""
    negotiation_id: str
    accepted: bool
    counter_offer: Optional[Dict[str, Any]] = None
    reasoning: str

class ItineraryRequest(Model):
    """Request to plan detailed itinerary"""
    group_id: str
    destination: str
    duration_days: int
    budget: float
    activities: List[str]
    participants_personalities: List[Dict[str, Any]]

class ItineraryProposal(Model):
    """Proposed itinerary"""
    itinerary_id: str
    days: List[Dict[str, Any]]
    total_cost: float
    highlights: List[str]

# === TRAVEL MATCHING PROTOCOL ===

travel_protocol = Protocol("Travel Matching")

@travel_protocol.on_message(model=GroupMatchProposal)
async def handle_group_proposal(ctx: Context, sender: str, msg: GroupMatchProposal):
    """
    Handle proposal from a group agent
    Decide whether to express interest based on personality compatibility
    """
    
    ctx.logger.info(f"📨 Received group proposal from {msg.group_id}")
    ctx.logger.info(f"   Destination: {msg.destination}, Budget: ${msg.budget}")
    
    # Calculate compatibility
    compatibility = calculate_group_compatibility(
        PERSONALITY,
        msg.group_personality,
        msg
    )
    
    ctx.logger.info(f"   Compatibility Score: {compatibility:.2f}")
    
    # Decide based on personality
    interested = decide_interest(compatibility, msg)
    
    if interested:
        # Express interest
        response_msg = generate_interest_message(msg, compatibility)
        
        # Check if we want to negotiate any details
        counter = generate_counter_proposal(msg) if should_negotiate(msg) else None
        
        await ctx.send(sender, MatchResponse(
            interested=True,
            compatibility_score=compatibility,
            message=response_msg,
            counter_proposal=counter
        ))
        
        # Track this negotiation
        state['active_negotiations'].append({
            'group_id': msg.group_id,
            'sender': sender,
            'proposal': msg.dict(),
            'compatibility': compatibility,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    else:
        # Politely decline
        decline_msg = generate_decline_message(msg, compatibility)
        await ctx.send(sender, MatchResponse(
            interested=False,
            compatibility_score=compatibility,
            message=decline_msg
        ))

@travel_protocol.on_message(model=TripNegotiation)
async def handle_negotiation(ctx: Context, sender: str, msg: TripNegotiation):
    """
    Handle negotiation for trip details
    """
    
    ctx.logger.info(f"💬 Negotiation from {msg.group_id}: {msg.proposal_type}")
    
    # Evaluate proposal based on personality
    evaluation = evaluate_negotiation_proposal(msg)
    
    if evaluation['acceptable']:
        # Accept the proposal
        await ctx.send(sender, NegotiationResponse(
            negotiation_id=msg.negotiation_id,
            accepted=True,
            reasoning=evaluation['reasoning']
        ))
    else:
        # Counter offer
        counter = generate_counter_offer(msg, evaluation)
        await ctx.send(sender, NegotiationResponse(
            negotiation_id=msg.negotiation_id,
            accepted=False,
            counter_offer=counter,
            reasoning=evaluation['reasoning']
        ))

@travel_protocol.on_message(model=ItineraryProposal)
async def handle_itinerary(ctx: Context, sender: str, msg: ItineraryProposal):
    """
    Review proposed itinerary and provide feedback
    """
    
    ctx.logger.info(f"📋 Received itinerary proposal: {msg.itinerary_id}")
    
    # Score itinerary based on personality preferences
    score = score_itinerary(msg)
    
    ctx.logger.info(f"   Itinerary Score: {score:.2f}")
    
    # Accept if score is high enough
    if score >= 0.7:
        state['proposed_trips'].append({
            'itinerary_id': msg.itinerary_id,
            'score': score,
            'details': msg.dict()
        })
        ctx.logger.info(f"   ✅ Itinerary accepted!")

# === PERSONALITY-DRIVEN DECISION FUNCTIONS ===

def calculate_group_compatibility(my_personality: Dict, group_personality: Dict, proposal: GroupMatchProposal) -> float:
    """
    Calculate compatibility between personal preferences and group
    """
    
    scores = []
    
    # 1. Adventure level compatibility
    adventure_diff = abs(my_personality['adventure_level'] - group_personality.get('adventure_level', 0.5))
    scores.append(1.0 - adventure_diff)
    
    # 2. Social level match
    social_diff = abs(my_personality['social_level'] - group_personality.get('social_level', 0.5))
    scores.append(1.0 - social_diff * 0.5)  # Less critical
    
    # 3. Pace preference
    pace_diff = abs(my_personality['pace_preference'] - group_personality.get('pace_preference', 0.5))
    scores.append(1.0 - pace_diff)
    
    # 4. Destination match
    dest_match = 0.0
    if proposal.destination in my_personality['preferred_destinations']:
        dest_match = 1.0
    else:
        # Partial match
        for pref_dest in my_personality['preferred_destinations']:
            if pref_dest.lower() in proposal.destination.lower():
                dest_match = 0.7
                break
    scores.append(dest_match)
    
    # 5. Budget compatibility
    my_budget_min = my_personality['budget_range']['min']
    my_budget_max = my_personality['budget_range']['max']
    
    if my_budget_min <= proposal.budget <= my_budget_max:
        budget_score = 1.0
    else:
        # Calculate distance from acceptable range
        if proposal.budget < my_budget_min:
            diff = my_budget_min - proposal.budget
            budget_score = max(0.0, 1.0 - (diff / my_budget_min))
        else:
            diff = proposal.budget - my_budget_max
            budget_score = max(0.0, 1.0 - (diff / my_budget_max))
    scores.append(budget_score)
    
    # 6. Activities/interests overlap
    my_interests = set(my_personality['interests'])
    group_activities = set(proposal.activities)
    
    if my_interests and group_activities:
        overlap = len(my_interests & group_activities) / len(my_interests | group_activities)
        scores.append(overlap)
    
    # Weighted average
    weights = [0.2, 0.1, 0.15, 0.25, 0.2, 0.1]
    return sum(s * w for s, w in zip(scores, weights)) / sum(weights)

def decide_interest(compatibility: float, proposal: GroupMatchProposal) -> bool:
    """
    Decide whether to express interest based on compatibility and personality
    """
    
    # Base threshold
    threshold = 0.6
    
    # Adjust threshold based on personality
    if PERSONALITY['social_level'] > 0.7:
        threshold -= 0.1  # More social = lower threshold
    
    if PERSONALITY['adventure_level'] > 0.7:
        threshold -= 0.05  # Adventurous travelers are more open
    
    if PERSONALITY['planning_style'] < 0.3:
        threshold -= 0.05  # Spontaneous travelers are more flexible
    
    return compatibility >= threshold

def should_negotiate(proposal: GroupMatchProposal) -> bool:
    """
    Determine if we should propose changes to the trip
    """
    
    # High planning style = more likely to negotiate
    if PERSONALITY['planning_style'] > 0.7:
        return True
    
    # Check if budget is slightly off
    my_budget_max = PERSONALITY['budget_range']['max']
    if proposal.budget > my_budget_max * 0.9:  # Within 10% over budget
        return True
    
    return False

def generate_interest_message(proposal: GroupMatchProposal, compatibility: float) -> str:
    """
    Generate personality-appropriate interest message
    """
    
    social_level = PERSONALITY['social_level']
    adventure_level = PERSONALITY['adventure_level']
    
    if social_level > 0.7:
        intro = "This sounds amazing! I'd love to join your group. "
    elif social_level > 0.4:
        intro = "I'm interested in joining your trip. "
    else:
        intro = "Your trip looks interesting. I'd like to learn more. "
    
    if adventure_level > 0.7 and 'adventure' in ' '.join(proposal.activities).lower():
        intro += "The adventure activities are right up my alley! "
    
    if compatibility > 0.8:
        intro += "We seem like a great match!"
    
    return intro

def generate_decline_message(proposal: GroupMatchProposal, compatibility: float) -> str:
    """
    Generate polite decline message
    """
    
    return "Thank you for the invitation! I don't think this trip aligns with my current plans, but I hope you have a wonderful time!"

def generate_counter_proposal(proposal: GroupMatchProposal) -> Optional[Dict]:
    """
    Generate counter-proposal if we want to negotiate
    """
    
    counter = {}
    
    # Suggest budget adjustment
    my_budget_max = PERSONALITY['budget_range']['max']
    if proposal.budget > my_budget_max:
        counter['budget'] = my_budget_max
        counter['reason'] = "Slightly over my budget, could we adjust?"
    
    # Suggest additional activities
    my_interests = PERSONALITY['interests']
    group_activities = proposal.activities
    
    missing_interests = [i for i in my_interests if i not in group_activities]
    if missing_interests and PERSONALITY['planning_style'] > 0.6:
        counter['additional_activities'] = missing_interests[:2]
        counter['reason'] = "Would love to add some activities I'm passionate about"
    
    return counter if counter else None

def evaluate_negotiation_proposal(negotiation: TripNegotiation) -> Dict:
    """
    Evaluate incoming negotiation proposal
    """
    
    proposal = negotiation.proposal
    prop_type = negotiation.proposal_type
    
    if prop_type == 'budget':
        new_budget = proposal.get('budget', 0)
        my_budget_range = PERSONALITY['budget_range']
        
        if my_budget_range['min'] <= new_budget <= my_budget_range['max']:
            return {
                'acceptable': True,
                'reasoning': "Budget works for me!"
            }
        else:
            return {
                'acceptable': False,
                'reasoning': "Budget is outside my comfortable range"
            }
    
    elif prop_type == 'activity':
        # More open personalities accept more activities
        if PERSONALITY['adventure_level'] > 0.5 or PERSONALITY['social_level'] > 0.6:
            return {
                'acceptable': True,
                'reasoning': "I'm open to trying new activities!"
            }
    
    # Default: accept if planning style is flexible
    if PERSONALITY['planning_style'] < 0.5:
        return {
            'acceptable': True,
            'reasoning': "Sounds good to me, I'm flexible!"
        }
    
    return {
        'acceptable': False,
        'reasoning': "Let me think about this"
    }

def generate_counter_offer(negotiation: TripNegotiation, evaluation: Dict) -> Dict:
    """
    Generate counter-offer in negotiation
    """
    
    # Simple counter-offer logic
    return {
        'type': negotiation.proposal_type,
        'alternative': "Let's find a middle ground",
        'flexible': PERSONALITY['planning_style'] < 0.5
    }

def score_itinerary(itinerary: ItineraryProposal) -> float:
    """
    Score proposed itinerary based on personality
    """
    
    scores = []
    
    # Budget check
    my_budget_max = PERSONALITY['budget_range']['max']
    if itinerary.total_cost <= my_budget_max:
        scores.append(1.0)
    else:
        excess = itinerary.total_cost - my_budget_max
        scores.append(max(0.0, 1.0 - (excess / my_budget_max)))
    
    # Activities variety (adventurous people like variety)
    num_unique_activities = len(set(day.get('activity', '') for day in itinerary.days))
    variety_score = min(1.0, num_unique_activities / (len(itinerary.days) * 0.6))
    
    if PERSONALITY['adventure_level'] > 0.6:
        scores.append(variety_score)
    else:
        # Less adventurous prefer consistency
        scores.append(1.0 - variety_score * 0.5)
    
    # Pace check
    activities_per_day = sum(len(day.get('activities', [])) for day in itinerary.days) / len(itinerary.days)
    
    if PERSONALITY['pace_preference'] > 0.7:  # Fast pace
        pace_score = min(1.0, activities_per_day / 5)
    elif PERSONALITY['pace_preference'] < 0.3:  # Relaxed
        pace_score = 1.0 - min(1.0, activities_per_day / 3)
    else:  # Moderate
        ideal_activities = 3
        pace_score = 1.0 - abs(activities_per_day - ideal_activities) / ideal_activities
    
    scores.append(pace_score)
    
    return sum(scores) / len(scores)

# Register protocol
agent.include(travel_protocol)

# === AGENT STARTUP ===

@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"🧳 WanderLink Travel Agent Starting...")
    ctx.logger.info(f"   User ID: {USER_ID}")
    ctx.logger.info(f"   Agent Address: {agent.address}")
    ctx.logger.info(f"   Personality Profile:")
    ctx.logger.info(f"     - Adventure Level: {PERSONALITY['adventure_level']:.2f}")
    ctx.logger.info(f"     - Social Level: {PERSONALITY['social_level']:.2f}")
    ctx.logger.info(f"     - Budget: ${PERSONALITY['budget_range']['min']}-${PERSONALITY['budget_range']['max']}")
    ctx.logger.info(f"     - Interests: {', '.join(PERSONALITY['interests'][:3])}")

if __name__ == "__main__":
    agent.run()
```

---

## Phase 2: Agent Communication & Matching (Week 2)

### 2.1 Create Group Agent

**File**: `agents/src/agents/group_agent.py`

This agent represents a travel group and proactively reaches out to compatible individual agents.

### 2.2 Create Agent Orchestrator

**File**: `agents/src/services/agent_orchestrator.py`

Manages communication between user agents and group agents:
- Broadcasting match requests
- Facilitating negotiations
- Collecting responses
- Finalizing trip plans

---

## Phase 3: Integration with Agent Service (Week 3)

### 3.1 Update Agent Service

Add new endpoints to `agent_service.py`:

```python
@app.post("/api/create-personal-agent")
async def create_personal_agent(request: CreateAgentRequest):
    """
    Create a personalized travel agent for a user
    """
    factory = TravelAgentFactory(supabase, config)
    agent = await factory.create_personalized_agent(request.dict())
    return agent

@app.post("/api/find-matches-with-agents")
async def find_matches_with_agents(request: MatchRequestAPI):
    """
    Use personal agent to find and negotiate with group agents
    """
    orchestrator = AgentOrchestrator(supabase)
    results = await orchestrator.find_matches_for_user(request.userId)
    return results
```

### 3.2 Update Frontend

**File**: `frontend/components/PersonalizedMatchingModal.tsx`

UI to:
1. Create personal agent (one-time, on first use)
2. Show agent personality profile
3. Initiate agent-based matching
4. Display negotiation progress
5. Show final trip recommendations

---

## Phase 4: Advanced Features (Week 4)

### 4.1 Destination Expert Agents

Create specialized agents for popular destinations that provide:
- Local insights
- Activity recommendations
- Budget optimization
- Hidden gems

### 4.2 Activity Coordinator Agents

Agents that specialize in specific activities:
- Trekking agent
- Food tour agent
- Adventure sports agent
- Cultural experiences agent

### 4.3 Agent Learning

Implement feedback loop:
- Track which trips user accepts/rejects
- Update agent personality over time
- Improve matching accuracy

---

## Database Schema Updates

### New Table: `user_agents`

```sql
CREATE TABLE user_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    agent_id TEXT UNIQUE NOT NULL,
    agent_address TEXT NOT NULL,
    personality JSONB NOT NULL,
    status TEXT DEFAULT 'active', -- active, inactive, archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX idx_user_agents_status ON user_agents(status);
```

### New Table: `agent_negotiations`

```sql
CREATE TABLE agent_negotiations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_agent_id UUID REFERENCES user_agents(id),
    group_id UUID REFERENCES travel_groups(id),
    compatibility_score DECIMAL(3,2),
    negotiation_history JSONB, -- Array of negotiation messages
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected, negotiating
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Benefits of This Approach

### 1. **Truly Personalized Matching**
- Each user has an AI agent representing their unique travel personality
- Agents negotiate on behalf of users 24/7
- Better matches through multi-dimensional compatibility

### 2. **Dynamic Trip Planning**
- Agents communicate to optimize itineraries
- Automatic accommodation of different preferences
- Real-time negotiation of trip details

### 3. **Scalable Architecture**
- Agents can be deployed to Agentverse (cloud) or run locally
- Asynchronous communication
- Can handle thousands of simultaneous negotiations

### 4. **Learning & Improvement**
- Agents learn from user feedback
- Personality profiles improve over time
- Better recommendations with each interaction

### 5. **Advanced Features**
- Destination expert agents provide local insights
- Activity coordinator agents optimize specific experiences
- Multi-agent collaboration for complex trip planning

---

## Implementation Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Agent Factory | AgentFactory, TravelAgentTemplate, Personality builder |
| 2 | Communication | GroupAgent, AgentOrchestrator, Negotiation protocols |
| 3 | Integration | Agent Service endpoints, Frontend components, Testing |
| 4 | Advanced | Destination agents, Activity agents, Learning system |

---

## Quick Start (MVP)

For a minimal viable product, focus on:

1. ✅ Create `TravelAgentFactory` with personality building
2. ✅ Create `travel_agent_template.py` with basic matching
3. ✅ Add `/api/create-personal-agent` endpoint
4. ✅ Add `/api/find-matches-with-agents` endpoint
5. ✅ Simple frontend to create agent & view matches

**This gives you the core personalized agent functionality without the full complexity.**

---

## Next Steps

Would you like me to:
1. **Start implementing Phase 1** (AgentFactory + Template)?
2. **Create a simplified MVP** version first?
3. **Focus on Agentverse deployment** setup?
4. **Build the frontend components** for agent creation?

Let me know which part you'd like to tackle first! 🚀
