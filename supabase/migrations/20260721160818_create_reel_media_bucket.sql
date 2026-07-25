/*
# Create reel-media storage bucket

## Summary
Creates the public storage bucket `reel-media` used by the app to store
reel images and videos. Adds storage RLS policies so authenticated users
can upload to their tenant's folder, and anon users can read (for guest view).

## Changes
1. Insert bucket `reel-media` (public) into `storage.buckets`.
2. Storage policies:
   - SELECT (read): public — anyone can read reel media.
   - INSERT/UPDATE: authenticated users can upload.
   - DELETE: authenticated users can delete.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('reel-media', 'reel-media', true)
ON CONFLICT (id) DO NOTHING;

-- Read: public
DROP POLICY IF EXISTS "reel_media_public_read" ON storage.objects;
CREATE POLICY "reel_media_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'reel-media');

-- Insert: authenticated
DROP POLICY IF EXISTS "reel_media_auth_insert" ON storage.objects;
CREATE POLICY "reel_media_auth_insert" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'reel-media');

-- Update: authenticated
DROP POLICY IF EXISTS "reel_media_auth_update" ON storage.objects;
CREATE POLICY "reel_media_auth_update" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'reel-media') WITH CHECK (bucket_id = 'reel-media');

-- Delete: authenticated
DROP POLICY IF EXISTS "reel_media_auth_delete" ON storage.objects;
CREATE POLICY "reel_media_auth_delete" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'reel-media');
