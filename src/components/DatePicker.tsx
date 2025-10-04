'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  theme?: 'light' | 'dark';
  className?: string;
}

export function DatePicker({ date, onDateChange, theme = 'light', className }: DatePickerProps) {
  const isLight = theme === 'light';
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${
            !date && 'text-muted-foreground'
          } ${className} ${
            isLight
              ? 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
              : 'bg-[#1a1c1e] border-[#2a2c2e] text-gray-200 hover:bg-[#1f2225]'
          }`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-auto p-0 ${isLight ? 'bg-white' : 'bg-[#1a1c1e] border-[#2a2c2e]'}`}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className={isLight ? '' : 'text-gray-200'}
        />
      </PopoverContent>
    </Popover>
  );
}
