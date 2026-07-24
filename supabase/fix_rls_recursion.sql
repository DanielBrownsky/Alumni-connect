-- FIX INFINITE RECURSION IN RLS POLICIES
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can do everything" ON profiles;

-- Step 2: Create a better admin policy using auth.uid() instead of checking profiles
CREATE POLICY "Admins can do everything"
  ON profiles FOR ALL
  USING (
    -- Check if the user's email is in the admin list
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('daniel@alumni-connect.com')
    )
  );

-- Step 3: Ensure other policies don't cause issues
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 4: Verify the policies are correct
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';