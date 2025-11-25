import { NextRequest, NextResponse } from 'next/server';
import { generateClaudeResponse } from '@/lib/claude';
import { createWish } from '@/lib/supabase';
import { getPersonaConfig } from '@/lib/personas';
import { generateAnonymousName } from '@/lib/utils';
import aiRouter from '@/lib/ai-router';
import type { WishSubmitPayload, WishResponse } from '@/typings/types';

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

    // Check if this persona was mentioned (or no mentions = respond anyway for backward compatibility)
    const shouldRespond = mentions.length === 0 || mentions.includes(persona);

    let aiReply: string | null = null;
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
      image_url: imageUrl,
      image_path: imagePath,
      audio_url: audioUrl,
      audio_path: audioPath,
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
