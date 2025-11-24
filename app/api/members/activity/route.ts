import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { wallet_address, username, avatar } = await req.json();

    if (!wallet_address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert member data (insert or update if exists)
    const { data, error } = await supabase
      .from('members')
      .upsert(
        {
          wallet_address,
          username: username || 'Anonymous',
          avatar: avatar || '👤',
          last_active: new Date().toISOString(),
        },
        {
          onConflict: 'wallet_address',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating member activity:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, member: data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update member activity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
