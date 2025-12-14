-- Fix Row-Level Security (RLS) policies for stores table
-- This allows users to manage only their own store

-- 1. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can manage their own store" ON stores;
DROP POLICY IF EXISTS "Enable read access for all users" ON stores;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON stores;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON stores;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON stores;

-- 2. Enable RLS on stores table
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- 3. Create comprehensive policy for authenticated users
CREATE POLICY "Users can manage their own store" ON stores
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow public read access (so anyone can view stores)
CREATE POLICY "Public stores are viewable by everyone" ON stores
  FOR SELECT
  USING (true);

-- Verification query (run after executing the above)
-- SELECT * FROM pg_policies WHERE tablename = 'stores';
