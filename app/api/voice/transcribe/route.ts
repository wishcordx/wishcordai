import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    console.log('✅ Transcribed:', transcription.text);

    return NextResponse.json({
      success: true,
      text: transcription.text,
    });
  } catch (error) {
    console.error('❌ Transcription error:', error);
    return NextResponse.json(
      { success: false, error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
