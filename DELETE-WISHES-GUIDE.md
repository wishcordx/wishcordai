# 🗑️ Easy Wish Deletion Guide

## Setup (One-time):

### Run the CASCADE DELETE Migration:

1. Go to **Supabase Dashboard** → SQL Editor
2. Click **"+ New query"**
3. Copy everything from `migration-cascade-delete.sql`
4. **Run** the query
5. You should see: `Success. No rows returned`

### Verify it worked:
Run this query:
```sql
SELECT 
  tc.table_name, 
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('replies', 'reactions');
```

You should see `delete_rule = CASCADE` for both tables ✅

---

## How to Delete Wishes (After Migration):

### Method 1: Delete Single Wish in Table Editor

1. Go to **Table Editor** → `wishes` table
2. Find the wish you want to delete
3. Check the checkbox next to it
4. Click **"Delete 1 row"** at the top
5. ✅ **Done!** The wish + all its replies + all its reactions are automatically deleted

### Method 2: Delete Multiple Wishes

1. Go to **Table Editor** → `wishes` table
2. Check multiple wish checkboxes
3. Click **"Delete X rows"**
4. ✅ **Done!** All selected wishes and their related data are deleted

### Method 3: Delete by SQL (More Powerful)

```sql
-- Delete a specific wish by ID
DELETE FROM wishes WHERE id = 'your-wish-id-here';

-- Delete all wishes from a specific user
DELETE FROM wishes WHERE username = 'BadUser123';

-- Delete all wishes with specific text
DELETE FROM wishes WHERE wish_text ILIKE '%spam%';

-- Delete old wishes (older than 30 days)
DELETE FROM wishes WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete all test wishes
DELETE FROM wishes WHERE wish_text = 'Test';
```

---

## What Gets Deleted When You Delete a Wish:

✅ The wish itself (from `wishes` table)  
✅ All replies to that wish (from `replies` table)  
✅ All reactions to that wish (from `reactions` table)  
✅ AI responses (included in wish data)  
✅ Images/audio references (database records - you may need to clean up storage separately)

---

## Important Notes:

⚠️ **Deletion is PERMANENT** - there's no undo button!  
⚠️ **Storage files** (images/audio) may remain in Supabase Storage - delete those separately if needed  
✅ **Safe to delete** - no orphaned data will remain  
✅ **Fast** - CASCADE happens automatically at database level

---

## Need to Delete Storage Files Too?

If you want to also delete images/audio from storage:

```sql
-- First, get the storage paths before deleting
SELECT id, image_path, audio_path, ai_audio_path 
FROM wishes 
WHERE id = 'your-wish-id';

-- Then delete from storage buckets manually in Supabase Storage section
-- Finally delete the wish (which cascades to replies/reactions)
DELETE FROM wishes WHERE id = 'your-wish-id';
```

---

**Ready to clean up your database! 🧹**
