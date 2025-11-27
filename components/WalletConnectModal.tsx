'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/lib/wallet-context';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connectWallet, isConnecting } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    try {
      await connectWallet();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1e1f2e] rounded-xl shadow-2xl w-full max-w-md border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-slate-300 text-center mb-6">
                  Connect your Solana wallet to access all features
                </p>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Wallet Options */}
                <div className="space-y-3">
                  {/* Phantom */}
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full flex items-center gap-4 p-4 bg-[#11121c] hover:bg-white/5 border border-white/10 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src="/assets/phantom.webp" alt="Phantom" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-semibold">Phantom</p>
                      <p className="text-xs text-slate-400">
                        {isMobile ? 'Open in Phantom app' : 'Browser extension'}
                      </p>
                    </div>
                    {isConnecting ? (
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Info Text */}
                <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <p className="text-xs text-slate-400 text-center">
                    {isMobile ? (
                      <>
                        <span className="text-indigo-400 font-semibold">Mobile users:</span> You'll be redirected to your Phantom wallet app. Make sure you have it installed.
                      </>
                    ) : (
                      <>
                        <span className="text-indigo-400 font-semibold">New to Solana?</span> Install Phantom wallet extension from{' '}
                        <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                          phantom.app
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-[#11121c] hover:bg-white/5 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
