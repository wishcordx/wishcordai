-- Create members table for tracking connected users
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text NOT NULL DEFAULT 'Anonymous',
  avatar text NOT NULL DEFAULT '👤',
  last_active timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_wallet ON members(wallet_address);

-- Create index on last_active for sorting
CREATE INDEX IF NOT EXISTS idx_members_last_active ON members(last_active DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read members
CREATE POLICY "Enable read access for all users" ON members
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert/update their own member data
CREATE POLICY "Enable insert/update for all users" ON members
  FOR ALL
  USING (true)
  WITH CHECK (true);
