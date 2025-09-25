 'use client';

import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import ClubFilter from '@/components/ClubFilter';
// AdminPanel moved to a secret route; keep main app lean
import { ClubProvider } from '@/context/ClubContext';
import { Event, Club } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { Toaster } from 'react-hot-toast';
// LoginForm handled on the secret admin page

const CalendarApp: React.FC = () => {
  const STORAGE_KEY = 'gfs-calendar-events-v1';
  const THEME_KEY = 'gfs-theme';

  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  // admin token and login handled on the secret admin route
  // loadingData intentionally removed; we show minimal loading states elsewhere if needed
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
      try {
        const [remoteEvents, remoteClubs] = await Promise.all([
          apiClient.get<Event[]>('/api/events'),
          apiClient.get<Club[]>('/api/clubs')
        ]);
        // Normalize date -> string (ISO) for existing UI
        setEvents(remoteEvents.map((e) => ({ ...e, date: e.date?.slice(0,10) })));
        setClubs(remoteClubs.map((c) => ({ id: c.id, name: c.name, color: c.color, enabled: c.enabled })));
      } catch {
        // fallback to empty lists
        setEvents([]);
        setClubs([]);
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

  // handleEditEvent removed: editing happens in admin panel only

  return (
    <ClubProvider initialClubs={clubs}>
  <div suppressHydrationWarning className={`min-h-screen md:h-screen flex flex-col md:flex-row text-sm transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#0b0c0d] text-gray-100'}`}>
        {/* Sidebar (desktop) / Drawer (mobile) */}
        <div className={`md:w-[250px] md:flex-shrink-0 md:h-full md:relative fixed top-0 left-0 h-full w-[250px] transform ${showFilters ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-inherit z-40 transition-transform duration-300`}> 
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
              className={`rounded-full p-2 shadow-lg text-xs font-medium border ${theme === 'light' ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100' : 'bg-[#16181a] border-[#2a2c2e] text-gray-200 hover:bg-[#1f2225]'}`}
              aria-label="Toggle theme"
            >{theme === 'light' ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21.752 15.002A9.718 9.718 0 0 1 12.999 22C7.476 22 3 17.523 3 12a9.718 9.718 0 0 1 6.998-8.752.75.75 0 0 1 .92.92A8.218 8.218 0 0 0 11 12c0 4.075 3.06 7.437 6.832 7.832a.75.75 0 0 1 .92.92Z"/></svg> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 12 22Zm0-16a.75.75 0 0 1-.75-.75V3.75a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 12 6Z"/></svg>}</button>
          </div>
        </div>
        <Toaster />
        {/* Admin UI moved to /glenforestsacadmindash */}

        {selectedEvent && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
              <div
                className={`w-full max-w-md mx-4 rounded-lg p-6 shadow-lg border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#14161a] border-[#1e2022] text-gray-100'}`}
                onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">{selectedEvent.title}</h3>
              {(() => {
                const club = clubs.find(c => c.id === selectedEvent.clubId);
                return club && (
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: club.color || '#ffffff' }}
                    ></div>
                    <p className={`text-sm font-medium ${theme==='light' ? 'text-gray-700' : 'text-gray-300'}`}>{club.name}</p>
                  </div>
                );
              })()}
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