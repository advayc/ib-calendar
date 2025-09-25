export interface Club {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  prioritized?: boolean;
}

export interface Event {
  id: string;
  title: string;
  clubId: string;
  date: string; // ISO date string
  time?: string;
  description?: string;
  location?: string;
  // Some API responses include recurrence expanded as separate fields (recurrenceFrequency, recurrenceInterval, etc.)
  // Keep both shapes for compatibility with different backends.
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    interval: number; // every X weeks
    count?: number; // number of occurrences
    until?: string; // ISO date string end date (inclusive)
  };
  // Optional raw recurrence fields (from Prisma-expanded rows / legacy API)
  recurrenceFrequency?: string;
  recurrenceInterval?: number;
  recurrenceCount?: number;
  recurrenceUntil?: string;
}

export interface CalendarDay {
  date: Date;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
}