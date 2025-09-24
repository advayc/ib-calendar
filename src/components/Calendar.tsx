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
  onAdminClick?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, clubs, controlledDate, onDateChange, onAdminClick }) => {
  const [internalDate, setInternalDate] = useState(new Date());
  const currentDate = controlledDate ?? internalDate;
  const setCurrentDate = (d: Date) => {
    if (onDateChange) onDateChange(d); else setInternalDate(d);
  };
  const { enabledClubIds } = useClubs();

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

  return (
    <div className="flex-1 flex flex-col bg-[#0d0e0f]">
      <MonthNavigation
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onAdminClick={onAdminClick}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-[#1e2022] bg-[#16181a] text-[11px] font-medium tracking-wide">
          {weekDays.map(day => (
            <div
              key={day}
              className="py-3 text-center text-gray-400 uppercase"
            >
              {day}
            </div>
          ))}
        </div>        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {calendarDays.map((day, index) => {
            const isFaded = !day.isCurrentMonth;
            return (
              <div
                key={index}
                className={`relative border-r border-b border-[#1e2022] px-2 pt-2 pb-1 min-h-[145px] overflow-hidden ${
                  isFaded ? 'bg-[#0f1112] text-[#4a4c4f]' : 'bg-[#14161a] text-gray-200'
                }`}
              >
                <div className="flex justify-end pt-1 pr-1">
                  {!day.isToday && (
                    <span className="text-[13px] font-medium text-gray-300 select-none">
                      {getDayNumber(day.date)}
                    </span>
                  )}
                  {day.isToday && (
                    <span className="text-[13px] font-semibold text-white flex items-center justify-center select-none bg-[#FF3B30] w-6 h-6 rounded-full shadow-sm">
                      {getDayNumber(day.date)}
                    </span>
                  )}
                </div>
                <div className="pt-4 space-y-[3px] overflow-hidden pr-2">
                  {(() => {
                    const maxVisible = 4;
                    const visible = day.events.slice(0, maxVisible);
                    const hiddenCount = day.events.length - visible.length;
                    return (
                      <>
                        {visible.map(event => {
                          const club = clubsMap[event.clubId];
                          if (!club) return null;
                          return <EventCard key={event.id} event={event} club={club} />;
                        })}
                        {hiddenCount > 0 && (
                          <div className="text-[10px] text-gray-500 ml-2 mt-1">+{hiddenCount} more</div>
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