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
  'barry': process.env.ELEVENLABS_BARRY_VOICE_ID || 'mQJemUdtNfAfUYHccHzZ',
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

    // STEP 2: Trigger AI generation in background without blocking response
    if (shouldRespond) {
      console.log(`💬 ${personaConfig.name} is typing...`);
      
      // Call separate endpoint to generate AI response (non-blocking)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/wish/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wishId: wish.id,
          wishText: wishText || '[Media message]',
          persona,
          imageUrl,
          audioUrl,
        }),
      }).catch(err => console.error('Failed to trigger AI generation:', err));
    }

    // STEP 3: Return immediately so user sees their message
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
