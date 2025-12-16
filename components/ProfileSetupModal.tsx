'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useWallet } from '@/lib/wallet-context';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_EMOJIS = ['🎅', '🎄', '⛄', '🎁', '⭐', '🔔', '🦌', '🧝', '❄️', '🕯️', '🎊', '🍪'];

export default function ProfileSetupModal({ isOpen, onClose }: ProfileSetupModalProps) {
  const { walletAddress } = useWallet();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎅');
  const [customImage, setCustomImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    if (!walletAddress) return;

    const profile = {
      wallet_address: walletAddress,
      username: username || 'Anonymous',
      avatar: customImage || selectedEmoji,
      last_active: new Date().toISOString(),
    };

    try {
      // Save to database using upsert (insert or update if exists)
      const { error } = await supabase
        .from('members')
        .upsert(profile, { 
          onConflict: 'wallet_address',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error saving profile to database:', error);
        alert('Failed to save profile. Please try again.');
        return;
      }

      // Save to localStorage for quick access
      localStorage.setItem('userProfile', JSON.stringify({
        walletAddress,
        username: profile.username,
        avatar: profile.avatar,
        setupCompleted: true,
      }));

      console.log('Profile saved successfully:', profile.username);
      onClose();
      
      // Trigger a page refresh or custom event to update UI
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2b2d31] rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-700">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Step {step} of 2</span>
            <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="h-1 bg-[#1e1f22] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Username */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Username</h2>
            <p className="text-gray-400 text-sm mb-6">This is how others will see you on WCordAI</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.slice(0, 20))}
                placeholder="Enter username..."
                className="w-full px-4 py-3 bg-[#1e1f22] border border-[#35373c] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">{username.length}/20 characters</p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!username.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Avatar */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Avatar</h2>
            <p className="text-gray-400 text-sm mb-6">Pick an emoji or upload a custom image</p>
            
            {/* Current Selection */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-2">
                {customImage ? (
                  <img src={customImage} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-5xl">{selectedEmoji}</span>
                )}
              </div>
              <p className="text-white font-medium">{username}</p>
            </div>

            {/* Emoji Grid */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Default Emojis</p>
              <div className="grid grid-cols-6 gap-2">
                {DEFAULT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setSelectedEmoji(emoji);
                      setCustomImage(null);
                    }}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl hover:bg-[#35373c] transition ${
                      selectedEmoji === emoji && !customImage ? 'bg-green-600/30 ring-2 ring-green-500' : 'bg-[#1e1f22]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">Or Upload Custom Image</p>
              <label className="block w-full px-4 py-3 bg-[#1e1f22] border border-[#35373c] rounded-lg text-gray-400 hover:bg-[#35373c] transition cursor-pointer text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                📁 Choose Image
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
              >
                Complete Setup ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
