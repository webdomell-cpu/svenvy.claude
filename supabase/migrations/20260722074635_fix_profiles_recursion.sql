-- Fix infinite recursion on profiles: profiles_select references profiles itself
-- Solution: profiles_select only allows reading your own profile (id = auth.uid())
-- Admin check is NOT needed on profiles — admin reads tenants/locations/reels, not profiles

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

-- PROFILES: only self-access, no admin check (avoids recursion)
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  TO authenticated USING (id = auth.uid());
