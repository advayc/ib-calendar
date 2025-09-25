'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { formatMonthYear } from '@/utils/dateUtils';

interface MonthNavigationProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  theme = 'light',
  onToggleTheme
}) => {
  const isLight = theme === 'light';
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <div className={`flex items-center justify-between h-14 px-3 sm:px-4 select-none border-b ${isLight ? 'bg-white border-gray-200' : 'bg-[#0d0e0f] border-[#1e2022]'}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousMonth}
          className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors border ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 border-gray-200' : 'bg-[#2A2A2A] hover:bg-[#252729] text-gray-400 hover:text-gray-200 border-[#2a2c2e]'}`}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNextMonth}
          className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors border ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 border-gray-200' : 'bg-[#2A2A2A] hover:bg-[#252729] text-gray-400 hover:text-gray-200 border-[#2a2c2e]'}`}
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <h1 suppressHydrationWarning className={`ml-2 sm:ml-4 text-[20px] sm:text-[28px] font-semibold tracking-tight ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>
          {mounted ? formatMonthYear(currentDate) : ''}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors border ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-yellow-500 hover:text-yellow-600 border-gray-200' : 'bg-[#2A2A2A] hover:bg-[#252729] text-blue-300 hover:text-blue-200 border-[#2a2c2e]'}`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default MonthNavigation;