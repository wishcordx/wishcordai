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
    <header className="border-b border-[#0f1011] bg-[#1e1f22]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-hidden">
              <img src="/assets/logo.webp" alt="WishCord" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">
                WishCord
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">5 mods online</p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-3 text-sm">
            {/* About Link */}
            <Link
              href="/about"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#2a2d31] rounded-md transition-all duration-200"
            >
              <span className="text-base">ℹ️</span>
              <span className="font-medium">About</span>
            </Link>

            {/* How It Works Link */}
            <Link
              href="/how-it-works"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#2a2d31] rounded-md transition-all duration-200"
            >
              <span className="text-base">❓</span>
              <span className="font-medium">How It Works</span>
            </Link>

            {/* $WISH Token Button */}
            <Link
              href="/wishtoken"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <span className="text-sm">💎</span>
              <span>$WISH</span>
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
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="text-base">🔗</span>
                <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                <span className="sm:hidden">{isConnecting ? '...' : 'Connect'}</span>
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
