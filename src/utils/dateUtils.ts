// Format event time as 12-hour (AM/PM), fallback to original if parse fails
export const formatEventTime12h = (time?: string): string => {
  if (!time) return '';
  // Try to parse as HH:mm or H:mm
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    let hour = parseInt(match[1], 10);
    const min = match[2];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return `${hour}:${min} ${ampm}`;
  }
  // If already has AM/PM or not a time, return as is
  if (/am|pm/i.test(time)) return time;
  return time;
};
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth,
  addMonths,
  subMonths,
  
} from 'date-fns';
import { CalendarDay, Event } from '@/types';

export const formatDate = (date: Date, formatString: string = 'yyyy-MM-dd'): string => {
  return format(date, formatString);
};

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const getCalendarDays = (date: Date, events: Event[]): CalendarDay[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Normalize event dates to local YYYY-MM-DD to avoid timezone shift when
  // comparing Date objects stored as ISO strings. If the incoming event.date
  // is a plain YYYY-MM-DD string, parse it as a local date (no timezone).
  const normalizeDateOnly = (d: Date) => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const parseEventDateAsLocal = (dateVal: unknown): Date | null => {
    if (!dateVal) return null;
    try {
      if (typeof dateVal === 'string') {
        const s = dateVal.slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          const [y, m, dd] = s.split('-').map((n) => parseInt(n, 10));
          return new Date(y, m - 1, dd);
        }
      }
      const ev = new Date(String(dateVal));
      if (isNaN(ev.getTime())) return null;
      return normalizeDateOnly(ev);
    } catch {
      return null;
    }
  };

  // Create a normalized "today" date for reliable comparison
  // Force to browser's local midnight to avoid any timezone issues
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const normalizedToday = today;

  return days.map(day => {
    const dayStart = normalizeDateOnly(day);
    const dayEvents = events.filter(event => {
      const evDate = parseEventDateAsLocal(event.date);
      if (!evDate) return false;
      return evDate.getTime() === dayStart.getTime();
    });

    // Compare normalized dates instead of using isToday from date-fns
    const isTodayFlag = dayStart.getTime() === normalizedToday.getTime();

    return {
      date: day,
      events: dayEvents,
      isCurrentMonth: isSameMonth(day, date),
      isToday: isTodayFlag
    };
  });
};

export const getNextMonth = (date: Date): Date => addMonths(date, 1);
export const getPreviousMonth = (date: Date): Date => subMonths(date, 1);

export const formatEventTime = (time?: string): string => {
  if (!time) return '';
  return time;
};

export const getDayName = (date: Date): string => {
  return format(date, 'EEE');
};

export const getDayNumber = (date: Date): number => {
  return date.getDate();
};