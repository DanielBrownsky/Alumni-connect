-- Fix Job Applications RLS Policies
-- Run this in Supabase SQL Editor to fix the 403 error when students apply for jobs

-- Drop existing policies
DROP POLICY IF EXISTS "Students can apply for jobs" ON job_applications;
DROP POLICY IF EXISTS "Students can update own application" ON job_applications;
DROP POLICY IF EXISTS "Users can view own job application" ON job_applications;

-- Create INSERT policy - allow authenticated users to insert
CREATE POLICY "Students can apply for jobs"
ON job_applications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create SELECT policy - users can view their own applications
CREATE POLICY "Users can view own job application"
ON job_applications
FOR SELECT
TO authenticated
USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = student_id));

-- Create UPDATE policy - alumni can update status for jobs they posted
CREATE POLICY "Students can update own application"
ON job_applications
FOR UPDATE
TO authenticated
USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = student_id)
  OR
  job_id IN (SELECT id FROM job_postings WHERE posted_by = (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
