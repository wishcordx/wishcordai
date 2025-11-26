# Voice Response Setup Guide 🎙️

## What's New
Mods now respond with **VOICE** when you send them a voice message with @mention!

### How It Works:
1. Record a voice message: "Hey @JingBells叮噹鈴 My voice cool?"
2. The message gets transcribed
3. The mentioned mod generates a text response
4. The mod's response is converted to voice using ElevenLabs TTS
5. Both text AND voice response are displayed in the feed

---

## ⚠️ REQUIRED: Database Migration

You need to add two new columns to your `wishes` table:

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click **SQL Editor** → **New query**

### Step 2: Run the Migration
Copy and paste this SQL:

```sql
-- Add AI audio response fields to wishes table
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS ai_audio_url TEXT,
ADD COLUMN IF NOT EXISTS ai_audio_path TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wishes_ai_audio_url ON wishes (ai_audio_url) WHERE ai_audio_url IS NOT NULL;

COMMENT ON COLUMN wishes.ai_audio_url IS 'Public URL of the AI mod voice response';
COMMENT ON COLUMN wishes.ai_audio_path IS 'Storage path of the AI mod voice response';
```

Or just run the file: `migration-add-ai-audio.sql`

### Step 3: Verify
Run this query to check:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wishes' 
  AND column_name IN ('ai_audio_url', 'ai_audio_path')
ORDER BY column_name;
```

Should return 2 rows.

---

## Environment Variables

Make sure you have ElevenLabs API key in your `.env.local`:

```env
ELEVENLABS_API_KEY=your-key-here

# Optional: Custom voice IDs for each mod
ELEVENLABS_SANTA_VOICE_ID=...
ELEVENLABS_KRAMPUS_VOICE_ID=...
ELEVENLABS_ELF_VOICE_ID=...
ELEVENLABS_FROSTY_VOICE_ID=...
ELEVENLABS_DASHER_VOICE_ID=...
ELEVENLABS_SCAMMER_VOICE_ID=...
ELEVENLABS_JINGBELLS_VOICE_ID=...
```

Get your API key from: https://elevenlabs.io/

---

## Testing

1. Go to your app
2. Record a voice message mentioning a mod: "@SantaMod69 I want a new laptop"
3. Submit the message
4. The mod should respond with:
   - ✅ Text response (shown as usual)
   - ✅ Audio player with voice response

---

## Cost Notes

- Each voice response costs ~$0.02-0.05 depending on length
- Uses ElevenLabs Turbo v2.5 model (fastest + cheapest)
- Free tier: 10,000 characters/month
- Upgrade plans available at https://elevenlabs.io/pricing

---

## Troubleshooting

**No voice response?**
- Check that `ELEVENLABS_API_KEY` is set
- Check Vercel logs for errors
- Verify the migration was run successfully

**Audio won't play?**
- Check browser console for errors
- Verify the audio URL is accessible
- Check Supabase Storage bucket `wish-audio` is public

**Voice sounds wrong?**
- Set custom voice IDs in `.env.local`
- Use ElevenLabs Voice Lab to create custom voices
