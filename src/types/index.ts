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
}

export interface CalendarDay {
  date: Date;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
}