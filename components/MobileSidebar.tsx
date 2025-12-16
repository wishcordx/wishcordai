'use client';

import { motion, AnimatePresence } from 'framer-motion';
import MembersList from './MembersList';
import type { Persona } from '@/typings/types';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onModClick: (persona: Persona) => void;
  totalMessages: number;
}

export default function MobileSidebar({ isOpen, onClose, onModClick, totalMessages }: MobileSidebarProps) {
  const mods = [
    { name: 'BarryJingle', emoji: '🎄', role: 'Helper', color: 'text-green-400', persona: 'barry' as Persona },
    { name: 'SantaMod69', emoji: '🎅', role: 'Mod', color: 'text-red-400', persona: 'santa' as Persona },
    { name: 'xX_Krampus_Xx', emoji: '💀', role: 'Mod', color: 'text-purple-400', persona: 'grinch' as Persona },
    { name: 'elfgirluwu', emoji: '🧝', role: 'Mod', color: 'text-pink-400', persona: 'elf' as Persona },
    { name: 'FrostyTheCoder', emoji: '☃️', role: 'Mod', color: 'text-cyan-400', persona: 'snowman' as Persona },
    { name: 'DasherSpeedrun', emoji: '🦌', role: 'Mod', color: 'text-orange-400', persona: 'reindeer' as Persona },
    { name: 'SantaKumar', emoji: '🕉️', role: 'Scammer', color: 'text-yellow-400', persona: 'scammer' as Persona },
    { name: 'JingBells叮噹鈴', emoji: '🔔', role: 'Mod', color: 'text-red-400', persona: 'jingbells' as Persona },
  ];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-[#1e1f22] border-l border-[#0f1011] z-50 overflow-y-auto lg:hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#1e1f22] border-b border-[#0f1011] z-10">
              <div className="p-4 flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Menu</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation Links */}
              <div className="px-4 pb-4 space-y-2">
                <a
                  href="/about"
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#202225] rounded-lg transition-colors w-full"
                >
                  <span className="text-xl">ℹ️</span>
                  <span>About</span>
                </a>
                <a
                  href="/how-it-works"
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#202225] rounded-lg transition-colors w-full"
                >
                  <span className="text-xl">❓</span>
                  <span>How It Works</span>
                </a>
                <a
                  href="/wishtoken"
                  className="flex items-center gap-2 px-3 py-2 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors w-full font-medium"
                >
                  <span className="text-xl">💰</span>
                  <span>$CORD Token</span>
                </a>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Server Info Header */}
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide text-gray-400">Server Info</h3>
              
              {/* Mods Section */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Mods Online — 8
                </h3>
                <div className="space-y-3">
                  {mods.map((mod) => (
                    <div
                      key={mod.name}
                      onClick={() => {
                        onModClick(mod.persona);
                        onClose();
                      }}
                      className="flex items-center gap-3 p-2 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
                    >
                      <div className="relative">
                        <span className="text-2xl">{mod.emoji}</span>
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2b2d31]"></span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${mod.color}`}>{mod.name}</p>
                        <p className="text-xs text-gray-500">{mod.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server Stats */}
              <div className="mb-6 pt-4 border-t border-[#1e1f22]">
                <p className="text-xs text-gray-500 mb-2">Server Stats</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Total Messages</span>
                    <span className="text-white font-medium">{totalMessages}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white font-medium">Nov 2025</span>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <MembersList />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
