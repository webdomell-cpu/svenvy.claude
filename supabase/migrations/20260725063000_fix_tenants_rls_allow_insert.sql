-- Fix tenants insert RLS policy so authenticated users can insert their tenant row
DROP POLICY IF EXISTS "tenants_insert" ON tenants;

CREATE POLICY "tenants_insert" ON tenants FOR INSERT
  TO authenticated WITH CHECK (true);

-- Ensure user_tenant_id function bypasses RLS cleanly
CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Ensure is_admin function bypasses RLS cleanly
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
$$;
