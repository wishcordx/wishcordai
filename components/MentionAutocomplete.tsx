'use client';

import { useEffect, useRef } from 'react';

interface Mention {
  id: string;
  name: string;
  avatar: string;
}

interface MentionAutocompleteProps {
  mentions: Mention[];
  onSelect: (mention: Mention) => void;
  position: { top: number; left: number };
  selectedIndex: number;
}

const MODS: Mention[] = [
  { id: '@SantaMod69', name: 'SantaMod69', avatar: '🎅' },
  { id: '@xX_Krampus_Xx', name: 'xX_Krampus_Xx', avatar: '😈' },
  { id: '@elfgirluwu', name: 'elfgirluwu', avatar: '🧝‍♀️' },
  { id: '@FrostyTheCoder', name: 'FrostyTheCoder', avatar: '⛄' },
  { id: '@DasherSpeedrun', name: 'DasherSpeedrun', avatar: '🦌' },
  { id: '@SantaKumar', name: 'SantaKumar', avatar: '🤖' },
  { id: '@JingBells叮噹鈴', name: 'JingBells叮噹鈴', avatar: '🔔' },
];

export default function MentionAutocomplete({
  mentions,
  onSelect,
  position,
  selectedIndex,
}: MentionAutocompleteProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll selected item into view
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (mentions.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="fixed z-[9999] bg-[#1e1f22] border border-indigo-500 rounded-lg shadow-2xl max-h-64 overflow-y-auto w-[calc(100vw-2rem)] sm:w-auto"
      style={{
        top: `${position.top}px`,
        left: `${Math.min(position.left, window.innerWidth - 270)}px`,
        minWidth: '250px',
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      {mentions.map((mention, index) => (
        <button
          key={mention.id}
          onClick={() => onSelect(mention)}
          className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#202225] transition-colors ${
            index === selectedIndex ? 'bg-[#202225]' : ''
          }`}
        >
          <span className="text-2xl">{mention.avatar}</span>
          <span className="text-white font-medium">{mention.id}</span>
        </button>
      ))}
    </div>
  );
}

export { MODS };
export type { Mention };
