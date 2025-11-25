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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationHistoryRef = useRef<string>('');
  const ringToneRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);

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
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Could not access microphone');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setCallState('processing');
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2b2d31] rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl">
              {modPersona.emoji}
            </div>
            <div>
              <h2 className="text-white font-bold">{modPersona.name}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  callState === 'ai-speaking' ? 'bg-green-500 animate-pulse' :
                  callState === 'listening' ? 'bg-yellow-500 animate-pulse' :
                  callState === 'processing' ? 'bg-blue-500 animate-pulse' :
                  'bg-gray-500'
                }`} />
                <span className="text-gray-400 text-sm">
                  {callState === 'connecting' && 'Connecting...'}
                  {callState === 'ai-speaking' && 'Speaking...'}
                  {callState === 'listening' && 'Listening...'}
                  {callState === 'processing' && 'Thinking...'}
                  {callState === 'ended' && 'Call ended'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">{formatDuration(callDuration)}</span>
            <button
              onClick={endCall}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-[#1e1f22] rounded-lg p-4 mb-4 h-64 overflow-y-auto">
          {transcript.length === 0 ? (
            <p className="text-gray-500 text-center">Starting call...</p>
          ) : (
            transcript.map((line, i) => (
              <p key={i} className={`mb-2 ${line.startsWith('You:') ? 'text-blue-400' : 'text-green-400'}`}>
                {line}
              </p>
            ))
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-3">
          {/* Text Input for Testing */}
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && textInput.trim() && callState !== 'processing') {
                  setCallState('processing');
                  processText(textInput.trim());
                  setTextInput('');
                }
              }}
              placeholder="Type message for testing..."
              className="flex-1 bg-[#1e1f22] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              disabled={callState === 'processing' || callState === 'ended'}
            />
            <button
              onClick={() => {
                if (textInput.trim()) {
                  setCallState('processing');
                  processText(textInput.trim());
                  setTextInput('');
                }
              }}
              disabled={!textInput.trim() || callState === 'processing' || callState === 'ended'}
              className="px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
            >
              Send
            </button>
          </div>

          {callState === 'listening' && (
            <button
              onClick={stopListening}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              Stop Recording
            </button>
          )}
          
          {(callState === 'ai-speaking' || callState === 'processing') && (
            <button
              disabled
              className="flex-1 bg-gray-600 text-gray-400 font-bold py-3 rounded-lg cursor-not-allowed"
            >
              {callState === 'processing' ? 'Processing...' : 'AI Speaking...'}
            </button>
          )}

          <button
            onClick={endCall}
            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
          >
            End Call
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-4">
          {callState === 'listening' ? '🎤 Speak now, then click "Stop Recording"' : 'Type to test or use voice'}
        </p>
      </div>
    </div>
  );
}
