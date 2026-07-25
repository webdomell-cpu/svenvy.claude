/*
# Fix handle_new_user: bypass RLS during signup

## Summary
The `handle_new_user()` trigger inserts into `tenants` and `profiles` during
signup. Because the brand-new user has no profile row yet, the `tenants_own`
RLS policy (which checks `profiles.tenant_id = auth.uid()`) blocks the tenant
INSERT, so the trigger fails and signup aborts.

## Fix
Recreate `handle_new_user()` as `SECURITY DEFINER` with `SET search_path` and
explicitly bypass RLS by running the inserts as the function owner (postgres).
`SECURITY DEFINER` functions execute with the privileges of the function
owner, and the owner bypasses RLS — so the tenant + profile inserts succeed
even though the caller has no profile yet.

## Changes
1. Recreate `handle_new_user()` with `SECURITY DEFINER` + `SET search_path = public`.
   (Already SECURITY DEFINER, but re-assert with explicit search_path for safety.)
2. No schema/policy changes — the existing RLS policies are correct for normal
   app usage; only the signup trigger needed to bypass them.
*/

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  if new.email = 'admin@scenvy.de' then
    insert into profiles (id, tenant_id, full_name, email, role)
    values (new.id, null, 'Superadmin', new.email, 'admin');
  else
    insert into tenants (name, plan, status)
    values (
      coalesce(new.raw_user_meta_data->>'venue_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
      'starter',
      'trial'
    )
    returning id into new_tenant_id;

    insert into profiles (id, tenant_id, full_name, email, role)
    values (
      new.id,
      new_tenant_id,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
      new.email,
      'tenant_owner'
    );
  end if;

  return new;
end;
$$;
