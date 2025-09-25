export interface Club {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
}

export interface Event {
  id: string;
  title: string;
  clubId: string;
  date: string; // ISO date string
  time?: string;
  description?: string;
  location?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    interval: number; // every X weeks
    count?: number; // number of occurrences
    until?: string; // ISO date string end date (inclusive)
  };
}

export interface CalendarDay {
  date: Date;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
}