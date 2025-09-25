"use client";

import React, { useEffect, useState, useCallback } from 'react';
import AdminPanel from '@/components/AdminPanel';
import LoginForm from '@/components/LoginForm';
import { apiClient } from '@/lib/apiClient';
import { Event, Club } from '@/types';

const STORAGE_KEY = 'gfs-admin-token';

const AdminPage: React.FC = () => {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  // loading state removed (not used)
  const [loginError, setLoginError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light'|'dark'>(() => (typeof window !== 'undefined' ? (localStorage.getItem('gfs-theme') as 'light'|'dark') || 'light' : 'light'));

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
  const [evs, cls] = await Promise.all([apiClient.get<Event[]>('/api/events'), apiClient.get<Club[]>('/api/clubs')]);
  setEvents(evs.map((e) => ({ ...e, date: e.date?.slice?.(0,10) || e.date })));
  setClubs(cls.map((c) => ({ id: c.id, name: c.name, color: c.color, enabled: c.enabled })));
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
    try { await apiClient.delete(`/api/events?id=${eventId}`); setEvents(prev => prev.filter(e => e.id !== eventId)); } catch (err) { console.error('Delete failed', err); }
  }, [adminToken]);

  const handleAddClub = useCallback(async (club: { name: string; slug?: string; color?: string }) => {
    if (adminToken) apiClient.setToken(adminToken);
    try {
      const created = await apiClient.post<Club>('/api/clubs', club);
      setClubs(prev => [...prev, { id: created.id, name: created.name, color: created.color, enabled: created.enabled }]);
      return created;
    } catch (err) {
      console.error('Add club failed', err);
      // rethrow so UI shows the error
      throw err;
    }
  }, [adminToken]);

  const handleDeleteClub = useCallback(async (clubId: string) => {
    if (adminToken) apiClient.setToken(adminToken);
    try { await apiClient.delete(`/api/clubs?id=${clubId}`); setClubs(prev => prev.filter(c => c.id !== clubId)); setEvents(prev => prev.filter(e => e.clubId !== clubId)); } catch (err) { console.error('Delete club failed', err); }
  }, [adminToken]);

  const handleUpdateClub = useCallback(async (clubId: string, changes: Partial<Club>) => {
    if (adminToken) apiClient.setToken(adminToken);
    try { const updated = await apiClient.patch<Club>('/api/clubs', { id: clubId, ...changes }); setClubs(prev => prev.map(c => c.id === clubId ? { ...c, ...updated } : c)); } catch (err) { console.error('Update club failed', err); }
  }, [adminToken]);

  return (
    <div className={`min-h-screen p-4 sm:p-6 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#0b0c0d] text-gray-100'}`}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4">Admin Dashboard (Secret)</h1>
        {!adminToken ? (
          <div className="w-full max-w-md p-5 sm:p-6 rounded shadow-sm border bg-white/5">
            <p className="text-sm mb-3">Enter admin credentials to manage events and clubs.</p>
            <LoginForm onSubmit={handleLogin} error={loginError} loading={false} theme={theme} />
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="px-3 py-1 rounded border text-sm">Toggle theme</button>
                <button onClick={handleLogout} className="px-3 py-1 rounded border text-sm">Logout</button>
              </div>
            </div>
            <AdminPanel events={events} clubs={clubs} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} onUpdateClub={handleUpdateClub} onAddClub={handleAddClub} onDeleteClub={handleDeleteClub} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
