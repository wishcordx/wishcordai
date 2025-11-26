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

  const handleWishSubmitted = (wish: any) => {
    // Add new wish to feed instantly
    setNewWish(wish);
    // Trigger background refresh after a delay to sync with server
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
    setSelectedMod(null); // Close modal
    setActiveCall(persona);
  };

  const handleCloseCall = () => {
    setActiveCall(null);
  };

  useEffect(() => {
    // Load user profile from localStorage
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
    // Fetch total count
    fetch(`/api/wishes?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTotalMessages(data.wishes?.length || 0);
        }
      })
      .catch(err => console.error('Failed to fetch count:', err));
  }, [refreshTrigger]);

  return (
    <main className="min-h-screen">
      <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
      
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8">
        {/* Discord Channel Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="text-xl sm:text-2xl text-gray-400">#</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">xmas-wishes</h2>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            Drop your Xmas wish. Our AI mods are online 24/7 and ready to roast. 💀
          </p>
        </div>

        {/* Main Content - Discord Layout */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Chat Area - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* Post Message Box */}
            <div className="bg-[#202225] rounded-lg p-3 sm:p-6 border border-[#0f1011]">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                  {userProfile?.avatar ? (
                    userProfile.avatar.startsWith('data:') ? (
                      <img src={userProfile.avatar} alt={userProfile.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base sm:text-xl">{userProfile.avatar}</span>
                    )
                  ) : (
                    <span className="text-base sm:text-xl">👤</span>
                  )}
                </div>
                <div>
                  <p className="text-sm sm:text-base text-white font-medium">{userProfile?.username || 'Post your wish'}</p>
                  <p className="text-xs text-gray-400">The mods will respond...</p>
                </div>
              </div>
              <WishForm onWishSubmitted={handleWishSubmitted} />
            </div>

            {/* Messages Feed */}
            <div className="space-y-3">
              <Feed refreshTrigger={refreshTrigger} newWish={newWish} />
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-[#1e1f22] rounded-lg p-5 border border-[#0f1011] sticky top-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Mods Online — 7
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'SantaMod69', emoji: '🎅', role: 'Mod', color: 'text-red-400', persona: 'santa' as Persona },
                  { name: 'xX_Krampus_Xx', emoji: '💀', role: 'Mod', color: 'text-purple-400', persona: 'grinch' as Persona },
                  { name: 'elfgirluwu', emoji: '🧝', role: 'Mod', color: 'text-pink-400', persona: 'elf' as Persona },
                  { name: 'FrostyTheCoder', emoji: '☃️', role: 'Mod', color: 'text-cyan-400', persona: 'snowman' as Persona },
                  { name: 'DasherSpeedrun', emoji: '🦌', role: 'Mod', color: 'text-orange-400', persona: 'reindeer' as Persona },
                  { name: 'SantaKumar', emoji: '🕉️', role: 'Scammer', color: 'text-yellow-400', persona: 'scammer' as Persona },
                  { name: 'JingBells叮噹鈴', emoji: '🔔', role: 'Mod', color: 'text-red-400', persona: 'jingbells' as Persona },
                ].map((mod) => (
                  <div 
                    key={mod.name} 
                    onClick={() => handleModClick(mod.persona)}
                    className="flex items-center gap-3 p-2 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <span className="text-2xl">{mod.emoji}</span>
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2b2d31]"></span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${mod.color}`}>{mod.name}</p>
                      <p className="text-xs text-gray-500">{mod.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#1e1f22]">
                <p className="text-xs text-gray-500 mb-2">Server Stats</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Total Messages</span>
                    <span className="text-white font-medium">{totalMessages}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white font-medium">Nov 2025</span>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <MembersList />
            </div>
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
      <SocialMediaPopup />
    </main>
  );
}
