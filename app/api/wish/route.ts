import { NextRequest, NextResponse } from 'next/server';
import { generateClaudeResponse } from '@/lib/claude';
import { createWish } from '@/lib/supabase';
import { getPersonaConfig } from '@/lib/personas';
import { generateAnonymousName } from '@/lib/utils';
import aiRouter from '@/lib/ai-router';
import type { WishSubmitPayload, WishResponse, Persona } from '@/typings/types';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createClient } from '@supabase/supabase-js';

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
};

export async function POST(request: NextRequest) {
  try {
    const body: WishSubmitPayload = await request.json();
    const { 
      wishText, 
      persona, 
      walletAddress, 
      username, 
      avatar,
      imageUrl,
      imagePath,
      audioUrl,
      audioPath,
      mentionedPersonas 
    } = body;

    // Validate input - allow empty text if media is present
    if (!wishText?.trim() && !imageUrl && !audioUrl) {
      return NextResponse.json<WishResponse>(
        { success: false, error: 'Message, image, or audio is required' },
        { status: 400 }
      );
    }

    if (!persona) {
      return NextResponse.json<WishResponse>(
        { success: false, error: 'Persona is required' },
        { status: 400 }
      );
    }

    // Get persona configuration
    const personaConfig = getPersonaConfig(persona);
    if (!personaConfig) {
      return NextResponse.json<WishResponse>(
        { success: false, error: 'Invalid persona' },
        { status: 400 }
      );
    }

    // Parse @mentions from text if not already provided
    const mentions = mentionedPersonas || aiRouter.parseMentions(wishText || '');
    
    // Convert mentioned usernames to persona IDs for matching
    const usernameToPersonaMap: Record<string, string> = {
      'SantaMod69': 'santa',
      'xX_Krampus_Xx': 'grinch',
      'elfgirluwu': 'elf',
      'FrostyTheCoder': 'snowman',
      'DasherSpeedrun': 'reindeer',
      'SantaKumar': 'scammer',
      'JingBells叮噹鈴': 'jingbells',
    };
    
    const mentionedPersonaIds = mentions.map(m => usernameToPersonaMap[m] || m.toLowerCase()).filter(Boolean);

    // Only respond if this persona was mentioned
    // Or if no mentions but there's text (backward compatibility for simple text wishes)
    const hasTextOnly = wishText && wishText.trim().length > 0 && !audioUrl && !imageUrl;
    const shouldRespond = mentionedPersonaIds.includes(persona) || (mentionedPersonaIds.length === 0 && hasTextOnly);
    
    console.log('🏷️ Mentions detected:', mentions);
    console.log('🎭 Persona IDs:', mentionedPersonaIds);
    console.log('🤖 Current persona:', persona);
    console.log('💭 Should respond:', shouldRespond);

    let aiReply: string | null = null;
    let aiAudioUrl: string | null = null;
    let aiAudioPath: string | null = null;
    let imageDescription: string | undefined;
    let audioTranscript: string | undefined;

    if (shouldRespond) {
      console.log(`💬 ${personaConfig.name} is typing...`);

      // Analyze image if present
      if (imageUrl) {
        console.log('🖼️ Analyzing image with Claude Vision...');
        imageDescription = await aiRouter.analyzeMeme(imageUrl, 'claude');
      }

      // Note: Audio transcription should be done in the frontend before upload
      // The audioUrl here is already transcribed audio, stored for playback

      // Generate AI response with full context
      aiReply = await aiRouter.generateModResponse(
        personaConfig.systemPrompt,
        wishText || '[No text, see attached media]',
        imageDescription,
        audioTranscript
      );

      console.log(`✅ ${personaConfig.name} responded!`);

      // ONLY generate voice response if user sent a voice message (audioUrl exists)
      // Text-only messages with @mention will get text-only responses
      if (audioUrl && aiReply) {
        try {
          console.log(`🎙️ User sent voice, generating voice response for ${personaConfig.name}...`);
          
          const voiceId = VOICE_MAP[persona];
          const audio = await elevenlabs.textToSpeech.convert(voiceId, {
            text: aiReply,
            modelId: 'eleven_turbo_v2_5',
            outputFormat: 'mp3_22050_32',
          });

          // Convert audio stream to buffer
          const chunks: Uint8Array[] = [];
          const reader = audio.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          const audioBuffer = Buffer.concat(chunks);

          // Upload to Supabase Storage
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
            console.log(`✅ Voice response uploaded: ${publicUrl}`);
          } else {
            console.error('❌ Failed to upload AI voice:', uploadError);
          }
        } catch (voiceError) {
          console.error('❌ Voice generation failed:', voiceError);
          // Continue anyway with text response
        }
      }
    } else {
      console.log(`⏭️ ${personaConfig.name} not mentioned, skipping response`);
    }

    // Save to database with all media
    const wish = await createWish({
      wallet_address: walletAddress || generateAnonymousName(),
      username: username || 'Anonymous',
      avatar: avatar || '👤',
      wish_text: wishText || '[Media message]',
      persona,
      ai_reply: aiReply,
      ai_audio_url: aiAudioUrl,
      ai_audio_path: aiAudioPath,
      image_url: imageUrl,
      image_path: imagePath,
      audio_url: audioUrl,
      audio_path: audioPath,
      mentioned_personas: mentionedPersonaIds.length > 0 ? mentionedPersonaIds : undefined,
    });

    console.log('📝 Wish saved:', wish.id);

    return NextResponse.json<WishResponse>(
      { success: true, wish },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json<WishResponse>(
      { success: false, error: 'Failed to process wish' },
      { status: 500 }
    );
  }
}
