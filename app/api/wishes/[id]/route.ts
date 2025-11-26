import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: wish, error } = await supabase
      .from('wishes')
      .select('id, ai_reply, ai_status, ai_audio_url, ai_audio_path')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Wish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ai_reply: wish.ai_reply,
      ai_status: wish.ai_status,
      ai_audio_url: wish.ai_audio_url,
      ai_audio_path: wish.ai_audio_path,
    });
  } catch (error) {
    console.error('Error fetching wish status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wish status' },
      { status: 500 }
    );
  }
}
