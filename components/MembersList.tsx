'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/wallet-context';

interface Member {
  wallet_address: string;
  username: string;
  avatar: string;
  last_active: string;
  is_online: boolean;
}

export default function MembersList() {
  const { walletAddress } = useWallet();
  const [members, setMembers] = useState<Member[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    fetchMembers();
    
    // Update member activity when wallet is connected
    if (walletAddress) {
      updateMemberActivity();
    }

    // Refresh members list every 45 seconds (less aggressive)
    const interval = setInterval(() => {
      fetchMembers();
      if (walletAddress) {
        updateMemberActivity();
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [walletAddress]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/members?t=${Date.now()}`, {
        next: { revalidate: 30 } // Cache for 30 seconds
      });
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members);
        setOnlineCount(data.members.filter((m: Member) => m.is_online).length);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const updateMemberActivity = async () => {
    if (!walletAddress) return;

    // Get profile from localStorage
    const profileData = localStorage.getItem('userProfile');
    const profile = profileData ? JSON.parse(profileData) : null;

    try {
      await fetch('/api/members/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          username: profile?.username || 'Anonymous',
          avatar: profile?.avatar || '👤',
        }),
      });
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Sort members: online first, then by last active
  const onlineMembers = members.filter(m => m.is_online).sort((a, b) => 
    new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
  );
  const offlineMembers = members.filter(m => !m.is_online).sort((a, b) => 
    new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
  );

  return (
    <div className="border-t border-white/5 pt-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
        Members — {members.length}
      </h3>
      
      <div className="text-xs text-slate-400 mb-3 px-2">
        {onlineCount} online
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
        {/* Online Members */}
        {onlineMembers.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Online</p>
            {onlineMembers.map((member) => (
              <div
                key={member.wallet_address}
                className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500">
                    {member.avatar.startsWith('data:') ? (
                      <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{member.avatar}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#11121c] bg-green-500"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-300 truncate">
                    {member.username}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {truncateAddress(member.wallet_address)}
                  </p>
                </div>
                {walletAddress === member.wallet_address && (
                  <span className="text-xs bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Offline</p>
            {offlineMembers.map((member) => (
              <div
                key={member.wallet_address}
                className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors opacity-60"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-500 to-slate-600">
                    {member.avatar.startsWith('data:') ? (
                      <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{member.avatar}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#11121c] bg-slate-600"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-400 truncate">
                    {member.username}
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    {truncateAddress(member.wallet_address)}
                  </p>
                </div>
                {walletAddress === member.wallet_address && (
                  <span className="text-xs bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {members.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-sm">
            No members yet
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f1011;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4e5058;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5e6068;
        }
      `}</style>
    </div>
  );
}
