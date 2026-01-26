import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  createEntry,
  updateEntry,
  deleteEntry,
  getEntry,
  getAllEntries,
  getTodayEntries,
  getEntriesForMonth,
  getAllTags,
} from '@/lib/db';
import { searchService } from '@/lib/search';
import { Entry, SearchFilters, SearchResult } from '@/types';

export const useEntries = () => {
  const entries = useLiveQuery(() => getAllEntries(), []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (entries !== undefined) {
      setIsLoading(false);
      // Index entries for search
      searchService.indexEntries(entries);
    }
  }, [entries]);

  const create = useCallback(
    async (content: string, tags: string[] = [], mood?: Entry['mood']) => {
      const entry = await createEntry(content, tags, mood);
      searchService.indexEntry(entry);
      return entry;
    },
    []
  );

  const update = useCallback(
    async (id: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>) => {
      await updateEntry(id, updates);
      const updated = await getEntry(id);
      if (updated) {
        searchService.indexEntry(updated);
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    await deleteEntry(id);
    searchService.removeEntry(id);
  }, []);

  const get = useCallback(async (id: string) => {
    return getEntry(id);
  }, []);

  return {
    entries: entries || [],
    isLoading,
    create,
    update,
    remove,
    get,
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
  const entry = useLiveQuery(
    () => (id ? db.entries.get(id) : undefined),
    [id]
  );

  return {
    entry,
    isLoading: entry === undefined && !!id,
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
        await updateEntry(entryId, { content, tags, mood });
        const updated = await getEntry(entryId);
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
