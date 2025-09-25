'use client';

import React, { useState, useEffect } from 'react';
import { useClubs } from '@/context/ClubContext';
import { Check } from 'lucide-react';
import MiniCalendar from './MiniCalendar';

interface ClubFilterProps {
  activeDate?: Date;
  onChangeDate?: (d: Date) => void;
  theme?: 'light' | 'dark';
}

const ClubFilter: React.FC<ClubFilterProps> = ({ activeDate, onChangeDate, theme = 'light' }) => {
  const { clubs, toggleClub } = useClubs();

  const [miniDate, setMiniDate] = useState(activeDate || new Date());

  // Sync internal mini calendar month when parent activeDate changes
  useEffect(() => {
    if (!activeDate) return;
    if (miniDate.getFullYear() !== activeDate.getFullYear() || miniDate.getMonth() !== activeDate.getMonth()) {
      setMiniDate(activeDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDate]);

  const isLight = theme === 'light';
  return (
    <div className={`h-full flex flex-col border-r ${isLight ? 'bg-white text-gray-800 border-gray-200' : 'bg-[#0d0e0f] text-gray-200 border-[#1e2022]'}`}>
      <div className="px-4 pt-6 pb-4">
        <MiniCalendar
          value={miniDate}
          activeDate={miniDate}
          onChange={(d) => { setMiniDate(d); onChangeDate?.(d); }}
          onMonthChange={(d) => { setMiniDate(d); onChangeDate?.(d); }}
          theme={theme}
        />
      </div>
  {/* Section header */}
  <div className={`px-4 text-[12px] tracking-wide font-semibold uppercase mt-2 mb-4 select-none ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Clubs</div>
  <div className="flex-1 overflow-y-auto px-2">
        {clubs.map(club => (
          <button
            key={club.id}
            onClick={() => toggleClub(club.id)}
            className={`w-full flex items-center gap-4 rounded-lg px-4 py-3.5 text-left text-[13px] transition-colors group ${isLight ? 'hover:bg-gray-100' : 'hover:bg-[#2A2A2A]'}`}
          >
            <span
              className="h-4 w-4 rounded-md flex-shrink-0"
              style={{ 
                backgroundColor: club.enabled ? club.color : 'transparent',
                border: club.enabled ? 'none' : '1px solid #404245'
              }}
            />
            <span className={`truncate ${club.enabled ? (isLight ? 'text-gray-800' : 'text-gray-200') : 'text-gray-500'}`}>{club.name}</span>
            {club.enabled && <Check className={`ml-auto w-3.5 h-3.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClubFilter;