import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '@/hooks';
import { Entry } from '@/types';
import { stripHtml } from '@/utils/markdown';
import { formatDate } from '@/utils/date';
import { SwipeToDelete } from '@/components/ui';
import { yooptaContentToText, isYooptaContent } from '@/components/editor';

const EntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { entries, isLoading, remove } = useEntries();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = useCallback(
    async (id: string, e?: React.MouseEvent, skipConfirm = false) => {
      if (e) e.stopPropagation();
      if (skipConfirm || window.confirm('Delete this entry?')) {
        await remove(id);
      }
    },
    [remove]
  );

  const getPlainText = useCallback((content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (isYooptaContent(parsed)) {
        return yooptaContentToText(parsed);
      }
    } catch {
      // Not valid JSON
    }
    return stripHtml(content);
  }, []);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(e => {
      const plainContent = getPlainText(e.content).toLowerCase();
      return plainContent.includes(query) ||
        e.tags.some(t => t.toLowerCase().includes(query));
    });
  }, [entries, searchQuery, getPlainText]);

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
    let plainText = '';

    // Try to parse as Yoopta JSON first
    try {
      const parsed = JSON.parse(content);
      if (isYooptaContent(parsed)) {
        plainText = yooptaContentToText(parsed);
      } else {
        plainText = stripHtml(content);
      }
    } catch {
      // Not valid JSON, treat as legacy plain text/HTML
      plainText = stripHtml(content);
    }

    const firstLine = plainText.split('\n').filter(l => l.trim())[0];
    return firstLine?.slice(0, 60) || 'Untitled';
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
      <div className="relative">
        <svg
          className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="w-full py-2 pl-6 bg-transparent text-base text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
        />
      </div>

      {/* Entry list */}
      {filteredEntries.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-300 text-base">
          {searchQuery ? 'No entries found.' : 'No entries yet.'}
        </p>
      ) : (
        <div className="space-y-10">
          {groupedEntries.map(([date, dateEntries]) => (
            <div key={date}>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                {date}
              </p>
              <div className="space-y-1 -mx-2">
                {dateEntries.map(entry => (
                  <SwipeToDelete
                    key={entry.id}
                    onDelete={() => entry.id && handleDelete(entry.id, undefined, true)}
                  >
                    <div
                      onClick={() => navigate(`/entry/${entry.id}`)}
                      className="group flex items-center justify-between py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 px-2 rounded transition-colors"
                    >
                      <span className="text-base text-neutral-800 dark:text-neutral-200 truncate">
                        {getTitle(entry.content)}
                      </span>
                      <button
                        onClick={(e) => entry.id && handleDelete(entry.id, e)}
                        className="text-neutral-300 dark:text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hidden lg:block"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </SwipeToDelete>
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
