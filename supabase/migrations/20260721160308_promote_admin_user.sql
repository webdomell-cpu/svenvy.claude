/*
# Promote admin@scenvy.de to admin role

## Summary
Updates the `handle_new_user()` trigger so that the account `admin@scenvy.de`
is created with the `admin` role and no tenant (superadmin). All other signups
keep the default `tenant_owner` role with a new tenant.

## Changes
1. `handle_new_user()` — branches on the signup email:
   - `admin@scenvy.de` → admin role, no tenant, no tenant row.
   - everyone else → tenant_owner role + new tenant row (existing behaviour).
2. Backfill: any existing profile with `admin@scenvy.de` is promoted to admin.

## Security
No policy changes. The `admin` role is already honoured by the `tenants_admin`
RLS policy and the frontend `adminOnly` route guard.
*/

create or replace function handle_new_user()
returns trigger as $$
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
$$ language plpgsql security definer;

-- Backfill any existing admin@scenvy.de profile
update profiles set role = 'admin', tenant_id = null
where email = 'admin@scenvy.de' and role <> 'admin';
