'use client';

import { useState, useEffect } from 'react';
import WishForm from '@/components/WishForm';
import Feed from '@/components/Feed';
import VoiceCallAgent from '@/components/VoiceCallAgent';
import ModProfileModal from '@/components/ModProfileModal';
import SocialMediaPopup from '@/components/SocialMediaPopup';
import type { Persona } from '@/typings/types';

export default function HomePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [activeCall, setActiveCall] = useState<Persona | null>(null);
  const [userProfile, setUserProfile] = useState<{ username: string; avatar: string } | null>(null);
  const [selectedMod, setSelectedMod] = useState<Persona | null>(null);
  const [showSocialPopup, setShowSocialPopup] = useState(false);
  const [newWish, setNewWish] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'wishes' | 'about' | 'token' | 'how-it-works'>('wishes');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        {/* User Status */}
        <div className="p-3 bg-[#0d0e14] flex items-center gap-3 border-t border-white/5">
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
            <div className="text-sm font-semibold truncate text-white">{userProfile?.username || 'AnonUser'}</div>
            <div className="text-xs text-slate-500 truncate">Online</div>
          </div>
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

          <button className="bg-[#5865F2] hover:bg-[#4752c4] px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 text-white">
            <span>🔗</span>
            <span className="hidden sm:inline">Connect</span>
          </button>
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
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">❄️</div>
                <h2 className="text-2xl font-semibold tracking-tight mb-2 text-white">About Wishcord</h2>
                <p className="max-w-lg mx-auto leading-relaxed text-slate-400">
                  The ultimate holiday hangout for devs who'd rather be coding than wrapping gifts. Connect your wallet to receive virtual coal or $WISH tokens.
                </p>
              </div>
            </div>
          )}

          {/* TOKEN VIEW */}
          {activeTab === 'token' && (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 fade-in">
              <div className="bg-[#1e1f2e] border border-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-white">$WISH Token</h2>
                    <p className="text-sm text-slate-400">The currency of the North Pole.</p>
                  </div>
                  <div className="bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium border border-green-500/20 text-green-400">
                    +24.5% 📈
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
                      Click "Connect Wallet" in the top-right corner to link your Solana wallet. This gives you:
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

      {/* RIGHT SIDEBAR - Mods */}
      <aside className="w-64 bg-[#11121c] border-l border-white/5 hidden lg:flex flex-col p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
          Mods Online — {mods.filter(m => m.status === 'online').length}
        </h3>

        <div className="flex flex-col gap-1">
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
      </aside>

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
    </div>
  );
}
