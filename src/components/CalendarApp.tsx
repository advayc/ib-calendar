'use client';

import React, { useState, useEffect, useRef } from 'react';
import Calendar from '@/components/Calendar';
import ClubFilter from '@/components/ClubFilter';
// AdminPanel moved to a secret route; keep main app lean
import { ClubProvider } from '@/context/ClubContext';
import { Event, Club } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { Toaster } from 'react-hot-toast';
import { PanelLeftOpen } from 'lucide-react';
import EventDetailsModal from './EventDetailsModal';
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
  // Sidebar toggle for desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mobile sidebar (club filter) visibility
  const [showFilters, setShowFilters] = useState(false);
  // Dragging state for desktop sidebar (allows pushing left to hide)
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number>(0);
  const draggingRef = useRef<boolean>(false);
  const [dragOffset, setDragOffset] = useState(0); // negative when dragging left

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
        setClubs(remoteClubs.map((c) => ({ id: c.id, name: c.name, color: c.color, enabled: c.enabled, prioritized: c.prioritized || false })));
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

  // Drag handlers for sidebar drag-to-collapse
  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      const dx = e.clientX - startXRef.current;
      // only allow dragging left (negative dx) up to sidebar width
      const width = sidebarRef.current?.offsetWidth || 250;
      const clamped = Math.max(-width, Math.min(0, dx));
      setDragOffset(clamped);
    }

    function endDrag() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const width = sidebarRef.current?.offsetWidth || 250;
      // if dragged left more than 35% of width, collapse. Otherwise snap back open.
      if (Math.abs(dragOffset) > width * 0.35) {
        setSidebarCollapsed(true);
      }
      setDragOffset(0);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  // dragOffset intentionally not added to deps because we only read its current value in endDrag closure via state; it's fine to re-register on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handleEditEvent removed: editing happens in admin panel only

  return (
    <ClubProvider initialClubs={clubs}>
  <div suppressHydrationWarning className={`min-h-screen flex flex-col md:flex-row text-sm transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#101215] text-gray-200 border-r border-[#1e2022]'}`}>
        {/* Sidebar (desktop) / Drawer (mobile) */}
        <div
          ref={sidebarRef}
          className={`md:flex-shrink-0 md:h-auto md:static fixed top-0 left-0 h-full transform ${sidebarCollapsed ? 'md:w-0 -translate-x-full md:-translate-x-0' : 'md:w-[250px] translate-x-0'} ${showFilters ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'} ${theme === 'light' ? 'bg-gray-50' : 'bg-[#101215]'} z-40 md:z-auto transition-all duration-300 overflow-hidden relative`}
          style={{
            width: sidebarCollapsed ? (typeof window !== 'undefined' && window.innerWidth >= 768 ? '0' : '250px') : '250px',
            // Only apply inline translate while actively dragging; otherwise let CSS classes handle collapsed state
            transform: dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
          }}
        > 
          {!sidebarCollapsed && (
            <>
              <ClubFilter activeDate={activeDate} onChangeDate={(d) => { setActiveDate(d); if (showFilters) setShowFilters(false); }} theme={theme} />
              {/* Drag handle on the right edge */}
              <div 
                className="hidden md:block absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-blue-500 transition-colors"
                onPointerDown={(e) => {
                  // start dragging
                  // only left-button or touch
                  if ('button' in e && e.button !== 0) return;
                  draggingRef.current = true;
                  startXRef.current = e.clientX;
                }}
                title="Drag to hide sidebar"
              />
            </>
          )}
          
          {/* Collapsed state - show a tab to reopen */}
          {sidebarCollapsed && (
            <div 
              className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 cursor-pointer"
              onClick={() => setSidebarCollapsed(false)}
            >
              <div className={`p-2 rounded-r-lg shadow-lg ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-[#16181a] border border-[#2a2c2e]'}`}>
                <PanelLeftOpen className="w-5 h-5" />
              </div>
            </div>
          )}
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
          <EventDetailsModal event={selectedEvent} clubs={clubs} theme={theme} onClose={() => setSelectedEvent(null)} />
        )}

        {/* Admin Panel */}
      </div>
    </ClubProvider>
  );
};

export default CalendarApp;