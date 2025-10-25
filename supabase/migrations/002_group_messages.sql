-- Create group_messages table for agent-to-user chat
CREATE TABLE IF NOT EXISTS group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,  -- Can be user_id or 'PLANNER_AGENT', 'MATCHMAKER_AGENT', etc.
    message TEXT NOT NULL,
    is_agent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at DESC);

-- RLS Policies
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view group messages"
    ON group_messages FOR SELECT
    USING (true);

CREATE POLICY "Service role can insert messages"
    ON group_messages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can insert their own messages"
    ON group_messages FOR INSERT
    WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_group_messages_updated_at
    BEFORE UPDATE ON group_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE group_messages IS 'Chat messages within travel groups, including agent-generated itineraries';
COMMENT ON COLUMN group_messages.is_agent IS 'TRUE if message is from an AI agent, FALSE if from human user';
