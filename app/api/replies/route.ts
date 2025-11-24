import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// Post a reply
export async function POST(req: NextRequest) {
  try {
    const { wish_id, wallet_address, username, avatar, reply_text } = await req.json();

    if (!wish_id || !wallet_address || !reply_text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('replies')
      .insert({
        wish_id,
        wallet_address,
        username: username || 'Anonymous',
        avatar: avatar || '👤',
        reply_text,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reply: data });
  } catch (error) {
    console.error('Failed to post reply:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get replies for a wish
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

    const { data: replies, error } = await supabase
      .from('replies')
      .select('*')
      .eq('wish_id', wish_id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, replies: replies || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch replies:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
