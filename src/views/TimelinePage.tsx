import React, { useCallback } from 'react';
import { useEntries } from '@/hooks';
import { EntryList } from '@/components/entry';

const TimelinePage: React.FC = () => {
  const { entries, isLoading, remove } = useEntries();

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Timeline
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      </div>

      {/* Entry list */}
      <EntryList
        entries={entries}
        isLoading={isLoading}
        onDelete={handleDelete}
        groupByDate={true}
      />
    </div>
  );
};

export default TimelinePage;
