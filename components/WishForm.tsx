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
        {/* Professional Message Input Container */}
        <div className="relative bg-[#313338] rounded-lg border border-[#1e1f22] focus-within:border-[#3e4047] transition-colors">
          {/* Main input area with action buttons */}
          <div className="relative flex items-end gap-2 p-2">
            {/* Text input area */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                id="wish"
                value={wishText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Message #xmas-wishes (use @SantaMod69 to tag)"
                className="w-full min-h-[44px] max-h-[200px] px-3 py-2.5 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-sm disabled:opacity-50 scrollbar-thin scrollbar-thumb-[#1e1f22] scrollbar-track-transparent"
                style={{ lineHeight: '1.5' }}
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
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 pb-1">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Add Image button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || !!imageUrl}
                title="Add Image"
                className="relative group p-2 rounded-md hover:bg-[#3e4047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-disabled:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" />
                  <path d="M13.96 12.29L11.21 15.83L9.25 13.47L6.5 17H17.5L13.96 12.29Z" />
                </svg>
              </button>

              {/* Voice button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSubmitting || !!audioBlob}
                title={isRecording ? `Stop Recording (${recordingTime}s)` : 'Voice Message'}
                className={`relative group p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'hover:bg-[#3e4047]'
                }`}
              >
                {isRecording ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6H18V18H6V6Z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-disabled:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" />
                    <path d="M17 11C17 14 14.76 16.1 12 16.1C9.24 16.1 7 14 7 11H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C16.28 17.24 19 14.42 19 11H17Z" />
                  </svg>
                )}
              </button>

              {/* Send button */}
              <button
                type="submit"
                disabled={isSubmitting || (!wishText.trim() && !imageUrl && !audioBlob)}
                title="Send Message"
                className="relative group p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-1"
              >
                {isSubmitting ? (
                  <svg className="w-5 h-5 text-white animate-spin" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" opacity="0.3" />
                    <path d="M12 4C7.59 4 4 7.59 4 12H2C2 6.48 6.48 2 12 2V4Z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="flex items-center justify-between px-4 pb-2">
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
            <p className="text-[10px] text-gray-500 font-medium">
              {wishText.length}/500
            </p>
          </div>
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
    </form>
    </>
  );
}
