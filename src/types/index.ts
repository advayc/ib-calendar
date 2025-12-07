export interface Course {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  grade: 'DP1' | 'DP2'; // For filtering by grade level
  prioritized?: boolean;
}

export interface Event {
  id: string;
  title: string;
  courseId: string;
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
  recurrenceGroupId?: string; // Group ID to identify all events in the same recurring series
}

// Legacy type alias for backwards compatibility during migration
export type Club = Course;

export interface CalendarDay {
  date: Date;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
}