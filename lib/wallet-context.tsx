'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  walletAddress: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
  }, []);

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
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
    
    const { solana } = window as any;
    if (solana) {
      solana.disconnect();
    }
  };

  return (
    <WalletContext.Provider value={{ walletAddress, isConnecting, connectWallet, disconnectWallet }}>
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
