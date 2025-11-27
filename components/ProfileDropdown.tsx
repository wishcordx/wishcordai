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
        className="relative border-none bg-transparent p-0 outline-none cursor-pointer"
      >
        <span className="absolute top-0 left-0 w-full h-full bg-black/25 rounded-lg translate-y-[2px] transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:translate-y-[4px] hover:duration-[250ms] active:translate-y-[1px] active:duration-[34ms]"></span>
        <span className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-l from-indigo-900 via-indigo-700 to-indigo-900"></span>
        <span className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg -translate-y-1 transition-transform duration-[600ms] cubic-bezier-[0.3,0.7,0.4,1] hover:-translate-y-[6px] hover:duration-[250ms] active:-translate-y-[2px] active:duration-[34ms] select-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{profile?.username || 'Anonymous'}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1e1f22] rounded-lg shadow-xl border border-[#0f1011] overflow-hidden z-50 animate-slideDown">
          {/* Profile Header */}
          <div className="p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-b border-[#0f1011]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  profile.avatar.startsWith('data:') || profile.avatar.startsWith('https://') ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
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
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2b2d31] transition-colors flex items-center gap-2"
            >
              <span>⚙️</span>
              Setup Profile
            </button>
            
            <button
              onClick={handleCopyAddress}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2b2d31] transition-colors flex items-center gap-2"
            >
              <span>📋</span>
              Copy Address
            </button>

            <div className="my-2 border-t border-[#0f1011]"></div>

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
