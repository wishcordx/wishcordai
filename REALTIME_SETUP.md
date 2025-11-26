# Supabase Realtime Setup

## Enable Realtime for Instant Updates

### Step 1: Enable Realtime in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Find the `wishes` table
4. Toggle **Enable Realtime** to ON
5. Find the `replies` table
6. Toggle **Enable Realtime** to ON

### Step 2: Verify Setup

After enabling Realtime, you should see:
- ✅ Green checkmark next to `wishes` table
- ✅ Green checkmark next to `replies` table

### How It Works

**Before (Polling):**
- Client asks server every 5 seconds: "Any updates?"
- 5 second delay between updates
- Uses more bandwidth

**After (Realtime with WebSockets):**
- Server pushes updates instantly when data changes
- <100ms update delay
- Zero bandwidth waste
- Just like Discord/Slack!

### What Gets Updated Instantly:

1. **New Wishes** - When anyone posts, everyone sees it instantly
2. **AI Responses** - When AI completes, typing indicator → response instantly
3. **New Replies** - When someone replies, everyone in that thread sees it instantly
4. **AI Reply Updates** - When AI reply completes, updates instantly

### No Code Changes Needed

The implementation is already in:
- `components/Feed.tsx` - Listens for new/updated wishes
- `components/WishCard.tsx` - Listens for new/updated replies

Just enable Realtime in Supabase dashboard and it works! 🚀

### Console Logs to Verify

After enabling, you'll see in browser console:
- `🔌 Connecting to Supabase Realtime...`
- `✅ Realtime connected!`
- `✨ New wish via Realtime:` (when someone posts)
- `🔄 Wish updated via Realtime:` (when AI responds)
- `✨ New reply via Realtime:` (when someone replies)

### Cost

**FREE** - Included in your current Supabase plan!
- Free tier: 2GB database, 500MB storage, unlimited API requests
- Realtime included at no extra cost
