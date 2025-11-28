-- Create support_messages table for community support and feedback
CREATE TABLE IF NOT EXISTS public.support_messages (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  avatar TEXT,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read support messages
CREATE POLICY "Allow public read access"
  ON public.support_messages
  FOR SELECT
  USING (true);

-- Allow anyone to insert support messages
CREATE POLICY "Allow public insert access"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS support_messages_created_at_idx 
  ON public.support_messages(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER support_messages_updated_at
  BEFORE UPDATE ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
