 'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Repeat, PlusCircle, Save, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Event, Club } from '@/types';

interface AdminPanelProps {
  events: Event[];
  clubs: Club[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateClub?: (clubId: string, changes: Partial<Club>) => void;
  onAddClub?: (club: { name: string; slug?: string; color?: string }) => Promise<Club | undefined> | void;
  onDeleteClub?: (clubId: string) => void;
  theme?: 'light' | 'dark';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ events, clubs, onAddEvent, onDeleteEvent, onUpdateClub, onAddClub, onDeleteClub, theme = 'light' }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  interface NewEventState {
    title: string;
    date: string;
    time: string;
    description: string;
    location: string;
    clubId: string;
    recurrence: boolean;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    interval: number;
    until: string;
    count: string;
  }

  const [newEvent, setNewEvent] = useState<NewEventState>({
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    clubId: '',
    recurrence: false,
    frequency: 'weekly',
    interval: 1,
    until: '',
    count: ''
  });

  // helper to provide simple weekday names
  const weekdayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const getWeekdayName = (dateStr: string) => {
    try { const d = new Date(dateStr); if (isNaN(d.getTime())) return ''; return weekdayNames[d.getDay()]; } catch { return ''; }
  };

  // If user picks a different weekday for recurrence, compute next date for that weekday (on or after current date)
  const nextDateForWeekday = (fromDateStr: string, targetWeekdayIndex: number) => {
    const from = new Date(fromDateStr);
    if (isNaN(from.getTime())) return fromDateStr;
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const diff = (targetWeekdayIndex - start.getDay() + 7) % 7;
    const result = new Date(start);
    result.setDate(start.getDate() + diff);
    // format YYYY-MM-DD
    const y = result.getFullYear();
    const m = String(result.getMonth() + 1).padStart(2,'0');
    const d = String(result.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  };

  const [allDay, setAllDay] = useState(false);

  // slug will be auto-generated server-side if omitted
  const [newClub, setNewClub] = useState({ name: '', color: '#4ade80' });
  const [addingClub, setAddingClub] = useState(false);
  const [clubStatus, setClubStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
              frequency: newEvent.frequency || 'weekly',
              interval: newEvent.interval || 1,
              count: newEvent.count ? parseInt(newEvent.count) : undefined,
              until: newEvent.until || undefined,
            }
          : undefined,
      };
      try {
        onAddEvent(base);
        toast.success('Event added');
        setNewEvent({
        title: '',
        date: '',
        time: '',
        description: '',
        location: '',
        clubId: '',
        recurrence: false,
        frequency: 'weekly',
        interval: 1,
        until: '',
        count: '',
      });
      } catch (err) {
        toast.error('Failed to add event');
      }
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
          {/* Date + Time are in the row below */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
            <div className="col-span-2 flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Date</label>
                <input
                  type="date"
                  placeholder="Date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className={fieldClass()}
                  required
                />
              </div>
              <div className="w-36">
                <label className="text-xs text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Time</label>
                <input
                  type="time"
                  placeholder="Time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className={fieldClass(true)}
                  disabled={allDay}
                />
              </div>
            </div>
            <div className="col-span-1 flex items-center gap-2">
              <input id="allDay" type="checkbox" checked={allDay} onChange={(e) => { setAllDay(e.target.checked); if (e.target.checked) setNewEvent({ ...newEvent, time: '' }); }} />
              <label htmlFor="allDay" className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>All-day</label>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-1 mb-2">Tip: Toggle All-day to create an event without a time. Use the time selector to set a start time.</div>
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
            <label className={`flex items-center gap-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              <input
                type="checkbox"
                checked={newEvent.recurrence}
                onChange={(q) => setNewEvent({ ...newEvent, recurrence: q.target.checked })}
              />
              <Repeat className="w-4 h-4" />
              Recurring
            </label>
            {newEvent.recurrence && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">Repeats on</div>
                    <div className={`px-2 py-1 rounded ${isLight ? 'bg-gray-100' : 'bg-[#16181a]'}`}>{getWeekdayName(newEvent.date) || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">Or choose:</div>
                    <select
                        value={getWeekdayName(newEvent.date)}
                        onChange={(e) => {
                          const weekday = e.target.value;
                          const idx = weekdayNames.indexOf(weekday);
                          if (idx >= 0 && newEvent.date) {
                            const newDate = nextDateForWeekday(newEvent.date, idx);
                            setNewEvent({ ...newEvent, date: newDate });
                          }
                        }}
                      className={fieldClass(true)}
                    >
                      {weekdayNames.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap items-end">
                  <div className="w-36">
                    <label className={`block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Frequency</label>
                    <select className={fieldClass(true)} value={newEvent.frequency} onChange={(e) => setNewEvent({ ...newEvent, frequency: e.target.value as NewEventState['frequency'] })}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <div className="mt-1 text-xs text-gray-500">Repeats: <span className="font-medium">{newEvent.frequency === 'biweekly' ? 'Every 2 weeks' : newEvent.frequency}</span></div>
                  </div>
                  <div className="w-28">
                    <label className={`block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Every</label>
                    <input type="number" min={1} value={newEvent.interval} onChange={(e) => setNewEvent({ ...newEvent, interval: parseInt(e.target.value) || 1 })} className={fieldClass(true)} />
                  </div>
                  <div className="w-36">
                    <label className={`block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Ends on</label>
                    <input type="date" value={newEvent.until} onChange={(e) => setNewEvent({ ...newEvent, until: e.target.value })} className={fieldClass(true)} />
                  </div>
                  <div className="w-28">
                    <label className={`block mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Or count</label>
                    <input type="number" min={1} value={newEvent.count} onChange={(e) => setNewEvent({ ...newEvent, count: e.target.value })} className={fieldClass(true)} placeholder="opt" />
                  </div>
                </div>
                <div className="text-xs text-gray-500">By default recurring events repeat on the weekday of the start date. Choose another weekday to update the start date.</div>
              </div>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#FF3B30] hover:bg-[#E5352B] text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Event{newEvent.recurrence ? 's' : ''}
            </button>
          </div>
        </form>
      </div>

      <div className={`p-4 rounded-lg ${sectionCard}`}>
        <h3 className={`text-lg font-medium mb-3 ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Clubs</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newClub.name) return;
            try {
              setAddingClub(true);
              setClubStatus(null);
              const created = await (onAddClub ? onAddClub({ name: newClub.name, color: newClub.color }) : undefined);
              if (created && typeof created === 'object' && (created as Club).id) {
                toast.success(`Created ${created.name}`);
                setNewClub({ name: '', color: '#4ade80' });
              } else {
                toast.error('No club data returned from server');
              }
            } catch (err: unknown) {
              let msg = 'Failed to create club';
              if (err instanceof Error) msg = err.message;
              else if (typeof err === 'string') msg = err;
              toast.error(msg);
            } finally {
              setAddingClub(false);
              setTimeout(() => setClubStatus(null), 3500);
            }
          }}
          className="mb-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
            <input
              className={fieldClass()}
              placeholder="Club name"
              value={newClub.name}
              onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
            />
            {/* slug is optional and will be generated from the name server-side */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-10 h-10 p-0 border-none rounded"
                value={newClub.color}
                onChange={(e) => setNewClub({ ...newClub, color: e.target.value })}
                aria-label="Club color"
              />
              <div className="text-xs text-gray-500">Color</div>
            </div>
            <div className="flex justify-end">
              <button
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-[#10b981] to-[#059669] hover:from-[#0ea56d] hover:to-[#04855a] text-white rounded shadow disabled:opacity-60"
                type="submit"
                disabled={addingClub || !newClub.name}
              >
                <PlusCircle className="w-4 h-4" /> {addingClub ? 'Adding…' : 'Add Club'}
              </button>
            </div>
          </div>
        </form>
        {clubStatus && (
          <div className={`text-sm ${clubStatus.type === 'success' ? 'text-green-600' : 'text-red-500'} mt-2`}>{clubStatus.message}</div>
        )}
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
              <div className="flex gap-2">
                <button
                  onClick={() => { onUpdateClub?.(club.id, { color: club.color }); toast.success('Saved'); }}
                  className={`${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-[#222426] hover:bg-[#2a2c2f] text-gray-100'} px-3 py-1 rounded text-sm flex items-center gap-2`}
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm(`Delete club “${club.name}” and its events?`)) { onDeleteClub?.(club.id); toast.success('Deleted'); } }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
                  onClick={() => { if (confirm('Delete event?')) { onDeleteEvent(event.id); toast.success('Deleted event'); } }}
                  className="ml-0 sm:ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex-shrink-0 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminPanel;