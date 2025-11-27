'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Holder {
  address: string;
  balance: string;
  percentage: string;
}

export default function WishTokenPage() {
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // TODO: Replace with actual contract address when deployed on Pump.fun
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WISH_TOKEN_CONTRACT || null;
  const TWITTER_URL = process.env.NEXT_PUBLIC_WISH_TOKEN_TWITTER || null;

  useEffect(() => {
    if (CONTRACT_ADDRESS) {
      setContractAddress(CONTRACT_ADDRESS);
      fetchTopHolders();
    }
  }, []);

  const fetchTopHolders = async () => {
    if (!CONTRACT_ADDRESS) return;
    
    setLoading(true);
    try {
      // TODO: Implement Helius or Moralis API call when contract is live
      // Example endpoint structure ready for integration:
      // const response = await fetch(`/api/token/holders?contract=${CONTRACT_ADDRESS}`);
      // const data = await response.json();
      // setHolders(data.holders);
      
      // Placeholder data for now
      setHolders([]);
    } catch (error) {
      console.error('Failed to fetch holders:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <main className="min-h-screen bg-[#1a1b1e]">
      <Header />
      
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            $WISH Token
          </h1>
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto">
            The official token of Wishcord. Make wishes, earn $WISH, and spread Christmas cheer on the blockchain! 🎄
          </p>
        </div>

        {/* Contract Address Section */}
        <div className="bg-[#1e1f22] rounded-lg p-4 sm:p-6 border border-[#0f1011] mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            📜 Contract Address
          </h2>
          
          {CONTRACT_ADDRESS ? (
            <div className="bg-[#202225] rounded-lg p-3 sm:p-4 border border-[#0f1011]">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <code className="text-xs sm:text-sm text-yellow-400 font-mono break-all flex-1">
                  {CONTRACT_ADDRESS}
                </code>
                <button
                  onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
                  className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <a
                  href={`https://solscan.io/token/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 underline"
                >
                  View on Solscan →
                </a>
                <a
                  href={`https://pump.fun/coin/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 underline"
                >
                  View on Pump.fun →
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-[#202225] rounded-lg p-6 sm:p-8 border border-[#0f1011] text-center">
              <p className="text-gray-400 text-sm sm:text-base mb-3">
                🚀 Token launching soon on Pump.fun!
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                Contract address will be displayed here once deployed.
              </p>
            </div>
          )}
        </div>

        {/* Grid Layout for Tokenomics and Holders */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Tokenomics */}
          <div className="bg-[#1e1f22] rounded-lg p-4 sm:p-6 border border-[#0f1011]">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              📊 Tokenomics
            </h2>
            
            <div className="space-y-4">
              <div className="bg-[#202225] rounded-lg p-3 sm:p-4 border border-[#0f1011]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Total Supply</span>
                  <span className="text-white font-bold text-base sm:text-lg">1,000,000,000</span>
                </div>
              </div>

              <div className="bg-[#202225] rounded-lg p-3 sm:p-4 border border-[#0f1011]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Network</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base sm:text-lg">Solana</span>
                    <span className="text-purple-400 text-xl">⚡</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#202225] rounded-lg p-3 sm:p-4 border border-[#0f1011]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Tax</span>
                  <span className="text-green-400 font-bold text-base sm:text-lg">0% 🎉</span>
                </div>
              </div>

              <div className="bg-[#202225] rounded-lg p-3 sm:p-4 border border-[#0f1011]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm sm:text-base">Launch Platform</span>
                  <span className="text-white font-bold text-base sm:text-lg">Pump.fun 🚀</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 10 Holders */}
          <div className="bg-[#1e1f22] rounded-lg p-4 sm:p-6 border border-[#0f1011]">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              👑 Top 10 Holders
            </h2>
            
            {CONTRACT_ADDRESS && holders.length > 0 ? (
              <div className="space-y-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-[#0f1011]">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">Address</th>
                      <th className="text-right py-2 px-2">Balance</th>
                      <th className="text-right py-2 px-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holders.map((holder, index) => (
                      <tr key={holder.address} className="border-b border-[#0f1011] hover:bg-[#2b2d31] transition-colors">
                        <td className="py-3 px-2 text-gray-400">{index + 1}</td>
                        <td className="py-3 px-2">
                          <a
                            href={`https://solscan.io/account/${holder.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 font-mono text-xs"
                          >
                            {truncateAddress(holder.address)}
                          </a>
                        </td>
                        <td className="py-3 px-2 text-right text-white font-medium">{holder.balance}</td>
                        <td className="py-3 px-2 text-right text-green-400">{holder.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#202225] rounded-lg p-6 sm:p-8 border border-[#0f1011] text-center">
                <p className="text-gray-400 text-sm sm:text-base mb-2">
                  📊 Holder data will appear here once token is live
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {loading ? 'Loading...' : 'Awaiting contract deployment'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Socials Section */}
        <div className="bg-[#1e1f22] rounded-lg p-4 sm:p-6 border border-[#0f1011]">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            🌐 Community & Socials
          </h2>
          
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {TWITTER_URL ? (
              <a
                href={TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-[#1d9bf0] hover:bg-[#1a8cd8] rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Follow on X
              </a>
            ) : (
              <div className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-[#202225] rounded-lg border border-[#0f1011] text-gray-500 text-sm sm:text-base">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter Coming Soon
              </div>
            )}

            {CONTRACT_ADDRESS && (
              <>
                <a
                  href={`https://dexscreener.com/solana/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
                >
                  📈 DexScreener
                </a>
                <a
                  href={`https://www.dextools.io/app/solana/pair-explorer/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
                >
                  🛠️ DexTools
                </a>
              </>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm sm:text-base transition-colors"
          >
            ← Back to Wishcord
          </Link>
        </div>
      </div>
    </main>
  );
}
