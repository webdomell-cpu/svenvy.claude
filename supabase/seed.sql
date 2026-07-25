-- SCENVY Seed Data — Test Tenant + Demo Content
-- Run this AFTER schema.sql
-- Replace 'YOUR-ADMIN-USER-ID' with your actual Supabase user ID

-- ─── Update your user to admin role ──────────────────────
-- Run this after you find your user ID in Supabase → Authentication → Users:
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-ADMIN-USER-ID';

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
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'Happy Hour Special', 'offer', 'live', '#7C3AED', '🍹', 'Order Now', 'https://order.example.com', 'url', 3241, 18.4),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'Weekend Brunch', 'event', 'live', '#FF2D8D', '🥂', 'Reserve', 'https://reserve.example.com', 'reserve', 2108, 24.1),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'Chef''s Special', 'menu', 'live', '#00D4FF', '🍽️', 'View Menu', 'https://menu.example.com', 'menu', 1872, 15.7),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'Sunset Cocktails', 'offer', 'live', '#7C3AED', '🌅', 'Book Now', 'https://book.example.com', 'reserve', 4156, 31.2),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'Ladies Night', 'event', 'scheduled', '#FF9500', '✨', 'RSVP', '', 'url', 0, 0);

-- ─── Link test tenant to your profile ─────────────────────
-- To make yourself a tenant member of The Marina Group (optional, for testing):
-- UPDATE profiles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE id = 'YOUR-USER-ID';
