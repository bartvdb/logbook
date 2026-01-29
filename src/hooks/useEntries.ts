import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  getTodayEntries,
  getEntriesForMonth,
  getAllTags,
} from '@/lib/db';
import { dataService, getSyncStatus, onSyncStatusChange } from '@/lib/dataService';
import { searchService } from '@/lib/search';
import { Entry, EntryImage, SearchFilters, SearchResult } from '@/types';

export const useEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());

  // Listen for sync status changes
  useEffect(() => {
    return onSyncStatusChange(setSyncStatus);
  }, []);

  // Fetch entries from data service (cloud-first with local fallback)
  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const allEntries = await dataService.getAllEntries();
      setEntries(allEntries);
      searchService.indexEntries(allEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Also listen for local DB changes (for offline updates)
  const localEntries = useLiveQuery(() => db.entries.orderBy('createdAt').reverse().toArray(), []);
  useEffect(() => {
    if (localEntries && !navigator.onLine) {
      setEntries(localEntries);
      searchService.indexEntries(localEntries);
    }
  }, [localEntries]);

  const create = useCallback(
    async (content: string, tags: string[] = [], mood?: Entry['mood'], images?: EntryImage[]) => {
      const entry = await dataService.createEntry(content, tags, mood, images);
      searchService.indexEntry(entry);
      // Refresh the list
      await fetchEntries();
      return entry;
    },
    [fetchEntries]
  );

  const update = useCallback(
    async (id: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>) => {
      await dataService.updateEntry(id, updates);
      const updated = await dataService.getEntry(id);
      if (updated) {
        searchService.indexEntry(updated);
      }
      // Refresh the list
      await fetchEntries();
    },
    [fetchEntries]
  );

  const remove = useCallback(async (id: string) => {
    await dataService.deleteEntry(id);
    searchService.removeEntry(id);
    // Refresh the list
    await fetchEntries();
  }, [fetchEntries]);

  const get = useCallback(async (id: string) => {
    return dataService.getEntry(id);
  }, []);

  return {
    entries,
    isLoading,
    syncStatus,
    create,
    update,
    remove,
    get,
    refresh: fetchEntries,
  };
};

export const useTodayEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const todayEntries = await getTodayEntries();
    setEntries(todayEntries);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, isLoading, refresh };
};

export const useMonthEntries = (year: number, month: number) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      const monthEntries = await getEntriesForMonth(year, month);
      setEntries(monthEntries);
      setIsLoading(false);
    };
    fetchEntries();
  }, [year, month]);

  return { entries, isLoading };
};

export const useEntry = (id: string | undefined) => {
  const [entry, setEntry] = useState<Entry | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    if (!id) {
      setEntry(undefined);
      setIsLoading(false);
      return;
    }

    const fetchEntry = async () => {
      setIsLoading(true);
      try {
        const result = await dataService.getEntry(id);
        setEntry(result);
      } catch (error) {
        console.error('Error fetching entry:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  // Also listen for local changes
  const localEntry = useLiveQuery(
    () => (id ? db.entries.get(id) : undefined),
    [id]
  );

  useEffect(() => {
    if (localEntry && !navigator.onLine) {
      setEntry(localEntry);
    }
  }, [localEntry]);

  return {
    entry,
    isLoading,
  };
};

export const useTags = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const allTags = await getAllTags();
    setTags(allTags);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tags, isLoading, refresh };
};

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback((filters: SearchFilters) => {
    setIsSearching(true);
    try {
      const searchResults = searchService.search(filters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
  }, []);

  const autoComplete = useCallback((query: string) => {
    return searchService.autoComplete(query);
  }, []);

  return { results, isSearching, search, clear, autoComplete };
};

export const useAutoSave = (
  entryId: string | undefined,
  content: string,
  tags: string[],
  mood: Entry['mood'] | undefined,
  delay = 3000
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!entryId || !content.trim()) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      try {
        await dataService.updateEntry(entryId, { content, tags, mood });
        const updated = await dataService.getEntry(entryId);
        if (updated) {
          searchService.indexEntry(updated);
        }
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [entryId, content, tags, mood, delay]);

  return { isSaving, lastSaved };
};
