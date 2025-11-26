# Database Migration Required

## IMPORTANT: Run this in Supabase SQL Editor

Before testing the new instant message feature, you need to add the `ai_status` column to the wishes table:

```sql
-- Add AI status field to track AI response generation state
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT NULL;

-- Add index for filtering wishes by AI status
CREATE INDEX IF NOT EXISTS idx_wishes_ai_status ON wishes (ai_status) WHERE ai_status IS NOT NULL;

COMMENT ON COLUMN wishes.ai_status IS 'AI response status: NULL (no AI), pending (generating), completed, failed';

-- Update existing wishes with completed status where AI reply exists
UPDATE wishes SET ai_status = 'completed' WHERE ai_reply IS NOT NULL AND ai_status IS NULL;
```

## Steps:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL above
4. Click "Run"
5. Verify: `SELECT ai_status, COUNT(*) FROM wishes GROUP BY ai_status;`

## What's Next:
After running the migration, the app will:
- ✅ Show user messages instantly
- ✅ Display "Mod is typing..." indicator
- ✅ Poll for AI response every 2 seconds
- ✅ Update with AI reply when ready

## Still TODO:
- Apply same pattern to replies with @mentions
- Test voice messages with instant display
- Test error handling
