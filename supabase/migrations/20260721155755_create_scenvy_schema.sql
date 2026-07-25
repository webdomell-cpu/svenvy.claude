/*
# Create SCENVY core schema

## Summary
Creates the full multi-tenant schema for the SCENVY venue-marketing platform:
tenants, profiles (linked to auth.users), locations, reels, and scan_events.

## New Tables
1. `tenants` — organizations (starter/pro/enterprise plan)
2. `profiles` — user profiles linked to auth.users, with role + tenant_id
3. `locations` — physical venues belonging to a tenant
4. `reels` — TikTok-style content items attached to a location
5. `scan_events` — analytics events recorded when a guest scans a QR code

## Security (RLS)
- `tenants`: owner (via profiles.tenant_id) OR admin role can access.
- `profiles`: users can read/update only their own row.
- `locations`: tenant members get full CRUD; anon can SELECT active locations (guest view).
- `reels`: tenant members get full CRUD; anon can SELECT live reels (guest view).
- `scan_events`: anon can INSERT (guest scans); tenant members can SELECT their tenant's events.

## Triggers / Functions
- `update_updated_at()` — bumps updated_at on row update (tenants, profiles, locations, reels).
- `handle_new_user()` — on signup, creates a tenant + profile for the new user.

## Important Notes
1. Email confirmation stays OFF (Supabase default for this project).
2. Owner columns default to auth.uid() where applicable.
3. Public read policies use `active = true` / `status = 'live'` so guests (anon) can view content without signing in.
*/

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
  role        text not null default 'tenant_owner' check (role in ('admin','tenant_owner','tenant_member')),
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

drop trigger if exists tenants_updated_at   on tenants;
drop trigger if exists profiles_updated_at  on profiles;
drop trigger if exists locations_updated_at on locations;
drop trigger if exists reels_updated_at     on reels;
create trigger tenants_updated_at   before update on tenants   for each row execute function update_updated_at();
create trigger profiles_updated_at  before update on profiles  for each row execute function update_updated_at();
create trigger locations_updated_at before update on locations for each row execute function update_updated_at();
create trigger reels_updated_at     before update on reels     for each row execute function update_updated_at();

-- ─── AUTO CREATE PROFILE ON SIGNUP ──────────────────────
create or replace function handle_new_user()
returns trigger as $$
declare
  new_tenant_id uuid;
begin
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

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────
alter table tenants     enable row level security;
alter table profiles    enable row level security;
alter table locations   enable row level security;
alter table reels       enable row level security;
alter table scan_events enable row level security;

-- Tenants: owner (via profiles) OR admin OR insert new tenant
drop policy if exists "tenants_own"        on tenants;
drop policy if exists "tenants_own_select" on tenants;
drop policy if exists "tenants_own_update" on tenants;
drop policy if exists "tenants_own_delete" on tenants;
drop policy if exists "tenants_insert"     on tenants;
drop policy if exists "tenants_admin"      on tenants;

create policy "tenants_own_select" on tenants for select
  to authenticated
  using (id in (select tenant_id from profiles where id = auth.uid()));

create policy "tenants_own_update" on tenants for update
  to authenticated
  using (id in (select tenant_id from profiles where id = auth.uid()))
  with check (id in (select tenant_id from profiles where id = auth.uid()));

create policy "tenants_own_delete" on tenants for delete
  to authenticated
  using (id in (select tenant_id from profiles where id = auth.uid()));

create policy "tenants_insert" on tenants for insert
  to authenticated
  with check (true);

create policy "tenants_admin" on tenants for all
  to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin')
  with check ((select role from profiles where id = auth.uid()) = 'admin');

-- Profiles: users see own profile
drop policy if exists "profiles_own" on profiles;
create policy "profiles_own" on profiles for all
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Locations: tenant members full CRUD; anon SELECT active
drop policy if exists "locations_tenant"       on locations;
drop policy if exists "locations_public_read"  on locations;
create policy "locations_tenant" on locations for all
  to authenticated
  using (tenant_id in (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id in (select tenant_id from profiles where id = auth.uid()));
create policy "locations_public_read" on locations for select
  to anon, authenticated
  using (active = true);

-- Reels: tenant members full CRUD; anon SELECT live
drop policy if exists "reels_tenant"      on reels;
drop policy if exists "reels_public_live" on reels;
create policy "reels_tenant" on reels for all
  to authenticated
  using (tenant_id in (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id in (select tenant_id from profiles where id = auth.uid()));
create policy "reels_public_live" on reels for select
  to anon, authenticated
  using (status = 'live');

-- Scan events: anon INSERT (guest scans); tenant SELECT
drop policy if exists "scan_events_insert" on scan_events;
drop policy if exists "scan_events_tenant" on scan_events;
create policy "scan_events_insert" on scan_events for insert
  to anon, authenticated
  with check (true);
create policy "scan_events_tenant" on scan_events for select
  to authenticated
  using (tenant_id in (select tenant_id from profiles where id = auth.uid()));

-- ─── ADMIN VIEW: tenants with counts ─────────────────────
create or replace view tenants_with_counts as
select
  t.*,
  count(distinct l.id) as locations_count,
  count(distinct r.id) as reels_count
from tenants t
left join locations l on l.tenant_id = t.id
left join reels r on r.tenant_id = t.id
group by t.id;

grant select on tenants_with_counts to authenticated;
