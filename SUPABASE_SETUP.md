# Supabase Database Setup

This guide will help you set up the Supabase database for WishAI.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in your project details:
   - **Name**: WishAI (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to your users
5. Click "Create new project"

## Step 2: Get Your API Keys

Once your project is created:

1. Go to **Settings** → **API**
2. You'll need these values for your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Paste the following SQL and click "Run":

```sql
-- Create wishes table
CREATE TABLE wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  wish_text TEXT NOT NULL,
  persona TEXT NOT NULL,
  ai_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet_address for faster queries
CREATE INDEX idx_wishes_wallet_address ON wishes(wallet_address);

-- Create index on created_at for faster sorting
CREATE INDEX idx_wishes_created_at ON wishes(created_at DESC);

-- Create index on persona for filtering
CREATE INDEX idx_wishes_persona ON wishes(persona);

-- Enable Row Level Security (RLS)
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read wishes
CREATE POLICY "Anyone can read wishes"
  ON wishes
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert wishes
-- (In production, you might want to restrict this)
CREATE POLICY "Anyone can insert wishes"
  ON wishes
  FOR INSERT
  WITH CHECK (true);
```

## Step 4: Verify the Table

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a table called `wishes` with the following columns:
   - `id` (uuid)
   - `wallet_address` (text)
   - `wish_text` (text)
   - `persona` (text)
   - `ai_reply` (text)
   - `created_at` (timestamptz)

## Step 5: Configure Environment Variables

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Optional: Test the Setup

You can test the database by inserting a sample wish directly in the SQL Editor:

```sql
INSERT INTO wishes (wallet_address, wish_text, persona, ai_reply)
VALUES (
  'TestUser123',
  'I wish for a white Christmas!',
  'santa',
  'Ho ho ho! What a wonderful wish! I''ll do my best to make it snow on Christmas Day!'
);
```

Then query to verify:

```sql
SELECT * FROM wishes ORDER BY created_at DESC LIMIT 10;
```

## Security Notes

### Row Level Security (RLS)

The table has RLS enabled with policies that allow:
- **Read**: Anyone can read wishes (public feed)
- **Insert**: Anyone can insert wishes (no auth required for MVP)

### Production Considerations

For a production app, you should consider:

1. **Rate Limiting**: Implement rate limiting to prevent spam
2. **Authentication**: Require wallet signature or other auth for submitting wishes
3. **Moderation**: Add content moderation to filter inappropriate wishes
4. **Update/Delete Policies**: Add policies if you want users to edit/delete their wishes

### Example: Restricting Updates

If you want only the wish creator to update their wishes:

```sql
CREATE POLICY "Users can update their own wishes"
  ON wishes
  FOR UPDATE
  USING (auth.uid()::text = wallet_address)
  WITH CHECK (auth.uid()::text = wallet_address);
```

## Database Schema

```
┌─────────────────────────────────────┐
│           wishes                    │
├─────────────────────────────────────┤
│ id              UUID (PK)           │
│ wallet_address  TEXT                │
│ wish_text       TEXT                │
│ persona         TEXT                │
│ ai_reply        TEXT (nullable)     │
│ created_at      TIMESTAMPTZ         │
└─────────────────────────────────────┘

Indexes:
- PRIMARY KEY on id
- idx_wishes_wallet_address on wallet_address
- idx_wishes_created_at on created_at DESC
- idx_wishes_persona on persona
```

## Troubleshooting

### Connection Issues

If you can't connect to Supabase:
1. Verify your API keys are correct
2. Check that your project is active (not paused)
3. Ensure you've added the keys to `.env.local`
4. Restart your Next.js dev server after changing `.env.local`

### Policy Errors

If you get RLS policy errors:
1. Make sure you've run all the SQL commands
2. Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'wishes';`
3. You can temporarily disable RLS for testing: `ALTER TABLE wishes DISABLE ROW LEVEL SECURITY;`

### Performance Issues

If queries are slow:
1. Verify indexes were created successfully
2. Check your Supabase plan limits
3. Consider upgrading if you have high traffic

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
