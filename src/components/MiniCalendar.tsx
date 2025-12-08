"use client";
import React, { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths
} from 'date-fns';

interface MiniCalendarProps {
  value: Date;
  onChange?: (d: Date) => void;
  activeDate: Date; // current big calendar month
  onMonthChange?: (d: Date) => void;
  theme?: 'light' | 'dark';
}

const dayNames = ['S','M','T','W','T','F','S'];

const MiniCalendar: React.FC<MiniCalendarProps> = ({ value, onChange, activeDate, onMonthChange, theme = 'light' }) => {
  const isLight = theme === 'light';
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const days = useMemo(() => {
    const monthStart = startOfMonth(activeDate);
    const monthEnd = endOfMonth(activeDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [activeDate]);

  const handlePrev = () => onMonthChange?.(subMonths(activeDate, 1));
  const handleNext = () => onMonthChange?.(addMonths(activeDate, 1));

  return (
    // suppressHydrationWarning here because dates and locale formatting can differ between server and client
    <div suppressHydrationWarning className="px-2 py-2">
      <div className="flex items-center justify-between mb-3 select-none">
        <button
          onClick={handlePrev}
          className={`h-7 w-7 flex items-center justify-center text-sm font-bold rounded transition-colors ${isLight ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2A2A2A]'}`}
          aria-label="Prev month"
          suppressHydrationWarning
        >
          {mounted ? '‹' : ''}
        </button>

  <div suppressHydrationWarning className={`text-[12px] font-semibold uppercase tracking-wide ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>{mounted ? format(activeDate, 'MMMM yyyy') : ''}</div>

        <button
          onClick={handleNext}
          className={`h-7 w-7 flex items-center justify-center text-sm font-bold rounded transition-colors ${isLight ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2A2A2A]'}`}
          aria-label="Next month"
          suppressHydrationWarning
        >
          {mounted ? '›' : ''}
        </button>
      </div>

      <div suppressHydrationWarning className={`grid grid-cols-7 gap-1 text-[10px] text-center font-medium mb-2 select-none ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
        {dayNames.map((d, i) => (
          <div key={`${d}-${i}`} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-[11px] leading-tight">
        {days.map((d) => {
          const faded = !isSameMonth(d, activeDate);
          
          // Use consistent date normalization (midnight local time)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const normalizedD = new Date(d);
          normalizedD.setHours(0, 0, 0, 0);
          const isTodayValue = normalizedD.getTime() === today.getTime();
          
          const selected = isSameDay(d, value);
            return (
              <button
                key={d.toISOString()}
                onClick={() => onChange?.(d)}
                className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors focus:outline-none ${
                  isTodayValue
                    ? 'bg-[#FF3B30] text-white font-semibold'
                    : faded
                      ? isLight
                        ? 'text-gray-300'
                        : 'text-[#4a4c4f]'
                      : isLight
                        ? 'text-gray-700'
                        : 'text-gray-300'
                } ${selected && !isTodayValue ? (isLight ? 'bg-gray-200' : 'bg-[#2a2c2e]') : ''} ${isLight ? 'hover:bg-gray-200' : 'hover:bg-[#22252a]'}`}
                suppressHydrationWarning
              >
                {mounted ? format(d, 'd') : ''}
              </button>
            );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;