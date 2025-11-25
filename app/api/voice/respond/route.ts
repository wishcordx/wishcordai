import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { getPersonaConfig } from '@/lib/personas';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

// Voice IDs for each mod (using persona keys)
const VOICE_MAP: Record<string, string> = {
  'santa': process.env.ELEVENLABS_SANTA_VOICE_ID || 'pNInz6obpgDQGcFmaJgB', // Default: Adam
  'grinch': process.env.ELEVENLABS_KRAMPUS_VOICE_ID || 'onwK4e9ZLuTAKqWW03F9', // Default: Daniel
  'elf': process.env.ELEVENLABS_ELF_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL', // Default: Bella
  'snowman': process.env.ELEVENLABS_FROSTY_VOICE_ID || 'TxGEqnHWrfWFTfGW9XjX', // Default: Josh
  'reindeer': process.env.ELEVENLABS_DASHER_VOICE_ID || 'VR6AewLTigWG4xSOukaG', // Default: Arnold
  'scammer': process.env.ELEVENLABS_SCAMMER_VOICE_ID || 'pqHfZKP75CvOlQylNhV4', // Default: Bill (Indian accent)
};

export async function POST(request: NextRequest) {
  try {
    const { persona, userMessage, conversationHistory } = await request.json();

    if (!persona || !userMessage) {
      return NextResponse.json(
        { success: false, error: 'Missing persona or message' },
        { status: 400 }
      );
    }

    console.log(`💬 ${persona} responding to: "${userMessage}"`);

    const modPersona = getPersonaConfig(persona as any);
    
    // Build conversation context
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: conversationHistory || `User joined the voice call. Start the conversation by greeting them in character and asking what they want. Keep responses SHORT (1-2 sentences max) for natural conversation flow.`
      },
      {
        role: 'assistant',
        content: 'I understand. I will respond in character with short, natural voice messages.'
      },
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Get AI response
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200, // Keep it short for voice
      system: modPersona.systemPrompt + '\n\nIMPORTANT: Keep responses SHORT (1-2 sentences). You are in a VOICE CALL, not writing an essay. Be conversational and natural.',
      messages,
    });

    const aiText = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log(`✅ ${persona} says: "${aiText}"`);

    // Generate voice audio
    const voiceId = VOICE_MAP[persona];
    console.log(`🎙️ Generating voice with ID: ${voiceId}`);

    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: aiText,
      modelId: 'eleven_turbo_v2_5', // Fastest model for real-time
      outputFormat: 'mp3_44100_128', // Explicit format for better compatibility
    });

    // Convert audio stream to base64
    const chunks: Uint8Array[] = [];
    const reader = audio.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');
    
    console.log(`✅ Audio generated, size: ${audioBase64.length} bytes`);

    return NextResponse.json({
      success: true,
      text: aiText,
      audio: audioBase64,
    });

  } catch (error) {
    console.error('❌ Voice response error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate voice response' },
      { status: 500 }
    );
  }
}
