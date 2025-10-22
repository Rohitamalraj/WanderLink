-- Seed data for testing (Run this in Supabase SQL Editor)

-- First, run the schema migration if you haven't: 001_init_schema.sql

-- Insert test users (these will come from Google Auth normally)
-- You'll need to replace these UUIDs with actual auth.users IDs from Google login

-- Insert some test groups
INSERT INTO travel_groups (name, destination, start_date, end_date, budget_per_person, max_members, current_members, status, creator_id)
VALUES
  ('Tokyo Cherry Blossom Adventure', 'Tokyo, Japan', '2025-11-15', '2025-11-22', 1200, 3, 1, 'forming', 'replace-with-your-user-id'),
  ('Bali Wellness Retreat', 'Bali, Indonesia', '2025-12-01', '2025-12-10', 950, 3, 1, 'forming', 'replace-with-your-user-id'),
  ('Iceland Northern Lights', 'Reykjavik, Iceland', '2025-11-20', '2025-11-28', 2100, 3, 2, 'forming', 'replace-with-your-user-id');

-- Note: Replace 'replace-with-your-user-id' with actual UUID from auth.users after Google login
-- You can get it by running: SELECT id FROM auth.users WHERE email = 'your-email@gmail.com';
