'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import ClubFilter from '@/components/ClubFilter';
// AdminPanel moved to a secret route; keep main app lean
import { ClubProvider } from '@/context/ClubContext';
import { Event, Club } from '@/types';
import { apiClient } from '@/lib/apiClient';
// LoginForm handled on the secret admin page

const CalendarApp: React.FC = () => {
  const STORAGE_KEY = 'gfs-calendar-events-v1';
  const THEME_KEY = 'gfs-theme';

  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  // admin token and login handled on the secret admin route
  const [loadingData, setLoadingData] = useState(false);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  // admin modal removed; use secret route /glenforestsacadmindash
  // Theme: initialize to 'light' for server/client parity, then hydrate from localStorage after mount
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
    setTheme(saved);
  }, []);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // Mobile sidebar (club filter) visibility
  const [showFilters, setShowFilters] = useState(false);

  // Initial load from backend (fallback to static on failure)
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [remoteEvents, remoteClubs] = await Promise.all([
          apiClient.get('/api/events'),
          apiClient.get('/api/clubs')
        ]);
        // Normalize date -> string (ISO) for existing UI
        setEvents(remoteEvents.map((e: any) => ({ ...e, date: e.date?.slice(0,10) })));
        setClubs(remoteClubs.map((c: any) => ({ id: c.id, name: c.name, color: c.color, enabled: c.enabled })));
      } catch (err) {
        // fallback to empty lists
        setEvents([]);
        setClubs([]);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // Persist events locally as cache (optional)
  useEffect(() => {
    if (events.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  const handleEditEvent = useCallback((eventId: string, updatedEvent: Partial<Event>) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId ? { ...event, ...updatedEvent } : event
      )
    );
  }, []);

  return (
    <ClubProvider initialClubs={clubs}>
  <div suppressHydrationWarning className={`min-h-screen md:h-screen flex flex-col md:flex-row text-sm transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#0b0c0d] text-gray-100'}`}>
        {/* Sidebar (desktop) / Drawer (mobile) */}
        <div className={`md:w-[250px] md:flex-shrink-0 md:h-full ${showFilters ? 'block' : 'hidden'} md:block bg-inherit z-40`}> 
          <ClubFilter activeDate={activeDate} onChangeDate={(d) => { setActiveDate(d); if (showFilters) setShowFilters(false); }} theme={theme} />
        </div>

        {/* Mobile overlay backdrop */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setShowFilters(false)}
            aria-label="Close filters overlay"
          />
        )}

        {/* Calendar main section */}
        <div className="flex-1 flex flex-col relative">
          <Calendar
            events={events}
            clubs={clubs}
            controlledDate={activeDate}
            onDateChange={setActiveDate}
            onSelectEvent={(e) => setSelectedEvent(e)}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />

          {/* Floating action buttons (mobile) */}
          <div className="md:hidden fixed bottom-4 right-4 flex flex-col gap-3 z-50">
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`rounded-full px-4 py-2 shadow-lg text-xs font-medium border ${theme === 'light' ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100' : 'bg-[#16181a] border-[#2a2c2e] text-gray-200 hover:bg-[#1f2225]'}`}
              aria-label="Toggle club filters"
            >{showFilters ? 'Close Filters' : 'Filters'}</button>
            <button
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              className={`rounded-full px-4 py-2 shadow-lg text-xs font-medium border ${theme === 'light' ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100' : 'bg-[#16181a] border-[#2a2c2e] text-gray-200 hover:bg-[#1f2225]'}`}
              aria-label="Toggle theme"
            >{theme === 'light' ? 'Dark' : 'Light'}</button>
          </div>
        </div>
        {/* Admin UI moved to /glenforestsacadmindash */}

        {selectedEvent && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
              <div
                className={`w-full max-w-md mx-4 rounded-lg p-6 shadow-lg border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#14161a] border-[#1e2022] text-gray-100'}`}
                onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">{selectedEvent.title}</h3>
              {selectedEvent.time && <p className={`text-sm mb-1 font-mono ${theme==='light' ? 'opacity-90 text-gray-700' : 'opacity-80'}`}>Time: {selectedEvent.time}</p>}
              {selectedEvent.location && <p className={`text-sm mb-1 ${theme==='light' ? 'opacity-90 text-gray-700' : 'opacity-80'}`}>Location: {selectedEvent.location}</p>}
              {selectedEvent.description && <p className="text-sm mb-4 whitespace-pre-wrap leading-relaxed">{selectedEvent.description}</p>}
                <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className={`${theme==='light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' : 'bg-[#222426] hover:bg-[#2a2c2f] text-gray-100'} px-4 py-2 rounded-md text-sm font-medium`}
                >Close</button>
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