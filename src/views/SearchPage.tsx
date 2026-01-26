import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchBar } from '@/components/ui';
import { EntryList } from '@/components/entry';
import { useSearch, useEntries } from '@/hooks';
import { SearchFilters, Entry } from '@/types';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const { results, isSearching, search, clear } = useSearch();
  const { entries, remove } = useEntries();
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Entry[]>([]);

  // Handle initial filters from navigation state
  useEffect(() => {
    const state = location.state as { filters?: SearchFilters } | null;
    if (state?.filters) {
      handleSearch(state.filters);
    }
  }, [location.state]);

  // Convert search results to full entries
  useEffect(() => {
    if (results.length > 0) {
      const entryMap = new Map(entries.map((e) => [e.id, e]));
      const fullEntries = results
        .map((r) => entryMap.get(r.id))
        .filter((e): e is Entry => e !== undefined);
      setSearchResults(fullEntries);
    } else {
      setSearchResults([]);
    }
  }, [results, entries]);

  const handleSearch = useCallback(
    (filters: SearchFilters) => {
      search(filters);
      setHasSearched(true);
    },
    [search]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Search
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Find entries by keyword, tag, or date
        </p>
      </div>

      {/* Search bar with filters */}
      <SearchBar
        onSearch={handleSearch}
        showFilters={true}
        autoFocus={true}
        placeholder="Search entries..."
      />

      {/* Results */}
      <section>
        {hasSearched && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {isSearching
                ? 'Searching...'
                : `${searchResults.length} ${
                    searchResults.length === 1 ? 'result' : 'results'
                  }`}
            </h2>
            {searchResults.length > 0 && (
              <button
                onClick={() => {
                  clear();
                  setHasSearched(false);
                  setSearchResults([]);
                }}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {hasSearched ? (
          <EntryList
            entries={searchResults}
            isLoading={isSearching}
            onDelete={handleDelete}
            emptyMessage="No entries found matching your search."
            groupByDate={false}
          />
        ) : (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Start typing to search your entries
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              Tip: Use the filter button to narrow down by tags, mood, or date
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
