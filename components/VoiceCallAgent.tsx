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
  jingbells: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_JINGBELLS!,
  barry: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_BARRY!,
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
      console.log('🎤 Starting call for persona:', persona);
      console.log('📋 Agent ID:', agentId);
      
      // Check if agent ID exists
      if (!agentId || agentId === 'undefined') {
        console.error('❌ Agent ID is missing or undefined for persona:', persona);
        setError(`Agent ID not configured for ${persona}. Please check environment variables.`);
        setCallState('ended');
        return;
      }

      // Request microphone permission first
      console.log('🎤 Requesting microphone permission...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone permission granted');
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('❌ Microphone permission denied:', err);
        setError('Microphone permission required. Please allow microphone access.');
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
      console.log('Using agent ID:', agentId);
      setCallState('connecting');
      
      // Initialize ElevenLabs Conversation
      const conversation = await Conversation.startSession({
        agentId: agentId,
        connectionType: "websocket",
        onConnect: () => {
          console.log('✅ Connected to agent:', persona);
          setCallState('connected');
          setError(''); // Clear any errors
          
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
          setError(typeof error === 'string' ? error : 'Connection error');
          endCall();
        },
        onModeChange: (mode) => {
          console.log('🔄 Mode changed:', mode);
          setIsAgentSpeaking(mode.mode === 'speaking');
          setIsSpeaking(mode.mode === 'listening');
        },
      });

      conversationRef.current = conversation;
      console.log('✅ Conversation session started successfully');
      
    } catch (err: any) {
      console.error('❌ Call start error:', err);
      const errorMsg = err?.message || 'Failed to start call. Please try again.';
      setError(errorMsg);
      setCallState('ended');
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
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a0b10] via-[#111318] to-[#1a1b24] z-50 flex flex-col select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Top Bar - Clean and minimal */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-white/80 text-sm font-medium">Voice Call</span>
        </div>
        <button
          onClick={endCall}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Content - Centered Avatars */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Mod Avatar - Main Focus */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative mb-6">
            {/* Subtle glow effect when speaking */}
            {isAgentSpeaking && (
              <motion.div
                animate={{ 
                  scale: [1, 1.15],
                  opacity: [0.4, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 rounded-full bg-green-400 blur-2xl"
              />
            )}
            
            <motion.div
              animate={{
                scale: isAgentSpeaking ? [1, 1.02, 1] : 1
              }}
              transition={{ duration: 2, repeat: isAgentSpeaking ? Infinity : 0 }}
              className="relative"
            >
              {/* Main avatar circle */}
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-8xl shadow-2xl ring-4 ring-white/5">
                {modPersona.emoji}
              </div>
              
              {/* Status indicator */}
              <motion.div 
                animate={{ scale: isAgentSpeaking ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1, repeat: isAgentSpeaking ? Infinity : 0 }}
                className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-[#0a0b10] flex items-center justify-center ${
                  isAgentSpeaking ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                {isAgentSpeaking && (
                  <motion.div
                    animate={{ scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Name and status */}
          <h1 className="text-white text-3xl font-bold mb-2">{modPersona.name}</h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isAgentSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <p className="text-white/60 text-base">
              {isAgentSpeaking ? 'Speaking...' : 'Listening'}
            </p>
          </div>
        </div>

        {/* User Avatar - Smaller, bottom */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10"
        >
          <div className="relative">
            {/* Subtle glow when speaking */}
            {isSpeaking && (
              <motion.div
                animate={{ 
                  scale: [1, 1.2],
                  opacity: [0.5, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 rounded-full bg-blue-400 blur-xl"
              />
            )}
            
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/10">
              👤
            </div>
            
            {/* Mic indicator */}
            {isSpeaking && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-[#0a0b10] flex items-center justify-center"
              >
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                </svg>
              </motion.div>
            )}
          </div>
          
          <div>
            <p className="text-white font-semibold text-sm">You</p>
            <p className="text-white/50 text-xs">
              {isSpeaking ? 'Speaking' : 'Listening'}
            </p>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm max-w-md text-center"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* Bottom Control Bar - Clean and centered */}
      <div className="px-6 py-6 flex flex-col items-center gap-4">
        {/* Call duration */}
        <div className="text-white/40 text-sm font-mono">
          {formatDuration(callDuration)}
        </div>
        
        {/* End call button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={endCall}
          className="group relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-red-500 blur-xl opacity-30 group-hover:opacity-50 transition"></div>
          
          {/* Button */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center shadow-2xl transition-all">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </div>
        </motion.button>
        
        {/* Hint text */}
        <p className="text-white/40 text-xs text-center max-w-xs">
          Speak naturally when you see the microphone icon
        </p>
      </div>
    </div>
  );
}
