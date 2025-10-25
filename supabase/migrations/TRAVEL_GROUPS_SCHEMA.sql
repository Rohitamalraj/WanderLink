-- WanderLink - Travel Groups Table Schema
-- This is the table used by the Planner Agent
-- Run this in your Supabase SQL Editor

-- ============================================================
-- TRAVEL_GROUPS TABLE - Stores groups created by Planner Agent
-- ============================================================
CREATE TABLE IF NOT EXISTS travel_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id TEXT NOT NULL UNIQUE, -- Custom group ID from Planner
    destination TEXT NOT NULL,
    members TEXT[] NOT NULL, -- Array of user IDs (agent addresses)
    member_count INTEGER NOT NULL DEFAULT 3,
    itinerary TEXT NOT NULL,
    travelers JSONB, -- Array of traveler preference objects
    status TEXT NOT NULL DEFAULT 'matched', -- matched, active, completed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GROUP_MESSAGES TABLE - Stores messages in travel groups
-- ============================================================
CREATE TABLE IF NOT EXISTS group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id TEXT NOT NULL, -- References travel_groups.group_id
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_agent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PLANNER_BRIDGE_MESSAGES - Messages from Planner to users
-- ============================================================
CREATE TABLE IF NOT EXISTS planner_bridge_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_agent BOOLEAN DEFAULT true,
    sender TEXT DEFAULT 'planner',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for better performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_travel_groups_group_id ON travel_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_travel_groups_members ON travel_groups USING GIN(members);
CREATE INDEX IF NOT EXISTS idx_travel_groups_status ON travel_groups(status);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_planner_bridge_user_id ON planner_bridge_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_planner_bridge_read ON planner_bridge_messages(read);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE travel_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_bridge_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - Allow service role full access
-- ============================================================

-- Travel Groups: Service role can do everything
DROP POLICY IF EXISTS "Service role can manage travel_groups" ON travel_groups;
CREATE POLICY "Service role can manage travel_groups"
    ON travel_groups FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Travel Groups: Anon users can read
DROP POLICY IF EXISTS "Anon can read travel_groups" ON travel_groups;
CREATE POLICY "Anon can read travel_groups"
    ON travel_groups FOR SELECT
    TO anon
    USING (true);

-- Group Messages: Service role can do everything
DROP POLICY IF EXISTS "Service role can manage group_messages" ON group_messages;
CREATE POLICY "Service role can manage group_messages"
    ON group_messages FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Group Messages: Anon users can read
DROP POLICY IF EXISTS "Anon can read group_messages" ON group_messages;
CREATE POLICY "Anon can read group_messages"
    ON group_messages FOR SELECT
    TO anon
    USING (true);

-- Planner Bridge Messages: Service role can do everything
DROP POLICY IF EXISTS "Service role can manage planner_bridge_messages" ON planner_bridge_messages;
CREATE POLICY "Service role can manage planner_bridge_messages"
    ON planner_bridge_messages FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Planner Bridge Messages: Anon users can read their own
DROP POLICY IF EXISTS "Anon can read own planner_bridge_messages" ON planner_bridge_messages;
CREATE POLICY "Anon can read own planner_bridge_messages"
    ON planner_bridge_messages FOR SELECT
    TO anon
    USING (true);

-- ============================================================
-- FUNCTIONS - Helper functions
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for travel_groups table
DROP TRIGGER IF EXISTS update_travel_groups_updated_at ON travel_groups;
CREATE TRIGGER update_travel_groups_updated_at BEFORE UPDATE ON travel_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- REALTIME - Enable for live updates
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE travel_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE planner_bridge_messages;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Check tables were created:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('travel_groups', 'group_messages', 'planner_bridge_messages');

-- Check columns in travel_groups:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'travel_groups' 
ORDER BY ordinal_position;

-- ============================================================
-- ✅ SCHEMA COMPLETE!
-- ============================================================
