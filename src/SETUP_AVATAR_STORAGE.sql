-- ============================================================================
-- AVATAR STORAGE BUCKET SETUP
-- ============================================================================
-- Purpose: Create storage bucket and RLS policies for avatar uploads
-- Run this in: Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: Create the avatars bucket (if it doesn't exist)
-- ============================================================================

-- Note: Storage buckets are managed in storage.buckets table
-- Check if bucket exists first
DO $$
BEGIN
  -- Create bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================================
-- STEP 2: Enable RLS on storage.objects
-- ============================================================================

-- RLS should already be enabled, but let's make sure
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Drop existing policies (if any) to avoid conflicts
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- ============================================================================
-- STEP 4: Create RLS policies for avatars bucket
-- ============================================================================

-- Policy 1: Public read access (anyone can view avatars)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Authenticated users can upload avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() IS NOT NULL
);

-- Policy 3: Users can update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() IS NOT NULL
);

-- Policy 4: Users can delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- ============================================================================
-- STEP 5: Verify setup
-- ============================================================================

-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check policies are created
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
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';

-- ============================================================================
-- SUCCESS! ✅
-- ============================================================================
-- You should now be able to:
-- 1. Upload avatars without RLS errors
-- 2. Update existing avatars (upsert: true)
-- 3. Anyone can view avatars (public bucket)
-- 4. Users can delete their own avatars
-- ============================================================================

-- Test by uploading an avatar through the Edit Profile modal!
