-- Migration: Add ai_status to replies table for instant messaging with typing indicators
-- This enables replies to show immediately while AI responses generate in the background
-- Run this in Supabase SQL Editor

-- Add ai_status column to replies table
-- NULL = no AI response needed (regular user reply)
-- 'pending' = AI is generating response
-- 'completed' = AI response generated successfully
-- 'failed' = AI generation encountered an error
ALTER TABLE replies ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT NULL;

-- Create index for efficient querying of pending AI responses
CREATE INDEX IF NOT EXISTS idx_replies_ai_status ON replies (ai_status) WHERE ai_status IS NOT NULL;

-- Add column comment for documentation
COMMENT ON COLUMN replies.ai_status IS 'AI response status: NULL (no AI), pending (generating), completed, failed';

-- Update existing mod replies to mark them as completed
-- This assumes mod replies are AI-generated (can identify by specific mod usernames)
UPDATE replies 
SET ai_status = 'completed' 
WHERE username IN ('SantaMod69', 'xX_Krampus_Xx', 'elfgirluwu', 'FrostyTheCoder', 'DasherSpeedrun', 'SantaKumar', 'JingBells叮噹鈴')
  AND ai_status IS NULL;

-- Verification queries (optional - run these to check results):
-- SELECT ai_status, COUNT(*) FROM replies GROUP BY ai_status;
-- SELECT * FROM replies WHERE ai_status = 'pending' LIMIT 5;
