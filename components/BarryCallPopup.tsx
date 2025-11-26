'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BarryCallPopupProps {
  onAccept: () => void;
  onReject: () => void;
}

export default function BarryCallPopup({ onAccept, onReject }: BarryCallPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setIsRinging(false);
    setIsVisible(false);
    setTimeout(onAccept, 300);
  };

  const handleReject = () => {
    setIsRinging(false);
    setIsVisible(false);
    setTimeout(onReject, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={handleReject}
          />

          {/* Centered popup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[95vw] max-w-lg"
          >
            <div className="relative bg-[#1a1d21] rounded-3xl shadow-2xl border border-green-500/30 overflow-hidden">
              {/* Animated glow border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 animate-pulse pointer-events-none" />
              
              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />
              
              {/* Content */}
              <div className="relative p-6 sm:p-8">
                {/* Avatar and Info Section */}
                <div className="flex flex-col items-center text-center mb-6">
                  {/* Animated avatar with rings */}
                  <motion.div
                    animate={isRinging ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    className="relative mb-4"
                  >
                    {/* Outer pulsing rings */}
                    {isRinging && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                          className="absolute inset-0 rounded-full bg-green-500/40 blur-md"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                          className="absolute inset-0 rounded-full bg-green-400/40 blur-md"
                        />
                      </>
                    )}
                    
                    {/* Avatar circle */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 flex items-center justify-center shadow-2xl ring-4 ring-green-500/20">
                      <span className="text-5xl sm:text-6xl">🎄</span>
                      
                      {/* Online indicator */}
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-[#1a1d21] shadow-lg">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-full h-full rounded-full bg-green-300"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Name and status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white">BarryJingle</h3>
                      <span className="px-2.5 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-xs font-semibold text-green-400">
                        HELPER
                      </span>
                    </div>
                    
                    {/* Animated calling status */}
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex items-center justify-center gap-2 text-green-400"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm font-medium">Incoming voice call...</span>
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </motion.div>
                  </div>
                </div>

                {/* Message card */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl p-4 mb-6 border border-green-500/20">
                  <p className="text-center text-white/90 leading-relaxed">
                    <span className="font-semibold text-green-400">Barry</span> wants to give you a <span className="font-medium text-green-300">quick tour</span> of WishCord! 🎄✨
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReject}
                    className="flex-1 px-6 py-4 bg-[#2b2d31] hover:bg-[#35373c] border border-red-500/30 hover:border-red-500/50 rounded-2xl text-white font-semibold transition-all shadow-lg group"
                  >
                    <span className="flex items-center justify-center gap-2.5">
                      <span className="text-2xl group-hover:scale-110 transition-transform">📵</span>
                      <span className="text-base">Decline</span>
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAccept}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl text-white font-bold shadow-xl shadow-green-500/30 transition-all group"
                  >
                    <span className="flex items-center justify-center gap-2.5">
                      <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                      <span className="text-base">Accept</span>
                    </span>
                  </motion.button>
                </div>

                {/* Footer note */}
                <p className="text-xs text-gray-500 text-center mt-5">
                  💡 You can call Barry anytime from the mods list
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
