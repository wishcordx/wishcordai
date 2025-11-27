'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetchWishes();
  }, [refreshTrigger]);

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
    <div className="space-y-4">
      {wishes.map((wish) => (
        <WishCard key={wish.id} wish={wish} />
      ))}
    </div>
  );
}
