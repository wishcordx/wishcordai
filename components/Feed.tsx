'use client';

import { useEffect, useState } from 'react';
import WishCard from './WishCard';
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

  // Background sync every 5 seconds - silently updates wishes without UI disruption
  useEffect(() => {
    console.log('🔄 Starting background sync interval...');
    const syncInterval = setInterval(() => {
      console.log('⏰ Running silent sync...');
      silentSync();
    }, 5000); // Sync every 5 seconds

    return () => {
      console.log('🛑 Stopping background sync interval');
      clearInterval(syncInterval);
    };
  }, []); // Empty dependency - only run once on mount

  // Optimistically add new wish to top of feed
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

  const silentSync = async () => {
    try {
      const response = await fetch(`/api/wishes?t=${Date.now()}`, {
        cache: 'no-store'
      });
      const data = await response.json();

      if (data.success && data.wishes) {
        setWishes(prev => {
          const newWishes: Wish[] = [];
          const existingIds = new Set(prev.map(w => w.id));
          
          // Find new wishes that don't exist locally
          data.wishes.forEach((wish: Wish) => {
            if (!existingIds.has(wish.id)) {
              newWishes.push(wish);
              console.log(`✨ New wish detected: ${wish.id}`);
            }
          });
          
          // Update existing wishes
          const updated = prev.map(existingWish => {
            const serverWish = data.wishes.find((w: Wish) => w.id === existingWish.id);
            if (serverWish && (
              serverWish.ai_status !== existingWish.ai_status ||
              serverWish.ai_reply !== existingWish.ai_reply
            )) {
              console.log(`🔄 Updated wish ${existingWish.id}`);
              return serverWish;
            }
            return existingWish;
          });
          
          // Prepend new wishes to the top
          return [...newWishes, ...updated];
        });
      }
    } catch (err) {
      // Silently fail - don't disrupt UX
      console.error('Background sync failed:', err);
    }
  };

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
