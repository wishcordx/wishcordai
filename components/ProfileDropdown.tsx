'use client';

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@/lib/wallet-context';
import { truncateAddress } from '@/lib/utils';

interface ProfileDropdownProps {
  onDisconnect: () => void;
  onOpenSetup?: () => void;
}

export default function ProfileDropdown({ onDisconnect, onOpenSetup }: ProfileDropdownProps) {
  const { walletAddress } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showCopied, setShowCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, [walletAddress]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress!);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600/20 text-green-400 font-mono text-xs hover:bg-green-600/30 transition-colors border border-green-600/30"
      >
        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center overflow-hidden">
          {profile?.avatar ? (
            profile.avatar.startsWith('data:') ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">{profile.avatar}</span>
            )
          ) : (
            <span className="text-sm">👤</span>
          )}
        </div>
        {profile?.username || 'Anonymous'}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#2b2d31] rounded-lg shadow-xl border border-[#1e1f22] overflow-hidden z-50 animate-slideDown">
          {/* Profile Header */}
          <div className="p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-b border-[#1e1f22]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  profile.avatar.startsWith('data:') ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{profile.avatar}</span>
                  )
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{profile?.username || 'Anonymous'}</p>
                <p className="text-xs text-gray-400 font-mono">{truncateAddress(walletAddress!)}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSetup?.();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#35373c] transition-colors flex items-center gap-2"
            >
              <span>⚙️</span>
              Setup Profile
            </button>
            
            <button
              onClick={handleCopyAddress}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#35373c] transition-colors flex items-center gap-2"
            >
              <span>📋</span>
              Copy Address
            </button>

            <div className="my-2 border-t border-[#1e1f22]"></div>

            <button
              onClick={() => {
                setIsOpen(false);
                onDisconnect();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <span>🚪</span>
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Copied Toast Notification */}
      {showCopied && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Address copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  );
}
