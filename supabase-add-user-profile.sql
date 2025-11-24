-- Add username and avatar columns to wishes table
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS username text DEFAULT 'Anonymous';
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS avatar text DEFAULT '👤';
