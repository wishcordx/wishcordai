-- Add AI audio response fields to wishes table
-- This allows mods to respond with voice messages

ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS ai_audio_url TEXT,
ADD COLUMN IF NOT EXISTS ai_audio_path TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wishes_ai_audio_url ON wishes (ai_audio_url) WHERE ai_audio_url IS NOT NULL;

COMMENT ON COLUMN wishes.ai_audio_url IS 'Public URL of the AI mod voice response';
COMMENT ON COLUMN wishes.ai_audio_path IS 'Storage path of the AI mod voice response';
