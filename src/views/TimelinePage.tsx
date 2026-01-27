import React, { useState, useCallback, useMemo } from 'react';
import { useEntries, useTags } from '@/hooks';
import { EntryList } from '@/components/entry';
import { Mood, MOOD_OPTIONS } from '@/types';
import { stripHtml } from '@/utils/markdown';

const TimelinePage: React.FC = () => {
  const { entries, isLoading, remove } = useEntries();
  const { tags: allTags } = useTags();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove]
  );

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Text search - simple content filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => {
        const plainContent = stripHtml(e.content).toLowerCase();
        return plainContent.includes(query) ||
          e.tags.some(t => t.toLowerCase().includes(query));
      });
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter(e =>
        selectedTags.every(tag => e.tags.includes(tag))
      );
    }

    // Mood filter
    if (selectedMood) {
      result = result.filter(e => e.mood === selectedMood);
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(e => new Date(e.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(e => new Date(e.createdAt) <= to);
    }

    return result;
  }, [entries, searchQuery, selectedTags, selectedMood, dateFrom, dateTo]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedMood('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedMood || dateFrom || dateTo;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Timeline
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
              {hasActiveFilters && entries.length !== filteredEntries.length && ` (filtered from ${entries.length})`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
            {/* Tags filter */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mood filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedMood === mood.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {mood.emoji} {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range filter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Entry list - no pagination, grouped by date */}
      <EntryList
        entries={filteredEntries}
        isLoading={isLoading}
        onDelete={handleDelete}
        groupByDate={true}
        emptyMessage={hasActiveFilters ? 'No entries match your filters.' : 'No entries yet. Start writing!'}
      />
    </div>
  );
};

export default TimelinePage;
