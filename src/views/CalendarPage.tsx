import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarView } from '@/components/ui';
import { Entry } from '@/types';
import { formatDate } from '@/utils/date';
import { EntryCard } from '@/components/entry';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);

  const handleDateSelect = (date: Date, entries: Entry[]) => {
    if (entries.length === 1) {
      navigate(`/entry/${entries[0].id}`);
    } else {
      setSelectedDate(date);
      setSelectedEntries(entries);
    }
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
    setSelectedEntries([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Calendar
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Browse entries by date
        </p>
      </div>

      {/* Calendar */}
      <CalendarView onDateSelect={handleDateSelect} />

      {/* Selected date modal/drawer */}
      {selectedDate && selectedEntries.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleCloseModal}
          />
          <div className="relative min-h-full flex items-end justify-center p-4 sm:items-center">
            <div className="relative bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {formatDate(selectedDate)}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedEntries.length}{' '}
                    {selectedEntries.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Entries */}
              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
                {selectedEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
