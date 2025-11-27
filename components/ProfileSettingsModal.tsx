'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentAvatar: string;
  walletAddress: string;
  onSave: (username: string, avatar: string) => void;
}

const emojiOptions = [
  '😀', '😎', '🤩', '🥳', '🤖', '👻', '🎃', '🎄',
  '🎅', '🧝', '☃️', '🦌', '🎁', '⭐', '✨', '🔥',
  '💎', '🚀', '🌟', '💫', '🎮', '🎨', '🎭', '🎪'
];

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  currentUsername,
  currentAvatar,
  walletAddress,
  onSave,
}: ProfileSettingsModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [avatarMode, setAvatarMode] = useState<'emoji' | 'upload'>(
    currentAvatar.startsWith('data:') ? 'upload' : 'emoji'
  );
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (username.trim().length === 0) {
      alert('Username cannot be empty');
      return;
    }
    if (username.length > 20) {
      alert('Username must be 20 characters or less');
      return;
    }
    onSave(username.trim(), avatar);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

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
            <div className="bg-[#1e1f2e] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Profile Settings</h2>
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
              <div className="p-6 space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={20}
                    className="w-full px-4 py-2 bg-[#11121c] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Enter your name"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {username.length}/20 characters
                  </p>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Profile Picture
                  </label>
                  
                  {/* Mode Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setAvatarMode('emoji')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        avatarMode === 'emoji'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#11121c] text-slate-400 hover:text-white'
                      }`}
                    >
                      🎨 Emoji
                    </button>
                    <button
                      onClick={() => setAvatarMode('upload')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        avatarMode === 'upload'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#11121c] text-slate-400 hover:text-white'
                      }`}
                    >
                      📤 Upload
                    </button>
                  </div>

                  {/* Avatar Preview */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
                      {avatar.startsWith('data:') ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{avatar}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{username || 'Your Name'}</p>
                      <p className="text-xs text-slate-500">Preview</p>
                    </div>
                  </div>

                  {/* Emoji Grid */}
                  {avatarMode === 'emoji' && (
                    <div className="grid grid-cols-8 gap-2 p-3 bg-[#11121c] rounded-lg border border-white/10 max-h-48 overflow-y-auto">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setAvatar(emoji)}
                          className={`w-10 h-10 flex items-center justify-center text-2xl rounded-lg transition-all hover:scale-110 ${
                            avatar === emoji
                              ? 'bg-indigo-600 ring-2 ring-indigo-400'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Upload */}
                  {avatarMode === 'upload' && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-3 bg-[#11121c] border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose Image
                      </button>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Max 2MB. JPG, PNG, GIF supported.
                      </p>
                    </div>
                  )}
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-2 bg-[#11121c] border border-white/10 rounded-lg text-slate-400 font-mono text-sm truncate">
                      {truncateAddress(walletAddress)}
                    </div>
                    <button
                      onClick={copyWalletAddress}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-[#11121c] hover:bg-white/5 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
