-- WanderLink Database Schema
-- Production-ready schema for group travel matching

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences/travel profile
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  preferred_destinations TEXT[] DEFAULT '{}',
  budget_min INTEGER DEFAULT 500,
  budget_max INTEGER DEFAULT 5000,
  interests TEXT[] DEFAULT '{}',
  travel_pace TEXT CHECK (travel_pace IN ('relaxed', 'moderate', 'packed')),
  activities JSONB DEFAULT '{}',
  travel_style JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Travel groups (max 3 people)
CREATE TABLE travel_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_per_person INTEGER NOT NULL,
  max_members INTEGER DEFAULT 3 CHECK (max_members <= 3),
  current_members INTEGER DEFAULT 1 CHECK (current_members <= max_members),
  status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'full', 'confirmed', 'active', 'completed', 'cancelled')),
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES travel_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'left')),
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Match requests (for finding compatible travelers)
CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES travel_groups(id) ON DELETE CASCADE NOT NULL,
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  match_factors JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-generated itineraries
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES travel_groups(id) ON DELETE CASCADE NOT NULL,
  generated_by TEXT DEFAULT 'planner_agent',
  itinerary_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id)
);

-- User agents (ASI-powered personal agents)
CREATE TABLE user_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  agent_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_travel_groups_status ON travel_groups(status);
CREATE INDEX idx_travel_groups_creator ON travel_groups(creator_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_match_requests_user_id ON match_requests(user_id);
CREATE INDEX idx_match_requests_group_id ON match_requests(group_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);
CREATE INDEX idx_itineraries_group_id ON itineraries(group_id);

-- Row Level Security (RLS) Policies

-- Users: Users can read their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences: Users can manage their own preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Travel groups: Anyone can view, creator can update
ALTER TABLE travel_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view travel groups" ON travel_groups
  FOR SELECT USING (true);
CREATE POLICY "Creators can insert travel groups" ON travel_groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their groups" ON travel_groups
  FOR UPDATE USING (auth.uid() = creator_id);

-- Group members: Members and potential members can view
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view group membership" ON group_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT creator_id FROM travel_groups WHERE id = group_id)
  );
CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their membership" ON group_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Match requests: Users can view their own requests
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their match requests" ON match_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create match requests" ON match_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their match requests" ON match_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Itineraries: Group members can view
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view itineraries" ON itineraries
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM group_members WHERE group_id = itineraries.group_id)
  );

-- User agents: Users can manage their own agents
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own agent" ON user_agents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own agent" ON user_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own agent" ON user_agents
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_groups_updated_at BEFORE UPDATE ON travel_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_members_updated_at BEFORE UPDATE ON group_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_requests_updated_at BEFORE UPDATE ON match_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_agents_updated_at BEFORE UPDATE ON user_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE travel_groups
    SET current_members = current_members + 1,
        status = CASE WHEN current_members + 1 >= max_members THEN 'full' ELSE status END
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE travel_groups
    SET current_members = current_members + 1,
        status = CASE WHEN current_members + 1 >= max_members THEN 'full' ELSE status END
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE travel_groups
    SET current_members = GREATEST(current_members - 1, 0),
        status = CASE WHEN current_members - 1 < max_members THEN 'forming' ELSE status END
    WHERE id = NEW.group_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for group member count
CREATE TRIGGER trigger_update_group_member_count
AFTER INSERT OR UPDATE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_group_member_count();
