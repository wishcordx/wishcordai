'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PERSONAS } from '@/lib/personas';
import { truncateAddress } from '@/lib/utils';
import { formatDiscordTimestamp, formatRelativeTime } from '@/lib/time-utils';
import { useWallet } from '@/lib/wallet-context';
import { supabase } from '@/lib/supabase';
import MentionAutocomplete, { MODS, type Mention } from './MentionAutocomplete';
import type { Wish } from '@/typings/types';

interface WishCardProps {
  wish: Wish;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Reply {
  id: string;
  wallet_address: string;
  username: string;
  avatar: string;
  reply_text: string;
  ai_status?: 'pending' | 'completed' | 'failed' | null;
  created_at: string;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '💀', '🎄', '🎅'];

export default function WishCard({ wish }: WishCardProps) {
  const { walletAddress } = useWallet();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  // @Mention autocomplete state for replies
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const replyInputRef = useRef<HTMLInputElement>(null);

  const personaConfig = PERSONAS[wish.persona as keyof typeof PERSONAS];
  // Use wish props directly - Realtime updates the parent which re-renders this component
  const [lastReplyCount, setLastReplyCount] = useState(0);
  const [shouldPollReplies, setShouldPollReplies] = useState(false);
  const [expectedModUsername, setExpectedModUsername] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch reactions and reply count in parallel for faster loading
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (showReplies && replies.length === 0) {
      fetchReplies();
    }
  }, [showReplies]);

  // Supabase Realtime - Listen for new replies on this wish
  useEffect(() => {
    if (showReplies) {
      console.log(`🔌 Listening for replies on wish ${wish.id}...`);
      
      const channel = supabase
        .channel(`replies-${wish.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'replies',
            filter: `wish_id=eq.${wish.id}`,
          },
          (payload) => {
            console.log('✨ New reply via Realtime:', payload.new);
            const newReply = payload.new as Reply;
            setReplies(prev => {
              // Avoid duplicates
              if (prev.some(r => r.id === newReply.id)) return prev;
              return [...prev, newReply];
            });
            setReplyCount(prev => prev + 1);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'replies',
            filter: `wish_id=eq.${wish.id}`,
          },
          (payload) => {
            console.log('🔄 Reply updated via Realtime:', payload.new);
            const updatedReply = payload.new as Reply;
            setReplies(prev =>
              prev.map(r => (r.id === updatedReply.id ? updatedReply : r))
            );
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Realtime connected for replies on wish ${wish.id}`);
          }
        });

      return () => {
        console.log(`🔌 Disconnecting from replies on wish ${wish.id}`);
        supabase.removeChannel(channel);
      };
    }
  }, [showReplies, wish.id]);

  // No need to poll - Realtime updates the wish prop automatically!

  // Poll for new replies when expecting AI response
  useEffect(() => {
    if (!shouldPollReplies) return;

    let pollCount = 0;
    const maxPolls = 30; // Poll for up to 60 seconds (30 * 2s)

    const pollInterval = setInterval(async () => {
      pollCount++;
      
      try {
        const response = await fetch(`/api/replies?wish_id=${wish.id}`, {
          cache: 'no-store'
        });
        const data = await response.json();
        
        if (data.success && data.replies) {
          const newReplyCount = data.replies.length;
          
          // If we got a new reply, update and stop polling
          if (newReplyCount > lastReplyCount) {
            console.log('✅ New reply detected! Updating...');
            setReplies(data.replies);
            setReplyCount(newReplyCount);
            setLastReplyCount(newReplyCount);
            setShouldPollReplies(false);
            setExpectedModUsername(null);
            clearInterval(pollInterval);
          }
        }
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          console.log('⏱️ Stopped polling for replies after 60 seconds');
          setShouldPollReplies(false);
          setExpectedModUsername(null);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Failed to poll replies:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [shouldPollReplies, wish.id, lastReplyCount]);



  const fetchInitialData = async () => {
    try {
      setIsLoadingData(true);
      // Fetch both in parallel
      const [reactionsRes, repliesRes] = await Promise.all([
        fetch(`/api/reactions?wish_id=${wish.id}`),
        fetch(`/api/replies?wish_id=${wish.id}`)
      ]);

      const [reactionsData, repliesData] = await Promise.all([
        reactionsRes.json(),
        repliesRes.json()
      ]);

      if (reactionsData.success) {
        setReactions(reactionsData.reactions);
      }
      if (repliesData.success) {
        setReplyCount(repliesData.replies.length);
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/replies?wish_id=${wish.id}`);
      const data = await response.json();
      if (data.success) {
        setReplies(data.replies);
        setReplyCount(data.replies.length);
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!walletAddress) {
      alert('Please connect your wallet to react!');
      return;
    }

    const hasReacted = reactions.find(r => r.emoji === emoji && r.users.includes(walletAddress));
    const action = hasReacted ? 'remove' : 'add';

    // Optimistic update
    const optimisticReactions = [...reactions];
    const existingIndex = optimisticReactions.findIndex(r => r.emoji === emoji);
    
    if (action === 'add') {
      if (existingIndex >= 0) {
        optimisticReactions[existingIndex].count++;
        optimisticReactions[existingIndex].users.push(walletAddress);
      } else {
        optimisticReactions.push({ emoji, count: 1, users: [walletAddress] });
      }
    } else {
      if (existingIndex >= 0) {
        optimisticReactions[existingIndex].count--;
        optimisticReactions[existingIndex].users = optimisticReactions[existingIndex].users.filter(u => u !== walletAddress);
        if (optimisticReactions[existingIndex].count === 0) {
          optimisticReactions.splice(existingIndex, 1);
        }
      }
    }
    setReactions(optimisticReactions);
    setShowReactionPicker(false);

    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wish_id: wish.id,
          wallet_address: walletAddress,
          emoji,
          action,
        }),
      });
    } catch (error) {
      console.error('Failed to add reaction:', error);
      // Revert on error
      fetchInitialData();
    }
  };

  // Handle reply text change with @mention detection
  const handleReplyTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    const input = e.target;
    const cursorPos = input.selectionStart || newText.length;
    
    setReplyText(newText);
    setCursorPosition(cursorPos);

    // Detect @ mention trigger
    const textBeforeCursor = newText.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    console.log('[Reply @] text:', newText, 'cursor:', cursorPos, 'lastAt:', lastAtIndex);
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      console.log('[Reply @] after @:', textAfterAt, 'hasSpace:', textAfterAt.includes(' '));
      
      // Show mentions if we just typed @ or are typing a name (no space yet)
      if (!textAfterAt.includes(' ')) {
        console.log('[Reply @] SHOWING AUTOCOMPLETE');
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentions(true);
        setSelectedMentionIndex(0);
      } else {
        console.log('[Reply @] hiding - space found');
        setShowMentions(false);
      }
    } else {
      console.log('[Reply @] hiding - no @');
      setShowMentions(false);
    }
  };

  // Handle keyboard navigation for mentions
  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentions) {
      const filteredMentions = MODS.filter(mod =>
        mod.name.toLowerCase().includes(mentionSearch)
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredMentions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredMentions.length - 1
        );
      } else if (e.key === 'Enter') {
        if (filteredMentions.length > 0) {
          e.preventDefault();
          handleMentionSelect(filteredMentions[selectedMentionIndex]);
        }
      } else if (e.key === 'Tab') {
        if (filteredMentions.length > 0) {
          e.preventDefault();
          handleMentionSelect(filteredMentions[selectedMentionIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && !isPostingReply) {
      handlePostReply();
    }
  };

  // Insert selected mention
  const handleMentionSelect = (mention: Mention) => {
    const textBeforeCursor = replyText.substring(0, cursorPosition);
    const textAfterCursor = replyText.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newText = 
      replyText.substring(0, lastAtIndex) + 
      mention.id + ' ' + 
      textAfterCursor;
    
    setReplyText(newText);
    setShowMentions(false);
    
    // Set cursor after mention
    setTimeout(() => {
      if (replyInputRef.current) {
        const newCursorPos = lastAtIndex + mention.id.length + 1;
        replyInputRef.current.selectionStart = newCursorPos;
        replyInputRef.current.selectionEnd = newCursorPos;
        replyInputRef.current.focus();
      }
    }, 0);
  };

  const handlePostReply = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet to reply!');
      return;
    }

    if (!replyText.trim()) return;

    setIsPostingReply(true);

    // Get profile from localStorage
    const profileData = localStorage.getItem('userProfile');
    const profile = profileData ? JSON.parse(profileData) : null;

    // Check if user @mentioned a mod
    const mentionRegex = /@(SantaMod69|xX_Krampus_Xx|elfgirluwu|FrostyTheCoder|DasherSpeedrun|SantaKumar|JingBells叮噹鈴)/;
    const match = replyText.match(mentionRegex);
    const hasMention = match !== null;
    const mentionedMod = match ? match[1] : null;

    try {
      const response = await fetch('/api/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wish_id: wish.id,
          wallet_address: walletAddress,
          username: profile?.username || 'Anonymous',
          avatar: profile?.avatar || '👤',
          reply_text: replyText,
        }),
      });

      if (response.ok) {
        setReplyText('');
        
        // Refresh replies to show user's new reply
        await fetchReplies();
        
        // If mod was mentioned, start polling for AI response and show typing
        if (hasMention && mentionedMod) {
          setExpectedModUsername(mentionedMod);
          setLastReplyCount(replies.length + 1); // +1 for the reply we just posted
          setShouldPollReplies(true);
          console.log(`🔄 Started polling for @${mentionedMod} AI response...`);
        }
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsPostingReply(false);
    }
  };

  const shareToTwitter = () => {
    setShareCount(prev => prev + 1);
    const tweetText = `Just made a wish on WishCord! 🎅✨\n\n"${wish.wish_text.slice(0, 100)}${wish.wish_text.length > 100 ? '...' : ''}"\n\n${personaConfig?.name} responded with: "${wish.ai_reply?.slice(0, 80)}..."\n\n#WishCord #XmasAI #Web3Christmas`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  
  const getVerdict = (reply: string | null) => {
    if (!reply) return 'PENDING';
    if (reply.includes('GRANTED')) return 'GRANTED';
    if (reply.includes('COAL')) return 'COAL';
    if (reply.includes('DENIED')) return 'DENIED';
    return 'PENDING';
  };
  
  const verdict = getVerdict(wish.ai_reply);
  
  const verdictColors = {
    'GRANTED': 'bg-green-600/20 text-green-400 border-green-600/30',
    'DENIED': 'bg-red-600/20 text-red-400 border-red-600/30',
    'COAL': 'bg-gray-600/20 text-gray-400 border-gray-600/30',
    'PENDING': 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  };

  return (
    <div className="bg-[#1e1f22] rounded-lg p-4 sm:p-6 border border-[#0f1011] hover:border-[#2b2d31] transition-colors">
      {/* User Message */}
      <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          {wish.avatar ? (
            wish.avatar.startsWith('data:') || wish.avatar.startsWith('https://') ? (
              <img src={wish.avatar} alt={wish.username || 'User'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base sm:text-lg">{wish.avatar}</span>
            )
          ) : (
            <span className="text-base sm:text-lg">👤</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-2 mb-1 flex-wrap">
            <span className="text-white font-medium text-xs sm:text-sm">
              {wish.username || (wish.wallet_address ? truncateAddress(wish.wallet_address) : 'Anonymous')}
            </span>
            <span className="text-gray-500 text-xs" title={formatRelativeTime(wish.created_at)}>
              {formatDiscordTimestamp(wish.created_at)}
            </span>
          </div>
          
          {/* Only show text if there's no audio, otherwise hide transcription */}
          {!wish.audio_url && (
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{wish.wish_text}</p>
          )}
          
          {/* Image Attachment */}
          {wish.image_url && (
            <div className="mt-3">
              <img
                src={wish.image_url}
                alt="Attached meme"
                className="max-w-full max-h-80 rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-[#0f1011]"
                onClick={() => setShowImageLightbox(true)}
              />
            </div>
          )}

          {/* Audio Attachment - Show audio player only */}
          {wish.audio_url && (
            <div className="mt-2 bg-[#202225] rounded-lg p-3 border border-[#0f1011] flex items-center gap-2">
              <span className="text-xl">🎤</span>
              <audio controls className="flex-1 h-8">
                <source src={wish.audio_url} type="audio/webm" />
                <source src={wish.audio_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {showImageLightbox && wish.image_url && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageLightbox(false)}
        >
          <button
            onClick={() => setShowImageLightbox(false)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl z-10"
          >
            ✕
          </button>
          <img
            src={wish.image_url}
            alt="Full size meme"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Mod Response */}
      {(wish.ai_reply || wish.ai_status === 'pending') && (
        <div className="flex gap-2 sm:gap-3 pl-4 sm:pl-6 border-l-2 border-indigo-600/30 ml-4 sm:ml-6 mb-2 sm:mb-3">
          <span className="text-xl sm:text-2xl flex-shrink-0">{personaConfig?.emoji || '🤖'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
              <span className="text-indigo-400 font-medium text-xs sm:text-sm">{personaConfig?.name || 'Mod'}</span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded text-xs font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-600/30">
                MOD
              </span>
              {wish.ai_reply && (
                <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-bold border ${verdictColors[verdict as keyof typeof verdictColors]}`}>
                  {verdict}
                </span>
              )}
            </div>
            
            {/* Show typing indicator when AI is generating response */}
            {wish.ai_status === 'pending' && (
              <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm italic">
                <span>{personaConfig?.emoji || '🤖'} {personaConfig?.name || 'Mod'} is typing</span>
                <div className="flex gap-1">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            {/* Show error message if AI generation failed */}
            {wish.ai_status === 'failed' && (
              <p className="text-red-400 text-xs sm:text-sm italic">Failed to generate response. Please try again.</p>
            )}
            
            {/* Only show text if there's no AI audio, otherwise hide transcription */}
            {wish.ai_reply && !wish.ai_audio_url && wish.ai_status === 'completed' && (
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{wish.ai_reply}</p>
            )}
            
            {/* AI Voice Response - Show audio player only */}
            {wish.ai_audio_url && wish.ai_status === 'completed' && (
              <div className="mt-2 bg-[#202225] rounded-lg p-2 border border-indigo-600/20 flex items-center gap-2">
                <span className="text-xl">{personaConfig?.emoji || '🤖'}</span>
                <audio
                  controls
                  src={wish.ai_audio_url}
                  className="flex-1 h-8"
                  preload="metadata"
                >
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center gap-2 sm:gap-4 ml-6 sm:ml-12 mt-2 flex-wrap">
        {/* Reaction Button */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="text-gray-400 hover:text-gray-300 text-xs flex items-center gap-1 hover:bg-[#35373c] px-1.5 sm:px-2 py-1 rounded transition-colors"
          >
            😊 <span className="hidden sm:inline">React</span> {totalReactions > 0 && <span className="text-gray-500">({totalReactions})</span>}
          </button>
          
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-[#1e1f22] border border-[#35373c] rounded-lg p-1.5 sm:p-2 flex gap-0.5 sm:gap-1 shadow-lg z-10">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-xl sm:text-2xl hover:scale-125 transition-transform p-0.5 sm:p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply Button */}
        <button
          onClick={toggleReplies}
          className="text-gray-400 hover:text-gray-300 text-xs flex items-center gap-1 hover:bg-[#35373c] px-1.5 sm:px-2 py-1 rounded transition-colors"
        >
          💬 <span className="hidden sm:inline">Reply</span> {replyCount > 0 && <span className="text-gray-500">({replyCount})</span>}
        </button>

        {/* Share to Twitter Button */}
        {wish.ai_reply && (
          <button
            onClick={shareToTwitter}
            className="text-gray-400 hover:text-blue-400 text-xs flex items-center gap-1 hover:bg-[#35373c] px-1.5 sm:px-2 py-1 rounded transition-colors"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="hidden sm:inline">Share</span> {shareCount > 0 && <span className="text-gray-500">({shareCount})</span>}
          </button>
        )}
      </div>

      {/* Reactions Display */}
      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 ml-6 sm:ml-12 mt-2 sm:mt-3">
          {reactions.map((reaction) => {
            const hasReacted = walletAddress && reaction.users.includes(walletAddress);
            return (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                  hasReacted
                    ? 'bg-indigo-600/30 border border-indigo-500/50'
                    : 'bg-[#1e1f22] border border-[#35373c] hover:border-indigo-500/30'
                }`}
                title={`${reaction.count} ${reaction.count === 1 ? 'person' : 'people'} reacted`}
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs text-gray-400">{reaction.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Thread Replies */}
      {showReplies && (
        <div className="ml-6 sm:ml-12 mt-3 sm:mt-4 space-y-2 sm:space-y-3 border-l-2 border-[#35373c] pl-3 sm:pl-4">
          {replyCount > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
              <button
                onClick={() => setShowReplies(false)}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                Hide replies
              </button>
            </div>
          )}
          
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500 flex-shrink-0">
                {reply.avatar.startsWith('data:') || reply.avatar.startsWith('https://') ? (
                  <img src={reply.avatar} alt={reply.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs sm:text-sm">{reply.avatar}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                  <span className="text-white font-medium text-xs">{reply.username}</span>
                  <span className="text-gray-500 text-xs" title={formatRelativeTime(reply.created_at)}>
                    {formatDiscordTimestamp(reply.created_at)}
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{reply.reply_text}</p>
              </div>
            </div>
          ))}

          {/* Typing Indicator for expected mod reply */}
          {expectedModUsername && (() => {
            // Map mod username to correct avatar and role color
            const modInfo = {
              'SantaMod69': { avatar: '🎅', color: 'from-red-500 to-green-500' },
              'xX_Krampus_Xx': { avatar: '😈', color: 'from-red-600 to-gray-800' },
              'elfgirluwu': { avatar: '🧝‍♀️', color: 'from-green-400 to-emerald-500' },
              'FrostyTheCoder': { avatar: '⛄', color: 'from-blue-400 to-cyan-400' },
              'DasherSpeedrun': { avatar: '🦌', color: 'from-amber-600 to-yellow-500' },
              'SantaKumar': { avatar: '🤖', color: 'from-purple-500 to-indigo-500' },
              'JingBells叮噹鈴': { avatar: '🔔', color: 'from-yellow-400 to-amber-500' },
            }[expectedModUsername] || { avatar: '💬', color: 'from-gray-500 to-gray-600' };
            
            return (
              <div className="flex gap-1.5 sm:gap-2 animate-pulse">
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-gradient-to-br ${modInfo.color} flex-shrink-0`}>
                  <span className="text-xs sm:text-sm">{modInfo.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                    <span className="text-white font-medium text-xs">{expectedModUsername}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm italic">
                    <span>{expectedModUsername} is typing</span>
                    <div className="flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Reply Input */}
          <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
            <div className="flex-1 relative">
              <input
                ref={replyInputRef}
                type="text"
                value={replyText}
                onChange={handleReplyTextChange}
                onKeyDown={handleReplyKeyDown}
                placeholder="Write a reply..."
                disabled={!walletAddress || isPostingReply}
                className="w-full bg-[#1e1f22] border border-[#35373c] rounded px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              
              {/* @Mention Autocomplete */}
              {showMentions && (() => {
                const filtered = MODS.filter(mod =>
                  mod.name.toLowerCase().includes(mentionSearch)
                );
                console.log('[Reply @] Rendering autocomplete with', filtered.length, 'mods');
                return (
                  <MentionAutocomplete
                    mentions={filtered}
                    onSelect={handleMentionSelect}
                    position={{ top: 0, left: 0 }}
                    selectedIndex={selectedMentionIndex}
                  />
                );
              })()}
            </div>
            <button
              onClick={handlePostReply}
              disabled={!walletAddress || !replyText.trim() || isPostingReply}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors"
            >
              {isPostingReply ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Show Replies Button (when collapsed and has replies) */}
      {!showReplies && replyCount > 0 && (
        <button
          onClick={toggleReplies}
          className="ml-6 sm:ml-12 mt-2 sm:mt-3 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <span>▼</span> Show {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
        </button>
      )}
    </div>
  );
}
