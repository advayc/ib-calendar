'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type ViewType = 'day' | 'week' | 'month';

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  theme?: 'light' | 'dark';
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange, theme = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = theme === 'light';

  const views: { value: ViewType; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  const currentLabel = views.find(v => v.value === currentView)?.label || 'Month';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors border ${
          isLight
            ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
            : 'bg-[#1E1E1E] border-[#2A2A2A] text-gray-200 hover:bg-[#252525]'
        }`}
      >
        {currentLabel}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-1 right-0 w-32 rounded-lg shadow-lg border overflow-hidden z-50 ${
            isLight
              ? 'bg-white border-gray-200'
              : 'bg-[#1a1c1e] border-[#2a2c2e]'
          }`}
        >
          {views.map(view => (
            <button
              key={view.value}
              onClick={() => {
                onViewChange(view.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                currentView === view.value
                  ? isLight
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'bg-blue-900/30 text-blue-400 font-medium'
                  : isLight
                    ? 'text-gray-700 hover:bg-gray-50'
                    : 'text-gray-300 hover:bg-[#2a2c2f]'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewSelector;
