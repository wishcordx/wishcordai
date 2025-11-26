'use client';

import { useState, useRef } from 'react';
import MemeEditor from './MemeEditor';
import MentionAutocomplete, { MODS, type Mention } from './MentionAutocomplete';
import { useWallet } from '@/lib/wallet-context';
import type { Persona } from '@/typings/types';

interface WishFormProps {
  onWishSubmitted?: (wish: any) => void;
}

export default function WishForm({ onWishSubmitted }: WishFormProps) {
  const { walletAddress } = useWallet();
  const [wishText, setWishText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // @Mention autocomplete state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Media features
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [showMemeEditor, setShowMemeEditor] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setWishText(newText);
    setCursorPosition(cursorPos);
    
    // Show typing indicator
    if (!isTyping && newText.length > 0) {
      setIsTyping(true);
    }
    
    // Hide typing indicator after 2 seconds of no typing
    setTimeout(() => setIsTyping(false), 2000);

    // Detect @ mention trigger
    const textBeforeCursor = newText.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's no space after @
      if (!textAfterAt.includes(' ') && textAfterAt.length <= 20) {
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentions(true);
        setSelectedMentionIndex(0);
        
        // Calculate position for dropdown next to @ symbol
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const rect = textarea.getBoundingClientRect();
          
          // Get computed styles for accurate measurements
          const style = window.getComputedStyle(textarea);
          const fontSize = parseFloat(style.fontSize);
          const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.5;
          const paddingTop = parseFloat(style.paddingTop);
          const paddingLeft = parseFloat(style.paddingLeft);
          
          // Calculate line number and position
          const lines = textBeforeCursor.split('\n');
          const currentLineIndex = lines.length - 1;
          const currentLine = lines[currentLineIndex];
          
          // Calculate approximate character width (rough estimate for monospace-like behavior)
          const charWidth = fontSize * 0.6;
          const textWidth = (currentLine.length) * charWidth;
          
          setMentionPosition({
            top: rect.top + paddingTop + (currentLineIndex * lineHeight) + lineHeight + window.scrollY,
            left: rect.left + paddingLeft + textWidth,
          });
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Handle keyboard navigation for mentions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions) return;

    const filteredMentions = MODS.filter(mod =>
      mod.name.toLowerCase().includes(mentionSearch)
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMentionIndex(prev => 
        prev < filteredMentions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMentionIndex(prev => 
        prev > 0 ? prev - 1 : filteredMentions.length - 1
      );
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (filteredMentions.length > 0) {
        e.preventDefault();
        handleMentionSelect(filteredMentions[selectedMentionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  // Insert selected mention
  const handleMentionSelect = (mention: Mention) => {
    const textBeforeCursor = wishText.substring(0, cursorPosition);
    const textAfterCursor = wishText.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newText = 
      wishText.substring(0, lastAtIndex) + 
      mention.id + ' ' + 
      textAfterCursor;
    
    setWishText(newText);
    setShowMentions(false);
    
    // Set cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = lastAtIndex + mention.id.length + 1;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setShowMemeEditor(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle meme editor save
  const handleMemeEditorSave = (url: string, path: string) => {
    setImageUrl(url);
    setImagePath(path);
    setShowMemeEditor(false);
  };

  // Remove image
  const removeImage = () => {
    setImageUrl(null);
    setImagePath(null);
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to access microphone');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Remove audio
  const removeAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wishText.trim() && !imageUrl && !audioBlob) {
      setError('Please write a message, add an image, or record audio!');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Get profile from localStorage
    const profileData = localStorage.getItem('userProfile');
    const profile = profileData ? JSON.parse(profileData) : null;

    const personaMap: Record<string, Persona> = {
      'SantaMod69': 'santa',
      'xX_Krampus_Xx': 'grinch',
      'elfgirluwu': 'elf',
      'FrostyTheCoder': 'snowman',
      'DasherSpeedrun': 'reindeer',
      'SantaKumar': 'scammer',
      'JingBells叮噹鈴': 'jingbells',
    };

    try {
      // If audio exists, upload and transcribe it first
      let audioUrl = null;
      let audioPath = null;
      let transcribedText = wishText.trim();
      
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-message.webm');
        
        // Upload audio to Supabase and transcribe via API
        const uploadResponse = await fetch('/api/voice/transcribe', {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          audioUrl = uploadData.audioUrl;
          audioPath = uploadData.audioPath;
          // Always use transcribed text when audio exists, append to any typed text
          if (uploadData.text) {
            // If user typed something AND recorded, combine them
            transcribedText = transcribedText 
              ? `${transcribedText} ${uploadData.text}` 
              : uploadData.text;
          }
          console.log('🎤 Transcribed audio:', uploadData.text);
          console.log('📝 Final text:', transcribedText);
        } else {
          throw new Error(uploadData.error || 'Failed to process audio');
        }
      }

      // Parse @mentions from the final text (typed or transcribed)
      const mentionRegex = /@(SantaMod69|xX_Krampus_Xx|elfgirluwu|FrostyTheCoder|DasherSpeedrun|SantaKumar|JingBells叮噹鈴)/g;
      const matches = transcribedText.match(mentionRegex);
      const mentionedPersonas = matches ? matches.map(m => m.substring(1)) : [];
      
      // Determine persona from first mention, or default to santa only if there's text/media
      const persona = mentionedPersonas.length > 0 
        ? personaMap[mentionedPersonas[0]] || 'santa'
        : 'santa';

      const response = await fetch('/api/wish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wishText: transcribedText,
          persona,
          walletAddress: walletAddress || '',
          username: profile?.username || 'Anonymous',
          avatar: profile?.avatar || '👤',
          imageUrl,
          imagePath,
          audioUrl,
          audioPath,
          mentionedPersonas: mentionedPersonas.length > 0 ? mentionedPersonas : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWishText('');
        setImageUrl(null);
        setImagePath(null);
        setUploadedImage(null);
        setAudioBlob(null);
        setRecordingTime(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
    <>
      {/* Meme Editor Modal */}
      <MemeEditor
        isOpen={showMemeEditor}
        onClose={() => setShowMemeEditor(false)}
        initialImage={uploadedImage}
        onSaveToFeed={handleMemeEditorSave}
      />

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="space-y-2 relative">
          <textarea
            ref={textareaRef}
            id="wish"
            value={wishText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Message #xmas-wishes (use @SantaMod69 to tag specific mods)"
            className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-[#1a1b1e] text-sm sm:text-base text-white placeholder:text-gray-500 border border-[#0f1011] focus:outline-none focus:border-indigo-500 resize-none min-h-[80px]"
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
          />
          
          {/* @Mention Autocomplete */}
          {showMentions && (
            <MentionAutocomplete
              mentions={MODS.filter(mod =>
                mod.name.toLowerCase().includes(mentionSearch)
              )}
              onSelect={handleMentionSelect}
              position={mentionPosition}
              selectedIndex={selectedMentionIndex}
            />
          )}
          
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

        {/* Media Attachments Section */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Image Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting || !!imageUrl}
            className="px-3 py-2 bg-[#1e1f22] hover:bg-[#202225] text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            📷 <span className="hidden sm:inline">Add Image</span>
          </button>

          {/* Voice Recording Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSubmitting || !!audioBlob}
            className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                : 'bg-[#1e1f22] hover:bg-[#202225] text-gray-300'
            }`}
          >
            {isRecording ? (
              <>🔴 <span className="hidden sm:inline">{recordingTime}s</span></>
            ) : (
              <>🎤 <span className="hidden sm:inline">Voice</span></>
            )}
          </button>
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="relative bg-[#1e1f22] rounded-lg p-3 border border-[#0f1011]">
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              ✕
            </button>
            <img
              src={imageUrl}
              alt="Attached meme"
              className="max-h-40 rounded-lg mx-auto"
            />
            <p className="text-xs text-gray-400 text-center mt-2">🎨 Meme attached</p>
          </div>
        )}

        {/* Audio Preview */}
        {audioBlob && (
          <div className="relative bg-[#1e1f22] rounded-lg p-3 border border-[#0f1011] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎤</span>
              <div>
                <p className="text-sm text-white">Voice message</p>
                <p className="text-xs text-gray-400">{recordingTime} seconds</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeAudio}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        )}

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
        disabled={isSubmitting || (!wishText.trim() && !imageUrl && !audioBlob)}
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
    </>
  );
}
