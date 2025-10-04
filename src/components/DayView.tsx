'use client';

import React, { useMemo } from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event, Club } from '@/types';
import { useClubs } from '@/context/ClubContext';
import EventCard from './EventCard';

interface DayViewProps {
  events: Event[];
  clubs: Club[];
  currentDate: Date;
  onDateChange: (d: Date) => void;
  theme?: 'light' | 'dark';
}

const DayView: React.FC<DayViewProps> = ({ events, clubs, currentDate, onDateChange, theme = 'light' }) => {
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

  const dayEvents = useMemo(() => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const eventsForDay = filteredEvents.filter(event => {
      const eventDate = event.date.slice(0, 10);
      return eventDate === dateKey;
    });

    // Sort events: prioritized first, then by time
    eventsForDay.sort((a, b) => {
      const aPrior = prioritizedClubIds.includes(a.clubId);
      const bPrior = prioritizedClubIds.includes(b.clubId);
      if (aPrior && !bPrior) return -1;
      if (!aPrior && bPrior) return 1;
      const aTime = a.time || '';
      const bTime = b.time || '';
      if (aTime && bTime) return aTime.localeCompare(bTime);
      if (aTime) return -1;
      if (bTime) return 1;
      return 0;
    });

    return eventsForDay;
  }, [currentDate, filteredEvents, prioritizedClubIds]);

  // Current time position for the red line indicator
  const [currentTimePosition, setCurrentTimePosition] = React.useState<number | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Calculate position (6 AM = hour 6 is index 0 in our timeSlots)
      if (hour >= 6 && hour <= 23) {
        const slotIndex = hour - 6;
        const position = slotIndex * 64 + (minute / 60) * 64;
        setCurrentTimePosition(position);
      } else {
        setCurrentTimePosition(null);
      }
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to center current time on mount
  React.useEffect(() => {
    if (scrollContainerRef.current && currentTimePosition !== null) {
      const container = scrollContainerRef.current;
      const containerHeight = container.clientHeight;
      // Scroll to position the current time in the middle of the viewport
      const scrollTop = Math.max(0, currentTimePosition - (containerHeight / 2));
      container.scrollTop = scrollTop;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handlePreviousDay = () => {
    onDateChange(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(currentDate, 1));
  };

  const isLight = theme === 'light';
  const isDayToday = isToday(currentDate);

  // Generate time slots for the day (6 AM to 11 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isLight ? 'bg-white' : 'bg-[#0d0e0f]'}`}>
      {/* Day Navigation */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1e2022] bg-[#16181a]'}`}>
        <button
          onClick={handlePreviousDay}
          className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-200 text-gray-700' : 'hover:bg-[#2a2c2f] text-gray-300'}`}
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        
        <button
          onClick={handleNextDay}
          className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-200 text-gray-700' : 'hover:bg-[#2a2c2f] text-gray-300'}`}
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Grid with Time Column */}
      <div className="flex-1 flex overflow-auto" ref={scrollContainerRef}>
        {/* Time column */}
        <div className={`w-20 flex-shrink-0 border-r ${isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1e2022] bg-[#16181a]'}`}>
          {timeSlots.map(hour => (
            <div
              key={hour}
              className={`h-16 border-b flex items-start justify-end pr-3 pt-1 ${isLight ? 'border-gray-200 text-gray-500' : 'border-[#1e2022] text-gray-400'}`}
            >
              <span className="text-sm">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="flex-1 relative">
          {/* Time grid background */}
          {timeSlots.map(hour => (
            <div
              key={hour}
              className={`h-16 border-b ${isLight ? 'border-gray-200' : 'border-[#1e2022]'}`}
            ></div>
          ))}
          
          {/* Events positioned by time */}
          <div className="absolute inset-0 px-2">
            {dayEvents.map(event => {
              const club = clubsMap[event.clubId];
              if (!club) return null;
              
              // Calculate position based on time
              let topPosition = 0;
              if (event.time) {
                const timeMatch = event.time.match(/^(\d{1,2}):(\d{2})/);
                if (timeMatch) {
                  const hour = parseInt(timeMatch[1], 10);
                  const minute = parseInt(timeMatch[2], 10);
                  const slotIndex = timeSlots.indexOf(hour);
                  if (slotIndex >= 0) {
                    topPosition = slotIndex * 64 + (minute / 60) * 64;
                  }
                }
              }
              
              return (
                <div
                  key={event.id}
                  style={{
                    position: 'absolute',
                    top: `${topPosition}px`,
                    left: '8px',
                    right: '8px',
                  }}
                >
                  <EventCard
                    event={event}
                    club={club}
                    theme={theme}
                    isPrioritized={prioritizedClubIds.includes(event.clubId)}
                  />
                </div>
              );
            })}
            
            {/* Current time indicator - only show if viewing today */}
            {isDayToday && currentTimePosition !== null && (
              <div
                className="absolute left-0 right-0 pointer-events-none z-10"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#FF3B30] ml-2"></div>
                  <div className="flex-1 h-0.5 bg-[#FF3B30] mr-2"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
