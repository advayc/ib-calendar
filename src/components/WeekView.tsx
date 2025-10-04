'use client';

import React, { useMemo } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, subWeeks, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event, Club } from '@/types';
import { useClubs } from '@/context/ClubContext';
import EventCard from './EventCard';

interface WeekViewProps {
  events: Event[];
  clubs: Club[];
  currentDate: Date;
  onDateChange: (d: Date) => void;
  onSelectEvent?: (event: Event) => void;
  theme?: 'light' | 'dark';
}

const WeekView: React.FC<WeekViewProps> = ({ events, clubs, currentDate, onDateChange, onSelectEvent, theme = 'light' }) => {
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

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

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

  const eventsGroupedByDay = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    weekDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      grouped[dateKey] = [];
    });

    filteredEvents.forEach(event => {
      const eventDate = event.date.slice(0, 10);
      if (grouped[eventDate]) {
        grouped[eventDate].push(event);
      }
    });

    // Sort events in each day: prioritized first, then by time
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
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
    });

    return grouped;
  }, [weekDays, filteredEvents, prioritizedClubIds]);

  const handlePreviousWeek = () => {
    onDateChange(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    onDateChange(addWeeks(currentDate, 1));
  };

  const isLight = theme === 'light';

  // Generate time slots for the day (6 AM to 11 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);
  // Small visual offset so events don't sit flush against the top of the grid
  const EVENT_TOP_OFFSET = 8;

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isLight ? 'bg-white' : 'bg-[#0d0e0f]'}`}>
      {/* Week Navigation */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1e2022] bg-[#16181a]'}`}>
        <button
          onClick={handlePreviousWeek}
          className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-200 text-gray-700' : 'hover:bg-[#2a2c2f] text-gray-300'}`}
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </h2>
        
        <button
          onClick={handleNextWeek}
          className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-200 text-gray-700' : 'hover:bg-[#2a2c2f] text-gray-300'}`}
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Grid with Time Column */}
      <div className="flex-1 flex overflow-auto" ref={scrollContainerRef}>
        {/* Time column */}
        <div className={`w-16 flex-shrink-0 border-r ${isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1e2022] bg-[#16181a]'}`}>
          {/* Empty corner for day headers */}
          <div className={`h-16 border-b ${isLight ? 'border-gray-200' : 'border-[#1e2022]'}`}></div>
          
          {/* Time labels */}
          {timeSlots.map(hour => (
            <div
              key={hour}
              className={`h-16 border-b flex items-start justify-end pr-2 pt-1 ${isLight ? 'border-gray-200 text-gray-500' : 'border-[#1e2022] text-gray-400'}`}
            >
              <span className="text-xs">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsGroupedByDay[dateKey] || [];
            const isDayToday = isToday(day);

            return (
              <div
                key={idx}
                className={`border-r ${isLight ? 'border-gray-200' : 'border-[#1e2022]'}`}
              >
                {/* Day Header - centered */}
                <div className={`h-16 border-b flex flex-col items-center justify-center ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#16181a] border-[#1e2022]'}`}>
                  <div className={`text-xs font-medium uppercase ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {format(day, 'EEE')}
                  </div>
                  {isDayToday ? (
                    <div className="w-10 h-10 rounded-full bg-[#FF3B30] flex items-center justify-center mt-1">
                      <span className="text-lg font-semibold text-white">
                        {format(day, 'd')}
                      </span>
                    </div>
                  ) : (
                    <div className={`text-2xl font-semibold mt-1 ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
                      {format(day, 'd')}
                    </div>
                  )}
                </div>

                {/* Time grid */}
                <div className="relative">
                  {timeSlots.map(hour => (
                    <div
                      key={hour}
                      className={`h-16 border-b ${isLight ? 'border-gray-200' : 'border-[#1e2022]'}`}
                    ></div>
                  ))}
                  
                  {/* Events positioned by time */}
                  <div className="absolute inset-0 p-1">
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
                            top: `${topPosition + EVENT_TOP_OFFSET}px`,
                            left: '4px',
                            right: '4px',
                          }}
                        >
                          <EventCard
                            event={event}
                            club={club}
                            theme={theme}
                            isPrioritized={prioritizedClubIds.includes(event.clubId)}
                            onClick={() => onSelectEvent?.(event)}
                          />
                        </div>
                      );
                    })}
                    
                    {/* Current time indicator - only show on today */}
                    {isDayToday && currentTimePosition !== null && (
                      <div
                        className="absolute left-0 right-0 pointer-events-none z-10"
                        style={{ top: `${currentTimePosition}px` }}
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#FF3B30] -ml-1"></div>
                          <div className="flex-1 h-0.5 bg-[#FF3B30]"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
