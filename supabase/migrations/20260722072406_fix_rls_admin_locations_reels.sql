/*
# Fix RLS: add admin policies for locations + reels

## Problem
Admin users (role='admin', tenant_id=null) cannot insert/update locations
or reels because the `locations_tenant` and `reels_tenant` policies check
`tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())` —
admin's tenant_id is NULL, so the check always fails.

## Fix
Add admin-specific policies that allow admins full access to all locations
and reels. Also add explicit INSERT WITH CHECK on the tenant policies so
non-admin users can only insert rows matching their own tenant_id.
*/

-- Drop existing tenant policies (they're FOR ALL, need to split per verb)
drop policy if exists "locations_tenant" on locations;
drop policy if exists "reels_tenant" on reels;

-- Locations: tenant owners/members — per-verb policies
create policy "locations_select_own" on locations for select
  to authenticated using (tenant_id in (select tenant_id from profiles where id = auth.uid()));

create policy "locations_insert_own" on locations for insert
  to authenticated with check (tenant_id in (select tenant_id from profiles where id = auth.uid()));

create policy "locations_update_own" on locations for update
  to authenticated using (tenant_id in (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id in (select tenant_id from profiles where id = auth.uid()));

create policy "locations_delete_own" on locations for delete
  to authenticated using (tenant_id in (select tenant_id from profiles where id = auth.uid()));

-- Locations: admin full access
create policy "locations_admin_all" on locations for all
  to authenticated using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');

-- Reels: tenant owners/members — per-verb policies
create policy "reels_select_own" on reels for select
  to authenticated using (tenant_id in (select tenant_id from profiles where id = auth.uid()));

create policy "reels_insert_own" on reels for insert
  to authenticated with check (tenant_id in (select tenant_id from profiles where id = auth.uid()));

create policy "reels_update_own" on reels for update
  to authenticated using (tenant_id in (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id in (select tenant_id from profiles where id = auth.uid()));

create policy "reels_delete_own" on reels for delete
  to authenticated using (tenant_id in (select tenant_id from profiles where id = auth.uid()));

-- Reels: admin full access
create policy "reels_admin_all" on reels for all
  to authenticated using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');

-- Tenants: add INSERT/UPDATE/DELETE for admin (existing tenants_admin is FOR ALL)
-- The existing tenants_admin already covers all verbs, no change needed.
