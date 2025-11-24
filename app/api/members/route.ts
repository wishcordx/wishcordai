import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Consider users online if they were active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .order('last_active', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Mark members as online/offline based on last_active timestamp
    const membersWithStatus = (members || []).map((member) => ({
      ...member,
      is_online: new Date(member.last_active) > new Date(fiveMinutesAgo),
    }));

    return NextResponse.json(
      { success: true, members: membersWithStatus },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
