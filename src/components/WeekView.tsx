'use client';

import React, { useMemo } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event, Club } from '@/types';
import { useCourses } from '@/context/CourseContext';
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
  const { enabledCourseIds } = useCourses();

  const clubsMap = useMemo(() => {
    return clubs.reduce((acc, club) => {
      acc[club.id] = club;
      return acc;
    }, {} as Record<string, Club>);
  }, [clubs]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => enabledCourseIds.includes(event.courseId));
  }, [events, enabledCourseIds]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Refs for measuring actual slot positions to align the current time indicator precisely
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const firstDayHeaderRef = React.useRef<HTMLDivElement | null>(null);
  const timeSlotRefs = React.useRef<Record<number, HTMLDivElement | null>>({});
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    // Update every minute to keep time indicator current
    const interval = setInterval(() => forceUpdate(), 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper to compute offset of an element relative to the scroll container
  const getOffsetRelativeToContainer = React.useCallback(
    (element: HTMLElement | null) => {
      const container = scrollContainerRef.current;
      if (!container || !element) return null;
      let offset = 0;
      let current: HTMLElement | null = element;
      while (current && current !== container) {
        offset += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return current === container ? offset : null;
    },
    []
  );

  // Auto-scroll to center current time on mount
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      if (hour >= 6 && hour <= 23) {
        const slotElement = timeSlotRefs.current[hour];
        const slotHeight = slotElement?.offsetHeight ?? getTimeSlotHeight(hour);
        const slotOffset = getOffsetRelativeToContainer(slotElement);
        const fallbackHeaderHeight = firstDayHeaderRef.current?.offsetHeight ?? 64;

        const topPosition =
          (slotOffset ?? (fallbackHeaderHeight + getTimeSlotPosition(hour))) +
          (minute / 60) * slotHeight;

        const container = scrollContainerRef.current;
        const containerHeight = container.clientHeight;
        const scrollTop = Math.max(0, topPosition - (containerHeight / 2));
        container.scrollTop = scrollTop;
      }
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

    // Sort events in each day by time
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        const aTime = a.time || '';
        const bTime = b.time || '';
        if (aTime && bTime) return aTime.localeCompare(bTime);
        if (aTime) return -1;
        if (bTime) return 1;
        return 0;
      });
    });

    return grouped;
  }, [weekDays, filteredEvents]);

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

  // Calculate maximum events per time slot across all days
  const maxEventsPerTimeSlot = useMemo(() => {
    const counts: { [key: number]: number } = {};
    
    // Initialize counts for each time slot
    timeSlots.forEach(hour => {
      counts[hour] = 0;
    });

    // Count events for each time slot across all days
    Object.values(eventsGroupedByDay).forEach(dayEvents => {
      const timeSlotCounts: { [key: number]: number } = {};
      
      dayEvents.forEach(event => {
        if (event.time) {
          const timeMatch = event.time.match(/^(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            const hour = parseInt(timeMatch[1], 10);
            timeSlotCounts[hour] = (timeSlotCounts[hour] || 0) + 1;
          }
        }
      });
      
      // Update max counts
      Object.entries(timeSlotCounts).forEach(([hour, count]) => {
        const h = parseInt(hour, 10);
        counts[h] = Math.max(counts[h], count);
      });
    });
    
    return counts;
  }, [eventsGroupedByDay, timeSlots]);

  // Calculate height for each time slot
  const getTimeSlotHeight = (hour: number) => {
    const baseHeight = 64;
    const eventHeight = 24;
    const padding = 16;
    const maxEvents = maxEventsPerTimeSlot[hour] || 0;
    
    if (maxEvents === 0) return baseHeight;
    
    // Calculate total height needed for events plus padding
    const neededHeight = maxEvents * eventHeight + padding;
    return Math.max(baseHeight, neededHeight);
  };

  // Calculate cumulative position for a given hour
  const getTimeSlotPosition = (hour: number) => {
    let position = 0;
    for (let h = timeSlots[0]; h < hour; h++) {
      position += getTimeSlotHeight(h);
    }
    return position;
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isLight ? 'bg-white' : 'bg-[#191919]'}`}>
      {/* Week Navigation */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1E1E1E] bg-[#191919]'}`}>
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
      <div className="flex-1 flex overflow-auto relative" ref={scrollContainerRef}>
        {/* Time column */}
        <div className={`w-16 flex-shrink-0 border-r ${isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1E1E1E] bg-[#191919]'}`}>
          {/* Empty corner for day headers */}
          <div className={`h-16 border-b ${isLight ? 'border-gray-200' : 'border-[#1E1E1E]'}`}></div>
          
          {/* Time labels */}
          {timeSlots.map(hour => (
            <div
              key={hour}
              style={{ height: `${getTimeSlotHeight(hour)}px` }}
              className={`border-b flex items-start justify-end pr-2 pt-1 ${isLight ? 'border-gray-200 text-gray-500' : 'border-[#1E1E1E] text-gray-400'}`}
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
            
            // Use normalized date comparison for isToday check
            const today = new Date();
            const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const normalizedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
            const isDayToday = normalizedDay.getTime() === normalizedToday.getTime();

            return (
              <div
                key={idx}
                className={`border-r ${isLight ? 'border-gray-200' : 'border-[#1E1E1E]'}`}
              >
                {/* Day Header - centered */}
                <div
                  className={`h-16 border-b flex flex-col items-center justify-center ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#191919] border-[#1E1E1E]'}`}
                  ref={idx === 0 ? firstDayHeaderRef : undefined}
                >
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
                      style={{ height: `${getTimeSlotHeight(hour)}px` }}
                      className={`border-b ${isLight ? 'border-gray-200' : 'border-[#1E1E1E]'}`}
                      ref={idx === 0 ? (el) => { timeSlotRefs.current[hour] = el; } : undefined}
                    ></div>
                  ))}
                  
                  {/* Events positioned by time */}
                  <div className="absolute inset-0 p-1">
                    {(() => {
                      // Group events by their start time
                      const eventsByTime: { [key: string]: Event[] } = {};
                      dayEvents.forEach(event => {
                        const timeKey = event.time || 'no-time';
                        if (!eventsByTime[timeKey]) {
                          eventsByTime[timeKey] = [];
                        }
                        eventsByTime[timeKey].push(event);
                      });

                      // Render events, stacking those with the same time vertically
                      return dayEvents.map((event) => {
                        const club = clubsMap[event.courseId];
                        if (!club) return null;
                        
                        // Calculate position based on time
                        let topPosition = 0;
                        let hour = 0;
                        if (event.time) {
                          const timeMatch = event.time.match(/^(\d{1,2}):(\d{2})/);
                          if (timeMatch) {
                            hour = parseInt(timeMatch[1], 10);
                            const minute = parseInt(timeMatch[2], 10);
                            
                            // Get position at start of hour slot
                            topPosition = getTimeSlotPosition(hour);
                            
                            // Add offset for minutes within the hour
                            const slotHeight = getTimeSlotHeight(hour);
                            topPosition += (minute / 60) * slotHeight;
                          }
                        }

                        // Find index within same-time group to stack vertically
                        const timeKey = event.time || 'no-time';
                        const sameTimeEvents = eventsByTime[timeKey];
                        const indexInGroup = sameTimeEvents.findIndex(e => e.id === event.id);
                        const verticalOffset = indexInGroup * 24; // Stack with 24px spacing
                        
                        // Center events within the time slot
                        const slotHeight = getTimeSlotHeight(hour);
                        const totalEventsHeight = sameTimeEvents.length * 24;
                        const centeringOffset = (slotHeight - totalEventsHeight) / 2;
                        
                        return (
                          <div
                            key={event.id}
                            style={{
                              position: 'absolute',
                              top: `${topPosition + centeringOffset + verticalOffset}px`,
                              left: '4px',
                              right: '4px',
                            }}
                          >
                            <EventCard
                              event={event}
                              club={club}
                              theme={theme}
                              onClick={() => onSelectEvent?.(event)}
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Current time indicator spanning all days */}
        {(() => {
          const now = new Date();
          const hour = now.getHours();
          const minute = now.getMinutes();
          
          if (hour < 6 || hour > 23) return null;
          
          const slotElement = timeSlotRefs.current[hour];
          const slotHeight = slotElement?.offsetHeight ?? getTimeSlotHeight(hour);
          const slotOffset = getOffsetRelativeToContainer(slotElement);
          const fallbackHeaderHeight = firstDayHeaderRef.current?.offsetHeight ?? 64;
          const basePosition = slotOffset ?? (fallbackHeaderHeight + getTimeSlotPosition(hour));
          const topPosition = basePosition + (minute / 60) * slotHeight;
          
          // Format time for label
          const timeLabel = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
          
          return (
            <>
              {/* Faint line across all days */}
              <div
                className="absolute left-16 right-0 pointer-events-none z-10"
                style={{ top: `${topPosition}px`, transform: 'translateY(-50%)' }}
              >
                <div className="w-full h-[2px] bg-[#FF3B30] opacity-30"></div>
              </div>
              
              {/* Bright dot, line and time label on current day */}
              {weekDays.map((day, dayIndex) => {
                const isDayToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                if (!isDayToday) return null;
                
                const leftPosition = `calc(64px + ((100% - 64px) / 7) * ${dayIndex})`;
                const columnWidth = `calc((100% - 64px) / 7)`;
                
                return (
                  <div
                    key={`time-indicator-${dayIndex}`}
                    className="absolute pointer-events-none z-20"
                    style={{ 
                      left: leftPosition,
                      width: columnWidth,
                      top: `${topPosition}px`,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <div className="flex items-center relative">
                      {/* Time label on the left */}
                      <div className="absolute right-full mr-1 bg-[#FF3B30] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                        {timeLabel}
                      </div>
                      {/* Red dot, then line extending to right (no line on left) */}
                      <div className="w-2 h-2 rounded-full bg-[#FF3B30]"></div>
                      <div className="flex-1 h-[2px] bg-[#FF3B30]"></div>
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default WeekView;
