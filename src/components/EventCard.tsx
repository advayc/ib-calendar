'use client';

import React, { useMemo } from 'react';
import { Event, Club } from '@/types';
import { formatEventTime } from '@/utils/dateUtils';

interface EventCardProps {
  event: Event;
  club: Club;
  onClick?: () => void;
  theme?: 'light' | 'dark';
}

const EventCard: React.FC<EventCardProps> = React.memo(({ event, club, onClick, theme = 'light' }) => {
  // Attempt to derive ordering weight from time for future sorting (not used yet here directly)
  const timeDisplay = useMemo(() => formatEventTime(event.time), [event.time]);

  const isLight = theme === 'light';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full flex items-center text-[11px] leading-tight cursor-pointer select-none rounded-sm min-h-[16px] hover:brightness-105 transition ${isLight ? 'text-gray-800' : 'text-gray-200'}`}
      title={`${event.title}${event.time ? ` - ${event.time}` : ''}${event.description ? `\n${event.description}` : ''}`}
      style={{ 
        backgroundColor: `${club.color}33`, // ~20% opacity
        paddingLeft: '4px',
        paddingRight: '4px',
        paddingTop: '2px',
        paddingBottom: '2px'
      }}
    >
      <span className={`truncate flex-1 font-medium ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{event.title}</span>
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