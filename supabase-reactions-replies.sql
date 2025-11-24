-- Create reactions table for emoji reactions on wishes
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id uuid NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(wish_id, wallet_address, emoji)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reactions_wish ON reactions(wish_id);
CREATE INDEX IF NOT EXISTS idx_reactions_wallet ON reactions(wallet_address);

-- Create replies table for threaded conversations
CREATE TABLE IF NOT EXISTS replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id uuid NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  username text NOT NULL DEFAULT 'Anonymous',
  avatar text NOT NULL DEFAULT '👤',
  reply_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_replies_wish ON replies(wish_id);
CREATE INDEX IF NOT EXISTS idx_replies_created ON replies(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Create policies for reactions
CREATE POLICY "Enable read access for all users on reactions" ON reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert/delete for all users on reactions" ON reactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for replies
CREATE POLICY "Enable read access for all users on replies" ON replies
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users on replies" ON replies
  FOR INSERT
  WITH CHECK (true);
