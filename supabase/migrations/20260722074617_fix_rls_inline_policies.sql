-- Fix RLS: Replace SECURITY DEFINER helper functions with inline subqueries
-- Step 1: Drop ALL existing policies first (they depend on the helper functions)

-- Drop ALL policies on all tables
DROP POLICY IF EXISTS "locations_select_own" ON locations;
DROP POLICY IF EXISTS "locations_insert_own" ON locations;
DROP POLICY IF EXISTS "locations_update_own" ON locations;
DROP POLICY IF EXISTS "locations_delete_own" ON locations;
DROP POLICY IF EXISTS "locations_public_read" ON locations;

DROP POLICY IF EXISTS "reels_select_own" ON reels;
DROP POLICY IF EXISTS "reels_insert_own" ON reels;
DROP POLICY IF EXISTS "reels_update_own" ON reels;
DROP POLICY IF EXISTS "reels_delete_own" ON reels;
DROP POLICY IF EXISTS "reels_public_live" ON reels;

DROP POLICY IF EXISTS "tenants_select_own" ON tenants;
DROP POLICY IF EXISTS "tenants_update_own" ON tenants;
DROP POLICY IF EXISTS "tenants_insert_admin" ON tenants;
DROP POLICY IF EXISTS "tenants_delete_admin" ON tenants;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

DROP POLICY IF EXISTS "scan_events_insert" ON scan_events;
DROP POLICY IF EXISTS "scan_events_select_own" ON scan_events;

-- Step 2: Now drop the helper functions
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.user_tenant_id();

-- Step 3: Create new inline policies (no helper functions, no recursion)

-- PROFILES
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (id = auth.uid() OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  TO authenticated USING (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- TENANTS
CREATE POLICY "tenants_select" ON tenants FOR SELECT
  TO authenticated USING (
    id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "tenants_update" ON tenants FOR UPDATE
  TO authenticated USING (
    id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "tenants_insert" ON tenants FOR INSERT
  TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "tenants_delete" ON tenants FOR DELETE
  TO authenticated USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- LOCATIONS
CREATE POLICY "locations_select" ON locations FOR SELECT
  TO authenticated USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "locations_insert" ON locations FOR INSERT
  TO authenticated WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "locations_update" ON locations FOR UPDATE
  TO authenticated USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "locations_delete" ON locations FOR DELETE
  TO authenticated USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "locations_public_read" ON locations FOR SELECT
  TO anon, authenticated USING (active = true);

-- REELS
CREATE POLICY "reels_select" ON reels FOR SELECT
  TO authenticated USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "reels_insert" ON reels FOR INSERT
  TO authenticated WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "reels_update" ON reels FOR UPDATE
  TO authenticated USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "reels_delete" ON reels FOR DELETE
  TO authenticated USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "reels_public_live" ON reels FOR SELECT
  TO anon, authenticated USING (status = 'live');

-- SCAN EVENTS
CREATE POLICY "scan_events_insert" ON scan_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "scan_events_select" ON scan_events FOR SELECT
  TO authenticated USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
