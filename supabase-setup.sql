-- WishAI Database Setup
-- Run this in your Supabase SQL Editor

-- Create wishes table
CREATE TABLE IF NOT EXISTS wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  wish_text TEXT NOT NULL,
  persona TEXT NOT NULL,
  ai_reply TEXT,
  judge_responses JSONB DEFAULT '{}',
  final_verdict TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishes_wallet_address ON wishes(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_persona ON wishes(persona);

-- Enable Row Level Security
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read wishes" ON wishes;
DROP POLICY IF EXISTS "Anyone can insert wishes" ON wishes;

-- Allow anyone to read wishes (public feed)
CREATE POLICY "Anyone can read wishes"
  ON wishes
  FOR SELECT
  USING (true);

-- Allow anyone to insert wishes (MVP - no auth required)
CREATE POLICY "Anyone can insert wishes"
  ON wishes
  FOR INSERT
  WITH CHECK (true);

-- Verify the table was created
SELECT COUNT(*) as total_wishes FROM wishes;
