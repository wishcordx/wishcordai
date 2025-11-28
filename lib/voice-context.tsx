'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant } from 'livekit-client';

interface VoiceContextType {
  room: Room | null;
  isConnected: boolean;
  currentChannel: string | null;
  participants: (LocalParticipant | RemoteParticipant)[];
  isMuted: boolean;
  isDeafened: boolean;
  connectToChannel: (channelName: string) => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [participants, setParticipants] = useState<(LocalParticipant | RemoteParticipant)[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const connectToChannel = async (channelName: string) => {
    try {
      // Get user profile
      const profileData = localStorage.getItem('userProfile');
      const profile = profileData ? JSON.parse(profileData) : null;
      const username = profile?.username || 'Anonymous';

      // Get token from backend
      const response = await fetch(`/api/livekit?room=${channelName}&username=${username}`);
      const data = await response.json();

      if (!data.token) {
        throw new Error('Failed to get token');
      }

      // Create room instance
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Set up event listeners
      const updateParticipantsList = () => {
        const remotes = Array.from(newRoom.remoteParticipants.values());
        setParticipants(remotes);
      };
      
      newRoom.on(RoomEvent.ParticipantConnected, updateParticipantsList);
      newRoom.on(RoomEvent.ParticipantDisconnected, updateParticipantsList);
      newRoom.on(RoomEvent.LocalTrackPublished, updateParticipantsList);
      newRoom.on(RoomEvent.LocalTrackUnpublished, updateParticipantsList);
      
      newRoom.on(RoomEvent.Connected, () => {
        console.log('✅ Connected to voice channel:', channelName);
        setIsConnected(true);
        setCurrentChannel(channelName);
        updateParticipantsList();
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        console.log('❌ Disconnected from voice channel');
        setIsConnected(false);
        setCurrentChannel(null);
        setParticipants([]);
      });

      // Connect to LiveKit room
      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || '', data.token);

      // Enable microphone
      await newRoom.localParticipant.setMicrophoneEnabled(true);

      setRoom(newRoom);
      updateParticipantsList();
    } catch (error) {
      console.error('Failed to connect to voice channel:', error);
      throw error;
    }
  };

  const disconnect = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setCurrentChannel(null);
      setParticipants([]);
      setIsMuted(false);
      setIsDeafened(false);
    }
  };

  const toggleMute = async () => {
    if (room?.localParticipant) {
      const newMutedState = !isMuted;
      await room.localParticipant.setMicrophoneEnabled(!newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const toggleDeafen = async () => {
    if (room) {
      const newDeafenedState = !isDeafened;
      
      // Control audio element volume for remote tracks
      room.remoteParticipants.forEach((participant) => {
        participant.audioTrackPublications.forEach((publication) => {
          if (publication.audioTrack && publication.audioTrack.attachedElements.length > 0) {
            // Set volume on HTML audio elements
            publication.audioTrack.attachedElements.forEach((element) => {
              if (element instanceof HTMLAudioElement) {
                element.volume = newDeafenedState ? 0 : 1;
              }
            });
          }
        });
      });

      setIsDeafened(newDeafenedState);
      
      // If deafening, also mute microphone
      if (newDeafenedState && !isMuted) {
        await toggleMute();
      }
    }
  };



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return (
    <VoiceContext.Provider
      value={{
        room,
        isConnected,
        currentChannel,
        participants,
        isMuted,
        isDeafened,
        connectToChannel,
        disconnect,
        toggleMute,
        toggleDeafen,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}
