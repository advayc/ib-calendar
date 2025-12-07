'use client';

import React from 'react';
import { Club } from '@/types';
import { Filter, X } from 'lucide-react';

export interface EventFilterState {
  searchText: string;
  clubIds: string[];
  dateRange: 'all' | 'upcoming' | 'past' | 'this-week' | 'this-month' | 'next-30-days' | 'custom';
  customDateFrom: string;
  customDateTo: string;
  showAllDay: boolean;
  showRecurring: boolean;
  showNonRecurring: boolean;
  sortBy: 'date-asc' | 'date-desc' | 'name-asc' | 'club-asc';
}

interface EventFiltersProps {
  filters: EventFilterState;
  clubs: Club[];
  onFilterChange: (filters: EventFilterState) => void;
  theme?: 'light' | 'dark';
  compact?: boolean;
}

const EventFilters: React.FC<EventFiltersProps> = ({ filters, clubs, onFilterChange, theme = 'light', compact = false }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  const isLight = theme === 'light';
  const fieldClass = `w-full px-2 py-1.5 rounded-md text-sm outline-none transition-colors ${
    isLight 
      ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
      : 'bg-[#1E1E1E] border border-[#2A2A2A] text-gray-200 placeholder-gray-500 focus:border-blue-400'
  }`;

  const updateFilter = (key: keyof EventFilterState, value: string | string[] | boolean) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.searchText.trim() !== '' ||
    filters.clubIds.length > 0 ||
    filters.dateRange !== 'all' ||
    filters.sortBy !== 'date-asc';

  const clearFilters = () => {
    onFilterChange({
      searchText: '',
      clubIds: [],
      dateRange: 'all',
      customDateFrom: '',
      customDateTo: '',
      showAllDay: true,
      showRecurring: true,
      showNonRecurring: true,
      sortBy: 'date-asc'
    });
  };

  const toggleClubFilter = (clubId: string) => {
    const newClubIds = filters.clubIds.includes(clubId)
      ? filters.clubIds.filter(id => id !== clubId)
      : [...filters.clubIds, clubId];
    updateFilter('clubIds', newClubIds);
  };

  return (
    <div className={`space-y-3 ${compact ? 'mb-3' : 'mb-4'}`}>
      {/* Always visible: Search and Club Filter */}
      <div className="space-y-3">
        {/* Search - Always visible */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Search Events
          </label>
          <input
            type="text"
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            placeholder="Search by title or location..."
            className={fieldClass}
            spellCheck={false}
          />
        </div>

        {/* Club Filter - Always visible */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Filter by Club
          </label>
          <div className={`max-h-32 overflow-y-auto rounded-md border p-2 space-y-1 ${
            isLight ? 'bg-white border-gray-300' : 'bg-[#1a1c1e] border-[#2a2c2e]'
          }`}>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-opacity-50 px-1 py-0.5 rounded">
              <input
                type="checkbox"
                checked={filters.clubIds.length === 0}
                onChange={() => updateFilter('clubIds', [])}
                className="rounded"
              />
              <span className={isLight ? 'text-gray-700' : 'text-gray-300'}>All Clubs</span>
            </label>
            {clubs.map(club => (
              <label key={club.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-opacity-50 px-1 py-0.5 rounded">
                <input
                  type="checkbox"
                  checked={filters.clubIds.includes(club.id)}
                  onChange={() => toggleClubFilter(club.id)}
                  className="rounded"
                />
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: club.color }}
                />
                <span className={`truncate ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{club.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Toggle button for additional filters */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isLight
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-[#1a1c1e] hover:bg-[#2a2c2f] text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            {expanded ? 'Hide Additional Filters' : 'Show More Filters'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                isLight
                  ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1c1e]'
              }`}
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Additional filters - shown only when expanded */}
      {expanded && (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg ${
          isLight ? 'bg-gray-50 border border-gray-200' : 'bg-[#0f1012] border border-[#1e2022]'
        }`}>
          {/* Date Range */}
          <div>
            <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className={fieldClass}
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="next-30-days">Next 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>From</label>
                  <input
                    type="date"
                    value={filters.customDateFrom}
                    onChange={(e) => updateFilter('customDateFrom', e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>To</label>
                  <input
                    type="date"
                    value={filters.customDateTo}
                    onChange={(e) => updateFilter('customDateTo', e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sort By */}
          <div>
            <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className={fieldClass}
            >
              <option value="date-asc">Date (Oldest First)</option>
              <option value="date-desc">Date (Newest First)</option>
              <option value="name-asc">Event Name (A-Z)</option>
              <option value="club-asc">Club Name (A-Z)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFilters;
