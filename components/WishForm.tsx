'use client';

import { useState } from 'react';
import PersonaSelector from './PersonaSelector';
import { useWallet } from '@/lib/wallet-context';
import type { Persona } from '@/typings/types';

interface WishFormProps {
  onWishSubmitted?: () => void;
}

export default function WishForm({ onWishSubmitted }: WishFormProps) {
  const { walletAddress } = useWallet();
  const [wishText, setWishText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<Persona>('santa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWishText(e.target.value);
    
    // Show typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    }
    
    // Hide typing indicator after 2 seconds of no typing
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wishText.trim()) {
      setError('Please write your wish first!');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Get profile from localStorage
    const profileData = localStorage.getItem('userProfile');
    const profile = profileData ? JSON.parse(profileData) : null;

    try {
      const response = await fetch('/api/wish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wishText: wishText.trim(),
          persona: selectedPersona,
          walletAddress: walletAddress || '',
          username: profile?.username || 'Anonymous',
          avatar: profile?.avatar || '👤',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWishText('');
        setSelectedPersona('santa');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onWishSubmitted?.();
      } else {
        setError(data.error || 'Failed to submit wish');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="space-y-2">
        <textarea
          id="wish"
          value={wishText}
          onChange={handleTextChange}
          placeholder="Message #xmas-wishes"
          className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-[#383a40] text-sm sm:text-base text-white placeholder:text-gray-500 border border-[#1e1f22] focus:outline-none focus:border-indigo-500 resize-none"
          rows={3}
          maxLength={500}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTyping && wishText.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                <span className="ml-1">typing...</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {wishText.length}/500
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs sm:text-sm text-gray-400">Pick a mod to respond:</p>
        <PersonaSelector 
          selectedPersona={selectedPersona} 
          onSelect={setSelectedPersona}
        />
      </div>

      {success && (
        <div className="bg-green-600/20 border border-green-600/30 px-3 py-2 sm:px-4 rounded-lg">
          <p className="text-xs sm:text-sm text-green-400">
            ✅ Message sent! Mod is typing...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-600/20 border border-red-600/30 px-3 py-2 sm:px-4 rounded-lg">
          <p className="text-xs sm:text-sm text-red-400">
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !wishText.trim()}
        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '💬 Sending...' : '📤 Send Message'}
      </button>
    </form>
  );
}
