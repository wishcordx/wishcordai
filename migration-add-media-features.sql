-- Migration: Add media and tagging features to wishes table
-- Date: 2025-11-25
-- Features: Image uploads, audio messages, @mention tagging

-- Add new columns to wishes table
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_path TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_path TEXT,
ADD COLUMN IF NOT EXISTS mentioned_personas TEXT[];

-- Add index for mentioned_personas for faster queries
CREATE INDEX IF NOT EXISTS idx_wishes_mentioned_personas ON wishes USING GIN (mentioned_personas);

-- Add index for media queries
CREATE INDEX IF NOT EXISTS idx_wishes_image_url ON wishes (image_url) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishes_audio_url ON wishes (audio_url) WHERE audio_url IS NOT NULL;

-- Create storage bucket for wish memes (run this in Supabase dashboard Storage section)
-- Bucket name: wish-memes
-- Public: true
-- File size limit: 5MB
-- Allowed mime types: image/png, image/jpeg, image/gif, image/webp

-- Create storage bucket for voice messages (run this in Supabase dashboard Storage section)
-- Bucket name: wish-audio
-- Public: true
-- File size limit: 10MB
-- Allowed mime types: audio/mpeg, audio/wav, audio/webm, audio/ogg

-- Storage policies for wish-memes bucket
-- Note: Execute these in Supabase Dashboard > Storage > wish-memes > Policies

-- Policy: Allow public read access
-- CREATE POLICY "Public read access for wish memes"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'wish-memes');

-- Policy: Allow authenticated users to upload
-- CREATE POLICY "Authenticated users can upload wish memes"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'wish-memes' AND auth.role() = 'authenticated');

-- Policy: Allow users to delete their own uploads
-- CREATE POLICY "Users can delete their own wish memes"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'wish-memes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for wish-audio bucket
-- Policy: Allow public read access
-- CREATE POLICY "Public read access for wish audio"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'wish-audio');

-- Policy: Allow authenticated users to upload
-- CREATE POLICY "Authenticated users can upload wish audio"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'wish-audio' AND auth.role() = 'authenticated');

-- Policy: Allow users to delete their own uploads
-- CREATE POLICY "Users can delete their own wish audio"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'wish-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wishes' 
  AND column_name IN ('image_url', 'image_path', 'audio_url', 'audio_path', 'mentioned_personas')
ORDER BY column_name;
