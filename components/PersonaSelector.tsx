'use client';

import { PERSONAS, getAllPersonas } from '@/lib/personas';
import type { Persona } from '@/typings/types';

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onSelect: (persona: Persona) => void;
  onCallMod?: (persona: Persona) => void;
}

export default function PersonaSelector({ selectedPersona, onSelect, onCallMod }: PersonaSelectorProps) {
  const personas = getAllPersonas();

  return (
    <div className="flex flex-wrap gap-2">
      {personas.map((persona) => {
        const config = PERSONAS[persona];
        const isSelected = selectedPersona === persona;
        
        return (
          <div key={persona} className="flex gap-1">
            <button
              onClick={() => onSelect(persona)}
              type="button"
              className={`
                px-3 py-2 rounded-md text-sm font-medium
                transition-all duration-200 flex items-center gap-2
                ${isSelected 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-[#1e1f22] text-gray-300 hover:bg-[#2b2d31] border border-[#0f1011]'
                }
              `}
            >
              <span className="text-lg">{config.emoji}</span>
              <span>{config.name}</span>
            </button>
            
            {onCallMod && (
              <button
                onClick={() => onCallMod(persona)}
                type="button"
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1"
                title={`Call ${config.name}`}
              >
                📞
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
