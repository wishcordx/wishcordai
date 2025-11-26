import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import aiRouter from '@/lib/ai-router';
import { getPersonaConfig } from '@/lib/personas';
import type { Persona } from '@/typings/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// Post a reply
export async function POST(req: NextRequest) {
  try {
    const { wish_id, wallet_address, username, avatar, reply_text } = await req.json();

    if (!wish_id || !wallet_address || !reply_text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for @mentions in the reply
    const mentionRegex = /@(SantaMod69|xX_Krampus_Xx|elfgirluwu|FrostyTheCoder|DasherSpeedrun|SantaKumar|JingBells叮噹鈴)/g;
    const matches = reply_text.match(mentionRegex);
    const hasMention = matches && matches.length > 0;

    // Map usernames to persona IDs
    const usernameToPersonaMap: Record<string, Persona> = {
      'SantaMod69': 'santa',
      'xX_Krampus_Xx': 'grinch',
      'elfgirluwu': 'elf',
      'FrostyTheCoder': 'snowman',
      'DasherSpeedrun': 'reindeer',
      'SantaKumar': 'scammer',
      'JingBells叮噹鈴': 'jingbells',
    };

    let mentionedUsername: string | undefined;
    let personaId: Persona | undefined;
    
    if (hasMention) {
      mentionedUsername = matches![0].substring(1); // Remove @ symbol
      personaId = mentionedUsername ? usernameToPersonaMap[mentionedUsername] : undefined;
    }

    // ==========================================
    // STEP 1: Save user's reply INSTANTLY
    // ==========================================
    const { data: userReply, error: userError } = await supabase
      .from('replies')
      .insert({
        wish_id,
        wallet_address,
        username: username || 'Anonymous',
        avatar: avatar || '👤',
        reply_text,
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error inserting user reply:', userError);
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 500 }
      );
    }

    // ==========================================
    // STEP 2: Return response IMMEDIATELY
    // ==========================================
    const response = NextResponse.json({ 
      success: true, 
      reply: userReply,
    });

    // ==========================================
    // STEP 3: Generate AI response in background (if mod mentioned)
    // ==========================================
    if (hasMention && personaId && mentionedUsername) {
      const personaConfig = getPersonaConfig(personaId);
      
      if (!personaConfig) {
        console.error(`❌ No persona config found for ${personaId}`);
        return response;
      }
      
      console.log(`🏷️ Starting async AI generation for @${mentionedUsername} (${personaConfig.name})`);
      
      // Fire and forget - generate AI response async
      (async () => {
        try {
          console.log(`🤖 [ASYNC] Generating AI response from ${personaConfig.name}...`);
          
          // Fetch the original wish to get context and media
          const { data: originalWish } = await supabase
            .from('wishes')
            .select('*')
            .eq('id', wish_id)
            .single();
          
          // Fetch previous replies in the thread for conversation context
          const { data: previousReplies } = await supabase
            .from('replies')
            .select('*')
            .eq('wish_id', wish_id)
            .order('created_at', { ascending: true });
          
          // Build full conversation context
          let contextMessage = '';
          
          // Add original post context
          if (originalWish) {
            contextMessage += `[ORIGINAL POST by ${originalWish.username}]: ${originalWish.wish_text}\n`;
            if (originalWish.image_url) {
              contextMessage += `[Image attached to original post]\n`;
            }
            if (originalWish.audio_url) {
              contextMessage += `[Audio attached to original post]\n`;
            }
          }
          
          // Add conversation thread (excluding the pending reply we just created)
          if (previousReplies && previousReplies.length > 0) {
            contextMessage += `\n[CONVERSATION THREAD]:\n`;
            previousReplies
              .filter(r => r.id !== modReplyId) // Exclude the placeholder
              .forEach(r => {
                contextMessage += `${r.username}: ${r.reply_text}\n`;
              });
          }
          
          // Add current reply
          contextMessage += `\n[NEW REPLY to respond to]: ${username || 'Anonymous'}: ${reply_text}`;
          
          // Analyze image if present in original wish
          let imageDescription = undefined;
          if (originalWish?.image_url) {
            console.log('🖼️ Analyzing image from original post...');
            imageDescription = await aiRouter.analyzeMeme(originalWish.image_url, 'claude');
          }
          
          // Generate AI response with full context
          const aiReply = await aiRouter.generateModResponse(
            personaConfig!.systemPrompt,
            contextMessage,
            imageDescription,
            undefined
          );
          
          // Insert mod's reply directly
          await supabase.from('replies').insert({
            wish_id,
            wallet_address: personaConfig!.name.toLowerCase().replace(/\s+/g, '_'),
            username: mentionedUsername,
            avatar: personaConfig!.emoji,
            reply_text: aiReply,
          });
          
          console.log(`✅ ${personaConfig!.name} responded to reply with full context!`);
        } catch (aiError) {
          console.error('❌ Failed to generate AI reply:', aiError);
          // Don't fail the whole request if AI fails
        }
      })();
    }

    return response;
  } catch (error) {
    console.error('Failed to post reply:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get replies for a wish
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wish_id = searchParams.get('wish_id');

    if (!wish_id) {
      return NextResponse.json(
        { success: false, error: 'wish_id is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: replies, error } = await supabase
      .from('replies')
      .select('*')
      .eq('wish_id', wish_id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, replies: replies || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch replies:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
