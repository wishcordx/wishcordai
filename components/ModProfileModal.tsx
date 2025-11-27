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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, damping: 20, stiffness: 300 }
  }
};

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
    'BarryJingle': { responded: 0, grantRate: 100, favoriteVerdict: 'HELPER' },
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
            <motion.div
              onClick={(e) => e.stopPropagation()}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-b from-[#1e1f2e] to-[#16171f] rounded-2xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl"
            >
              {/* Header with Dynamic Banner */}
              <div className="relative h-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    backgroundSize: '200% 200%',
                  }}
                />
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Avatar & Profile */}
              <div className="px-6 pb-6">
                <motion.div variants={itemVariants} className="relative -mt-16 mb-4">
                  <div className="relative inline-block">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#2a2d3a] to-[#1e1f2e] border-4 border-[#16171f] flex items-center justify-center text-6xl shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                      {personaConfig.emoji}
                    </motion.div>
                    {/* Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-[#16171f] rounded-full px-2.5 py-1 border-2 border-green-500/50">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-bold text-green-400">ONLINE</span>
                    </div>
                  </div>
                </motion.div>

                {/* Name & Role */}
                <motion.div variants={itemVariants} className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    {personaConfig.name}
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                      MODERATOR
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      ⚡ AI POWERED
                    </span>
                  </div>
                </motion.div>

                {/* About Me Section */}
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#2a2d3a] to-[#1e1f2e] rounded-xl p-4 mb-4 border border-white/5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">About</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {personaConfig.systemPrompt?.split('.')[0].replace(/^You are /i, 'I am ') || `I'm ${personaConfig.name}, ready to review your Christmas wishes!`}
                  </p>
                </motion.div>

                {/* Stats Section */}
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#2a2d3a] to-[#1e1f2e] rounded-xl p-4 mb-4 border border-white/5 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Performance Stats</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Wishes Responded</span>
                      </div>
                      <span className="text-sm font-bold text-white bg-white/5 px-3 py-1 rounded-full">{modStats.responded.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Grant Rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${modStats.grantRate}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          />
                        </div>
                        <span className="text-sm font-bold text-green-400">{modStats.grantRate}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Favorite Verdict</span>
                      </div>
                      <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        {modStats.favoriteVerdict}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Call Button */}
                <motion.button
                  variants={itemVariants}
                  onClick={onCall}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 text-sm shadow-lg shadow-green-500/30 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="relative z-10">Start Voice Call</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
