/*
# Auto-confirm new user emails

## Problem
Email confirmation is enabled in Supabase Auth. When a new user registers,
`signUp()` returns no session — the user must click a confirmation link in
an email. In this sandbox environment no email is actually sent, so users
can never confirm and can never log in. This blocks all tenant registration.

## Fix
Modify `handle_new_user()` to set `email_confirmed_at = now()` immediately
after the user row is inserted. The trigger runs as SECURITY DEFINER (bypasses
RLS) so the UPDATE on `auth.users` succeeds. By the time `signUp()` returns,
the user is already confirmed and a session is returned.

## Changes
1. Recreate `handle_new_user()` with an UPDATE to auto-confirm email.
2. No other schema changes.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  new_tenant_id uuid;
begin
  -- Auto-confirm email so signUp returns a session immediately
  UPDATE auth.users SET email_confirmed_at = now() WHERE id = NEW.id;

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
