-- Migration: Add CASCADE DELETE to wish-related tables
-- This allows you to delete a wish and automatically delete all related data:
-- - All replies to that wish
-- - All reactions to that wish
-- Run this in Supabase SQL Editor

-- ==========================================
-- Step 1: Drop existing foreign key constraints
-- ==========================================

-- Drop the wish_id foreign key on replies table
ALTER TABLE replies 
DROP CONSTRAINT IF EXISTS replies_wish_id_fkey;

-- Drop the wish_id foreign key on reactions table
ALTER TABLE reactions 
DROP CONSTRAINT IF EXISTS reactions_wish_id_fkey;

-- ==========================================
-- Step 2: Add new foreign keys WITH CASCADE DELETE
-- ==========================================

-- Add CASCADE DELETE to replies
-- When a wish is deleted, all its replies are automatically deleted
ALTER TABLE replies
ADD CONSTRAINT replies_wish_id_fkey 
FOREIGN KEY (wish_id) 
REFERENCES wishes(id) 
ON DELETE CASCADE;

-- Add CASCADE DELETE to reactions
-- When a wish is deleted, all its reactions are automatically deleted
ALTER TABLE reactions
ADD CONSTRAINT reactions_wish_id_fkey 
FOREIGN KEY (wish_id) 
REFERENCES wishes(id) 
ON DELETE CASCADE;

-- ==========================================
-- Verification (run this after migration)
-- ==========================================
-- SELECT 
--   tc.constraint_name, 
--   tc.table_name, 
--   kcu.column_name, 
--   rc.delete_rule
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu 
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.referential_constraints rc 
--   ON tc.constraint_name = rc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_name IN ('replies', 'reactions');

-- You should see delete_rule = 'CASCADE' for both tables
