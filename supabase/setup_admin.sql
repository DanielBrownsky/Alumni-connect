-- Add admin role to the profiles table
-- Run this in your Supabase SQL Editor

-- First, check if the role column exists and update it to include 'admin'
ALTER TABLE profiles 
ALTER COLUMN role TYPE TEXT USING role::TEXT;

-- Drop the existing constraint if it exists and recreate it to include 'admin'
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add a check constraint for the allowed roles (now including admin)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'alumni', 'admin'));

-- Create a function to automatically set up admin role for specific emails
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email is your admin email (replace with your actual admin email)
  IF NEW.email = 'admin@alumni-connect.com' THEN
    INSERT INTO public.profiles (user_id, email, first_name, last_name, role, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      'Admin',
      'User',
      'admin',
      NOW(),
      NOW()
    );
  ELSE
    -- For regular users, set default role as student
    INSERT INTO public.profiles (user_id, email, first_name, last_name, role, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE profiles TO anon, authenticated;
GRANT ALL ON SEQUENCE profiles_id_seq TO anon, authenticated;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
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

-- Admin policy - admins can do everything
DROP POLICY IF EXISTS "Admins can do everything" ON profiles;
CREATE POLICY "Admins can do everything"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );