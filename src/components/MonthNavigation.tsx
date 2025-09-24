'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { formatMonthYear } from '@/utils/dateUtils';

interface MonthNavigationProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAdminClick?: () => void;
}

const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onAdminClick,
}) => {
  return (
    <div className="flex items-center justify-between h-14 px-4 bg-[#0d0e0f] border-b border-[#1e2022] select-none">
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousMonth}
          className="h-8 w-8 flex items-center justify-center rounded-md bg-[#1a1c1e] hover:bg-[#252729] text-gray-400 hover:text-gray-200 transition-colors border border-[#2a2c2e]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNextMonth}
          className="h-8 w-8 flex items-center justify-center rounded-md bg-[#1a1c1e] hover:bg-[#252729] text-gray-400 hover:text-gray-200 transition-colors border border-[#2a2c2e]"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <h1 className="ml-4 text-[28px] font-semibold tracking-tight text-gray-100">
          {formatMonthYear(currentDate)}
        </h1>
      </div>
      {onAdminClick && (
        <button
          onClick={onAdminClick}
          className="h-8 w-8 flex items-center justify-center rounded-md bg-[#1a1c1e] hover:bg-[#252729] text-gray-400 hover:text-gray-200 transition-colors border border-[#2a2c2e]"
          aria-label="Admin Dashboard"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MonthNavigation;