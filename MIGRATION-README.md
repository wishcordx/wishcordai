# Database Migration Instructions

## You need to run this SQL in your Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the SQL from `migration-add-judges.sql`
6. Click "Run"

The migration will add two new columns:
- `judge_responses` (JSONB) - Stores all 5 judge responses
- `final_verdict` (TEXT) - Stores the calculated consensus verdict

After running this, the Christmas Court will work with all 5 judges!
