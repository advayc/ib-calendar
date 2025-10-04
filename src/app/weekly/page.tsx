'use client';

import React, { useState, useEffect } from 'react';
import WeekView from '@/components/WeekView';
import DayView from '@/components/DayView';
import ClubFilter from '@/components/ClubFilter';
import ViewSelector from '@/components/ViewSelector';
import { ClubProvider } from '@/context/ClubContext';
import { Event, Club } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { Toaster } from 'react-hot-toast';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EventDetailsModal from '@/components/EventDetailsModal';

type ViewType = 'day' | 'week' | 'month';

const WeeklyCalendarPage: React.FC = () => {
  const THEME_KEY = 'gfs-theme';
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('week');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
    setTheme(saved);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [remoteEvents, remoteClubs] = await Promise.all([
          apiClient.get<Event[]>('/api/events'),
          apiClient.get<Club[]>('/api/clubs')
        ]);
        setEvents(remoteEvents.map((e) => ({ ...e, date: e.date?.slice(0,10) })));
        setClubs(remoteClubs.map((c) => ({ id: c.id, name: c.name, color: c.color, enabled: c.enabled, prioritized: c.prioritized || false })));
      } catch {
        setEvents([]);
        setClubs([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  const handleViewChange = (view: ViewType) => {
    if (view === 'month') {
      router.push('/');
    } else {
      setCurrentView(view);
    }
  };

  return (
    <ClubProvider initialClubs={clubs}>
      <div suppressHydrationWarning className={`min-h-screen flex flex-col md:flex-row text-sm transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#101215] text-gray-200'}`}>
        {/* Sidebar */}
        <div
          className={`md:flex-shrink-0 md:h-auto md:static fixed top-0 left-0 h-full transform ${sidebarCollapsed ? 'md:w-0 -translate-x-full md:-translate-x-0' : 'md:w-[250px] translate-x-0'} ${theme === 'light' ? 'bg-gray-50' : 'bg-[#101215]'} z-40 transition-all duration-300 overflow-hidden`}
          style={{ width: sidebarCollapsed ? (typeof window !== 'undefined' && window.innerWidth >= 768 ? '0' : '250px') : '250px' }}
        >
          {!sidebarCollapsed && (
            <ClubFilter activeDate={activeDate} onChangeDate={setActiveDate} theme={theme} />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col relative">
          {/* Header with collapse button and navigation */}
          <div className={`flex items-center gap-3 px-4 py-3 border-b ${theme === 'light' ? 'border-gray-200 bg-white' : 'border-[#1e2022] bg-[#14161a]'}`}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-[#2a2c2f] text-gray-300'}`}
              aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            <div className="flex-1"></div>

            <div className="flex items-center gap-2">
              <ViewSelector
                currentView={currentView}
                onViewChange={handleViewChange}
                theme={theme}
              />
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-[#2a2c2f] hover:bg-[#3a3c3e] text-gray-200'}`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>

          {currentView === 'week' ? (
            <WeekView
              events={events}
              clubs={clubs}
              currentDate={activeDate}
              onDateChange={setActiveDate}
              onSelectEvent={(e) => setSelectedEvent(e)}
              theme={theme}
            />
          ) : (
            <DayView
              events={events}
              clubs={clubs}
              currentDate={activeDate}
              onDateChange={setActiveDate}
              onSelectEvent={(e) => setSelectedEvent(e)}
              theme={theme}
            />
          )}
        </div>

        <Toaster />

        {selectedEvent && (
          <EventDetailsModal event={selectedEvent} clubs={clubs} theme={theme} onClose={() => setSelectedEvent(null)} />
        )}
      </div>
    </ClubProvider>
  );
};

export default WeeklyCalendarPage;
