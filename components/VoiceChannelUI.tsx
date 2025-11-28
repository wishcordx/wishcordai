'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '@/lib/voice-context';
import { useState, useEffect } from 'react';
import { AudioVisualizer } from '@livekit/components-react';

interface VoiceChannelUIProps {
  onClose: () => void;
}

export default function VoiceChannelUI({ onClose }: VoiceChannelUIProps) {
  const { currentChannel, participants, isMuted, isDeafened, toggleMute, toggleDeafen, disconnect } = useVoice();
  const [showChat, setShowChat] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  if (!currentChannel) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl h-[80vh] bg-[#1e1f22] rounded-lg overflow-hidden flex flex-col border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="h-14 bg-[#111214] border-b border-white/10 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <div>
                <h2 className="text-white font-semibold text-sm">Voice Connected</h2>
                <p className="text-gray-400 text-xs">{currentChannel}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mobile Chat Toggle */}
              <button
                onClick={() => setShowChat(!showChat)}
                className="lg:hidden p-2 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Participants Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.map((participant) => {
                  const isSpeaking = participant.isSpeaking;
                  const isMicMuted = !participant.isMicrophoneEnabled;
                  
                  return (
                    <motion.div
                      key={participant.identity}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`relative bg-[#2b2d31] rounded-lg p-6 flex flex-col items-center justify-center aspect-video ${
                        isSpeaking ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white mb-3 relative">
                        {participant.name?.charAt(0).toUpperCase() || '?'}
                        
                        {/* Speaking indicator */}
                        {isSpeaking && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-4 border-green-500"
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [1, 0.5, 1],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                            }}
                          />
                        )}
                      </div>

                      {/* Username */}
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{participant.name}</span>
                        {isMicMuted && (
                          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Empty state */}
                {participants.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm">No one else is here yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Sidebar (Desktop) */}
            <div className={`hidden lg:flex w-80 bg-[#2b2d31] border-l border-white/10 flex-col`}>
              <div className="h-12 bg-[#111214] border-b border-white/10 flex items-center px-4">
                <h3 className="text-white font-semibold text-sm">Channel Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-gray-400 text-sm text-center py-8">Chat coming soon...</p>
              </div>
            </div>

            {/* Chat Sidebar (Mobile Overlay) */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="lg:hidden absolute inset-y-0 right-0 w-full sm:w-80 bg-[#2b2d31] border-l border-white/10 flex flex-col z-10"
                >
                  <div className="h-12 bg-[#111214] border-b border-white/10 flex items-center justify-between px-4">
                    <h3 className="text-white font-semibold text-sm">Channel Chat</h3>
                    <button
                      onClick={() => setShowChat(false)}
                      className="p-1 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <p className="text-gray-400 text-sm text-center py-8">Chat coming soon...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Control Bar */}
          <div className="h-16 bg-[#111214] border-t border-white/10 flex items-center justify-center gap-3 px-4">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-lg transition-all ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#2b2d31] hover:bg-[#35373c] text-white'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                {isMuted ? (
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                ) : (
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                )}
              </svg>
            </button>

            {/* Deafen Button */}
            <button
              onClick={toggleDeafen}
              className={`p-3 rounded-lg transition-all ${
                isDeafened
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#2b2d31] hover:bg-[#35373c] text-white'
              }`}
              title={isDeafened ? 'Undeafen' : 'Deafen'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                {isDeafened ? (
                  <path d="M12 4c-3.87 0-7 3.13-7 7v2c0 3.87 3.13 7 7 7s7-3.13 7-7v-2c0-3.87-3.13-7-7-7zm0 12c-2.76 0-5-2.24-5-5v-2c0-2.76 2.24-5 5-5s5 2.24 5 5v2c0 2.76-2.24 5-5 5zM2.81 2.81L1.39 4.22l2.27 2.27C3.24 7.35 3 8.15 3 9v6c0 .55.45 1 1 1h2v-6c0-.77.18-1.5.5-2.15l1.88 1.88c-.15.26-.23.55-.23.85V15c0 .55.45 1 1 1h.22l2.72 2.72c-.69.19-1.41.28-2.16.28-3.87 0-7-3.13-7-7v-2c0-1.21.32-2.35.87-3.34L2.81 2.81zM19 15v-6c0-.82-.15-1.58-.42-2.3l-1.45 1.45c.09.27.14.56.14.85v6h2c.55 0 1-.45 1-1V9c0-1.03-.25-2-.68-2.86L21 4.22 19.61 2.8 4.22 18.19l1.41 1.41L19 6.24c.72.65 1.17 1.59 1.17 2.65v6h2c.55 0 1-.45 1-1V9c0-2.12-.89-4.03-2.32-5.39L19 1.8z"/>
                ) : (
                  <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                )}
              </svg>
            </button>

            {/* Settings Button */}
            <button
              className="p-3 rounded-lg bg-[#2b2d31] hover:bg-[#35373c] text-white transition-all"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all ml-2"
              title="Disconnect"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
