'use client';

import React, { useMemo } from 'react';
import { Event, Club } from '@/types';
import { formatEventTime12h } from '@/utils/dateUtils';

interface EventCardProps {
  event: Event;
  club: Club;
  onClick?: () => void;
  theme?: 'light' | 'dark';
  isPrioritized?: boolean;
}

const EventCard: React.FC<EventCardProps> = React.memo(({ event, club, onClick, theme = 'light', isPrioritized = false }) => {
  // Attempt to derive ordering weight from time for future sorting (not used yet here directly)
  const timeDisplay = useMemo(() => formatEventTime12h(event.time), [event.time]);

  const isLight = theme === 'light';
  // SAC events should be same size but bolded
  const isSAC = club.name.toLowerCase().includes('sac');
  const textSize = 'text-[11px]';
  const minHeight = 'min-h-[16px]';
  const padding = 'px-1 pt-1 pb-0.5';
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full flex items-center ${textSize} leading-tight cursor-pointer select-none rounded-sm ${minHeight} hover:brightness-105 transition ${isLight ? 'text-gray-800' : 'text-gray-200'} ${padding}`}
      title={`${event.title}${event.time ? ` - ${event.time}` : ''}${event.location ? ` @ ${event.location}` : ''}${event.description ? `\n${event.description}` : ''}`}
      style={{ 
        backgroundColor: `${club.color}33`,
      }}
    >
      <span className={`truncate flex-1 ${isPrioritized || isSAC ? 'font-bold' : 'font-medium'} ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{event.title}</span>
      {event.recurrenceGroupId && (
        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-yellow-100 text-yellow-800" title="Recurring event">
          ↻
        </span>
      )}
      {timeDisplay && (
        <span className={`ml-2 text-[10px] tabular-nums ${isLight ? 'text-gray-500' : 'text-gray-300'}`}>
          {timeDisplay}
        </span>
      )}
    </button>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;