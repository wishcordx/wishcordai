'use client';

import { useState, useEffect } from 'react';
import { RemoteParticipant, LocalParticipant } from 'livekit-client';

interface VoiceParticipantProps {
  participant: RemoteParticipant | LocalParticipant;
  isLocal?: boolean;
  isMuted?: boolean;
}

interface UserProfile {
  username: string;
  avatar: string;
}

export default function VoiceParticipant({ participant, isLocal = false, isMuted = false }: VoiceParticipantProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Try to get username from participant name or identity
        const username = participant.name || participant.identity;
        
        // Fetch profile from Supabase
        const response = await fetch(`/api/members?username=${encodeURIComponent(username)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.members && data.members.length > 0) {
            const member = data.members[0];
            setProfile({
              username: member.username || username,
              avatar: member.avatar || '👤',
            });
          } else {
            // Fallback to participant name
            setProfile({
              username,
              avatar: '👤',
            });
          }
        } else {
          setProfile({
            username,
            avatar: '👤',
          });
        }
      } catch (error) {
        console.error('Error fetching participant profile:', error);
        setProfile({
          username: participant.name || participant.identity,
          avatar: '👤',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [participant.identity, participant.name]);

  const displayName = profile?.username || participant.name || participant.identity;
  const displayAvatar = profile?.avatar || '👤';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${
          participant.isSpeaking 
            ? 'border-4 border-green-400 animate-pulse' 
            : 'border-4 border-transparent'
        } ${
          isLocal 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-500' 
            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
        }`}>
          {displayAvatar && (displayAvatar.startsWith('data:') || displayAvatar.startsWith('https://')) ? (
            <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">{displayAvatar}</span>
          )}
        </div>
        
        {/* Muted Indicator */}
        {isMuted && (
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#1e1f2e]">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </div>
        )}

        {/* Speaking Indicator */}
        {participant.isSpeaking && (
          <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping" />
        )}
      </div>
      
      <div className="text-center">
        <p className="text-sm font-semibold text-white truncate max-w-[100px]">
          {displayName}
        </p>
        <p className="text-xs text-green-400">{isLocal ? 'You' : 'Voice'}</p>
      </div>
    </div>
  );
}
