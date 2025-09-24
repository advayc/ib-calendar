"use client";
import React, { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
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
}

const dayNames = ['S','M','T','W','T','F','S'];

const MiniCalendar: React.FC<MiniCalendarProps> = ({ value, onChange, activeDate, onMonthChange }) => {
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
    <div className="px-2 py-2">
      <div className="flex items-center justify-between mb-3 select-none">
        <button
          onClick={handlePrev}
          className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-200 text-sm font-bold hover:bg-[#1a1c1e] rounded transition-colors"
          aria-label="Prev month"
        >
          ‹
        </button>

        <div className="text-[12px] font-semibold text-gray-200 uppercase tracking-wide">
          {format(activeDate, 'MMMM yyyy')}
        </div>

        <button
          onClick={handleNext}
          className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-200 text-sm font-bold hover:bg-[#1a1c1e] rounded transition-colors"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-gray-500 font-medium mb-2 select-none">
        {dayNames.map((d, i) => (
          <div key={`${d}-${i}`} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-[11px] leading-tight">
        {days.map((d) => {
          const faded = !isSameMonth(d, activeDate);
          const today = isToday(d);
          const selected = isSameDay(d, value);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onChange?.(d)}
              className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors focus:outline-none ${
                today ? 'bg-[#e54848] text-white font-semibold' : faded ? 'text-[#4a4c4f]' : 'text-gray-300'
              } ${selected && !today ? 'bg-[#2a2c2e]' : ''} hover:bg-[#22252a]`}
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;