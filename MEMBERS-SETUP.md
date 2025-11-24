# Members List Setup Guide

## What You Need to Do in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/gbmkvfkhzojwzkzonosf

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy all the content from `supabase-members-table.sql`
   - Paste it into the SQL Editor
   - Click "Run" button

4. **Verify Table Creation**
   - Click on "Table Editor" in the left sidebar
   - You should see a new table called "members" with these columns:
     - `id` (uuid, primary key)
     - `wallet_address` (text, unique)
     - `username` (text)
     - `avatar` (text)
     - `last_active` (timestamp)
     - `created_at` (timestamp)

## How It Works

- **Automatic Registration**: When a user connects their wallet, they're automatically added to the members table
- **Online Status**: Users are marked as "online" if they were active in the last 5 minutes
- **Auto-Update**: The system updates user activity every 30 seconds while the page is open
- **Profile Sync**: Username and avatar are synced from the user's localStorage profile
- **Real-time Sorting**: Online members appear at the top of the list

## Features

✅ Shows all registered members (wallet holders who connected)
✅ Online/offline status indicator (green = online, gray = offline)
✅ Online users displayed at the top
✅ Total member count
✅ Online member count
✅ Shows custom avatars (emoji or uploaded images)
✅ Shows usernames
✅ Highlights current user with "You" badge
✅ Auto-refreshes every 30 seconds
✅ Custom scrollbar for long member lists

## No Code Changes Needed After SQL

Once you run the SQL in Supabase, everything will work automatically!
