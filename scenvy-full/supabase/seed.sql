-- SCENVY Seed Data — Test Tenant + Demo Content
-- Run this AFTER schema.sql
-- Replace 'YOUR-ADMIN-USER-ID' and 'YOUR-SUPERADMIN-USER-ID' with actual Supabase user IDs

-- ─── How to create Admin and Superadmin users ──────────────
-- 1. Go to Supabase → Authentication → Users
-- 2. Create a new user (or find existing user ID)
-- 3. Copy the user ID and run one of these commands:

-- FOR ADMIN USER (can manage all tenants):
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-ADMIN-USER-ID';

-- FOR SUPERADMIN USER (full platform access):
-- UPDATE profiles SET role = 'superadmin' WHERE id = 'YOUR-SUPERADMIN-USER-ID';

-- ─── Example: Make first registered user an admin ──────────────
-- SELECT id, email, role FROM profiles ORDER BY created_at LIMIT 1;
-- Then update with: UPDATE profiles SET role = 'admin' WHERE id = '<copied-id>';

-- ─── Create Test Tenant ───────────────────────────────────
insert into tenants (id, name, plan, status) values
  ('00000000-0000-0000-0000-000000000001', 'The Marina Group', 'pro', 'active')
on conflict (id) do nothing;

-- ─── Test Locations ───────────────────────────────────────
insert into locations (id, tenant_id, name, city, active, scans, wr) values
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Marina Walk', 'Dubai Marina', true, 1247, 94),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'JBR Terrace', 'JBR Beach', true, 893, 78),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'DIFC Branch', 'DIFC', true, 614, 88)
on conflict (id) do nothing;

-- ─── Test Reels ───────────────────────────────────────────
insert into reels (tenant_id, location_id, title, type, status, color, emoji, cta, cta_url, cta_action, views, ctr) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'Happy Hour Special', 'offer', 'live', '#7C3AED', '🍹', 'Order Now', 'https://order.example.com', 'url', 3241, 87.3),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'Weekend Brunch', 'event', 'live', '#FF2D8D', '🥂', 'Reserve', 'https://reserve.example.com', 'reserve', 2108, 76.5),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'Chef''s Special', 'menu', 'live', '#00D4FF', '🍽️', 'View Menu', 'https://menu.example.com', 'menu', 1872, 91.2),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'Sunset Cocktails', 'offer', 'live', '#7C3AED', '🌅', 'Book Now', 'https://book.example.com', 'reserve', 4156, 82.1),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'Ladies Night', 'event', 'scheduled', '#FF9500', '✨', 'RSVP', '', 'url', 0, 0);

-- ─── Link test tenant to your profile (optional) ──────────────
-- To make yourself a tenant member of The Marina Group for testing:
-- UPDATE profiles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE id = 'YOUR-USER-ID';
