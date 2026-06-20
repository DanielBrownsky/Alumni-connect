-- Check your current role in the database
-- Run this in Supabase SQL Editor

-- Check your profile and role
SELECT id, user_id, email, first_name, last_name, role 
FROM profiles 
WHERE user_id = '4bb11876-7b4b-4d2b-bd18-a9dec0efb5a6';

-- If your role is wrong, update it to alumni
UPDATE profiles 
SET role = 'alumni' 
WHERE user_id = '4bb11876-7b4b-4d2b-bd18-a9dec0efb5a6';
