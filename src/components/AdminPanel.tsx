'use client';

import React, { useState } from 'react';
import { Event, Club } from '@/types';

interface AdminPanelProps {
  events: Event[];
  clubs: Club[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateClub?: (clubId: string, changes: Partial<Club>) => void;
  theme?: 'light' | 'dark';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ events, clubs, onAddEvent, onDeleteEvent, onUpdateClub, theme = 'light' }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    clubId: '',
    recurrence: false,
    interval: 1,
    until: '',
    count: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date && newEvent.clubId) {
      const base: Omit<Event, 'id'> = {
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || undefined,
        description: newEvent.description || undefined,
        location: newEvent.location || undefined,
        clubId: newEvent.clubId,
        recurrence: newEvent.recurrence
          ? {
              frequency: 'weekly',
              interval: newEvent.interval || 1,
              count: newEvent.count ? parseInt(newEvent.count) : undefined,
              until: newEvent.until || undefined,
            }
          : undefined,
      };
      onAddEvent(base);
      setNewEvent({
        title: '',
        date: '',
        time: '',
        description: '',
        location: '',
        clubId: '',
        recurrence: false,
        interval: 1,
        until: '',
        count: '',
      });
    }
  };

  const isLight = theme === 'light';
  const fieldBase = 'w-full px-3 py-2 rounded-md focus:outline-none transition-colors';
  const smallFieldBase = 'w-full px-2 py-1 rounded-md focus:outline-none transition-colors';
  const fieldLight = 'bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400';
  const fieldDark = 'bg-[#1a1c1e] border border-[#2a2c2e] text-gray-200 placeholder-gray-500 focus:border-[#3a3c3e]';
  const fieldClass = (small = false) => `${small ? smallFieldBase : fieldBase} ${isLight ? fieldLight : fieldDark}`;

  const sectionCard = isLight
    ? 'bg-gray-50 border border-gray-200 shadow-sm'
    : 'bg-[#1a1c1e] border border-[#2a2c2e]';

  const listItem = isLight
    ? 'bg-white border border-gray-200 hover:border-gray-300'
    : 'bg-[#1a1c1e] border border-[#2a2c2e] hover:border-[#3a3c3e]';

  return (
  <div className="space-y-6">
      <div className={`p-4 rounded-lg ${sectionCard}`}>
        <h3 className={`text-lg font-medium mb-3 ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Add New Event</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            className={fieldClass()}
            required
          />
          <input
            type="date"
            placeholder="Date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            className={fieldClass()}
            required
          />
          <input
            type="time"
            placeholder="Time"
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            className={fieldClass()}
          />
          <textarea
            placeholder="Description (optional)"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className={`${fieldClass()} resize-none`}
            rows={3}
          />
          <input
            type="text"
            placeholder="Location (optional)"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            className={fieldClass()}
          />
          <select
            value={newEvent.clubId}
            onChange={(e) => setNewEvent({ ...newEvent, clubId: e.target.value })}
            className={fieldClass()}
            required
          >
            <option value="">Select Club</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
          <div className={`space-y-3 pt-3 mt-2 ${isLight ? 'border-t border-gray-200' : 'border-t border-[#2a2c2e]'}`}>
            <label className={`flex items-center gap-2 text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              <input
                type="checkbox"
                checked={newEvent.recurrence}
                onChange={(q) => setNewEvent({ ...newEvent, recurrence: q.target.checked })}
              />
              Weekly Recurring
            </label>
            {newEvent.recurrence && (
              <div className="grid grid-cols-3 gap-2 text-xs xs:grid-cols-3">
                <div className="col-span-1">
                  <label className={`block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Every (weeks)</label>
                  <input
                    type="number"
                    min={1}
                    value={newEvent.interval}
                    onChange={(e) => setNewEvent({ ...newEvent, interval: parseInt(e.target.value) || 1 })}
                    className={fieldClass(true)}
                  />
                </div>
                <div className="col-span-1">
                  <label className={`block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Until</label>
                  <input
                    type="date"
                    value={newEvent.until}
                    onChange={(e) => setNewEvent({ ...newEvent, until: e.target.value })}
                    className={fieldClass(true)}
                  />
                </div>
                <div className="col-span-1">
                  <label className={`block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Count</label>
                  <input
                    type="number"
                    min={1}
                    value={newEvent.count}
                    onChange={(e) => setNewEvent({ ...newEvent, count: e.target.value })}
                    placeholder="(opt)"
                    className={fieldClass(true)}
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#FF3B30] hover:bg-[#E5352B] text-white rounded-md transition-colors font-medium"
            >
              Add Event{newEvent.recurrence ? 's' : ''}
            </button>
          </div>
        </form>
      </div>

      <div className={`p-4 rounded-lg ${sectionCard}`}>
        <h3 className={`text-lg font-medium mb-3 ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Clubs</h3>
        <div className="space-y-2">
          {clubs.map(club => (
            <div key={club.id} className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-2 rounded-md ${listItem}`}>
              <input
                type="color"
                value={club.color || '#ffffff'}
                onChange={(e) => {
                  const color = e.target.value;
                  if (onUpdateClub) onUpdateClub(club.id, { color });
                }}
                className="w-10 h-10 p-0 border-none rounded"
              />
              <div className="flex-1 min-w-[140px]">
                <div className={`font-medium ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{club.name}</div>
                <div className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{club.id}</div>
              </div>
              <button
                onClick={() => onUpdateClub?.(club.id, { color: club.color })}
                className={`${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-[#222426] hover:bg-[#2a2c2f] text-gray-100'} px-3 py-1 rounded text-sm`}
              >
                Save
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-4 rounded-lg ${sectionCard}`}>
        <h3 className={`text-lg font-medium mb-3 ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Existing Events</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {events.map(event => {
            const club = clubs.find(c => c.id === event.clubId);
            return (
              <div key={event.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md transition-colors ${listItem}`}>
                <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                  <div className={`font-medium truncate ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{event.title}</div>
                  <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{mounted ? new Date(event.date).toDateString() : ''} {event.time}</div>
                  {event.location && <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>📍 {event.location}</div>}
                  {club && <div className={`text-xs mt-0.5 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{club.name}</div>}
                </div>
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="ml-0 sm:ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex-shrink-0"
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