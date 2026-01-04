-- Migration to add Tenant Settings (Feature Flags & Branding)

-- 1. Add 'settings' JSONB column to 'clinics' table
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "modules": ["appointments", "patients"], 
  "branding": {
    "primaryColor": "#0f172a", 
    "logoUrl": null
  }
}';

-- 2. Add comment for clarity
COMMENT ON COLUMN clinics.settings IS 'Configuration for Feature Flags (modules) and Whitelabeling (branding)';

-- 3. Security Policy for Settings
-- Allow Clinic Admins to READ their settings
-- Only Super Admins (service_role or specific claim) can UPDATE settings
-- We use existing policy "View own clinic" for SELECT, which covers all columns including settings.
-- We must restrict UPDATE if RLS is enabled.

-- Ensure only authorized roles can update critical settings
CREATE POLICY "Super Admins can update clinic settings" ON clinics
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'super_admin' 
    -- OR some other high-privilege check
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'super_admin'
  );
