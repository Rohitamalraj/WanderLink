-- ============================================
-- WanderLink - Quick Setup SQL
-- ============================================
-- Run this in your Supabase SQL Editor
-- This will:
-- 1. Insert your user into the users table
-- 2. Create some test groups for you to join
-- ============================================

-- STEP 1: Insert your user (from auth.users → users table)
-- This syncs your Google-authenticated user
INSERT INTO users (id, email, full_name, avatar_url, created_at)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url',
  created_at
FROM auth.users
WHERE id = 'f7e78b88-682c-4534-af7c-c4332db4c038'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url;

-- Verify your user was inserted
SELECT id, email, full_name FROM users WHERE id = 'f7e78b88-682c-4534-af7c-c4332db4c038';


-- STEP 2: Create test travel groups
-- These groups will appear in "Find My Matches"
INSERT INTO travel_groups (id, name, destination, start_date, end_date, budget_per_person, max_members, current_members, status, creator_id, created_at)
VALUES
  -- Group 1: Tokyo Adventure (you created this)
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Tokyo Cherry Blossom Adventure 🌸',
    'Tokyo, Japan',
    '2025-11-15',
    '2025-11-22',
    1200,
    3,
    1,
    'forming',
    'f7e78b88-682c-4534-af7c-c4332db4c038',
    NOW()
  ),
  
  -- Group 2: Bali Wellness
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Bali Wellness & Beaches 🏝️',
    'Bali, Indonesia',
    '2025-12-01',
    '2025-12-10',
    950,
    3,
    1,
    'forming',
    'f7e78b88-682c-4534-af7c-c4332db4c038',
    NOW()
  ),
  
  -- Group 3: Iceland Northern Lights
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Iceland Northern Lights ❄️',
    'Reykjavik, Iceland',
    '2025-11-20',
    '2025-11-28',
    2100,
    3,
    2,
    'forming',
    'f7e78b88-682c-4534-af7c-c4332db4c038',
    NOW()
  ),
  
  -- Group 4: Thailand Island Hopping
  (
    'd4e5f6a7-b8c9-0123-def1-234567890123',
    'Thailand Island Hopping 🛥️',
    'Phuket, Thailand',
    '2025-12-15',
    '2025-12-25',
    1100,
    3,
    1,
    'forming',
    'f7e78b88-682c-4534-af7c-c4332db4c038',
    NOW()
  ),
  
  -- Group 5: Morocco Desert Safari
  (
    'e5f6a7b8-c9d0-1234-ef12-345678901234',
    'Morocco Desert Safari 🐪',
    'Marrakech, Morocco',
    '2025-11-10',
    '2025-11-18',
    1350,
    3,
    1,
    'forming',
    'f7e78b88-682c-4534-af7c-c4332db4c038',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- STEP 3: Add yourself as the first member of each group
INSERT INTO group_members (group_id, user_id, status, compatibility_score, joined_at)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f7e78b88-682c-4534-af7c-c4332db4c038', 'accepted', 100.0, NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f7e78b88-682c-4534-af7c-c4332db4c038', 'accepted', 100.0, NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'f7e78b88-682c-4534-af7c-c4332db4c038', 'accepted', 100.0, NOW()),
  ('d4e5f6a7-b8c9-0123-def1-234567890123', 'f7e78b88-682c-4534-af7c-c4332db4c038', 'accepted', 100.0, NOW()),
  ('e5f6a7b8-c9d0-1234-ef12-345678901234', 'f7e78b88-682c-4534-af7c-c4332db4c038', 'accepted', 100.0, NOW())
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Verify groups were created
SELECT 
  id, 
  name, 
  destination, 
  current_members || '/' || max_members as members,
  status,
  budget_per_person
FROM travel_groups 
WHERE creator_id = 'f7e78b88-682c-4534-af7c-c4332db4c038'
ORDER BY start_date;

-- ============================================
-- SUCCESS! 🎉
-- ============================================
-- Now you can:
-- 1. Go to http://localhost:3000/trips
-- 2. Click "CREATE GROUP" to make new groups
-- 3. Click "FIND MY MATCHES" to see these groups
-- 4. Join other groups (up to 3 people per group)
-- ============================================
