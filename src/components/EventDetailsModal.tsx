import React from 'react';
import { Event, Club } from '@/types';

interface Props {
  event: Event;
  clubs: Club[];
  theme: 'light' | 'dark';
  onClose: () => void;
}

const EventDetailsModal: React.FC<Props> = ({ event, clubs, theme, onClose }) => {
  const club = clubs.find(c => c.id === event.clubId);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className={`w-full max-w-md mx-4 rounded-lg p-6 shadow-lg border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#14161a] border-[#1e2022] text-gray-100'}`}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
        {club && (
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: club.color || '#ffffff' }}
            ></div>
            <p className={`text-sm font-medium ${theme==='light' ? 'text-gray-700' : 'text-gray-300'}`}>{club.name}</p>
          </div>
        )}
        {event.time && <p className={`text-sm mb-1 font-mono ${theme==='light' ? 'opacity-90 text-gray-700' : 'opacity-80'}`}>Time: {event.time}</p>}
        {event.location && <p className={`text-sm mb-1 ${theme==='light' ? 'opacity-90 text-gray-700' : 'opacity-80'}`}>Location: {event.location}</p>}
        {event.description && <p className="text-sm mb-4 whitespace-pre-wrap leading-relaxed">{event.description}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className={`${theme==='light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' : 'bg-[#222426] hover:bg-[#2a2c2f] text-gray-100'} px-4 py-2 rounded-md text-sm font-medium`}
          >Close</button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
