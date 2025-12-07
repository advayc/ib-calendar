"use client";

import React, { useEffect, useState, useCallback } from 'react';
import AdminPanel from '@/components/AdminPanel';
import LoginForm from '@/components/LoginForm';
import { apiClient } from '@/lib/apiClient';
import { Event, Course } from '@/types';

const STORAGE_KEY = 'gfs-admin-token';

const AdminPage: React.FC = () => {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  // loading state removed (not used)
  const [loginError, setLoginError] = useState<string | null>(null);
  // Initialize to a stable value for SSR to avoid hydration mismatch; hydrate from localStorage after mount
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  useEffect(() => {
    try {
      const saved = (localStorage.getItem('gfs-theme') as 'light'|'dark') || 'light';
      setTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const t = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (t) { setAdminToken(t); apiClient.setToken(t); }
    } catch {
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
  const [evs, crs] = await Promise.all([apiClient.get<Event[]>('/api/events'), apiClient.get<Course[]>('/api/courses')]);
  setEvents(evs.map((e) => ({ ...e, date: e.date?.slice?.(0,10) || e.date })));
  setCourses(crs.map((c) => ({ id: c.id, name: c.name, color: c.color, enabled: c.enabled, grade: c.grade || 'DP2' })));
      } catch (err) {
        console.error('Load failed', err);
      }
    };
    load();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setLoginError(null);
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (!res.ok) throw new Error('Invalid');
      const data = await res.json();
      setAdminToken(data.token);
      apiClient.setToken(data.token);
      try { localStorage.setItem(STORAGE_KEY, data.token); } catch {}
    } catch {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    apiClient.setToken(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const handleAddEvent = useCallback(async (newEvent: Omit<Event, 'id'>) => {
    if (adminToken) apiClient.setToken(adminToken);
    try {
      if (newEvent.recurrence) {
        const created = await apiClient.post<Event[]>('/api/events', { ...newEvent, recurrence: { frequency: newEvent.recurrence.frequency, interval: newEvent.recurrence.interval, count: newEvent.recurrence.count, until: newEvent.recurrence.until } });
        const normalized = created.map((e) => ({ ...e, date: e.date.slice(0,10) }));
        setEvents(prev => [...prev, ...normalized]);
      } else {
        const created = await apiClient.post<Event>('/api/events', newEvent);
        setEvents(prev => [...prev, { ...created, date: created.date.slice(0,10) }]);
      }
  } catch (err) { console.error('Add event failed', err); }
  }, [adminToken]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    if (adminToken) apiClient.setToken(adminToken);
    try {
      const response = await apiClient.delete(`/api/events?id=${eventId}`);
      // Check if this was a series deletion
      if (response && typeof response === 'object' && 'deletedSeries' in response && response.deletedSeries) {
        // Find and remove all events with the same recurrenceGroupId
        const eventToDelete = events.find(e => e.id === eventId);
        if (eventToDelete?.recurrenceGroupId) {
          setEvents(prev => prev.filter(e => e.recurrenceGroupId !== eventToDelete.recurrenceGroupId));
        } else {
          setEvents(prev => prev.filter(e => e.id !== eventId));
        }
      } else {
        setEvents(prev => prev.filter(e => e.id !== eventId));
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  }, [adminToken, events]);

  const handleAddCourse = useCallback(async (course: { name: string; slug?: string; color?: string; grade?: string }) => {
    if (adminToken) apiClient.setToken(adminToken);
    try {
      const created = await apiClient.post<Course>('/api/courses', course);
      setCourses(prev => [...prev, { id: created.id, name: created.name, color: created.color, enabled: created.enabled, grade: created.grade || 'DP2' }]);
      return created;
    } catch (err) {
      console.error('Add course failed', err);
      // rethrow so UI shows the error
      throw err;
    }
  }, [adminToken]);

  const handleDeleteCourse = useCallback(async (courseId: string) => {
    if (adminToken) apiClient.setToken(adminToken);
    try { await apiClient.delete(`/api/courses?id=${courseId}`); setCourses(prev => prev.filter(c => c.id !== courseId)); setEvents(prev => prev.filter(e => e.courseId !== courseId)); } catch (err) { console.error('Delete course failed', err); }
  }, [adminToken]);

  const handleUpdateCourse = useCallback(async (courseId: string, changes: Partial<Course>) => {
    if (adminToken) apiClient.setToken(adminToken);
    try { const updated = await apiClient.patch<Course>('/api/courses', { id: courseId, ...changes }); setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...updated } : c)); } catch (err) { console.error('Update course failed', err); }
  }, [adminToken]);

  const handleUpdateEvent = useCallback(async (eventId: string, changes: Partial<Event>) => {
    if (adminToken) apiClient.setToken(adminToken);
    try { const updated = await apiClient.patch<Event>('/api/events', { id: eventId, ...changes }); setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updated, date: updated.date?.slice?.(0,10) || updated.date } : e)); } catch (err) { console.error('Update event failed', err); }
  }, [adminToken]);

  return (
    <div suppressHydrationWarning className={`min-h-screen p-4 sm:p-6 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#191919] text-gray-100'}`}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4">Admin Dashboard (Secret)</h1>
        {!adminToken ? (
          <div className="w-full max-w-md p-5 sm:p-6 rounded shadow-sm border bg-white/5">
            <p className="text-sm mb-3">Enter admin credentials to manage events and courses.</p>
            <LoginForm onSubmit={handleLogin} error={loginError} loading={false} theme={theme} />
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                  className={`px-3 py-1 rounded border text-sm transition-colors ${
                    theme === 'light'
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                      : 'border-[#2a2c2f] text-gray-200 hover:bg-[#1a1c1e] hover:border-[#3a3c3e]'
                  }`}
                >
                  Toggle theme
                </button>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-1 rounded border text-sm transition-colors ${
                    theme === 'light'
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                      : 'border-[#2a2c2f] text-gray-200 hover:bg-[#1a1c1e] hover:border-[#3a3c3e]'
                  }`}
                >
                  Logout
                </button>
              </div>
            </div>
            <AdminPanel events={events} clubs={courses} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} onUpdateClub={handleUpdateCourse} onUpdateEvent={handleUpdateEvent} onAddClub={handleAddCourse} onDeleteClub={handleDeleteCourse} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
