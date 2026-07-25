/*
# Fix RLS recursion — restore SECURITY DEFINER helper functions

## Problem
The inline RLS policies query `profiles` from within policies ON `profiles`
(and on other tables). When PostgreSQL evaluates a policy on `profiles`,
the subquery `SELECT 1 FROM profiles ...` re-triggers the `profiles` RLS,
which re-evaluates the policy, which queries `profiles` again → infinite
recursion → every query fails silently. This breaks:
1. Admin login → Dashboard queries (reels, locations) fail → redirect to tenant area
2. Tenant users can't create reels/locations (INSERT fails RLS)
3. New user registration — the handle_new_user trigger runs as SECURITY DEFINER
   (so the profile insert works), but the subsequent client-side session query
   hits the recursion and returns nothing.

## Fix
Recreate two SECURITY DEFINER helper functions that read from `profiles`
without triggering RLS (SECURITY DEFINER bypasses RLS for the function's
internal queries). Then drop ALL existing policies and recreate them using
the helper functions. This is the same approach from migration
20260722073832, which was incorrectly reverted by 20260722074617.

## Changes
1. Create `is_admin()` — SECURITY DEFINER, returns boolean
2. Create `user_tenant_id()` — SECURITY DEFINER, returns uuid
3. Drop ALL policies on all tables
4. Recreate all policies using the helper functions
5. Grant execute on helper functions to authenticated role
*/

-- ─── HELPER FUNCTIONS (SECURITY DEFINER = bypasses RLS) ───
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

-- ─── DROP ALL EXISTING POLICIES ───
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

DROP POLICY IF EXISTS "tenants_select" ON tenants;
DROP POLICY IF EXISTS "tenants_update" ON tenants;
DROP POLICY IF EXISTS "tenants_insert" ON tenants;
DROP POLICY IF EXISTS "tenants_delete" ON tenants;

DROP POLICY IF EXISTS "locations_select" ON locations;
DROP POLICY IF EXISTS "locations_insert" ON locations;
DROP POLICY IF EXISTS "locations_update" ON locations;
DROP POLICY IF EXISTS "locations_delete" ON locations;
DROP POLICY IF EXISTS "locations_public_read" ON locations;

DROP POLICY IF EXISTS "reels_select" ON reels;
DROP POLICY IF EXISTS "reels_insert" ON reels;
DROP POLICY IF EXISTS "reels_update" ON reels;
DROP POLICY IF EXISTS "reels_delete" ON reels;
DROP POLICY IF EXISTS "reels_public_live" ON reels;

DROP POLICY IF EXISTS "scan_events_insert" ON scan_events;
DROP POLICY IF EXISTS "scan_events_select" ON scan_events;

DROP POLICY IF EXISTS "media_select" ON media;
DROP POLICY IF EXISTS "media_insert" ON media;
DROP POLICY IF EXISTS "media_update" ON media;
DROP POLICY IF EXISTS "media_delete" ON media;

-- ─── PROFILES ───
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  TO authenticated USING (is_admin());

-- ─── TENANTS ───
CREATE POLICY "tenants_select" ON tenants FOR SELECT
  TO authenticated USING (id = user_tenant_id() OR is_admin());

CREATE POLICY "tenants_update" ON tenants FOR UPDATE
  TO authenticated USING (id = user_tenant_id() OR is_admin())
  WITH CHECK (id = user_tenant_id() OR is_admin());

CREATE POLICY "tenants_insert" ON tenants FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "tenants_delete" ON tenants FOR DELETE
  TO authenticated USING (is_admin());

-- ─── LOCATIONS ───
CREATE POLICY "locations_select" ON locations FOR SELECT
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "locations_insert" ON locations FOR INSERT
  TO authenticated WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "locations_update" ON locations FOR UPDATE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin())
  WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "locations_delete" ON locations FOR DELETE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "locations_public_read" ON locations FOR SELECT
  TO anon, authenticated USING (active = true);

-- ─── REELS ───
CREATE POLICY "reels_select" ON reels FOR SELECT
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "reels_insert" ON reels FOR INSERT
  TO authenticated WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "reels_update" ON reels FOR UPDATE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin())
  WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "reels_delete" ON reels FOR DELETE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "reels_public_live" ON reels FOR SELECT
  TO anon, authenticated USING (status = 'live');

-- ─── SCAN EVENTS ───
CREATE POLICY "scan_events_insert" ON scan_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "scan_events_select" ON scan_events FOR SELECT
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

-- ─── MEDIA ───
CREATE POLICY "media_select" ON media FOR SELECT
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "media_insert" ON media FOR INSERT
  TO authenticated WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "media_update" ON media FOR UPDATE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin())
  WITH CHECK (tenant_id = user_tenant_id() OR is_admin());

CREATE POLICY "media_delete" ON media FOR DELETE
  TO authenticated USING (tenant_id = user_tenant_id() OR is_admin());

-- ─── GRANTS ───
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION user_tenant_id() TO authenticated;
