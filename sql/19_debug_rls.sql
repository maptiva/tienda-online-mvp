-- Debug RLS issue: Check user_id mismatch
-- Run these queries in Supabase SQL Editor to diagnose the problem

-- 1. Check your current authenticated user ID
SELECT auth.uid() as current_user_id;

-- 2. Check the user_id in your store record
SELECT id, store_name, user_id, created_at 
FROM stores 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Compare: Does auth.uid() match the user_id in stores?
-- If they DON'T match, that's the problem!

-- 4. TEMPORARY FIX: Disable RLS completely (for development only)
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;

-- 5. PERMANENT FIX: Update the user_id to match your current auth user
-- First, get your auth.uid() from query #1, then:
-- UPDATE stores 
-- SET user_id = 'YOUR_AUTH_UID_HERE'
-- WHERE id = 3;  -- Adjust ID as needed

-- 6. After fixing user_id, re-enable RLS
-- ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
