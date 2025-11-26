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

    // DEBUG: Log incoming request
    console.log('📥 INCOMING WISH REQUEST:');
    console.log('  📝 wishText:', wishText);
    console.log('  🎭 persona:', persona);
    console.log('  👥 mentionedPersonas:', mentionedPersonas);
    console.log('  🎤 audioUrl:', audioUrl);
    console.log('  🖼️ imageUrl:', imageUrl);

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

    // Only respond if this persona was mentioned (no mentions = no AI response)
    const shouldRespond = mentionedPersonaIds.includes(persona);
    
    console.log('🏷️ Mentions detected:', mentions);
    console.log('🎭 Persona IDs:', mentionedPersonaIds);
    console.log('🤖 Current persona:', persona);
    console.log('💭 Should respond:', shouldRespond);

    // STEP 1: Save wish immediately with pending status if AI response is needed
    const aiStatus = shouldRespond ? 'pending' : null;
    
    const wish = await createWish({
      wallet_address: walletAddress || generateAnonymousName(),
      username: username || 'Anonymous',
      avatar: avatar || '👤',
      wish_text: wishText || '[Media message]',
      persona,
      ai_reply: null, // Will be filled in async
      ai_status: aiStatus,
      image_url: imageUrl,
      image_path: imagePath,
      audio_url: audioUrl,
      audio_path: audioPath,
      mentioned_personas: mentionedPersonaIds.length > 0 ? mentionedPersonaIds : undefined,
    });

    console.log('📝 Wish saved instantly:', wish.id, 'AI status:', aiStatus);

    // STEP 2: Return immediately so user sees their message
    const response = NextResponse.json<WishResponse>(
      { success: true, wish },
      { status: 201 }
    );

    // STEP 3: Generate AI response asynchronously (don't await)
    if (shouldRespond) {
      console.log(`💬 ${personaConfig.name} is typing...`);
      
      // Fire and forget - generate AI response in background
      (async () => {
        const startTime = Date.now();
        try {
          console.log(`⏱️ [${wish.id}] Starting AI generation at ${new Date().toISOString()}`);
          let aiReply: string | null = null;
          let aiAudioUrl: string | undefined;
          let aiAudioPath: string | undefined;
          let imageDescription: string | undefined;

          // Analyze image if present
          if (imageUrl) {
            console.log('🖼️ Analyzing image with Claude Vision...');
            imageDescription = await aiRouter.analyzeMeme(imageUrl, 'claude');
          }

          console.log(`📝 Message content: "${wishText}"`);
          console.log(`🎤 Has audio: ${!!audioUrl}`);
          console.log(`🖼️ Has image: ${!!imageUrl}`);

          // Generate AI response with full context
          console.log(`⏱️ [${wish.id}] Calling aiRouter.generateModResponse...`);
          aiReply = await aiRouter.generateModResponse(
            personaConfig.systemPrompt,
            wishText || '[No text, see attached media]',
            imageDescription,
            undefined
          );

          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log(`✅ [${wish.id}] ${personaConfig.name} responded in ${elapsed}s!`);

          // Generate voice response if user sent voice message
          if (audioUrl && aiReply) {
            try {
              console.log(`🎙️ Generating voice response for ${personaConfig.name}...`);
              
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
                console.log(`✅ Voice response uploaded: ${publicUrl}`);
              }
            } catch (voiceError) {
              console.error('❌ Voice generation failed:', voiceError);
            }
          }

          // Update wish with AI response
          console.log(`⏱️ [${wish.id}] Updating database with AI response...`);
          const { error: updateError } = await supabase
            .from('wishes')
            .update({
              ai_reply: aiReply,
              ai_status: 'completed',
              ai_audio_url: aiAudioUrl,
              ai_audio_path: aiAudioPath,
            })
            .eq('id', wish.id);

          if (updateError) {
            console.error(`❌ [${wish.id}] Failed to update wish with AI response:`, updateError);
            // Mark as failed
            await supabase
              .from('wishes')
              .update({ ai_status: 'failed' })
              .eq('id', wish.id);
          } else {
            const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅✅✅ [${wish.id}] COMPLETE! Database updated in ${totalElapsed}s total`);
          }
        } catch (error) {
          console.error(`❌ [${wish.id}] AI generation error:`, error);
          // Mark as failed
          await supabase
            .from('wishes')
            .update({ ai_status: 'failed' })
            .eq('id', wish.id);
          console.log(`⚠️ [${wish.id}] Marked as failed in database`);
        }
      })();
    } else {
      console.log(`⏭️ ${personaConfig.name} not mentioned, no AI response needed`);
    }

    return response;
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json<WishResponse>(
      { success: false, error: 'Failed to process wish' },
      { status: 500 }
    );
  }
}
