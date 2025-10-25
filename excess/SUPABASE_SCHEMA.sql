-- WanderLink Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================================
-- 1. GROUPS TABLE - Stores travel groups created by Planner
-- ============================================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    itinerary TEXT NOT NULL,
    member_count INTEGER NOT NULL DEFAULT 3,
    status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. GROUP_MEMBERS TABLE - Stores which users are in which groups
-- ============================================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Agent address (e.g., agent1q...)
    user_agent_address TEXT, -- Full Agentverse agent address
    status TEXT NOT NULL DEFAULT 'active', -- active, left, removed
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- ============================================================
-- 3. GROUP_MESSAGES TABLE - Stores chat messages in groups
-- ============================================================
CREATE TABLE IF NOT EXISTS group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL, -- 'system', 'agent', or user_id
    sender_type TEXT NOT NULL DEFAULT 'user', -- system, agent, user
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text', -- text, itinerary, system
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. USER_TRIP_PREFERENCES - Stores user trip submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_trip_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    user_agent_address TEXT,
    preferences JSONB NOT NULL,
    original_input TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, matched, in_group
    group_id UUID REFERENCES groups(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. INDEXES for better performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_user_trip_preferences_user_id ON user_trip_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trip_preferences_status ON user_trip_preferences(status);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);

-- ============================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trip_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS POLICIES - Allow service role full access
-- ============================================================

-- Groups: Service role can do everything
CREATE POLICY "Service role can manage groups"
    ON groups FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Group Members: Service role can do everything
CREATE POLICY "Service role can manage group_members"
    ON group_members FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Group Messages: Service role can do everything
CREATE POLICY "Service role can manage group_messages"
    ON group_messages FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- User Trip Preferences: Service role can do everything
CREATE POLICY "Service role can manage user_trip_preferences"
    ON user_trip_preferences FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- 8. REALTIME - Enable for live updates
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE groups;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_trip_preferences;

-- ============================================================
-- 9. FUNCTIONS - Helper functions
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for groups table
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_trip_preferences table
CREATE TRIGGER update_user_trip_preferences_updated_at BEFORE UPDATE ON user_trip_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 10. SAMPLE DATA (Optional - for testing)
-- ============================================================
/*
-- Insert a test group
INSERT INTO groups (name, destination, itinerary, member_count, status)
VALUES (
    'Varkala Adventure Group - Oct 2025',
    'Varkala',
    'Day 1: Beach exploration...',
    3,
    'active'
);

-- Get the group_id
-- Then insert members
INSERT INTO group_members (group_id, user_id, user_agent_address)
VALUES 
    ('your-group-id-here', 'user1', 'agent1q...'),
    ('your-group-id-here', 'user2', 'agent1q...'),
    ('your-group-id-here', 'user3', 'agent1q...');

-- Insert welcome message
INSERT INTO group_messages (group_id, sender_id, sender_type, message, message_type)
VALUES (
    'your-group-id-here',
    'system',
    'system',
    'Welcome to your travel group!',
    'system'
);
*/

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Check tables were created:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('groups', 'group_members', 'group_messages', 'user_trip_preferences');

-- Check indexes:
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('groups', 'group_members', 'group_messages', 'user_trip_preferences');

-- Check RLS is enabled:
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('groups', 'group_members', 'group_messages', 'user_trip_preferences');

-- ============================================================
-- ✅ SCHEMA COMPLETE!
-- ============================================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify tables created successfully
-- 3. Update Planner agent to use these tables
-- 4. Update frontend to read from these tables
-- ============================================================
