import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '@/hooks';
import { Entry } from '@/types';
import { stripHtml } from '@/utils/markdown';
import { formatDate } from '@/utils/date';

const EntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { entries, isLoading, remove } = useEntries();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm('Delete this entry?')) {
        await remove(id);
      }
    },
    [remove]
  );

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(e => {
      const plainContent = stripHtml(e.content).toLowerCase();
      return plainContent.includes(query) ||
        e.tags.some(t => t.toLowerCase().includes(query));
    });
  }, [entries, searchQuery]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: Entry[] } = {};
    filteredEntries.forEach(entry => {
      const date = formatDate(entry.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return Object.entries(groups);
  }, [filteredEntries]);

  const getTitle = (content: string) => {
    const plain = stripHtml(content);
    const firstLine = plain.split('\n')[0];
    return firstLine.slice(0, 60) || 'Untitled';
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-6 w-24 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-20 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <h1 className="text-lg font-medium text-neutral-900 dark:text-white">
        Entries
      </h1>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="w-full py-2 bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 border-b border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
      />

      {/* Entry list */}
      {filteredEntries.length === 0 ? (
        <p className="text-neutral-400 dark:text-neutral-600 text-sm">
          {searchQuery ? 'No entries found.' : 'No entries yet.'}
        </p>
      ) : (
        <div className="space-y-10">
          {groupedEntries.map(([date, dateEntries]) => (
            <div key={date}>
              <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-4">
                {date}
              </p>
              <div className="space-y-1">
                {dateEntries.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => navigate(`/entry/${entry.id}`)}
                    className="group flex items-center justify-between py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 -mx-2 px-2 rounded transition-colors"
                  >
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                      {getTitle(entry.content)}
                    </span>
                    <button
                      onClick={(e) => entry.id && handleDelete(entry.id, e)}
                      className="text-neutral-300 dark:text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntriesPage;
