'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import ClubFilter from '@/components/ClubFilter';
import AdminPanel from '@/components/AdminPanel';
import { ClubProvider } from '@/context/ClubContext';
import { Event, Club } from '@/types';
import initialData from '@/data/events.json';

const CalendarApp: React.FC = () => {
  const STORAGE_KEY = 'gfs-calendar-events-v1';
  const THEME_KEY = 'gfs-theme';

  const [events, setEvents] = useState<Event[]>([]);
  const [clubs] = useState<Club[]>(initialData.clubs);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [showAdmin, setShowAdmin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && (localStorage.getItem(THEME_KEY) as 'light' | 'dark')) || 'light');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Load persisted events
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setEvents(JSON.parse(raw));
      } else {
        setEvents(initialData.events);
      }
    } catch (e) {
      setEvents(initialData.events);
    }
  }, []);

  // Persist events whenever changed
  useEffect(() => {
    if (events.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  }, [events]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  const expandRecurrence = (base: Omit<Event, 'id'>): Event[] => {
    if (!base.recurrence) {
      return [{ ...base, id: Date.now().toString() }];
    }
    const occurrences: Event[] = [];
    const startDate = new Date(base.date + 'T00:00:00');
    const intervalWeeks = base.recurrence.interval || 1;
    let current = new Date(startDate);
    let count = 0;
    const maxCount = base.recurrence.count || 52; // safety cap
    const until = base.recurrence.until ? new Date(base.recurrence.until + 'T23:59:59') : null;
    while (count < maxCount) {
      if (until && current > until) break;
      occurrences.push({ ...base, id: (Date.now() + count).toString(), date: current.toISOString().split('T')[0] });
      count++;
      current = new Date(current.getTime() + intervalWeeks * 7 * 24 * 60 * 60 * 1000);
    }
    return occurrences;
  };

  const handleAddEvent = useCallback((newEvent: Omit<Event, 'id'>) => {
    const expanded = expandRecurrence(newEvent);
    setEvents(prev => [...prev, ...expanded]);
  }, []);

  const handleEditEvent = useCallback((eventId: string, updatedEvent: Partial<Event>) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId ? { ...event, ...updatedEvent } : event
      )
    );
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  return (
    <ClubProvider initialClubs={clubs}>
      <div className={`h-screen flex text-sm transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#0b0c0d] text-gray-100'}`}>
        {/* Sidebar */}
        <div className="w-[250px] flex-shrink-0">
          <ClubFilter activeDate={activeDate} onChangeDate={setActiveDate} theme={theme} />
        </div>
        {/* Calendar main section */}
        <div className="flex-1 flex flex-col">
          <Calendar 
            events={events} 
            clubs={clubs} 
            controlledDate={activeDate} 
            onDateChange={setActiveDate} 
            onAdminClick={() => setShowAdmin(!showAdmin)}
            onSelectEvent={(e) => setSelectedEvent(e)}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
        </div>

        {/* Admin Modal */}
        {showAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0d0e0f] border-[#1e2022]'}`}>
              <div className={`flex items-center justify-between p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-[#1e2022]'}`}>
                <h2 className="text-xl font-semibold">Admin Dashboard</h2>
                <button
                  onClick={() => setShowAdmin(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                <AdminPanel 
                  events={events} 
                  clubs={clubs} 
                  onAddEvent={handleAddEvent} 
                  onDeleteEvent={handleDeleteEvent}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
            <div
              className={`w-full max-w-md mx-4 rounded-lg p-6 shadow-lg border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#14161a] border-[#1e2022]'}`}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">{selectedEvent.title}</h3>
              {selectedEvent.time && <p className="text-sm mb-1 font-mono opacity-80">Time: {selectedEvent.time}</p>}
              {selectedEvent.description && <p className="text-sm mb-4 whitespace-pre-wrap leading-relaxed">{selectedEvent.description}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-900 text-sm font-medium"
                >Close</button>
                <button
                  onClick={() => { handleDeleteEvent(selectedEvent.id); setSelectedEvent(null); }}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
                >Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel */}
      </div>
    </ClubProvider>
  );
};

export default CalendarApp;