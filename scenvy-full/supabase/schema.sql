-- SCENVY Production Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── TENANTS ─────────────────────────────────────────────
create table if not exists tenants (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  plan        text not null default 'starter' check (plan in ('starter','pro','enterprise')),
  status      text not null default 'trial' check (status in ('trial','active','suspended')),
  settings    jsonb default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── PROFILES ────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  tenant_id   uuid references tenants on delete set null,
  full_name   text,
  email       text,
  role        text not null default 'tenant_owner' check (role in ('admin','superadmin','tenant_owner','tenant_member')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── LOCATIONS ───────────────────────────────────────────
create table if not exists locations (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants on delete cascade,
  name        text not null,
  city        text default 'Dubai',
  active      boolean default true,
  scans       integer default 0,
  wr          integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── REELS ───────────────────────────────────────────────
create table if not exists reels (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants on delete cascade,
  location_id uuid references locations on delete set null,
  title       text not null,
  type        text default 'offer' check (type in ('offer','event','menu','promo')),
  status      text default 'draft' check (status in ('draft','live','scheduled','archived')),
  color       text default '#7C3AED',
  emoji       text default '🎬',
  cta         text default 'Learn More',
  cta_url     text,
  cta_action  text default 'url',
  media_url   text,
  media_type  text default 'image',
  views       integer default 0,
  ctr         numeric(5,2) default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── SCAN EVENTS ─────────────────────────────────────────
create table if not exists scan_events (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid references tenants on delete cascade,
  location_id uuid references locations on delete set null,
  reel_id     uuid references reels on delete set null,
  user_agent  text,
  created_at  timestamptz default now()
);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists tenants_updated_at on tenants;
create trigger tenants_updated_at   before update on tenants   for each row execute function update_updated_at();

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at  before update on profiles  for each row execute function update_updated_at();

drop trigger if exists locations_updated_at on locations;
create trigger locations_updated_at before update on locations for each row execute function update_updated_at();

drop trigger if exists reels_updated_at on reels;
create trigger reels_updated_at     before update on reels     for each row execute function update_updated_at();

-- ─── AUTO CREATE PROFILE ON SIGNUP ──────────────────────
create or replace function handle_new_user()
returns trigger as $$
declare
  new_tenant_id uuid;
begin
  -- Create a new tenant for the user
  insert into tenants (name, plan, status)
  values (
    coalesce(new.raw_user_meta_data->>'venue_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'starter',
    'trial'
  )
  returning id into new_tenant_id;

  -- Create profile linked to tenant (default role is tenant_owner)
  insert into profiles (id, tenant_id, full_name, email, role)
  values (
    new.id,
    new_tenant_id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    'tenant_owner'
  );

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────
-- Disable RLS temporarily
alter table profiles disable row level security;
alter table tenants disable row level security;
alter table locations disable row level security;
alter table reels disable row level security;
alter table scan_events disable row level security;

-- Drop all old policies
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_select_admin" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "tenants_select_own" on tenants;
drop policy if exists "tenants_select_admin" on tenants;
drop policy if exists "locations_select_tenant" on locations;
drop policy if exists "locations_select_admin" on locations;
drop policy if exists "locations_select_public" on locations;
drop policy if exists "reels_select_tenant" on reels;
drop policy if exists "reels_select_admin" on reels;
drop policy if exists "reels_select_public" on reels;
drop policy if exists "scan_events_insert_public" on scan_events;
drop policy if exists "scan_events_select_tenant" on scan_events;
drop policy if exists "scan_events_select_admin" on scan_events;
drop policy if exists "tenants_own" on tenants;
drop policy if exists "tenants_admin" on tenants;
drop policy if exists "profiles_own" on profiles;
drop policy if exists "profiles_admin" on profiles;
drop policy if exists "locations_tenant" on locations;
drop policy if exists "locations_admin" on locations;
drop policy if exists "locations_public_read" on locations;
drop policy if exists "reels_tenant" on reels;
drop policy if exists "reels_admin" on reels;
drop policy if exists "reels_public_live" on reels;
drop policy if exists "scan_events_insert" on scan_events;
drop policy if exists "scan_events_tenant" on scan_events;

-- Drop helper functions if they exist
drop function if exists get_user_role(uuid);

-- Create helper function to get user role
create or replace function get_user_role(user_id uuid)
returns text as $$
  select role from profiles where id = user_id
$$ language sql stable;

-- Enable RLS
alter table tenants    enable row level security;
alter table profiles   enable row level security;
alter table locations  enable row level security;
alter table reels      enable row level security;
alter table scan_events enable row level security;

-- ─── PROFILES POLICIES ────────────────────────────────────
-- Users can always read their own profile
create policy "profiles_select_own" on profiles for select
  using (id = auth.uid());

-- Anyone with admin role can read all profiles
create policy "profiles_select_admin" on profiles for select
  using (role in ('admin', 'superadmin'));

-- Users can update their own profile
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- ─── TENANTS POLICIES ─────────────────────────────────────
-- Users can read tenants they belong to
create policy "tenants_select_own" on tenants for select
  using (id in (
    select tenant_id from profiles where id = auth.uid() and tenant_id is not null
  ));

-- Admins/superadmins can read all tenants
create policy "tenants_select_admin" on tenants for select
  using (
    (select role from profiles where id = auth.uid()) in ('admin', 'superadmin')
  );

-- ─── LOCATIONS POLICIES ───────────────────────────────────
-- Tenant members see their locations
create policy "locations_select_tenant" on locations for select
  using (tenant_id in (
    select tenant_id from profiles where id = auth.uid() and tenant_id is not null
  ));

-- Admins/superadmins see all locations
create policy "locations_select_admin" on locations for select
  using (
    (select role from profiles where id = auth.uid()) in ('admin', 'superadmin')
  );

-- Public (anonymous) can see active locations
create policy "locations_select_public" on locations for select
  using (active = true and auth.role() = 'anon');

-- ─── REELS POLICIES ───────────────────────────────────────
-- Tenant members see their reels
create policy "reels_select_tenant" on reels for select
  using (tenant_id in (
    select tenant_id from profiles where id = auth.uid() and tenant_id is not null
  ));

-- Admins/superadmins see all reels
create policy "reels_select_admin" on reels for select
  using (
    (select role from profiles where id = auth.uid()) in ('admin', 'superadmin')
  );

-- Public (anonymous) can see live reels
create policy "reels_select_public" on reels for select
  using (status = 'live' and auth.role() = 'anon');

-- ─── SCAN EVENTS POLICIES ─────────────────────────────────
-- Anyone can insert scan events (for guest tracking)
create policy "scan_events_insert_public" on scan_events for insert
  with check (true);

-- Tenant members can read their scan events
create policy "scan_events_select_tenant" on scan_events for select
  using (tenant_id in (
    select tenant_id from profiles where id = auth.uid() and tenant_id is not null
  ));

-- Admins/superadmins can read all scan events
create policy "scan_events_select_admin" on scan_events for select
  using (
    (select role from profiles where id = auth.uid()) in ('admin', 'superadmin')
  );

-- ─── ADMIN VIEW: tenants with counts ─────────────────────
drop view if exists tenants_with_counts;
create view tenants_with_counts as
select
  t.*,
  count(distinct l.id) as locations_count,
  count(distinct r.id) as reels_count
from tenants t
left join locations l on l.tenant_id = t.id
left join reels r on r.tenant_id = t.id
group by t.id;

-- Grant access to view
grant select on tenants_with_counts to authenticated;
