import { NextRequest, NextResponse } from 'next/server';
import { generateClaudeResponse } from '@/lib/claude';
import { createWish } from '@/lib/supabase';
import { getPersonaConfig } from '@/lib/personas';
import { generateAnonymousName } from '@/lib/utils';
import type { WishSubmitPayload, WishResponse } from '@/typings/types';

export async function POST(request: NextRequest) {
  try {
    const body: WishSubmitPayload = await request.json();
    const { wishText, persona, walletAddress, username, avatar } = body;

    // Validate input
    if (!wishText || !wishText.trim()) {
      return NextResponse.json<WishResponse>(
        { success: false, error: 'Wish text is required' },
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

    console.log(`💬 ${personaConfig.name} is typing...`);

    // Generate AI response using Claude
    const aiReply = await generateClaudeResponse(
      personaConfig.systemPrompt,
      wishText
    );

    console.log(`✅ ${personaConfig.name} responded!`);

    // Save to database with user profile data
    const wish = await createWish({
      wallet_address: walletAddress || generateAnonymousName(),
      username: username || 'Anonymous',
      avatar: avatar || '👤',
      wish_text: wishText,
      persona,
      ai_reply: aiReply,
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
