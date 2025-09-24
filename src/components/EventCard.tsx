'use client';

import React, { useMemo } from 'react';
import { Event, Club } from '@/types';
import { formatEventTime } from '@/utils/dateUtils';

interface EventCardProps {
  event: Event;
  club: Club;
}

const EventCard: React.FC<EventCardProps> = React.memo(({ event, club }) => {
  // Attempt to derive ordering weight from time for future sorting (not used yet here directly)
  const timeDisplay = useMemo(() => formatEventTime(event.time), [event.time]);

  return (
    <div
      className="group relative flex items-center text-[11px] leading-tight cursor-default select-none rounded-sm min-h-[16px]"
      title={`${event.title}${event.time ? ` - ${event.time}` : ''}${event.description ? `\n${event.description}` : ''}`}
      style={{ 
        backgroundColor: `${club.color}50`, // 50% opacity
        paddingLeft: '4px',
        paddingRight: '4px',
        paddingTop: '2px',
        paddingBottom: '2px'
      }}
    >
      <span className="truncate flex-1 text-gray-200 font-medium">{event.title}</span>
      {timeDisplay && (
        <span className="ml-2 text-[10px] text-gray-300 tabular-nums">
          {timeDisplay}
        </span>
      )}
    </div>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;