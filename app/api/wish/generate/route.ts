import { NextRequest, NextResponse } from 'next/server';
import aiRouter from '@/lib/ai-router';
import { getPersonaConfig } from '@/lib/personas';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createClient } from '@supabase/supabase-js';
import type { Persona } from '@/typings/types';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Voice IDs for each mod
const VOICE_MAP: Record<Persona, string> = {
  'santa': process.env.ELEVENLABS_SANTA_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
  'grinch': process.env.ELEVENLABS_KRAMPUS_VOICE_ID || 'onwK4e9ZLuTAKqWW03F9',
  'elf': process.env.ELEVENLABS_ELF_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
  'snowman': process.env.ELEVENLABS_FROSTY_VOICE_ID || 'TxGEqnHWrfWFTfGW9XjX',
  'reindeer': process.env.ELEVENLABS_DASHER_VOICE_ID || 'VR6AewLTigWG4xSOukaG',
  'scammer': process.env.ELEVENLABS_SCAMMER_VOICE_ID || 'pqHfZKP75CvOlQylNhV4',
  'jingbells': process.env.ELEVENLABS_JINGBELLS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
  'barry': process.env.ELEVENLABS_BARRY_VOICE_ID || 'mQJemUdtNfAfUYHccHzZ',
};

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { wishId, wishText, persona, imageUrl, audioUrl }: {
      wishId: string;
      wishText: string;
      persona: Persona;
      imageUrl?: string;
      audioUrl?: string;
    } = await request.json();
    
    const personaConfig = getPersonaConfig(persona);
    if (!personaConfig) {
      throw new Error(`Invalid persona: ${persona}`);
    }

    let aiReply: string | null = null;
    let aiAudioUrl: string | undefined;
    let aiAudioPath: string | undefined;
    let imageDescription: string | undefined;

    // Analyze image if present
    if (imageUrl) {
      imageDescription = await aiRouter.analyzeMeme(imageUrl, 'claude');
    }

    // Generate AI response with full context
    aiReply = await aiRouter.generateModResponse(
      personaConfig.systemPrompt,
      wishText || '[No text, see attached media]',
      imageDescription,
      undefined
    );

    // Generate voice response if user sent voice message
    if (audioUrl && aiReply) {
      try {
        if (!process.env.ELEVENLABS_API_KEY) {
          throw new Error('ElevenLabs API key not configured');
        }
        
        const voiceId = VOICE_MAP[persona];
        const audio = await elevenlabs.textToSpeech.convert(voiceId, {
          text: aiReply,
          modelId: 'eleven_turbo_v2_5',
          outputFormat: 'mp3_22050_32',
        });

        const chunks: Uint8Array[] = [];
        const reader = audio.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const audioBuffer = Buffer.concat(chunks);

        const fileName = `ai-voice-${Date.now()}.mp3`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('wish-audio')
          .upload(fileName, audioBuffer, {
            contentType: 'audio/mpeg',
            cacheControl: '3600',
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('wish-audio')
            .getPublicUrl(fileName);
          
          aiAudioUrl = publicUrl;
          aiAudioPath = fileName;
        }
      } catch (voiceError) {
        console.error('❌ Voice generation failed:', voiceError);
      }
    }

    // Update wish with AI response

    const { error: updateError } = await supabase
      .from('wishes')
      .update({
        ai_reply: aiReply,
        ai_status: 'completed',
        ai_audio_url: aiAudioUrl,
        ai_audio_path: aiAudioPath,
      })
      .eq('id', wishId);

    if (updateError) {
      console.error(`❌ [${wishId}] Failed to update wish with AI response:`, updateError);
      // Mark as failed
      await supabase
        .from('wishes')
        .update({ ai_status: 'failed' })
        .eq('id', wishId);
      
      return NextResponse.json(
        { success: false, error: 'Failed to update wish' },
        { status: 500 }
      );
    }

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅✅✅ [${wishId}] COMPLETE! Database updated in ${totalElapsed}s total`);

    return NextResponse.json({ 
      success: true, 
      aiReply,
      aiAudioUrl,
      elapsed: totalElapsed 
    });
  } catch (error) {
    console.error(`❌ AI generation error:`, error);
    
    // Try to mark as failed in database if we have wishId
    const body = await request.json().catch(() => ({}));
    if (body.wishId) {
      await supabase
        .from('wishes')
        .update({ ai_status: 'failed' })
        .eq('id', body.wishId);
    }

    return NextResponse.json(
      { success: false, error: 'AI generation failed' },
      { status: 500 }
    );
  }
}
