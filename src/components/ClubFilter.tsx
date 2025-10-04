'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useClubs } from '@/context/ClubContext';
import { Check, ArrowUpDown } from 'lucide-react';
import MiniCalendar from './MiniCalendar';

interface ClubFilterProps {
  activeDate?: Date;
  onChangeDate?: (d: Date) => void;
  theme?: 'light' | 'dark';
}

const ClubFilter: React.FC<ClubFilterProps> = ({ activeDate, onChangeDate, theme = 'light' }) => {
  const { clubs, toggleClub } = useClubs();

  // Search state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'name-desc' | 'enabled-first'>('default');

  // Debounce search input for fast filtering
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 120);
    return () => clearTimeout(handler);
  }, [search]);

  // Filtered and sorted clubs
  const filteredClubs = useMemo(() => {
    let result = clubs;
    
    // Filter by search
    if (debouncedSearch.trim()) {
      const s = debouncedSearch.trim().toLowerCase();
      result = result.filter(club => club.name.toLowerCase().includes(s));
    }
    
    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'enabled-first':
        sorted.sort((a, b) => {
          if (a.enabled && !b.enabled) return -1;
          if (!a.enabled && b.enabled) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
      default:
        // Keep original order
        break;
    }
    
    return sorted;
  }, [clubs, debouncedSearch, sortBy]);

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
    <div
      className={`w-full h-full min-h-0 flex flex-col ${
        isLight
          ? 'bg-gray-50 text-gray-800 border-r border-gray-200'
          : 'bg-[#101215] text-gray-200 border-r border-[#1e2022]'
      }`}
    >
      <div className="px-4 pt-6 pb-4 flex-shrink-0">
        <MiniCalendar
          value={miniDate}
          activeDate={miniDate}
          onChange={(d) => { setMiniDate(d); onChangeDate?.(d); }}
          onMonthChange={(d) => { setMiniDate(d); onChangeDate?.(d); }}
          theme={theme}
        />
      </div>
  {/* Section header */}
  <div className={`px-4 text-[12px] tracking-wide font-semibold uppercase mt-2 mb-2 select-none flex-shrink-0 flex items-center justify-between ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
    <span>Clubs</span>
    <div className="relative">
      <button
        onClick={() => {
          const order: Array<typeof sortBy> = ['default', 'name-asc', 'name-desc', 'enabled-first'];
          const currentIdx = order.indexOf(sortBy);
          setSortBy(order[(currentIdx + 1) % order.length]);
        }}
        className={`p-1 rounded transition-colors ${isLight ? 'hover:bg-gray-200' : 'hover:bg-[#2a2c2f]'}`}
        title={`Sort: ${sortBy === 'default' ? 'Default' : sortBy === 'name-asc' ? 'A-Z' : sortBy === 'name-desc' ? 'Z-A' : 'Enabled First'}`}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
  {/* Search bar */}
  <div className="px-4 mb-2 flex-shrink-0">
    <input
      type="text"
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search clubs..."
      className={`w-full rounded-md border px-2 py-1 text-[13px] outline-none transition focus:ring-2 focus:ring-blue-400 ${isLight ? 'bg-white border-gray-200 text-gray-800 placeholder:text-gray-400' : 'bg-[#181a1d] border-[#23262a] text-gray-200 placeholder:text-gray-400'}`}
      spellCheck={false}
      autoComplete="off"
    />
  </div>
  <div className={`flex-1 overflow-y-auto px-2 pb-4 ${isLight ? 'bg-gray-50' : 'bg-[#101215]'}`}>
    {filteredClubs.length === 0 ? (
      <div className={`px-4 py-2 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>No clubs found</div>
    ) : (
      filteredClubs.map(club => (
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
      ))
    )}
  </div>
    </div>
  );
};

export default ClubFilter;