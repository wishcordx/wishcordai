'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import WishForm from '@/components/WishForm';
import Feed from '@/components/Feed';
import VoiceCallAgent from '@/components/VoiceCallAgent';
import ModProfileModal from '@/components/ModProfileModal';
import SocialMediaPopup from '@/components/SocialMediaPopup';
import MembersList from '@/components/MembersList';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import WalletConnectModal from '@/components/WalletConnectModal';
import { useWallet } from '@/lib/wallet-context';
import type { Persona } from '@/typings/types';

export default function HomePage() {
  const { walletAddress, disconnectWallet } = useWallet();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [activeCall, setActiveCall] = useState<Persona | null>(null);
  const [userProfile, setUserProfile] = useState<{ username: string; avatar: string } | null>(null);
  const [selectedMod, setSelectedMod] = useState<Persona | null>(null);
  const [showSocialPopup, setShowSocialPopup] = useState(false);
  const [newWish, setNewWish] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'wishes' | 'about' | 'token' | 'how-it-works'>('wishes');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  const mods = [
    { name: 'BarryJingle', emoji: '🎄', role: 'Helper', color: 'text-emerald-400', persona: 'barry' as Persona, status: 'online' },
    { name: 'SantaMod69', emoji: '🎅', role: 'Mod', color: 'text-red-400', persona: 'santa' as Persona, status: 'online' },
    { name: 'xX_Krampus_Xx', emoji: '💀', role: 'Mod', color: 'text-purple-400', persona: 'grinch' as Persona, status: 'idle' },
    { name: 'elfgirluwu', emoji: '🧝', role: 'Mod', color: 'text-blue-400', persona: 'elf' as Persona, status: 'dnd' },
    { name: 'FrostyTheCoder', emoji: '☃️', role: 'Mod', color: 'text-slate-300', persona: 'snowman' as Persona, status: 'online' },
    { name: 'DasherSpeedrun', emoji: '🦌', role: 'Mod', color: 'text-orange-400', persona: 'reindeer' as Persona, status: 'offline' },
    { name: 'SantaKumar', emoji: '🕉️', role: 'Scammer', color: 'text-yellow-400', persona: 'scammer' as Persona, status: 'online' },
    { name: 'JingBells叮噹鈴', emoji: '🔔', role: 'Mod', color: 'text-red-400', persona: 'jingbells' as Persona, status: 'online' },
  ];

  const handleWishSubmitted = (wish: any) => {
    setNewWish(wish);
    setTimeout(() => setRefreshTrigger(prev => prev + 1), 2000);
  };

  const handleModClick = (persona: Persona) => {
    setSelectedMod(persona);
  };

  const handleCallMod = (persona: Persona) => {
    setSelectedMod(null);
    setActiveCall(persona);
  };

  useEffect(() => {
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      const profile = JSON.parse(profileData);
      setUserProfile({
        username: profile.username || 'AnonUser',
        avatar: profile.avatar || '👤',
      });
    }
  }, []);

  const handleProfileSave = (username: string, avatar: string) => {
    const profile = { username, avatar };
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleConnectWallet = () => {
    setShowWalletConnect(true);
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setUserProfile(null);
    localStorage.removeItem('userProfile');
  };

  useEffect(() => {
    fetch(`/api/wishes?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setTotalMessages(data.wishes?.length || 0);
      })
      .catch(err => console.error(err));
  }, [refreshTrigger]);

  useEffect(() => {
    setTimeout(() => setShowSocialPopup(true), 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-slate-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'idle': return 'Idle';
      case 'dnd': return 'Do Not Disturb';
      default: return 'Offline';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0c15] text-slate-300 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="absolute top-4 left-4 z-50 md:hidden p-2 bg-[#1e1f2e] rounded-md border border-white/5 text-white"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* LEFT SIDEBAR */}
      <aside className={`w-64 bg-[#11121c] flex-col border-r border-white/5 h-full ${isMobileMenuOpen ? 'flex absolute z-40' : 'hidden'} md:flex transition-transform duration-300`}>
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 group cursor-pointer">
            <img src="/assets/logo.webp" alt="WishCord" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-semibold tracking-tight text-white">WishCord</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          <div className="px-2 mb-2 flex items-center justify-between group">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Xmas Channels</span>
          </div>

          <button
            onClick={() => setActiveTab('wishes')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md group transition-all duration-200 ${activeTab === 'wishes' ? 'bg-[#2b2d3d]/50 text-white' : 'text-slate-400 hover:bg-[#2b2d3d]/30 hover:text-slate-200'}`}
          >
            <span className="text-slate-400">#</span>
            <span className="font-medium">xmas-wishes</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md group transition-all duration-200 ${activeTab === 'about' ? 'bg-[#2b2d3d]/50 text-white' : 'text-slate-400 hover:bg-[#2b2d3d]/30 hover:text-slate-200'}`}
          >
            <span className="text-slate-400">ℹ️</span>
            <span className="font-medium">About</span>
          </button>

          <button
            onClick={() => setActiveTab('token')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md group transition-all duration-200 ${activeTab === 'token' ? 'bg-[#2b2d3d]/50 text-white' : 'text-slate-400 hover:bg-[#2b2d3d]/30 hover:text-slate-200'}`}
          >
            <span className="text-slate-400">💰</span>
            <span className="font-medium">WISH Token</span>
          </button>

          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md group transition-all duration-200 ${activeTab === 'how-it-works' ? 'bg-[#2b2d3d]/50 text-white' : 'text-slate-400 hover:bg-[#2b2d3d]/30 hover:text-slate-200'}`}
          >
            <span className="text-slate-400">❓</span>
            <span className="font-medium">How It Works</span>
          </button>
        </nav>

        {/* User Status / Wallet Connect */}
        <div className="p-3 bg-[#0d0e14] border-t border-white/5">
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                  {userProfile?.avatar && userProfile.avatar.startsWith('data:') ? (
                    <img src={userProfile.avatar} alt={userProfile.username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{userProfile?.avatar || '👤'}</span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0d0e14] rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate text-white">{userProfile?.username || 'User'}</div>
                <div className="text-xs text-slate-500 truncate">Online</div>
              </div>
              <button
                onClick={() => setShowProfileSettings(true)}
                className="p-1.5 hover:bg-white/5 rounded transition-colors text-slate-400 hover:text-white"
                title="Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Connect Wallet
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0b0c15] relative">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#0b0c15]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 pl-10 md:pl-0">
            <span className="text-slate-400">#</span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                {activeTab === 'wishes' && 'xmas-wishes'}
                {activeTab === 'about' && 'About'}
                {activeTab === 'token' && 'WISH Token'}
                {activeTab === 'how-it-works' && 'How It Works'}
              </h1>
              <p className="text-xs hidden sm:block text-slate-400">
                {activeTab === 'wishes' && 'Drop your Xmas wish. Our AI mods are online 24/7.'}
                {activeTab === 'about' && 'Learn more about the Wishcord community.'}
                {activeTab === 'token' && 'Current market stats and wallet integration.'}
                {activeTab === 'how-it-works' && 'Your complete guide to WishCord ✨'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* WISHES VIEW */}
          {activeTab === 'wishes' && (
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 fade-in">
              {/* Input Area */}
              <div className="bg-[#1e1f2e] rounded-xl p-4 border border-white/5 shadow-lg">
                <div className="flex gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1 text-white">Post your wish</h3>
                    <p className="text-xs text-slate-500">The mods will respond...</p>
                  </div>
                </div>
                <WishForm onWishSubmitted={handleWishSubmitted} />
              </div>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-600">Today</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Messages */}
              <Feed refreshTrigger={refreshTrigger} newWish={newWish} />
            </div>
          )}

          {/* ABOUT VIEW */}
          {activeTab === 'about' && (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 fade-in">
              {/* Hero */}
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">❄️</div>
                <h2 className="text-3xl font-bold tracking-tight mb-3 text-white">About WishCord</h2>
                <p className="text-lg text-slate-400">
                  Where AI meets the holiday spirit 🎄✨
                </p>
              </div>

              {/* What is WishCord */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border border-white/5">
                <h3 className="text-2xl font-bold mb-3 text-indigo-400">🎅 What is WishCord?</h3>
                <p className="text-slate-300 leading-relaxed mb-3">
                  WishCord is a revolutionary social platform that combines the magic of the holiday season with cutting-edge AI technology. 
                  Share your Christmas wishes, create festive memes, send voice messages, and interact with AI-powered Christmas characters 
                  who respond in unique, entertaining personalities.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Built on the Solana blockchain with Web3 integration, WishCord creates a decentralized community where every wish is 
                  permanently recorded and every interaction is authentic.
                </p>
              </div>

              {/* Our AI Mods */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border border-white/5">
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">🤖 Meet Our AI Mods</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                    <h4 className="text-base font-semibold mb-1 flex items-center gap-2">
                      🎅 <span className="text-red-400">SantaMod69</span>
                    </h4>
                    <p className="text-sm text-slate-400">
                      The boomer admin of WishCord since 1823. Types in ALL CAPS occasionally. Everything reminds him of "BACK IN MY DAY."
                    </p>
                  </div>

                  <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                    <h4 className="text-base font-semibold mb-1 flex items-center gap-2">
                      💀 <span className="text-purple-400">xX_Krampus_Xx</span>
                    </h4>
                    <p className="text-sm text-slate-400">
                      The edgelord who thinks he's terrifying but tries too hard. Roasts wishes with 2000s scene kid energy.
                    </p>
                  </div>

                  <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                    <h4 className="text-base font-semibold mb-1 flex items-center gap-2">
                      🧝 <span className="text-pink-400">elfgirluwu</span>
                    </h4>
                    <p className="text-sm text-slate-400">
                      The extremely online e-girl who loves anime and kawaii culture. Uses "uwu" and "owo" unironically.
                    </p>
                  </div>

                  <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                    <h4 className="text-base font-semibold mb-1 flex items-center gap-2">
                      ☃️ <span className="text-cyan-400">FrostyTheCoder</span>
                    </h4>
                    <p className="text-sm text-slate-400">
                      The tech bro snowman who speaks in startup buzzwords and programming references. Everything is "scalable."
                    </p>
                  </div>

                  <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                    <h4 className="text-base font-semibold mb-1 flex items-center gap-2">
                      🦌 <span className="text-orange-400">DasherSpeedrun</span>
                    </h4>
                    <p className="text-sm text-slate-400">
                      The hyperactive gamer reindeer obsessed with speedrunning everything. Speaks in gaming terms and frame-perfect timing.
                    </p>
                  </div>

                  <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                    <h4 className="text-base font-semibold mb-1 flex items-center gap-2">
                      🕉️ <span className="text-yellow-400">SantaKumar</span>
                    </h4>
                    <p className="text-sm text-slate-400">
                      The "tech support" scammer who pretends to help but tries to get your wallet seed phrase. Comic relief warning.
                    </p>
                  </div>

                  <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                    <h4 className="text-base font-semibold mb-1 flex items-center gap-2">
                      🔔 <span className="text-red-400">JingBells叮噹鈴</span>
                    </h4>
                    <p className="text-sm text-slate-400">
                      The multilingual Chinese mod who mixes English with Mandarin. Drops wisdom about family, tradition, and crypto trading.
                    </p>
                  </div>

                  <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                    <h4 className="text-base font-semibold mb-1 flex items-center gap-2">
                      🎄 <span className="text-emerald-400">BarryJingle</span>
                    </h4>
                    <p className="text-sm text-slate-400">
                      The friendly and helpful guide who explains everything about WishCord. Always ready to assist newcomers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Features */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border border-white/5">
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">✨ Platform Features</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <h4 className="text-base font-semibold mb-0.5 text-white">Text Wishes</h4>
                      <p className="text-sm text-slate-400">Share your holiday wishes and get AI responses instantly</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-2xl">🎨</span>
                    <div>
                      <h4 className="text-base font-semibold mb-0.5 text-white">Meme Editor</h4>
                      <p className="text-sm text-slate-400">Create custom festive memes with our built-in editor and send them to the feed</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-2xl">🎤</span>
                    <div>
                      <h4 className="text-base font-semibold mb-0.5 text-white">Voice Messages</h4>
                      <p className="text-sm text-slate-400">Record voice wishes and get AI voice responses from your favorite mods</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-2xl">@</span>
                    <div>
                      <h4 className="text-base font-semibold mb-0.5 text-white">@Mention Tagging</h4>
                      <p className="text-sm text-slate-400">Tag specific mods using @SantaMod69 style mentions for targeted responses</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <h4 className="text-base font-semibold mb-0.5 text-white">Community Interaction</h4>
                      <p className="text-sm text-slate-400">React to wishes, post replies, and engage with the community</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-2xl">🔗</span>
                    <div>
                      <h4 className="text-base font-semibold mb-0.5 text-white">Web3 Integration</h4>
                      <p className="text-sm text-slate-400">Connect your Solana wallet for authenticated experiences and $WISH token access</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border border-white/5">
                <h3 className="text-2xl font-bold mb-4 text-indigo-400">⚙️ Powered By</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-[#11121c] rounded-lg border border-white/5">
                    <p className="font-semibold text-white text-sm">Claude AI</p>
                    <p className="text-xs text-slate-400 mt-1">Text Generation</p>
                  </div>
                  <div className="text-center p-3 bg-[#11121c] rounded-lg border border-white/5">
                    <p className="font-semibold text-white text-sm">GPT-4 Vision</p>
                    <p className="text-xs text-slate-400 mt-1">Image Analysis</p>
                  </div>
                  <div className="text-center p-3 bg-[#11121c] rounded-lg border border-white/5">
                    <p className="font-semibold text-white text-sm">OpenAI Whisper</p>
                    <p className="text-xs text-slate-400 mt-1">Voice Transcription</p>
                  </div>
                  <div className="text-center p-3 bg-[#11121c] rounded-lg border border-white/5">
                    <p className="font-semibold text-white text-sm">ElevenLabs</p>
                    <p className="text-xs text-slate-400 mt-1">Voice Synthesis</p>
                  </div>
                  <div className="text-center p-3 bg-[#11121c] rounded-lg border border-white/5">
                    <p className="font-semibold text-white text-sm">Next.js 14</p>
                    <p className="text-xs text-slate-400 mt-1">Framework</p>
                  </div>
                  <div className="text-center p-3 bg-[#11121c] rounded-lg border border-white/5">
                    <p className="font-semibold text-white text-sm">Supabase</p>
                    <p className="text-xs text-slate-400 mt-1">Database & Storage</p>
                  </div>
                  <div className="text-center p-3 bg-[#11121c] rounded-lg border border-white/5">
                    <p className="font-semibold text-white text-sm">Solana</p>
                    <p className="text-xs text-slate-400 mt-1">Blockchain</p>
                  </div>
                  <div className="text-center p-3 bg-[#11121c] rounded-lg border border-white/5">
                    <p className="font-semibold text-white text-sm">Fabric.js</p>
                    <p className="text-xs text-slate-400 mt-1">Canvas Editor</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl p-6 border border-indigo-500/30 text-center">
                <h3 className="text-xl font-bold mb-2 text-indigo-300">💎 $WISH Token</h3>
                <p className="text-slate-300 mb-4 text-sm">
                  $WISH is the native token powering the WishCord ecosystem. Hold $WISH to access premium features, 
                  exclusive AI personalities, and participate in governance decisions.
                </p>
                <button
                  onClick={() => setActiveTab('token')}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors text-sm"
                >
                  Learn More About $WISH →
                </button>
              </div>
            </div>
          )}

          {/* TOKEN VIEW */}
          {activeTab === 'token' && (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 fade-in">
              {/* Hero */}
              <div className="text-center mb-2">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  $WISH Token
                </h2>
                <p className="text-base text-slate-400">
                  The official token of WishCord. Make wishes, earn $WISH, and spread Christmas cheer on the blockchain! 🎄
                </p>
              </div>

              {/* Contract Address */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border border-white/5">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                  📜 Contract Address
                </h3>
                <div className="bg-[#11121c] rounded-lg p-6 border border-white/5 text-center">
                  <p className="text-slate-400 mb-2">
                    🚀 Token launching soon on Pump.fun!
                  </p>
                  <p className="text-slate-500 text-sm">
                    Contract address will be displayed here once deployed.
                  </p>
                </div>
              </div>

              {/* Tokenomics and Holders Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Tokenomics */}
                <div className="bg-[#1e1f2e] rounded-xl p-6 border border-white/5">
                  <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    📊 Tokenomics
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Total Supply</span>
                        <span className="text-white font-bold">1,000,000,000</span>
                      </div>
                    </div>

                    <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Network</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">Solana</span>
                          <span className="text-purple-400">⚡</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Tax</span>
                        <span className="text-green-400 font-bold">0% 🎉</span>
                      </div>
                    </div>

                    <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Launch Platform</span>
                        <span className="text-white font-bold">Pump.fun 🚀</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Holders */}
                <div className="bg-[#1e1f2e] rounded-xl p-6 border border-white/5">
                  <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    👑 Top 10 Holders
                  </h3>
                  <div className="bg-[#11121c] rounded-lg p-6 border border-white/5 text-center">
                    <p className="text-slate-400 mb-2">
                      📊 Holder data will appear here once token is live
                    </p>
                    <p className="text-slate-500 text-sm">
                      Awaiting contract deployment
                    </p>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border border-white/5">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                  🌐 Community & Socials
                </h3>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-6 py-3 bg-[#11121c] rounded-lg border border-white/5 text-slate-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter Coming Soon
                  </div>
                  <div className="flex items-center gap-2 px-6 py-3 bg-[#11121c] rounded-lg border border-white/5 text-slate-500">
                    📈 DexScreener Coming Soon
                  </div>
                  <div className="flex items-center gap-2 px-6 py-3 bg-[#11121c] rounded-lg border border-white/5 text-slate-500">
                    🛠️ DexTools Coming Soon
                  </div>
                </div>
              </div>

              {/* What is $WISH */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/30">
                <h3 className="text-xl font-bold mb-3 text-yellow-300 flex items-center gap-2">
                  💰 What is $WISH?
                </h3>
                <div className="space-y-3 text-slate-300 text-sm">
                  <p>
                    $WISH is the native utility token of the WishCord ecosystem, built on Solana for lightning-fast transactions and minimal fees.
                  </p>
                  <p>
                    <strong className="text-white">Token Benefits:</strong>
                  </p>
                  <ul className="space-y-1.5 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Access premium AI mod personalities and exclusive features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Participate in community governance and platform decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Earn rewards for creating engaging content and wishes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Unlock special badges, avatars, and profile customization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Early access to new features and AI mod releases</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Roadmap */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border border-white/5">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                  🗺️ Roadmap
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">Phase 1: Platform Launch</h4>
                      <p className="text-slate-400 text-xs">WishCord platform with 8 AI mods, voice calls, meme editor</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-sm font-bold">
                      ⏳
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">Phase 2: $WISH Token Launch</h4>
                      <p className="text-slate-400 text-xs">Token deployment on Pump.fun, liquidity pool creation</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-bold">
                      ○
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">Phase 3: Premium Features</h4>
                      <p className="text-slate-400 text-xs">Token-gated content, exclusive mods, staking rewards</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-bold">
                      ○
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">Phase 4: Ecosystem Expansion</h4>
                      <p className="text-slate-400 text-xs">Mobile app, NFT integration, DAO governance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HOW IT WORKS VIEW */}
          {activeTab === 'how-it-works' && (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 fade-in">
              {/* Hero */}
              <div className="text-center mb-4">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="text-lg text-slate-400">
                  Your complete guide to WishCord ✨
                </p>
              </div>

              {/* Step 1 */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border-l-4 border-indigo-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-lg font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-indigo-400">Connect Your Wallet (Optional)</h3>
                    <p className="text-slate-300 mb-3">
                      Click "Connect Wallet" at the bottom-left corner of the page to link your Solana wallet. This gives you:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 ml-4">
                      <li>Verified identity with your wallet address</li>
                      <li>Custom username and avatar</li>
                      <li>Access to your wish history</li>
                      <li>$WISH token integration</li>
                    </ul>
                    <p className="text-sm text-slate-500 mt-3 italic">
                      💡 Tip: You can also use WishCord anonymously without connecting a wallet!
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border-l-4 border-green-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-lg font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-green-400">Set Up Your Profile</h3>
                    <p className="text-slate-300 mb-3">
                      Create your unique identity:
                    </p>
                    <div className="space-y-2">
                      <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <p className="text-white font-semibold mb-1">1. Choose a Username</p>
                        <p className="text-sm text-slate-400">Pick a name that represents you (max 20 characters)</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <p className="text-white font-semibold mb-1">2. Select an Avatar</p>
                        <p className="text-sm text-slate-400">Pick from emojis or upload a custom avatar</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <p className="text-white font-semibold mb-1">3. Save Your Profile</p>
                        <p className="text-sm text-slate-400">Your profile is stored and synced across devices</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border-l-4 border-purple-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-purple-400">Create Your Wish</h3>
                    <p className="text-slate-300 mb-3">
                      Express yourself in multiple ways:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                          📝 Text Wishes
                        </h4>
                        <p className="text-slate-400 text-sm mb-1">
                          Type your wish (up to 500 characters). You can:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm ml-4">
                          <li>Share holiday wishes and dreams</li>
                          <li>Ask for advice or guidance</li>
                          <li>Tell jokes or share stories</li>
                          <li>Use <code className="bg-[#11121c] px-1 rounded">@SantaMod69</code> to tag specific mods</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                          🎨 Meme Creator
                        </h4>
                        <p className="text-slate-400 text-sm mb-1">
                          Click the "📷 Add Image" button to create festive memes
                        </p>
                        <p className="text-sm text-yellow-500 mt-1">
                          ✨ AI mods can analyze your meme and respond to its content!
                        </p>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                          🎤 Voice Messages
                        </h4>
                        <p className="text-slate-400 text-sm mb-1">
                          Click the "🎤 Voice" button to record audio (max 60 seconds)
                        </p>
                        <p className="text-sm text-yellow-500 mt-1">
                          ✨ AI will transcribe your voice and respond with synthesized speech!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border-l-4 border-yellow-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-lg font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-yellow-400">Select an AI Mod</h3>
                    <p className="text-slate-300 mb-3">
                      Choose which AI personality responds to your wish:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-[#11121c] rounded-lg p-2 border border-white/5">
                        <p className="font-semibold text-red-400 text-sm">🎅 SantaMod69</p>
                        <p className="text-xs text-slate-400">Boomer admin - ALL CAPS energy</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-2 border border-white/5">
                        <p className="font-semibold text-purple-400 text-sm">💀 xX_Krampus_Xx</p>
                        <p className="text-xs text-slate-400">Edgelord with 2000s vibes</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-2 border border-white/5">
                        <p className="font-semibold text-pink-400 text-sm">🧝 elfgirluwu</p>
                        <p className="text-xs text-slate-400">Anime e-girl - uwu master</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-2 border border-white/5">
                        <p className="font-semibold text-cyan-400 text-sm">☃️ FrostyTheCoder</p>
                        <p className="text-xs text-slate-400">Tech bro - startup buzzwords</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-2 border border-white/5">
                        <p className="font-semibold text-orange-400 text-sm">🦌 DasherSpeedrun</p>
                        <p className="text-xs text-slate-400">Gamer - speedrun everything</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-2 border border-white/5">
                        <p className="font-semibold text-yellow-400 text-sm">🕉️ SantaKumar</p>
                        <p className="text-xs text-slate-400">Scammer - wants your seed phrase</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-2 border border-white/5">
                        <p className="font-semibold text-red-400 text-sm">🔔 JingBells叮噹鈴</p>
                        <p className="text-xs text-slate-400">Multilingual - wisdom & crypto</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-2 border border-white/5">
                        <p className="font-semibold text-emerald-400 text-sm">🎄 BarryJingle</p>
                        <p className="text-xs text-slate-400">Helper - explains everything</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-3 italic">
                      💡 Tip: Use @mentions in your text to tag multiple mods at once!
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border-l-4 border-pink-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-lg font-bold">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-pink-400">Get AI Response</h3>
                    <p className="text-slate-300 mb-3">
                      Watch as your chosen mod crafts a personalized response:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <span className="text-xl">⚡</span>
                        <div>
                          <p className="text-white font-semibold text-sm">Instant Response</p>
                          <p className="text-xs text-slate-400">AI generates reply in 2-5 seconds</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <span className="text-xl">🎭</span>
                        <div>
                          <p className="text-white font-semibold text-sm">Unique Personality</p>
                          <p className="text-xs text-slate-400">Each mod has distinct voice & style</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <span className="text-xl">🖼️</span>
                        <div>
                          <p className="text-white font-semibold text-sm">Context-Aware</p>
                          <p className="text-xs text-slate-400">Mods "see" images and "hear" voice messages</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-[#1e1f2e] rounded-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg font-bold">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-blue-400">Engage with Community</h3>
                    <p className="text-slate-300 mb-3">
                      Interact with other wishes:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <p className="text-xl mb-1">👍</p>
                        <p className="font-semibold text-white text-sm mb-0.5">React</p>
                        <p className="text-xs text-slate-400">Add emoji reactions to any wish</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <p className="text-xl mb-1">💬</p>
                        <p className="font-semibold text-white text-sm mb-0.5">Reply</p>
                        <p className="text-xs text-slate-400">Post comments and join discussions</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <p className="text-xl mb-1">📤</p>
                        <p className="font-semibold text-white text-sm mb-0.5">Share</p>
                        <p className="text-xs text-slate-400">Copy link or share on social media</p>
                      </div>
                      <div className="bg-[#11121c] rounded-lg p-3 border border-white/5">
                        <p className="text-xl mb-1">🔊</p>
                        <p className="font-semibold text-white text-sm mb-0.5">Voice Call</p>
                        <p className="text-xs text-slate-400">Have live AI voice conversations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/30">
                <h3 className="text-xl font-bold mb-3 text-yellow-300 flex items-center gap-2">
                  💡 Pro Tips
                </h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span>Use <code className="bg-[#1a1b1e] px-2 py-0.5 rounded text-xs">@ModName</code> tags to get responses from multiple mods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span>Combine text, images, and voice in one wish for engaging responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span>Check the Members list to see who's active and their wish counts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span>Visit user profiles to see their wish history and stats</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span>Hold $WISH tokens to unlock premium features and exclusive mods</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* RIGHT SIDEBAR - Mods & Members (Desktop) */}
      <aside className="w-64 bg-[#11121c] border-l border-white/5 hidden lg:flex flex-col p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
          Mods Online — {mods.filter(m => m.status === 'online').length}
        </h3>

        <div className="flex flex-col gap-1 mb-6">
          {mods.map((mod) => (
            <div
              key={mod.name}
              onClick={() => handleModClick(mod.persona)}
              className="flex items-center gap-3 p-2 rounded cursor-pointer group transition-colors hover:bg-white/5"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                  {mod.emoji}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#11121c] flex items-center justify-center rounded-full">
                  <span className={`w-2 h-2 ${getStatusColor(mod.status)} rounded-full`}></span>
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${mod.color}`}>{mod.name}</div>
                <div className="text-[10px] text-slate-500">{mod.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Members List */}
        <MembersList />
      </aside>

      {/* MOBILE SIDEBAR - Swipeable from right */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info: PanInfo) => {
                if (info.offset.x > 100 || info.velocity.x > 500) {
                  setIsMobileSidebarOpen(false);
                }
              }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#11121c] border-l border-white/5 z-50 lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-[#11121c] z-10">
                <h3 className="text-lg font-bold text-white">Mods & Members</h3>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                {/* Mods */}
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                  Mods Online — {mods.filter(m => m.status === 'online').length}
                </h4>

                <div className="flex flex-col gap-1 mb-6">
                  {mods.map((mod) => (
                    <div
                      key={mod.name}
                      onClick={() => {
                        handleModClick(mod.persona);
                        setIsMobileSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 p-2 rounded cursor-pointer group transition-colors hover:bg-white/5"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                          {mod.emoji}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#11121c] flex items-center justify-center rounded-full">
                          <span className={`w-2 h-2 ${getStatusColor(mod.status)} rounded-full`}></span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold truncate ${mod.color}`}>{mod.name}</div>
                        <div className="text-[10px] text-slate-500">{mod.role}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Members List */}
                <MembersList />
              </div>

              {/* Swipe indicator */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1 h-16 bg-white/20 rounded-l-full" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      {selectedMod && (
        <ModProfileModal
          isOpen={!!selectedMod}
          persona={selectedMod}
          onClose={() => setSelectedMod(null)}
          onCall={() => handleCallMod(selectedMod)}
        />
      )}

      {activeCall && <VoiceCallAgent persona={activeCall} onClose={() => setActiveCall(null)} />}

      <SocialMediaPopup isOpen={showSocialPopup} onClose={() => setShowSocialPopup(false)} />

      {/* Profile Settings Modal */}
      {walletAddress && userProfile && (
        <ProfileSettingsModal
          isOpen={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
          currentUsername={userProfile.username}
          currentAvatar={userProfile.avatar}
          walletAddress={walletAddress}
          onSave={handleProfileSave}
        />
      )}

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletConnect}
        onClose={() => setShowWalletConnect(false)}
      />
    </div>
  );
}
