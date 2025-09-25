'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
            {isLight ? (
              // moon icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M21.752 15.002A9.718 9.718 0 0 1 12.999 22C7.476 22 3 17.523 3 12a9.718 9.718 0 0 1 6.998-8.752.75.75 0 0 1 .92.92A8.218 8.218 0 0 0 11 12c0 4.075 3.06 7.437 6.832 7.832a.75.75 0 0 1 .92.92Z" />
              </svg>
            ) : (
              // sun icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 12 22Zm0-16a.75.75 0 0 1-.75-.75V3.75a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 12 6Zm10 6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 22 12ZM6 12a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 6 12Zm11.78 7.78a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 1 1 1.06-1.06l1.06 1.06c.29.29.29.77 0 1.06Zm-9.5-9.5a.75.75 0 0 1-1.06 0L6.16 9.22a.75.75 0 1 1 1.06-1.06L9.28 9.22c.29.29.29.77 0 1.06Zm9.5-4.72-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06Zm-9.5 9.5-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06Z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MonthNavigation;