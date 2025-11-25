'use client';

import { useState } from 'react';
import PersonaSelector from './PersonaSelector';
import { useWallet } from '@/lib/wallet-context';
import type { Persona } from '@/typings/types';

interface WishFormProps {
  onWishSubmitted?: (wish: any) => void;
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
        onWishSubmitted?.(data.wish);
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
        className="send-message-button relative w-full min-h-[68px] px-5 py-4 rounded-[14px] bg-[#2e2e2e] text-white font-semibold text-base sm:text-lg border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        style={{
          textShadow: '0 1px 1px rgba(0, 0, 0, 0.3)',
          boxShadow: '0 0.5px 0.5px 1px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.2), 0 4px 5px 0px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Outline effect */}
        <div className="send-btn-outline absolute inset-[-2px_-3.5px] rounded-[14px] overflow-hidden opacity-0 transition-opacity duration-400 pointer-events-none">
          <div className="absolute inset-[-100%] animate-spin-slow" style={{
            background: 'conic-gradient(from 180deg, transparent 60%, rgb(22, 22, 22) 80%, transparent 100%)',
            animationPlayState: isSubmitting ? 'paused' : 'running'
          }} />
        </div>
        
        {/* Border effect */}
        <div className="absolute inset-0 rounded-[14px] border-[2.5px] border-transparent pointer-events-none" style={{
          background: 'linear-gradient(#2e2e2e, #1a1a1a) padding-box, linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.45)) border-box'
        }} />
        
        {/* Inner glow */}
        <div className="absolute inset-[7px_6px_6px_6px] rounded-[30px] pointer-events-none z-[2]" style={{
          background: 'linear-gradient(to top, #2e2e2e, #1a1a1a)',
          filter: 'blur(0.5px)'
        }} />
        
        {/* Content */}
        <div className="relative z-[3] flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" />
                <path d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z" />
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" />
                <path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" />
              </svg>
              <span>Send Message</span>
            </>
          )}
        </div>
      </button>
      
      <style jsx>{`
        .send-message-button:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 0 1px 2px rgba(255, 255, 255, 0.3), 0 15px 30px rgba(0, 0, 0, 0.3), 0 10px 3px -3px rgba(0, 0, 0, 0.04);
        }
        .send-message-button:hover:not(:disabled) .send-btn-outline {
          opacity: 1;
        }
        .send-message-button:active:not(:disabled) {
          transform: scale(1);
          box-shadow: 0 0 1px 2px rgba(255, 255, 255, 0.3), 0 10px 3px -3px rgba(0, 0, 0, 0.2);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </form>
  );
}
