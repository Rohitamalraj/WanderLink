-- Fix foreign key constraints in group_members table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xbspnzviiefekzosukfa/sql/new

-- Step 1: Drop the old group_id constraint (if needed)
ALTER TABLE group_members 
DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;

-- Step 2: Add correct group_id constraint pointing to 'groups' table
ALTER TABLE group_members 
ADD CONSTRAINT group_members_group_id_fkey 
FOREIGN KEY (group_id) 
REFERENCES groups(id) 
ON DELETE CASCADE;

-- Step 3: Drop the user_id foreign key constraint (users don't exist in users table yet)
ALTER TABLE group_members 
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

-- Verify the constraints
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conrelid = 'group_members'::regclass
AND contype = 'f';  -- 'f' means foreign key
