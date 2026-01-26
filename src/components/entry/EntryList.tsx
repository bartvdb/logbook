import React, { useMemo } from 'react';
import { Entry } from '@/types';
import { EntryCard, EntryCardSkeleton } from './EntryCard';
import { formatDate, isToday, isYesterday, isSameDay } from '@/utils/date';

interface EntryListProps {
  entries: Entry[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  groupByDate?: boolean;
}

interface GroupedEntries {
  label: string;
  date: Date;
  entries: Entry[];
}

export const EntryList: React.FC<EntryListProps> = ({
  entries,
  isLoading = false,
  onDelete,
  emptyMessage = 'No entries yet. Start writing!',
  groupByDate = true,
}) => {
  const groupedEntries = useMemo(() => {
    if (!groupByDate) return null;

    const groups: GroupedEntries[] = [];
    let currentGroup: GroupedEntries | null = null;

    entries.forEach((entry) => {
      const entryDate = new Date(entry.createdAt);

      if (!currentGroup || !isSameDay(currentGroup.date, entryDate)) {
        let label: string;
        if (isToday(entryDate)) {
          label = 'Today';
        } else if (isYesterday(entryDate)) {
          label = 'Yesterday';
        } else {
          label = formatDate(entryDate);
        }

        currentGroup = {
          label,
          date: entryDate,
          entries: [],
        };
        groups.push(currentGroup);
      }

      currentGroup.entries.push(entry);
    });

    return groups;
  }, [entries, groupByDate]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <EntryCardSkeleton count={3} />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  if (groupByDate && groupedEntries) {
    return (
      <div className="space-y-6">
        {groupedEntries.map((group) => (
          <section key={group.label}>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 sticky top-0 bg-slate-50 dark:bg-slate-900 py-2 z-10">
              {group.label}
            </h2>
            <div className="space-y-3">
              {group.entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onDelete={onDelete} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default EntryList;
