-- Add AI status field to track AI response generation state
-- This helps differentiate between "no AI needed" vs "waiting for AI" vs "completed"

ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT NULL;

-- Add index for filtering wishes by AI status
CREATE INDEX IF NOT EXISTS idx_wishes_ai_status ON wishes (ai_status) WHERE ai_status IS NOT NULL;

COMMENT ON COLUMN wishes.ai_status IS 'AI response status: NULL (no AI), pending (generating), completed, failed';

-- Update existing wishes with completed status where AI reply exists
UPDATE wishes SET ai_status = 'completed' WHERE ai_reply IS NOT NULL AND ai_status IS NULL;
