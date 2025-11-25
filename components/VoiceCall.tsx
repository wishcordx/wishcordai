'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPersonaConfig } from '@/lib/personas';
import type { Persona } from '@/typings/types';

interface VoiceCallProps {
  persona: Persona;
  onClose: () => void;
}

type CallState = 'calling' | 'connecting' | 'ai-speaking' | 'listening' | 'processing' | 'ended';

export default function VoiceCall({ persona, onClose }: VoiceCallProps) {
  const [callState, setCallState] = useState<CallState>('calling');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>('');
  const [callDuration, setCallDuration] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPushingToTalk, setIsPushingToTalk] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationHistoryRef = useRef<string>('');
  const ringToneRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get persona config directly
  const modPersona = getPersonaConfig(persona);

  const callStartedRef = useRef(false);

  // Initialize ringtone
  useEffect(() => {
    const audio = new Audio('/sounds/outgoingringtone.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    ringToneRef.current = audio;
    
    // Preload the audio
    audio.load();
    
    // Create a pre-initialized audio element for AI responses (mobile Safari fix)
    const preloadedAudio = new Audio();
    preloadedAudio.preload = 'auto';
    preloadedAudio.setAttribute('playsinline', 'true');
    preloadedAudioRef.current = preloadedAudio;
    console.log('🎵 Pre-initialized audio element for mobile Safari');
    
    return () => {
      if (ringToneRef.current) {
        ringToneRef.current.pause();
        ringToneRef.current.src = '';
        ringToneRef.current = null;
      }
      if (preloadedAudioRef.current) {
        preloadedAudioRef.current.pause();
        preloadedAudioRef.current.src = '';
        preloadedAudioRef.current = null;
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // Start call sequence with calling state
  useEffect(() => {
    if (!callStartedRef.current) {
      callStartedRef.current = true;
      startCallSequence();
    }
  }, []);

  const startCallSequence = async () => {
    try {
      console.log('🔔 Starting ringtone...');
      // Play ringtone and keep playing until AI responds
      if (ringToneRef.current) {
        try {
          // Reset and play
          ringToneRef.current.currentTime = 0;
          const playPromise = ringToneRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('🎵 Ringtone playing successfully');
          }
        } catch (err) {
          console.error('❌ Ringtone play failed:', err);
          // If autoplay is blocked, user interaction might be needed
          // But since this is triggered by a button click, it should work
        }
      }

      console.log('📞 Initiating call to AI...');
      // Start actual call - ringtone will keep playing
      await startCall();
      
      console.log('✅ AI responded, stopping ringtone');
      // Stop ringtone after AI responds
      if (ringToneRef.current) {
        ringToneRef.current.pause();
        ringToneRef.current.currentTime = 0;
      }
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Call sequence error:', err);
      setError('Failed to connect call');
      if (ringToneRef.current) {
        ringToneRef.current.pause();
      }
    }
  };

  const startCall = async () => {
    try {
      // Keep calling state while waiting for AI
      
      // AI initiates the conversation
      const response = await fetch('/api/voice/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: persona,
          userMessage: 'START_CALL',
          conversationHistory: '',
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Now we can transition to connecting state
        setCallState('connecting');
        
        setTranscript(prev => [...prev, `${modPersona.name}: ${data.text}`]);
        conversationHistoryRef.current += `${modPersona.name}: ${data.text}\n`;
        
        // Play AI audio
        await playAudio(data.audio);
        
        // Now start listening for user
        setCallState('listening');
        startListening();
      }
    } catch (err) {
      console.error('Call start error:', err);
      setError('Failed to start call');
    }
  };

  const playAudio = async (base64Audio: string) => {
    setCallState('ai-speaking');
    
    try {
      console.log('🎵 Starting audio playback, base64 length:', base64Audio.length);
      
      // Use the pre-initialized audio element (created during user interaction)
      const audio = preloadedAudioRef.current || new Audio();
      
      // Set source to data URL
      const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;
      audio.src = dataUrl;
      audio.load();
      
      console.log('🎵 Audio element updated with new source');
      
      currentAudioRef.current = audio;
      
      return new Promise<void>((resolve, reject) => {
        let hasResolved = false;
        
        const cleanup = () => {
          if (!hasResolved) {
            hasResolved = true;
            currentAudioRef.current = null;
          }
        };
        
        audio.onended = () => {
          console.log('✅ Audio playback completed');
          cleanup();
          resolve();
        };
        
        audio.onerror = (e) => {
          console.error('❌ Audio playback error:', e, audio.error);
          cleanup();
          resolve(); // Resolve anyway to continue conversation
        };
        
        // Try to play
        audio.play()
          .then(() => {
            console.log('🎵 Audio playing successfully');
          })
          .catch(err => {
            console.error('❌ Audio play failed:', err);
            cleanup();
            resolve(); // Resolve anyway to continue conversation
          });
      });
    } catch (err) {
      console.error('Audio setup error:', err);
      throw err;
    }
  };

  const base64ToBlob = (base64: string, mimeType: string) => {
    try {
      // Remove any data URL prefix if present
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (err) {
      console.error('❌ Base64 decode error:', err);
      throw err;
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setCallState('listening');
      console.log('🎤 Ready to record - Press and hold the mic button');
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Could not access microphone. Use text input.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current || isRecording || callState !== 'listening') return;
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setCallState('processing');
        setIsSpeaking(false);
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsSpeaking(true);
      console.log('🎤 Recording started');
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsSpeaking(false);
      console.log('🛑 Recording stopped');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Transcribe user audio
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const transcribeResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      const transcribeData = await transcribeResponse.json();
      if (!transcribeData.success) {
        throw new Error('Transcription failed');
      }

      const userText = transcribeData.text;
      await processText(userText);
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong');
      setCallState('listening');
    }
  };

  const processText = async (userText: string) => {
    try {
      setTranscript(prev => [...prev, `You: ${userText}`]);
      conversationHistoryRef.current += `User: ${userText}\n`;

      // Get AI response
      const respondResponse = await fetch('/api/voice/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: persona,
          userMessage: userText,
          conversationHistory: conversationHistoryRef.current,
        }),
      });

      const respondData = await respondResponse.json();
      if (respondData.success) {
        setTranscript(prev => [...prev, `${modPersona.name}: ${respondData.text}`]);
        conversationHistoryRef.current += `${modPersona.name}: ${respondData.text}\n`;
        
        console.log('🎵 AI response received, audio length:', respondData.audio?.length || 0);
        
        // Play AI response
        if (respondData.audio) {
          try {
            await playAudio(respondData.audio);
            console.log('✅ Audio playback completed');
          } catch (err) {
            console.error('❌ Audio playback error:', err);
          }
        } else {
          console.warn('⚠️ No audio in response');
        }
        
        // Continue listening
        setCallState('listening');
        startListening();
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong');
      setCallState('listening');
    }
  };

  const endCall = () => {
    // Stop ringtone if still playing
    if (ringToneRef.current) {
      ringToneRef.current.pause();
      ringToneRef.current.currentTime = 0;
    }
    
    // Stop any AI audio that's currently playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setCallState('ended');
    setTimeout(onClose, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calling screen (with ringing animation)
  if (callState === 'calling') {
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
            Calling...
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

  return (
    <div className="fixed inset-0 bg-[#1e1f22] z-50 flex flex-col">
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

      {/* Center - Avatars and Status */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
        {/* Mod Avatar with Speaking Animation */}
        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              scale: callState === 'ai-speaking' ? [1, 1.05, 1] : 1,
              boxShadow: callState === 'ai-speaking' 
                ? ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 20px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                : '0 0 0 0 rgba(107, 114, 128, 0.3)'
            }}
            transition={{ duration: 1, repeat: callState === 'ai-speaking' ? Infinity : 0 }}
            className="relative"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl">
              {modPersona.emoji}
            </div>
            
            {/* Status Indicator */}
            <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-[#1e1f22] ${
              callState === 'ai-speaking' ? 'bg-green-500 animate-pulse' :
              callState === 'processing' ? 'bg-yellow-500 animate-pulse' :
              'bg-gray-500'
            }`} />
          </motion.div>

          {/* Name and Status */}
          <h1 className="text-white text-2xl sm:text-3xl font-bold mt-4 mb-1">{modPersona.name}</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {callState === 'ai-speaking' && '🗣️ Speaking...'}
            {callState === 'listening' && '👂 Listening...'}
            {callState === 'processing' && '💭 Thinking...'}
            {callState === 'connecting' && '📞 Connecting...'}
          </p>
        </div>

        {/* User Avatar (You) - Only show when listening */}
        {callState === 'listening' && (
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
              
              {/* Speaking Indicator */}
              <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#1e1f22] ${
                isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
              }`} />
            </motion.div>

            <p className="text-white text-lg font-semibold mt-2">You</p>
            <p className="text-sm text-gray-400">
              {isSpeaking ? '🎤 Recording...' : '⏸️ Ready'}
            </p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm max-w-md">
            {error}
          </div>
        )}

        {/* Hidden text input for testing (desktop only) */}
        {!error && (
          <div className="hidden sm:flex gap-2 max-w-md w-full">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && textInput.trim() && callState === 'listening') {
                  setCallState('processing');
                  processText(textInput.trim());
                  setTextInput('');
                }
              }}
              placeholder="Type to test (optional)..."
              className="flex-1 bg-[#313338] text-white text-sm px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              disabled={callState !== 'listening'}
            />
          </div>
        )}
      </div>

      {/* Bottom Bar - Controls */}
      <div className="bg-[#313338] px-4 py-6 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          {/* Push to Talk Button */}
          {callState === 'listening' && (
            <motion.button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-16 h-16 rounded-full ${
                isRecording 
                  ? 'bg-red-600 animate-pulse' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white flex items-center justify-center shadow-lg transition`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </motion.button>
          )}

          {/* Processing indicator */}
          {callState === 'processing' && (
            <div className="w-16 h-16 rounded-full bg-yellow-600 text-white flex items-center justify-center shadow-lg">
              <div className="animate-spin">⏳</div>
            </div>
          )}

          {/* End Call Button */}
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
          {callState === 'listening' && !isRecording && '👇 Hold mic button to talk'}
          {callState === 'listening' && isRecording && '🔴 Recording... Release to send'}
          {callState === 'processing' && 'Processing...'}
        </p>
      </div>
    </div>
  );
}
