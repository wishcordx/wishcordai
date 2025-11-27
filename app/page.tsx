'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import WishForm from '@/components/WishForm';
import Feed from '@/components/Feed';
import VoiceCallAgent from '@/components/VoiceCallAgent';
import MembersList from '@/components/MembersList';
import ModProfileModal from '@/components/ModProfileModal';
import MobileSidebar from '@/components/MobileSidebar';
import SocialMediaPopup from '@/components/SocialMediaPopup';
import type { Persona } from '@/typings/types';

export default function HomePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [activeCall, setActiveCall] = useState<Persona | null>(null);
  const [userProfile, setUserProfile] = useState<{ username: string; avatar: string } | null>(null);
  const [selectedMod, setSelectedMod] = useState<Persona | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newWish, setNewWish] = useState<any>(null);
  const [showSocialPopup, setShowSocialPopup] = useState(false);

  const handleWishSubmitted = (wish: any) => {
    setNewWish(wish);
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 2000);
  };

  const handleModClick = (persona: Persona) => {
    console.log('Mod clicked:', persona);
    setSelectedMod(persona);
  };

  const handleCallMod = (persona: Persona) => {
    console.log('Calling mod:', persona);
    setSelectedMod(null);
    setActiveCall(persona);
  };

  const handleCloseCall = () => {
    setActiveCall(null);
  };

  useEffect(() => {
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      const profile = JSON.parse(profileData);
      setUserProfile({
        username: profile.username || 'Anonymous',
        avatar: profile.avatar || '👤',
      });
    }
  }, []);

  useEffect(() => {
    fetch(`/api/wishes?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTotalMessages(data.wishes?.length || 0);
        }
      })
      .catch(err => console.error('Failed to fetch count:', err));
  }, [refreshTrigger]);

  useEffect(() => {
    setTimeout(() => setShowSocialPopup(true), 1000);
  }, []);

  const handleSocialClose = () => {
    setShowSocialPopup(false);
  };

  const mods = [
    { name: 'BarryJingle', emoji: '🎄', role: 'Helper', color: 'text-green-400', persona: 'barry' as Persona },
    { name: 'SantaMod69', emoji: '🎅', role: 'Mod', color: 'text-red-400', persona: 'santa' as Persona },
    { name: 'xX_Krampus_Xx', emoji: '💀', role: 'Mod', color: 'text-purple-400', persona: 'grinch' as Persona },
    { name: 'elfgirluwu', emoji: '🧝', role: 'Mod', color: 'text-pink-400', persona: 'elf' as Persona },
    { name: 'FrostyTheCoder', emoji: '☃️', role: 'Mod', color: 'text-cyan-400', persona: 'snowman' as Persona },
    { name: 'DasherSpeedrun', emoji: '🦌', role: 'Mod', color: 'text-orange-400', persona: 'reindeer' as Persona },
    { name: 'SantaKumar', emoji: '🕉️', role: 'Scammer', color: 'text-yellow-400', persona: 'scammer' as Persona },
    { name: 'JingBells叮噹鈴', emoji: '🔔', role: 'Mod', color: 'text-red-400', persona: 'jingbells' as Persona },
  ];

  return (
    <main className="min-h-screen flex bg-[#313338]">
      {/* Left Sidebar - Navigation (Desktop Only) */}
      <div className="hidden lg:flex flex-col w-60 bg-[#2b2d31]">
        {/* Logo & Name */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.webp" alt="WishCord" className="w-12 h-12 rounded-lg" />
            <div>
              <h1 className="text-white font-bold text-lg">WishCord</h1>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="space-y-0.5">
            <a
              href="/"
              className="flex items-center gap-3 px-2 py-2 rounded text-white bg-[#404249] font-medium"
            >
              <span className="text-gray-400 text-xl">#</span>
              <span className="text-sm">xmas-wishes</span>
            </a>
            <a
              href="/about"
              className="flex items-center gap-3 px-2 py-2 rounded text-[#949ba4] hover:bg-[#35383e] hover:text-[#dbdee1] transition-colors"
            >
              <span className="text-xl">👤</span>
              <span className="text-sm">About</span>
            </a>
            <a
              href="/how-it-works"
              className="flex items-center gap-3 px-2 py-2 rounded text-[#949ba4] hover:bg-[#35383e] hover:text-[#dbdee1] transition-colors"
            >
              <span className="text-xl">❓</span>
              <span className="text-sm">How It Works</span>
            </a>
            <a
              href="/wishtoken"
              className="flex items-center gap-3 px-2 py-2 rounded text-[#949ba4] hover:bg-[#35383e] hover:text-[#dbdee1] transition-colors"
            >
              <span className="text-xl">💰</span>
              <span className="text-sm">WISH Token</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40">
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Chat Area - Center */}
        <div className="flex-1 flex flex-col pt-16 lg:pt-0 bg-[#313338]">
          {/* Channel Header */}
          <div className="px-4 py-3 border-b border-[#1e1f22] bg-[#313338] shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl text-gray-400">#</span>
              <h2 className="text-xl font-bold text-white">xmas-wishes</h2>
            </div>
            <p className="text-gray-400 text-sm mt-0.5">
              Drop your Xmas wish. Our AI mods are online 24/7 and ready to roast. 💀
            </p>
          </div>

          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-full px-4 py-4 space-y-4">
              {/* Post Message Box */}
              <div className="bg-[#383a40] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                    {userProfile?.avatar ? (
                      userProfile.avatar.startsWith('data:') ? (
                        <img src={userProfile.avatar} alt={userProfile.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{userProfile.avatar}</span>
                      )
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{userProfile?.username || 'Post your wish'}</p>
                    <p className="text-xs text-gray-400">The mods will respond...</p>
                  </div>
                </div>
                <WishForm onWishSubmitted={handleWishSubmitted} />
              </div>

              {/* Messages Feed */}
              <Feed refreshTrigger={refreshTrigger} newWish={newWish} />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Mods List (Desktop Only) */}
        <div className="hidden lg:flex flex-col w-64 bg-[#2b2d31]">
          {/* Connect Button */}
          <div className="p-3">
            <button className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>🔗</span>
              <span>Connect</span>
            </button>
          </div>
          
          <div className="px-3 py-2">
            <h3 className="text-white font-semibold text-xs uppercase tracking-wide">Mods Online</h3>
          </div>

          {/* Mods List */}
          <div className="overflow-y-auto px-2 pb-2">
            <div className="space-y-0.5">
              {mods.map((mod) => (
                <div
                  key={mod.name}
                  onClick={() => handleModClick(mod.persona)}
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[#35383e] transition-colors cursor-pointer group"
                >
                  <div className="relative">
                    <span className="text-2xl">{mod.emoji}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a55a] rounded-full border-2 border-[#2b2d31]"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${mod.color}`}>
                      {mod.name}
                    </p>
                    <p className="text-xs text-[#949ba4]">{mod.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members List */}
          <div className="border-t border-[#1e1f22] px-2 py-2">
            <MembersList />
          </div>
        </div>
      </div>

      {/* Mod Profile Modal */}
      {selectedMod && (
        <ModProfileModal
          isOpen={!!selectedMod}
          persona={selectedMod}
          onClose={() => setSelectedMod(null)}
          onCall={() => handleCallMod(selectedMod)}
        />
      )}

      {/* Voice Call Modal */}
      {activeCall && (
        <VoiceCallAgent persona={activeCall} onClose={handleCloseCall} />
      )}

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onModClick={handleModClick}
        totalMessages={totalMessages}
      />

      {/* Social Media Popup */}
      <SocialMediaPopup isOpen={showSocialPopup} onClose={handleSocialClose} />
    </main>
  );
}
