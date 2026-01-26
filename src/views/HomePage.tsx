import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTodayEntries, useEntries } from '@/hooks';
import { EntryEditor } from '@/components/entry';
import { EntryList } from '@/components/entry';
import { Mood } from '@/types';
import { formatDate } from '@/utils/date';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { entries: todayEntries, isLoading, refresh } = useTodayEntries();
  const { create, remove } = useEntries();
  const [isEditing, setIsEditing] = useState(true); // Start with editor open for quick capture

  const handleSave = useCallback(
    async (content: string, tags: string[], mood?: Mood) => {
      const entry = await create(content, tags, mood);
      refresh();
      navigate(`/entry/${entry.id}`);
    },
    [create, refresh, navigate]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
      refresh();
    },
    [remove, refresh]
  );

  const today = new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Today
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {formatDate(today)}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </button>
        )}
      </div>

      {/* Editor - always visible by default for quick capture */}
      {isEditing && (
        <EntryEditor
          onSave={handleSave}
          onCancel={todayEntries.length > 0 ? () => setIsEditing(false) : undefined}
          autoSaveEnabled={false}
          placeholder="What's happening?"
        />
      )}

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Today's Entries
          </h2>
          <EntryList
            entries={todayEntries}
            isLoading={isLoading}
            onDelete={handleDelete}
            groupByDate={false}
          />
        </section>
      )}
    </div>
  );
};

export default HomePage;
