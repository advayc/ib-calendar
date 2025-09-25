'use client';

import React, { useState, useMemo } from 'react';
import { getCalendarDays, getDayNumber, getNextMonth, getPreviousMonth } from '@/utils/dateUtils';
import { useClubs } from '@/context/ClubContext';
import { Event, Club } from '@/types';
import EventCard from './EventCard';
import MonthNavigation from './MonthNavigation';

interface CalendarProps {
  events: Event[];
  clubs: Club[];
  controlledDate?: Date;
  onDateChange?: (d: Date) => void;
  onSelectEvent?: (e: Event) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, clubs, controlledDate, onDateChange, onSelectEvent, theme = 'light', onToggleTheme }) => {
  const [internalDate, setInternalDate] = useState(new Date());
  const currentDate = controlledDate ?? internalDate;
  const setCurrentDate = (d: Date) => {
    if (onDateChange) onDateChange(d); else setInternalDate(d);
  };
  const { enabledClubIds, prioritizedClubIds } = useClubs();

  const clubsMap = useMemo(() => {
    return clubs.reduce((acc, club) => {
      acc[club.id] = club;
      return acc;
    }, {} as Record<string, Club>);
  }, [clubs]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => enabledClubIds.includes(event.clubId));
  }, [events, enabledClubIds]);

  const calendarDays = useMemo(() => {
    return getCalendarDays(currentDate, filteredEvents);
  }, [currentDate, filteredEvents]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePreviousMonth = () => {
    setCurrentDate(getPreviousMonth(currentDate));
  };

  const handleNextMonth = () => {
    setCurrentDate(getNextMonth(currentDate));
  };

  const isLight = theme === 'light';

  return (
    <div className={`flex-1 flex flex-col ${isLight ? 'bg-white' : 'bg-[#0d0e0f]'}`}>
      <MonthNavigation
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Weekday headers */}
        <div className={`hidden sm:grid grid-cols-7 border-b text-[11px] font-medium tracking-wide ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#16181a] border-[#1e2022]'}`}>        
          {weekDays.map(day => (
            <div
              key={day}
              className={`py-3 text-center uppercase ${isLight ? 'text-gray-500' : 'text-gray-400'}`}
            >
              {day}
            </div>
          ))}
        </div>
        {/* Mobile weekday header (sticky) */}
        <div className={`sm:hidden grid grid-cols-7 text-[10px] font-medium tracking-wide border-b ${isLight ? 'bg-gray-100/90 backdrop-blur border-gray-200' : 'bg-[#16181a]/80 backdrop-blur border-[#1e2022]'}`}>        
          {weekDays.map(day => (
            <div key={day} className={`py-2 text-center uppercase ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{day}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-x-auto sm:overflow-visible text-[11px]" style={{ WebkitOverflowScrolling: 'touch' }}>
          {calendarDays.map((day, index) => {
            const isFaded = !day.isCurrentMonth;
            return (
              <div
                key={index}
                className={`relative border-r border-b px-1 sm:px-2 pt-1 sm:pt-2 pb-1 min-h-[calc(100vw/6)] sm:min-h-[180px] overflow-hidden ${
                  isLight
                    ? isFaded
                      ? 'bg-gray-50 text-gray-400 border-gray-200'
                      : 'bg-white text-gray-800 border-gray-200'
                    : isFaded
                      ? 'bg-[#0f1112] text-[#4a4c4f] border-[#1e2022]'
                      : 'bg-[#14161a] text-gray-200 border-[#1e2022]'
                }`}
              >
                <div className="flex justify-end pt-0.5 pr-0.5 sm:pt-1 sm:pr-1">
                  {!day.isToday && (
                    <span className={`text-[13px] font-medium select-none ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                      {getDayNumber(day.date)}
                    </span>
                  )}
                  {day.isToday && (
                    <span className="text-[13px] font-semibold text-white flex items-center justify-center select-none bg-[#FF3B30] w-6 h-6 rounded-full shadow-sm">
                      {getDayNumber(day.date)}
                    </span>
                  )}
                </div>
                <div className="pt-3 sm:pt-4 space-y-[3px] overflow-hidden pr-1 sm:pr-2">
                  {(() => {
                    const maxVisible = 4;
                    const sortedEvents = [...day.events].sort((a, b) => {
                      const aPrior = prioritizedClubIds.includes(a.clubId);
                      const bPrior = prioritizedClubIds.includes(b.clubId);
                      if (aPrior && !bPrior) return -1;
                      if (!aPrior && bPrior) return 1;
                      return 0;
                    });
                    const visible = sortedEvents.slice(0, maxVisible);
                    const hiddenCount = day.events.length - visible.length;
                    return (
                      <>
                        {visible.map(event => {
                          const club = clubsMap[event.clubId];
                          if (!club) return null;
                          return <EventCard key={event.id} event={event} club={club} onClick={() => onSelectEvent?.(event)} theme={theme} isPrioritized={prioritizedClubIds.includes(event.clubId)} />;
                        })}
                        {hiddenCount > 0 && (
                          <div className={`text-[10px] ml-2 mt-1 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>+{hiddenCount} more</div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;