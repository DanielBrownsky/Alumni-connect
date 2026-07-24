-- DIRECT ADMIN PROFILE FIX
-- Run this entire script at once in Supabase SQL Editor

-- First, let's see what's in your auth.users table
SELECT id, email FROM auth.users WHERE email = 'daniel@alumni-connect.com';

-- Then let's see what's in your profiles table
SELECT * FROM profiles WHERE email = 'daniel@alumni-connect.com';

-- If you see your user in auth.users but NOT in profiles, run this:
-- Replace 'YOUR_ACTUAL_USER_ID' with the ID from the first query above

INSERT INTO profiles (user_id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
  'YOUR_ACTUAL_USER_ID',  -- Replace this with the actual ID from the query above
  'daniel@alumni-connect.com',
  'Admin',
  'User',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Verify it worked
SELECT * FROM profiles WHERE email = 'daniel@alumni-connect.com';