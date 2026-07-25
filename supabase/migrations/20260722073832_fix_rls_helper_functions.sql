-- Fix RLS: use a SECURITY DEFINER helper function that safely returns the user's role
-- This avoids the NULL subquery problem when profiles row doesn't exist yet

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop and recreate all policies using the helper functions

-- LOCATIONS
DROP POLICY IF EXISTS "locations_select_own" ON locations;
DROP POLICY IF EXISTS "locations_insert_own" ON locations;
DROP POLICY IF EXISTS "locations_update_own" ON locations;
DROP POLICY IF EXISTS "locations_delete_own" ON locations;
DROP POLICY IF EXISTS "locations_admin_all" ON locations;
DROP POLICY IF EXISTS "locations_public_read" ON locations;

CREATE POLICY "locations_select_own" ON locations FOR SELECT
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "locations_insert_own" ON locations FOR INSERT
  TO authenticated WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "locations_update_own" ON locations FOR UPDATE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin())
  WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "locations_delete_own" ON locations FOR DELETE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "locations_public_read" ON locations FOR SELECT
  TO anon, authenticated USING (active = true);

-- REELS
DROP POLICY IF EXISTS "reels_select_own" ON reels;
DROP POLICY IF EXISTS "reels_insert_own" ON reels;
DROP POLICY IF EXISTS "reels_update_own" ON reels;
DROP POLICY IF EXISTS "reels_delete_own" ON reels;
DROP POLICY IF EXISTS "reels_admin_all" ON reels;
DROP POLICY IF EXISTS "reels_public_live" ON reels;

CREATE POLICY "reels_select_own" ON reels FOR SELECT
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "reels_insert_own" ON reels FOR INSERT
  TO authenticated WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "reels_update_own" ON reels FOR UPDATE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin())
  WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "reels_delete_own" ON reels FOR DELETE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "reels_public_live" ON reels FOR SELECT
  TO anon, authenticated USING (status = 'live');

-- TENANTS
DROP POLICY IF EXISTS "tenants_own" ON tenants;
DROP POLICY IF EXISTS "tenants_admin" ON tenants;

CREATE POLICY "tenants_select_own" ON tenants FOR SELECT
  TO authenticated USING (id = user_tenant_id() OR is_admin());

CREATE POLICY "tenants_update_own" ON tenants FOR UPDATE
  TO authenticated USING (id = user_tenant_id() OR is_admin())
  WITH CHECK (id = user_tenant_id() OR is_admin());

CREATE POLICY "tenants_insert_admin" ON tenants FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "tenants_delete_admin" ON tenants FOR DELETE
  TO authenticated USING (is_admin());

-- PROFILES
DROP POLICY IF EXISTS "profiles_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE
  TO authenticated USING (is_admin());

-- SCAN EVENTS (keep existing, they work)
DROP POLICY IF EXISTS "scan_events_insert" ON scan_events;
DROP POLICY IF EXISTS "scan_events_tenant" ON scan_events;

CREATE POLICY "scan_events_insert" ON scan_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "scan_events_select_own" ON scan_events FOR SELECT
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION user_tenant_id() TO authenticated;
