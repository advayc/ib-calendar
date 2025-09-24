'use client';

import React, { useState, useCallback } from 'react';
import Calendar from '@/components/Calendar';
import ClubFilter from '@/components/ClubFilter';
import AdminPanel from '@/components/AdminPanel';
import { ClubProvider } from '@/context/ClubContext';
import { Event, Club } from '@/types';
import initialData from '@/data/events.json';

const CalendarApp: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(initialData.events);
  const [clubs] = useState<Club[]>(initialData.clubs);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [showAdmin, setShowAdmin] = useState(false);

  const handleAddEvent = useCallback((newEvent: Omit<Event, 'id'>) => {
    const event: Event = {
      ...newEvent,
      id: Date.now().toString(), // Simple ID generation
    };
    setEvents(prev => [...prev, event]);
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
      <div className="h-screen flex bg-[#0b0c0d] text-sm">
        {/* Sidebar */}
        <div className="w-[250px] flex-shrink-0">
          <ClubFilter activeDate={activeDate} onChangeDate={setActiveDate} />
        </div>
        {/* Calendar main section */}
        <div className="flex-1 flex flex-col">
          <Calendar events={events} clubs={clubs} controlledDate={activeDate} onDateChange={setActiveDate} onAdminClick={() => setShowAdmin(!showAdmin)} />
        </div>

        {/* Admin Modal */}
        {showAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0d0e0f] border border-[#1e2022] rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#1e2022]">
                <h2 className="text-xl font-semibold text-gray-100">Admin Dashboard</h2>
                <button
                  onClick={() => setShowAdmin(false)}
                  className="text-gray-400 hover:text-gray-200 text-2xl leading-none"
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
                />
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