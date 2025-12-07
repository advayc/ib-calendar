'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Event, Course } from '@/types';

interface AdminPanelProps {
  events: Event[];
  clubs: Course[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateClub?: (courseId: string, changes: Partial<Course>) => void;
  onUpdateEvent?: (eventId: string, changes: Partial<Event>) => void;
  onAddClub?: (course: { name: string; color?: string; grade?: string }) => Promise<Course | undefined> | void;
  onDeleteClub?: (courseId: string) => void;
  theme?: 'light' | 'dark';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  events, 
  clubs, 
  onAddEvent, 
  onDeleteEvent, 
  onUpdateClub, 
  onUpdateEvent,
  onAddClub, 
  onDeleteClub, 
  theme = 'light' 
}) => {
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    courseId: '',
    isRecurring: false,
    recurrenceFrequency: 'daily' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    recurrenceCount: 7,
    recurrenceUntil: '',
  });

  const [newCourse, setNewCourse] = useState({ name: '', color: '#10b981', grade: 'DP2' });
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editEventData, setEditEventData] = useState<Partial<Event>>({});
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editCourseData, setEditCourseData] = useState<Partial<Course>>({});

  const isLight = theme === 'light';
  const cardClass = isLight ? 'bg-white border border-gray-200 shadow-sm' : 'bg-[#1E1E1E] border border-[#2A2A2A]';
  const inputClass = isLight 
    ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500'
    : 'bg-[#191919] border border-[#2A2A2A] text-gray-100 placeholder-gray-500 focus:border-gray-600';

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.courseId) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const eventData: Omit<Event, 'id'> & { recurrence?: { frequency: string; interval: number; count?: number; until?: string } } = {
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || undefined,
        description: newEvent.description || undefined,
        location: newEvent.location || undefined,
        courseId: newEvent.courseId,
      };

      // Add recurrence if enabled
      if (newEvent.isRecurring) {
        eventData.recurrence = {
          frequency: newEvent.recurrenceFrequency,
          interval: 1,
          count: newEvent.recurrenceCount || undefined,
          until: newEvent.recurrenceUntil || undefined,
        };
      }

      onAddEvent(eventData);
      toast.success(newEvent.isRecurring ? 'Recurring deadlines added!' : 'Deadline added!');
      setNewEvent({ 
        title: '', 
        date: '', 
        time: '', 
        description: '', 
        location: '', 
        courseId: '',
        isRecurring: false,
        recurrenceFrequency: 'daily',
        recurrenceCount: 7,
        recurrenceUntil: '',
      });
    } catch (err) {
      toast.error('Failed to add deadline');
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.name) return;

    try {
      const created = await onAddClub?.({ ...newCourse });
      if (created) {
        toast.success(`Course "${created.name}" added!`);
        setNewCourse({ name: '', color: '#10b981', grade: 'DP2' });
      }
    } catch (err) {
      toast.error('Failed to add course');
    }
  };

  const handleUpdateEvent = (eventId: string) => {
    if (!editEventData.title || !editEventData.date || !editEventData.courseId) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      onUpdateEvent?.(eventId, editEventData);
      toast.success('Deadline updated!');
      setEditingEvent(null);
      setEditEventData({});
    } catch (err) {
      toast.error('Failed to update deadline');
    }
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    if (confirm(`Delete "${eventTitle}"?`)) {
      try {
        onDeleteEvent(eventId);
        toast.success('Deadline deleted');
      } catch (err) {
        toast.error('Failed to delete deadline');
      }
    }
  };

  const handleDeleteCourse = (courseId: string, courseName: string) => {
    if (confirm(`Delete course "${courseName}" and all its deadlines?`)) {
      try {
        onDeleteClub?.(courseId);
        toast.success('Course deleted');
      } catch (err) {
        toast.error('Failed to delete course');
      }
    }
  };

  const handleUpdateCourse = (courseId: string) => {
    if (!editCourseData.name) {
      toast.error('Course name is required');
      return;
    }

    try {
      onUpdateClub?.(courseId, editCourseData);
      toast.success('Course updated!');
      setEditingCourse(null);
      setEditCourseData({});
    } catch (err) {
      toast.error('Failed to update course');
    }
  };

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
          Admin Dashboard
        </h2>
        <button
          onClick={() => window.open('/', '_blank')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" /> View Calendar
        </button>
      </div>

      {/* Add Deadline */}
      <div className={`p-6 rounded-lg ${cardClass}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
          Add New Deadline
        </h3>
        <form onSubmit={handleAddEvent} className="space-y-4">
          <input
            type="text"
            placeholder="Deadline Title *"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className={`px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
              required
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className={`px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
              placeholder="Time (optional)"
            />
          </div>

          <select
            value={newEvent.courseId}
            onChange={(e) => setNewEvent({ ...newEvent, courseId: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
            required
          >
            <option value="">Select Course *</option>
            {clubs.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>

          <textarea
            placeholder="Description (optional)"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none ${inputClass}`}
            rows={2}
          />

          <input
            type="text"
            placeholder="Location (optional)"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          />

          {/* Recurring Deadline Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newEvent.isRecurring}
                onChange={(e) => setNewEvent({ ...newEvent, isRecurring: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500"
              />
              <span className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                Recurring Deadline
              </span>
            </label>

            {newEvent.isRecurring && (
              <div className={`p-4 rounded-lg space-y-3 ${isLight ? 'bg-gray-50' : 'bg-[#191919]'}`}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                      Frequency
                    </label>
                    <select
                      value={newEvent.recurrenceFrequency}
                      onChange={(e) => setNewEvent({ ...newEvent, recurrenceFrequency: e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly' })}
                      className={`w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-gray-500 ${inputClass}`}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                      Number of Events
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={newEvent.recurrenceCount}
                      onChange={(e) => setNewEvent({ ...newEvent, recurrenceCount: parseInt(e.target.value) || 1 })}
                      className={`w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                      placeholder="7"
                    />
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-medium mb-1 block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                    Or End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={newEvent.recurrenceUntil}
                    onChange={(e) => setNewEvent({ ...newEvent, recurrenceUntil: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                  />
                </div>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {newEvent.recurrenceUntil 
                    ? `Creates events from ${newEvent.date} until ${newEvent.recurrenceUntil}`
                    : `Creates ${newEvent.recurrenceCount} ${newEvent.recurrenceFrequency} events starting ${newEvent.date}`
                  }
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Deadline
          </button>
        </form>
      </div>

      {/* Manage Courses */}
      <div className={`p-6 rounded-lg ${cardClass}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
          Manage Courses
        </h3>
        
        <form onSubmit={handleAddCourse} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Course Name *"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              className={`px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
              required
            />
            <select
              value={newCourse.grade}
              onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
              className={`px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
            >
              <option value="DP2">DP2</option>
              <option value="DP1">DP1</option>
            </select>
            <input
              type="color"
              value={newCourse.color}
              onChange={(e) => setNewCourse({ ...newCourse, color: e.target.value })}
              className="h-10 w-full rounded-lg cursor-pointer"
              title="Course Color"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              Add Course
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {clubs.map(course => {
            const isEditingThisCourse = editingCourse === course.id;

            if (isEditingThisCourse) {
              return (
                <div key={course.id} className={`p-4 rounded-lg border-2 border-gray-500 ${isLight ? 'bg-gray-50' : 'bg-[#252525]'}`}>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editCourseData.name || ''}
                      onChange={(e) => setEditCourseData({ ...editCourseData, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg outline-none ${inputClass}`}
                      placeholder="Course Name"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={editCourseData.grade || 'DP2'}
                        onChange={(e) => setEditCourseData({ ...editCourseData, grade: e.target.value as 'DP1' | 'DP2' })}
                        className={`px-3 py-2 rounded-lg outline-none ${inputClass}`}
                      >
                        <option value="DP2">DP2</option>
                        <option value="DP1">DP1</option>
                      </select>
                      <input
                        type="color"
                        value={editCourseData.color || '#10b981'}
                        onChange={(e) => setEditCourseData({ ...editCourseData, color: e.target.value })}
                        className="h-10 w-full rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateCourse(course.id)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingCourse(null); setEditCourseData({}); }}
                        className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={course.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isLight ? 'bg-gray-50 hover:bg-gray-100' : 'bg-[#14161a] hover:bg-[#1a1c20]'} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: course.color }}
                  />
                  <span className={isLight ? 'text-gray-900' : 'text-gray-100'}>{course.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${isLight ? 'bg-gray-200 text-gray-700' : 'bg-[#2a2c2e] text-gray-400'}`}>
                    {course.grade}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCourse(course.id);
                      setEditCourseData({
                        name: course.name,
                        color: course.color,
                        grade: course.grade,
                      });
                    }}
                    className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id, course.name)}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manage Deadlines */}
      <div className={`p-6 rounded-lg ${cardClass}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
          All Deadlines ({sortedEvents.length})
        </h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedEvents.length === 0 ? (
            <p className={`text-center py-8 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              No deadlines yet. Add one above!
            </p>
          ) : (
            sortedEvents.map(event => {
              const course = clubs.find(c => c.id === event.courseId);
              const isEditing = editingEvent === event.id;

              if (isEditing) {
                return (
                  <div key={event.id} className={`p-4 rounded-lg border-2 border-gray-500 ${isLight ? 'bg-gray-50' : 'bg-[#252525]'}`}>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editEventData.title || ''}
                        onChange={(e) => setEditEventData({ ...editEventData, title: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg outline-none ${inputClass}`}
                        placeholder="Title"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={editEventData.date || ''}
                          onChange={(e) => setEditEventData({ ...editEventData, date: e.target.value })}
                          className={`px-3 py-2 rounded-lg outline-none ${inputClass}`}
                        />
                        <input
                          type="time"
                          value={editEventData.time || ''}
                          onChange={(e) => setEditEventData({ ...editEventData, time: e.target.value })}
                          className={`px-3 py-2 rounded-lg outline-none ${inputClass}`}
                        />
                      </div>
                      <select
                        value={editEventData.courseId || ''}
                        onChange={(e) => setEditEventData({ ...editEventData, courseId: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg outline-none ${inputClass}`}
                      >
                        {clubs.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateEvent(event.id)}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingEvent(null); setEditEventData({}); }}
                          className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={event.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${isLight ? 'bg-gray-50 hover:bg-gray-100' : 'bg-[#191919] hover:bg-[#252525]'} transition-colors`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {course && (
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: course.color }}
                        />
                      )}
                      <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
                        {event.title}
                      </span>
                    </div>
                    <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {event.date} {event.time && `at ${event.time}`} • {course?.name || 'Unknown'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingEvent(event.id);
                        setEditEventData({
                          title: event.title,
                          date: event.date,
                          time: event.time,
                          courseId: event.courseId,
                          description: event.description,
                          location: event.location,
                        });
                      }}
                      className="p-2 hover:bg-gray-500/10 text-gray-500 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id, event.title)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
