'use client';

import React, { useState } from 'react';
import { Event, Club } from '@/types';

interface AdminPanelProps {
  events: Event[];
  clubs: Club[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ events, clubs, onAddEvent, onDeleteEvent }) => {
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    clubId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date && newEvent.clubId) {
      onAddEvent({
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || undefined,
        description: newEvent.description || undefined,
        clubId: newEvent.clubId,
      });
      setNewEvent({ title: '', date: '', time: '', description: '', clubId: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-200 mb-3">Add New Event</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            className="w-full px-3 py-2 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#3a3c3e]"
            required
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            className="w-full px-3 py-2 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md text-gray-200 focus:outline-none focus:border-[#3a3c3e]"
            required
          />
          <input
            type="time"
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            className="w-full px-3 py-2 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md text-gray-200 focus:outline-none focus:border-[#3a3c3e]"
          />
          <textarea
            placeholder="Description (optional)"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className="w-full px-3 py-2 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#3a3c3e] resize-none"
            rows={3}
          />
          <select
            value={newEvent.clubId}
            onChange={(e) => setNewEvent({ ...newEvent, clubId: e.target.value })}
            className="w-full px-3 py-2 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md text-gray-200 focus:outline-none focus:border-[#3a3c3e]"
            required
          >
            <option value="">Select Club</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#FF3B30] hover:bg-[#E5352B] text-white rounded-md transition-colors font-medium"
          >
            Add Event
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-200 mb-3">Existing Events</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {events.map(event => {
            const club = clubs.find(c => c.id === event.clubId);
            return (
              <div key={event.id} className="flex items-center justify-between p-3 bg-[#1a1c1e] rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-gray-200">{event.title}</div>
                  <div className="text-sm text-gray-400">{new Date(event.date).toDateString()} {event.time}</div>
                  {club && <div className="text-sm text-gray-500">{club.name}</div>}
                </div>
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;