# Setup Instructions for New Features

## ⚠️ IMPORTANT: Complete these steps before testing

### 1. Database Migration

Run the SQL migration in your Supabase SQL Editor:

```sql
-- File: migration-add-media-features.sql
-- This adds new columns to the wishes table

ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_path TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_path TEXT,
ADD COLUMN IF NOT EXISTS mentioned_personas TEXT[];

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_wishes_mentioned_personas ON wishes USING GIN (mentioned_personas);
CREATE INDEX IF NOT EXISTS idx_wishes_image_url ON wishes (image_url) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishes_audio_url ON wishes (audio_url) WHERE audio_url IS NOT NULL;
```

### 2. Create Storage Buckets

#### Bucket 1: wish-memes
**In Supabase Dashboard → Storage → Create Bucket:**
- Name: `wish-memes`
- Public: ✅ **Yes**
- File size limit: `5242880` (5MB)
- Allowed MIME types: `image/png, image/jpeg, image/gif, image/webp`

**Then create policies for wish-memes:**

```sql
-- Allow public read access
CREATE POLICY "Public read access for wish memes"
ON storage.objects FOR SELECT
USING (bucket_id = 'wish-memes');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload wish memes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wish-memes');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own wish memes"
ON storage.objects FOR DELETE
USING (bucket_id = 'wish-memes');
```

#### Bucket 2: wish-audio
**In Supabase Dashboard → Storage → Create Bucket:**
- Name: `wish-audio`
- Public: ✅ **Yes**
- File size limit: `10485760` (10MB)
- Allowed MIME types: `audio/mpeg, audio/wav, audio/webm, audio/ogg`

**Then create policies for wish-audio:**

```sql
-- Allow public read access
CREATE POLICY "Public read access for wish audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'wish-audio');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload wish audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wish-audio');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own wish audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'wish-audio');
```

### 3. Verify Setup

Run this query to verify the database migration:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wishes' 
  AND column_name IN ('image_url', 'image_path', 'audio_url', 'audio_path', 'mentioned_personas')
ORDER BY column_name;
```

Should return 5 rows showing the new columns.

### 4. Environment Variables Check

Make sure you have these in your `.env`:

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI APIs
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### 5. NPM Dependencies

Already installed:
- ✅ `fabric` - Canvas-based meme editor
- ✅ `@types/fabric` - TypeScript types

### 6. Test Checklist

Once Supabase is configured, test:

1. **Meme Editor**
   - [ ] Click "📷 Add Image" button
   - [ ] Upload an image
   - [ ] Add text with different fonts/colors
   - [ ] Download meme
   - [ ] Send to feed
   - [ ] Verify image appears in feed

2. **Voice Messages**
   - [ ] Click "🎤 Voice" button
   - [ ] Record audio (allow mic permission)
   - [ ] Preview recording
   - [ ] Send to feed
   - [ ] Verify audio player appears

3. **@Mention Tagging**
   - [ ] Type "@SantaMod69" in wish text
   - [ ] Send wish
   - [ ] Verify only Santa responds
   - [ ] Try multiple mentions
   - [ ] Try no mentions (should work normally)

4. **New Pages**
   - [ ] Visit /about - should load with platform info
   - [ ] Visit /how-it-works - should load with guide
   - [ ] Check navbar links work
   - [ ] Test mobile responsiveness

### 7. Known Limitations

- Voice message transcription currently happens client-side (implement server-side endpoint if needed)
- Image analysis uses Claude Vision API (costs ~$0.005 per image)
- @Mentions are case-insensitive and support aliases (e.g., @Frosty → snowman)
- Meme editor canvas is fixed at 800x600 (can be made responsive later)

### 8. Rollback Instructions

If anything breaks, rollback with:

```bash
git checkout main
git branch -D feature/meme-editor-voice-tagging
npm install
```

Then redeploy to Vercel.

### 9. Ready to Merge?

Once all tests pass:

```bash
git checkout main
git merge feature/meme-editor-voice-tagging
git push origin main
```

Vercel will auto-deploy the new features! 🚀
