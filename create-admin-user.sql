-- Create admin user script
-- Run this in Supabase SQL Editor to create an admin user

-- First, add role column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('alumni', 'student', 'admin'));

-- Update a specific user's role to admin
-- Replace 'user_id_here' with the actual user ID from auth.users
UPDATE profiles
SET role = 'admin'
WHERE user_id = 'user_id_here';

-- Or if you want to create a new admin user profile directly:
-- First create a user in auth.users via Supabase Auth UI
-- Then run:
-- INSERT INTO profiles (id, user_id, email, first_name, last_name, role)
-- VALUES (
--   gen_random_uuid(),
--   'user_id_from_auth',
--   'admin@alumniconnect.com',
--   'Admin',
--   'User',
--   'admin'
-- );
