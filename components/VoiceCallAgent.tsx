'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPersonaConfig } from '@/lib/personas';
import type { Persona } from '@/typings/types';
import { Conversation } from '@elevenlabs/client';

interface VoiceCallAgentProps {
  persona: Persona;
  onClose: () => void;
}

type CallState = 'calling' | 'connecting' | 'connected' | 'ended';

const AGENT_MAP: Record<Persona, string> = {
  santa: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_SANTA!,
  grinch: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_GRINCH!,
  reindeer: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_REINDEER!,
  snowman: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_SNOWMAN!,
  elf: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ELF!,
  scammer: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_SCAMMER!,
};

export default function VoiceCallAgent({ persona, onClose }: VoiceCallAgentProps) {
  const [callState, setCallState] = useState<CallState>('calling');
  const [error, setError] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  
  const ringToneRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationRef = useRef<Conversation | null>(null);

  const modPersona = getPersonaConfig(persona);
  const agentId = AGENT_MAP[persona];

  // Initialize ringtone
  useEffect(() => {
    const audio = new Audio('/sounds/outgoingringtone.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    ringToneRef.current = audio;
    audio.load();
    
    return () => {
      if (ringToneRef.current) {
        ringToneRef.current.pause();
        ringToneRef.current.src = '';
        ringToneRef.current = null;
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // Start call sequence
  useEffect(() => {
    startCallSequence();
  }, []);

  const startCallSequence = async () => {
    try {
      // Request microphone permission first
      console.log('🎤 Requesting microphone permission...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone permission granted');
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('❌ Microphone permission denied:', err);
        setError('Microphone permission required');
        setCallState('ended');
        return;
      }

      // Play ringtone
      if (ringToneRef.current) {
        try {
          ringToneRef.current.currentTime = 0;
          await ringToneRef.current.play();
          console.log('🎵 Ringtone playing');
        } catch (err) {
          console.error('Ringtone play failed:', err);
        }
      }

      console.log('📞 Connecting to ElevenLabs Conversational AI...');
      setCallState('connecting');
      
      // Initialize ElevenLabs Conversation
      const conversation = await Conversation.startSession({
        agentId: agentId,
        connectionType: "websocket",
        onConnect: () => {
          console.log('✅ Connected to agent');
          setCallState('connected');
          
          // Stop ringtone
          if (ringToneRef.current) {
            ringToneRef.current.pause();
            ringToneRef.current.currentTime = 0;
          }
          
          // Start call timer
          callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
        },
        onDisconnect: () => {
          console.log('📴 Disconnected from agent');
          endCall();
        },
        onError: (error) => {
          console.error('❌ Conversation error:', error);
          setError('Connection error');
          endCall();
        },
        onModeChange: (mode) => {
          console.log('🔄 Mode changed:', mode);
          setIsAgentSpeaking(mode.mode === 'speaking');
          setIsSpeaking(mode.mode === 'listening');
        },
      });

      conversationRef.current = conversation;
      
    } catch (err) {
      console.error('Call start error:', err);
      setError('Failed to start call');
      if (ringToneRef.current) {
        ringToneRef.current.pause();
      }
    }
  };

  const endCall = () => {
    // Stop ringtone
    if (ringToneRef.current) {
      ringToneRef.current.pause();
      ringToneRef.current.currentTime = 0;
    }
    
    // End conversation
    if (conversationRef.current) {
      conversationRef.current.endSession();
      conversationRef.current = null;
    }
    
    // Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    setCallState('ended');
    setTimeout(onClose, 500);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calling screen
  if (callState === 'calling' || callState === 'connecting') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1b1e] to-black z-50 flex items-center justify-center p-4">
        <div className="text-center">
          {/* Pulsing rings */}
          <div className="relative mb-12 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute rounded-full bg-green-500/20"
              style={{ width: '240px', height: '240px' }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="absolute rounded-full bg-green-500/30"
              style={{ width: '200px', height: '200px' }}
            />
            
            {/* Avatar */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-8xl shadow-2xl"
            >
              {modPersona.emoji}
            </motion.div>
          </div>

          {/* Calling text */}
          <h2 className="text-4xl font-bold text-white mb-3">{modPersona.name}</h2>
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-gray-400 text-xl mb-12"
          >
            {callState === 'calling' ? 'Calling...' : 'Connecting...'}
          </motion.p>

          {/* Cancel button */}
          <button
            onClick={endCall}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto shadow-lg"
          >
            <span className="text-xl">✕</span> Cancel
          </button>
        </div>
      </div>
    );
  }

  // Connected - Real-time conversation
  return (
    <div className="fixed inset-0 bg-[#1e1f22] z-50 flex flex-col select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Top Bar */}
      <div className="bg-[#313338] px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="text-gray-400 text-xl">🎙️</div>
          <div>
            <h2 className="text-white font-semibold">Voice Call</h2>
            <p className="text-xs text-gray-400">{modPersona.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{formatDuration(callDuration)}</span>
          <button
            onClick={endCall}
            className="text-gray-400 hover:text-white transition p-2"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Center - Avatars */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
        {/* Mod Avatar */}
        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              scale: isAgentSpeaking ? [1, 1.05, 1] : 1,
              boxShadow: isAgentSpeaking 
                ? ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 20px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                : '0 0 0 0 rgba(107, 114, 128, 0.3)'
            }}
            transition={{ duration: 1, repeat: isAgentSpeaking ? Infinity : 0 }}
            className="relative"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl">
              {modPersona.emoji}
            </div>
            
            <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-[#1e1f22] ${
              isAgentSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }`} />
          </motion.div>

          <h1 className="text-white text-2xl sm:text-3xl font-bold mt-4 mb-1">{modPersona.name}</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {isAgentSpeaking ? '🗣️ Speaking...' : '👂 Listening...'}
          </p>
        </div>

        {/* User Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{
              scale: isSpeaking ? [1, 1.08, 1] : 1,
              boxShadow: isSpeaking
                ? ['0 0 0 0 rgba(59, 130, 246, 0.6)', '0 0 0 15px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0)']
                : '0 0 0 0 rgba(107, 114, 128, 0.2)'
            }}
            transition={{ duration: 0.8, repeat: isSpeaking ? Infinity : 0 }}
            className="relative"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl sm:text-4xl shadow-xl">
              👤
            </div>
            
            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#1e1f22] ${
              isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
            }`} />
          </motion.div>

          <p className="text-white text-lg font-semibold mt-2">You</p>
          <p className="text-sm text-gray-400">
            {isSpeaking ? '🎤 Speaking...' : '🤫 Listening'}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 text-red-400 rounded-lg p-3 text-sm max-w-md">
            {error}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#313338] px-4 py-6 border-t border-gray-700">
        <div className="flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </motion.button>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-4 font-medium">
          Real-time conversation - just speak naturally!
        </p>
      </div>
    </div>
  );
}
