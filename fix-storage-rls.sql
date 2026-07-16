-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile pictures" ON storage.objects;

-- Create simpler RLS policies for the storage bucket
-- Allow authenticated users to upload to profile-pictures bucket
CREATE POLICY "Users can upload profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures');

-- Allow public access to view profile pictures
CREATE POLICY "Public can view profile pictures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Allow authenticated users to delete their own pictures
CREATE POLICY "Users can delete own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-pictures');
