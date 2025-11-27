'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WishCard from './WishCard';
import { supabase } from '@/lib/supabase';
import type { Wish } from '@/typings/types';

interface FeedProps {
  refreshTrigger?: number;
  newWish?: Wish | null;
}

export default function Feed({ refreshTrigger, newWish }: FeedProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWishes();
  }, [refreshTrigger]);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Listen for manual wish updates from polling fallback
  useEffect(() => {
    const handleWishUpdated = (event: CustomEvent) => {
      const { wishId, wish: updatedWish } = event.detail;
      console.log('📢 [Feed] Received wish-updated event for:', wishId);
      
      setWishes(prev => {
        const index = prev.findIndex(w => w.id === wishId);
        if (index === -1) {
          console.warn('⚠️ [Feed] Wish not found:', wishId);
          return prev;
        }
        
        const updated = [...prev];
        updated[index] = updatedWish;
        console.log('✅ [Feed] Updated wish via polling fallback');
        return updated;
      });
    };

    window.addEventListener('wish-updated', handleWishUpdated as EventListener);
    
    return () => {
      window.removeEventListener('wish-updated', handleWishUpdated as EventListener);
    };
  }, []);

  // Supabase Realtime - Listen for new wishes and updates
  useEffect(() => {
    console.log('🔌 Connecting to Supabase Realtime...');
    
    const channel = supabase
      .channel('wishes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wishes' },
        (payload) => {
          console.log('✨ New wish via Realtime:', payload.new);
          const newWish = payload.new as Wish;
          setWishes(prev => {
            // Avoid duplicates
            if (prev.some(w => w.id === newWish.id)) return prev;
            return [newWish, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'wishes' },
        (payload) => {
          console.log('🔄 Wish updated via Realtime:', payload.new);
          const updatedWish = payload.new as Wish;
          console.log('📝 AI Status:', updatedWish.ai_status, 'Reply:', updatedWish.ai_reply?.substring(0, 50));
          console.log('🆔 Updated wish ID:', updatedWish.id);
          setWishes(prev => {
            console.log('📋 Current wishes count:', prev.length);
            const foundIndex = prev.findIndex(w => w.id === updatedWish.id);
            console.log('🔍 Found wish at index:', foundIndex);
            
            if (foundIndex === -1) {
              console.warn('⚠️ Wish not found in current list!');
              return prev;
            }
            
            // Create completely new array with updated wish
            const updated = [...prev];
            updated[foundIndex] = { ...updatedWish };
            console.log('✅ Wishes state updated, wish at index', foundIndex, 'status:', updated[foundIndex].ai_status);
            return updated;
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected!');
        }
      });

    return () => {
      console.log('🔌 Disconnecting from Supabase Realtime...');
      supabase.removeChannel(channel);
    };
  }, []);

  // Optimistically add new wish to top of feed (for immediate feedback)
  useEffect(() => {
    if (newWish) {
      setWishes(prev => {
        // Check if wish already exists to avoid duplicates
        const exists = prev.some(w => w.id === newWish.id);
        if (exists) return prev;
        return [newWish, ...prev];
      });
    }
  }, [newWish]);

  const fetchWishes = async () => {
    try {
      // Don't show loading spinner if we already have wishes
      if (wishes.length === 0) {
        setIsLoading(true);
      }
      const response = await fetch(`/api/wishes?t=${Date.now()}`);
      const data = await response.json();

      console.log('Feed data:', data);

      if (data.success) {
        setWishes(data.wishes || []);
        console.log('Wishes loaded:', data.wishes?.length || 0);
      } else {
        setError(data.error || 'Failed to load wishes');
      }
    } catch (err) {
      console.error('Feed fetch error:', err);
      setError('Failed to load wishes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#1e1f22] rounded-lg p-8 border border-[#0f1011] text-center">
        <div className="animate-pulse">
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600/20 rounded-lg p-8 border border-red-600/30 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (wishes.length === 0) {
    return (
      <div className="bg-[#1e1f22] rounded-lg p-8 border border-[#0f1011] text-center">
        <p className="text-gray-400">No messages yet. Be the first to post! 💬</p>
      </div>
    );
  }

  return (
    <>
      <div ref={feedContainerRef} className="space-y-4">
        {wishes.map((wish) => (
          <WishCard key={wish.id} wish={wish} />
        ))}
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 sm:p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-shadow border border-indigo-400/30 group"
            aria-label="Scroll to top"
          >
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-y-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
