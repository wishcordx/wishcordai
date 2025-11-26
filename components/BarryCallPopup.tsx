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
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -200, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4"
        >
          <div className="bg-gradient-to-br from-[#2b2d31] to-[#1e1f22] rounded-2xl shadow-2xl border-2 border-green-500/50 backdrop-blur-xl overflow-hidden">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 animate-pulse" />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Header with animated icon */}
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={isRinging ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl shadow-lg">
                    🎅
                  </div>
                  {/* Pulsing ring */}
                  {isRinging && (
                    <motion.div
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full border-4 border-green-400"
                    />
                  )}
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">BarryJingle</h3>
                    <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full text-xs text-green-400 font-medium">
                      Helper
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Incoming voice call...</p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-black/30 rounded-lg p-3 mb-4 border border-white/10">
                <p className="text-sm text-gray-300">
                  <span className="text-green-400">Barry</span> wants to give you a quick tour of WishCord! 🎄
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReject}
                  className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 rounded-xl text-white font-semibold transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">📵</span>
                    Decline
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-semibold shadow-lg transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">📞</span>
                    Accept
                  </span>
                </motion.button>
              </div>

              {/* Small disclaimer */}
              <p className="text-xs text-gray-500 text-center mt-3">
                Don't worry, you can call Barry anytime from the mods list!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
