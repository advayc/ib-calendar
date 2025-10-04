import { Event, Club } from '@/types';
import { EventFilterState } from '@/components/EventFilters';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isWithinInterval, isBefore } from 'date-fns';

export function applyEventFilters(
  events: Event[],
  filters: EventFilterState,
  clubs: Club[]
): Event[] {
  let filtered = [...events];

  // Search text filter
  if (filters.searchText.trim()) {
    const searchLower = filters.searchText.trim().toLowerCase();
    filtered = filtered.filter(event => {
      const titleMatch = event.title.toLowerCase().includes(searchLower);
      const descMatch = event.description?.toLowerCase().includes(searchLower);
      const locMatch = event.location?.toLowerCase().includes(searchLower);
      return titleMatch || descMatch || locMatch;
    });
  }

  // Club filter
  if (filters.clubIds.length > 0) {
    filtered = filtered.filter(event => filters.clubIds.includes(event.clubId));
  }

  // Date range filter
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filters.dateRange) {
    case 'upcoming': {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return !isBefore(eventDate, today);
      });
      break;
    }
    case 'past': {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return isBefore(eventDate, today);
      });
      break;
    }
    case 'this-week': {
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
      });
      break;
    }
    case 'this-month': {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
      });
      break;
    }
    case 'next-30-days': {
      const thirtyDaysFromNow = addDays(today, 30);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, { start: today, end: thirtyDaysFromNow });
      });
      break;
    }
    case 'custom': {
      if (filters.customDateFrom && filters.customDateTo) {
        const from = new Date(filters.customDateFrom);
        const to = new Date(filters.customDateTo);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return isWithinInterval(eventDate, { start: from, end: to });
        });
      }
      break;
    }
  }

  // Event type filters
  const typeFiltered: Event[] = [];
  
  filtered.forEach(event => {
    const isAllDay = !event.time || event.time === '';
    const isRecurring = !!(event.recurrenceGroupId || event.recurrenceFrequency);
    
    // Check if event matches any enabled type
    let matches = false;
    
    if (isAllDay && filters.showAllDay) matches = true;
    if (isRecurring && filters.showRecurring) matches = true;
    if (!isRecurring && filters.showNonRecurring && !isAllDay) matches = true;
    if (!isRecurring && filters.showNonRecurring && isAllDay && filters.showAllDay) matches = true;
    
    if (matches) typeFiltered.push(event);
  });
  
  filtered = typeFiltered;

  // Sort
  const clubsMap = clubs.reduce((acc, club) => {
    acc[club.id] = club;
    return acc;
  }, {} as Record<string, Club>);

  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'club-asc': {
        const clubA = clubsMap[a.clubId]?.name || '';
        const clubB = clubsMap[b.clubId]?.name || '';
        return clubA.localeCompare(clubB);
      }
      default:
        return 0;
    }
  });

  return filtered;
}
