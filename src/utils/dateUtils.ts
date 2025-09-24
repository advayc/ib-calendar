import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  addMonths,
  subMonths,
  isSameDay
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

  return days.map(day => {
    const dayEvents = events.filter(event => 
      isSameDay(new Date(event.date), day)
    );

    return {
      date: day,
      events: dayEvents,
      isCurrentMonth: isSameMonth(day, date),
      isToday: isToday(day)
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