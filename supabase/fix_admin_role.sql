-- RUN THIS SQL TO FIX THE ADMIN ROLE ISSUE
-- This will update the constraint to allow 'admin' as a valid role

-- Step 1: Drop the existing constraint that doesn't allow 'admin'
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Add the constraint back with 'admin' included
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'alumni', 'admin'));

-- Step 3: Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND conname = 'profiles_role_check';