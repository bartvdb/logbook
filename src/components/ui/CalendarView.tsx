import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMonthEntries } from '@/hooks';
import {
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
} from '@/utils/date';
import { Entry } from '@/types';

interface CalendarViewProps {
  onDateSelect?: (date: Date, entries: Entry[]) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onDateSelect }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { entries, isLoading } = useMonthEntries(year, month);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach((entry) => {
      const dateKey = new Date(entry.createdAt).toDateString();
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, entry]);
    });
    return map;
  }, [entries]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    const dateKey = date.toDateString();
    const dayEntries = entriesByDate.get(dateKey) || [];

    if (onDateSelect) {
      onDateSelect(date, dayEntries);
    } else if (dayEntries.length === 1) {
      navigate(`/entry/${dayEntries[0].id}`);
    } else if (dayEntries.length > 1) {
      navigate('/timeline', { state: { filterDate: date } });
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [firstDayOfMonth, daysInMonth]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {getMonthName(month)} {year}
        </h2>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm font-medium text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const date = new Date(year, month, day);
            const dateKey = date.toDateString();
            const dayEntries = entriesByDate.get(dateKey) || [];
            const hasEntries = dayEntries.length > 0;
            const isTodayDate = isToday(date);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={isLoading}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg
                  transition-colors relative
                  ${isTodayDate
                    ? 'bg-blue-500 text-white font-semibold'
                    : hasEntries
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }
                `}
              >
                <span className="text-sm">{day}</span>
                {hasEntries && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEntries.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          isTodayDate ? 'bg-white/70' : 'bg-blue-500'
                        }`}
                      />
                    ))}
                    {dayEntries.length > 3 && (
                      <span className={`text-[8px] ${isTodayDate ? 'text-white/70' : 'text-blue-500'}`}>
                        +{dayEntries.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default CalendarView;
