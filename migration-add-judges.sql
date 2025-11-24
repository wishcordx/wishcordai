-- Migration: Add judge responses and final verdict columns
-- Run this in your Supabase SQL Editor

ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS judge_responses JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS final_verdict TEXT;

-- Update existing rows to have empty judge_responses
UPDATE wishes 
SET judge_responses = '{}'
WHERE judge_responses IS NULL;
