import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// Add or remove a reaction
export async function POST(req: NextRequest) {
  try {
    const { wish_id, wallet_address, emoji, action } = await req.json();

    if (!wish_id || !wallet_address || !emoji) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'remove') {
      // Remove reaction
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('wish_id', wish_id)
        .eq('wallet_address', wallet_address)
        .eq('emoji', emoji);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Add reaction (upsert to handle duplicates)
      const { error } = await supabase
        .from('reactions')
        .insert({
          wish_id,
          wallet_address,
          emoji,
        });

      if (error) {
        // If already exists, ignore error
        if (error.code === '23505') {
          return NextResponse.json({ success: true, action: 'already_exists' });
        }
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Failed to handle reaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get reactions for a wish
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wish_id = searchParams.get('wish_id');

    if (!wish_id) {
      return NextResponse.json(
        { success: false, error: 'wish_id is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: reactions, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('wish_id', wish_id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Group reactions by emoji with counts
    const grouped = (reactions || []).reduce((acc: any, reaction) => {
      const emoji = reaction.emoji;
      if (!acc[emoji]) {
        acc[emoji] = {
          emoji,
          count: 0,
          users: [],
        };
      }
      acc[emoji].count++;
      acc[emoji].users.push(reaction.wallet_address);
      return acc;
    }, {});

    return NextResponse.json(
      { success: true, reactions: Object.values(grouped) },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch reactions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
