import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('🎤 Transcribing audio...');

    // Convert File to Buffer for OpenAI
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a new File object that OpenAI expects
    const file = new File([buffer], 'audio.webm', { type: audioFile.type });

    // Transcribe audio
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    console.log('✅ Transcribed:', transcription.text);

    // Upload audio to Supabase Storage
    const fileName = `voice-${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wish-audio')
      .upload(fileName, buffer, {
        contentType: audioFile.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('❌ Audio upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload audio' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wish-audio')
      .getPublicUrl(fileName);

    console.log('✅ Audio uploaded:', publicUrl);

    return NextResponse.json({
      success: true,
      text: transcription.text,
      audioUrl: publicUrl,
      audioPath: fileName,
    });
  } catch (error) {
    console.error('❌ Transcription error:', error);
    return NextResponse.json(
      { success: false, error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
