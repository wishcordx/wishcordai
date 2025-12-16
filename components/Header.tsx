'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet-context';
import ProfileDropdown from './ProfileDropdown';
import ProfileSetupModal from './ProfileSetupModal';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps = {}) {
  const { walletAddress, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [profileKey, setProfileKey] = useState(0);

  // Check if user has completed profile setup
  useEffect(() => {
    if (walletAddress) {
      const profile = localStorage.getItem('userProfile');
      const profileData = profile ? JSON.parse(profile) : null;
      
      // Show setup modal if wallet connected but profile not set up
      if (!profileData || !profileData.setupCompleted || profileData.walletAddress !== walletAddress) {
        setShowSetupModal(true);
      }
    }
  }, [walletAddress]);

  const handleCloseModal = () => {
    setShowSetupModal(false);
    setProfileKey(prev => prev + 1); // Force ProfileDropdown to reload
  };

  return (
    <header className="border-b border-[#1e1f22] bg-[#313338]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-hidden">
              <img src="/assets/logo.webp" alt="WCordAI" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">
                WCordAI
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">5 mods online</p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-3 text-sm">
            {/* About Link */}
            <Link
              href="/about"
              className="hidden md:block relative border-none bg-transparent p-0 outline-none cursor-pointer"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-black/25 rounded-lg translate-y-[2px] transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:translate-y-[4px] hover:duration-[250ms] active:translate-y-[1px] active:duration-[34ms]"></span>
              <span className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-l from-[#232428] via-[#35373c] to-[#232428]"></span>
              <span className="relative flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#2b2d31] rounded-lg -translate-y-1 transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:-translate-y-[6px] hover:duration-[250ms] active:-translate-y-[2px] active:duration-[34ms] select-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>About</span>
              </span>
            </Link>

            {/* How It Works Link */}
            <Link
              href="/how-it-works"
              className="hidden md:block relative border-none bg-transparent p-0 outline-none cursor-pointer"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-black/25 rounded-lg translate-y-[2px] transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:translate-y-[4px] hover:duration-[250ms] active:translate-y-[1px] active:duration-[34ms]"></span>
              <span className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-l from-[#232428] via-[#35373c] to-[#232428]"></span>
              <span className="relative flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#2b2d31] rounded-lg -translate-y-1 transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:-translate-y-[6px] hover:duration-[250ms] active:-translate-y-[2px] active:duration-[34ms] select-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>How It Works</span>
              </span>
            </Link>

            {/* $WISH Token Button */}
            <Link
              href="/wishtoken"
              className="hidden sm:block relative border-none bg-transparent p-0 outline-none cursor-pointer"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-black/25 rounded-lg translate-y-[2px] transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:translate-y-[4px] hover:duration-[250ms] active:translate-y-[1px] active:duration-[34ms]"></span>
              <span className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-l from-[#232428] via-[#35373c] to-[#232428]"></span>
              <span className="relative flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-[#2b2d31] rounded-lg -translate-y-1 transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:-translate-y-[6px] hover:duration-[250ms] active:-translate-y-[2px] active:duration-[34ms] select-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>$WISH</span>
              </span>
            </Link>

            {/* Wallet Connection */}
            {walletAddress ? (
              <ProfileDropdown 
                key={profileKey}
                onDisconnect={disconnectWallet} 
                onOpenSetup={() => setShowSetupModal(true)}
              />
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="relative border-none bg-transparent p-0 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-black/25 rounded-lg translate-y-[2px] transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:translate-y-[4px] hover:duration-[250ms] active:translate-y-[1px] active:duration-[34ms]"></span>
                <span className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-l from-indigo-900 via-indigo-700 to-indigo-900"></span>
                <span className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg -translate-y-1 transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:-translate-y-[6px] hover:duration-[250ms] active:-translate-y-[2px] active:duration-[34ms] select-none">
                  🔗 <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  <span className="sm:hidden">{isConnecting ? '...' : 'Connect'}</span>
                </span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* Profile Setup Modal */}
      <ProfileSetupModal 
        isOpen={showSetupModal} 
        onClose={handleCloseModal} 
      />
    </header>
  );
}
