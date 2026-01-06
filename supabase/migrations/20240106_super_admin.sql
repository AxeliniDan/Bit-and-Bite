-- Migration: Security & Super Admin Controls

-- 1. Add is_super_admin to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- 2. RLS Policy: Super Admins can view ALL clinics
CREATE POLICY "Super Admins can view all clinics" ON clinics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_super_admin = TRUE
    )
  );

-- 3. RLS Policy: Super Admins can update ALL clinics (suspend/activate)
CREATE POLICY "Super Admins can update all clinics" ON clinics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_super_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_super_admin = TRUE
    )
  );

-- 4. RLS Policy: Super Admins can view ALL profiles
CREATE POLICY "Super Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
      EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_super_admin = TRUE
    )
  );

-- 5. Helper Function: Is User Super Admin? (For Frontend/RPC)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_super_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;
