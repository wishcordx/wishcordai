'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface WalletContextType {
  walletAddress: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  profileExists: boolean | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  // Check if wallet is already connected on mount and fetch profile
  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    if (savedWallet) {
      setWalletAddress(savedWallet);
      fetchAndSyncProfile(savedWallet);
    }
  }, []);

  // Fetch profile from database and sync with localStorage
  const fetchAndSyncProfile = async (address: string) => {
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - user needs to create one
          setProfileExists(false);
          localStorage.removeItem('userProfile');
        } else {
          console.error('Error fetching profile:', error);
          setProfileExists(false);
        }
        return;
      }

      if (member) {
        // Profile exists - sync to localStorage
        const profile = {
          walletAddress: member.wallet_address,
          username: member.username,
          avatar: member.avatar,
          setupCompleted: true,
        };
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setProfileExists(true);

        // Update last_active timestamp
        await supabase
          .from('members')
          .update({ last_active: new Date().toISOString() })
          .eq('wallet_address', address);
      } else {
        setProfileExists(false);
        localStorage.removeItem('userProfile');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setProfileExists(false);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if we're on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const { solana } = window as any;
      
      if (!solana) {
        if (isMobile) {
          // Redirect to Phantom app with deep link
          const currentUrl = window.location.href;
          const dappUrl = encodeURIComponent(currentUrl);
          window.location.href = `https://phantom.app/ul/browse/${dappUrl}?ref=${currentUrl}`;
          return;
        } else {
          alert('Please install a Solana wallet like Phantom or Solflare!');
          return;
        }
      }

      const response = await solana.connect();
      const address = response.publicKey.toString();
      
      setWalletAddress(address);
      localStorage.setItem('walletAddress', address);
      
      // Fetch profile from database
      await fetchAndSyncProfile(address);
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setProfileExists(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userProfile');
    
    const { solana } = window as any;
    if (solana) {
      solana.disconnect();
    }
  };

  return (
    <WalletContext.Provider value={{ walletAddress, isConnecting, connectWallet, disconnectWallet, profileExists }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
