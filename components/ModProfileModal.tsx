'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PERSONAS } from '@/lib/personas';
import type { Persona } from '@/typings/types';

interface ModProfileModalProps {
  isOpen: boolean;
  persona: Persona;
  onClose: () => void;
  onCall: () => void;
}

export default function ModProfileModal({ isOpen, persona, onClose, onCall }: ModProfileModalProps) {
  const personaConfig = PERSONAS[persona];

  if (!personaConfig) return null;

  const stats = {
    'SantaMod69': { responded: 1247, grantRate: 45, favoriteVerdict: 'GRANTED' },
    'xX_Krampus_Xx': { responded: 2103, grantRate: 12, favoriteVerdict: 'COAL' },
    'elfgirluwu': { responded: 1856, grantRate: 67, favoriteVerdict: 'GRANTED' },
    'FrostyTheCoder': { responded: 1634, grantRate: 38, favoriteVerdict: 'PENDING' },
    'DasherSpeedrun': { responded: 1923, grantRate: 51, favoriteVerdict: 'GRANTED' },
    'SantaKumar': { responded: 892, grantRate: 8, favoriteVerdict: 'DENIED' },
    'JingBells叮噹鈴': { responded: 1523, grantRate: 88, favoriteVerdict: 'GRANTED' },
  };

  const modStats = stats[personaConfig.name as keyof typeof stats] || { responded: 0, grantRate: 0, favoriteVerdict: 'PENDING' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1e1f22] rounded-lg border border-[#0f1011] w-full max-w-md overflow-hidden"
            >
              {/* Header with Banner */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 h-24 relative">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1e1f22]/80 hover:bg-[#1e1f22] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Avatar */}
              <div className="px-6 pb-6">
                <div className="relative -mt-16 mb-4">
                  <div className="w-24 h-24 rounded-full bg-[#1e1f22] border-8 border-[#1e1f22] flex items-center justify-center text-5xl">
                    {personaConfig.emoji}
                  </div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#1e1f22]"></div>
                </div>

                {/* Name & Role */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">{personaConfig.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-600/30">
                      MOD
                    </span>
                    <span className="text-sm text-gray-400">● Online</span>
                  </div>
                </div>

                {/* About Me */}
                <div className="bg-[#202225] rounded-lg p-4 mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">About Me</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {personaConfig.systemPrompt?.split('.')[0].replace(/^You are /i, 'I am ') || `I'm ${personaConfig.name}, ready to review your Christmas wishes!`}
                  </p>
                </div>

                {/* Stats */}
                <div className="bg-[#202225] rounded-lg p-4 mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Mod Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Wishes Responded</span>
                      <span className="text-sm font-bold text-white">{modStats.responded.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Grant Rate</span>
                      <span className="text-sm font-bold text-green-400">{modStats.grantRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Favorite Verdict</span>
                      <span className="text-sm font-bold text-indigo-400">{modStats.favoriteVerdict}</span>
                    </div>
                  </div>
                </div>

                {/* Call Button */}
                <button
                  onClick={onCall}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  📞 Call {personaConfig.name}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
