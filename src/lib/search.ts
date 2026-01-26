import MiniSearch from 'minisearch';
import { Entry, SearchFilters, SearchResult } from '@/types';

interface SearchDocument {
  id: string;
  content: string;
  tags: string;
  createdAt: number;
  mood?: string;
}

class SearchService {
  private searchIndex: MiniSearch<SearchDocument>;
  private initialized = false;

  constructor() {
    this.searchIndex = new MiniSearch<SearchDocument>({
      fields: ['content', 'tags'],
      storeFields: ['id', 'content', 'tags', 'createdAt', 'mood'],
      searchOptions: {
        boost: { content: 2, tags: 1 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
  }

  private entryToDocument(entry: Entry): SearchDocument {
    return {
      id: entry.id!,
      content: entry.content,
      tags: entry.tags.join(' '),
      createdAt: entry.createdAt.getTime(),
      mood: entry.mood,
    };
  }

  indexEntry(entry: Entry): void {
    if (!entry.id) return;

    // Remove existing document if present
    if (this.searchIndex.has(entry.id)) {
      this.searchIndex.discard(entry.id);
    }

    this.searchIndex.add(this.entryToDocument(entry));
  }

  indexEntries(entries: Entry[]): void {
    // Clear and rebuild index
    this.searchIndex.removeAll();
    const documents = entries
      .filter((e) => e.id)
      .map((e) => this.entryToDocument(e));
    this.searchIndex.addAll(documents);
    this.initialized = true;
  }

  removeEntry(id: string): void {
    if (this.searchIndex.has(id)) {
      this.searchIndex.discard(id);
    }
  }

  search(filters: SearchFilters): SearchResult[] {
    const { query, tags, dateFrom, dateTo, mood } = filters;

    if (!query && tags.length === 0 && !dateFrom && !dateTo && !mood) {
      return [];
    }

    let results: SearchResult[];

    if (query) {
      const searchResults = this.searchIndex.search(query);
      results = searchResults.map((result) => ({
        id: result.id,
        content: result.content as string,
        tags: (result.tags as string).split(' ').filter(Boolean),
        createdAt: new Date(result.createdAt as number),
        score: result.score,
      }));
    } else {
      // If no query, get all documents
      const allDocs = this.searchIndex.search('', { prefix: true });
      results = allDocs.map((result) => ({
        id: result.id,
        content: result.content as string,
        tags: (result.tags as string).split(' ').filter(Boolean),
        createdAt: new Date(result.createdAt as number),
        score: 1,
      }));
    }

    // Apply filters
    if (tags.length > 0) {
      results = results.filter((result) =>
        tags.some((tag) => result.tags.includes(tag))
      );
    }

    if (dateFrom) {
      results = results.filter((result) => result.createdAt >= dateFrom);
    }

    if (dateTo) {
      results = results.filter((result) => result.createdAt <= dateTo);
    }

    if (mood) {
      // Need to re-check mood from original results
      const moodResults = this.searchIndex.search(query || '', { prefix: true });
      const moodMap = new Map<string, string | undefined>();
      moodResults.forEach((r) => moodMap.set(r.id, r.mood as string | undefined));
      results = results.filter((result) => moodMap.get(result.id) === mood);
    }

    return results;
  }

  autoComplete(query: string, limit = 5): string[] {
    if (!query) return [];

    const results = this.searchIndex.autoSuggest(query, { fuzzy: 0.2 });
    return results.slice(0, limit).map((r) => r.suggestion);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  clear(): void {
    this.searchIndex.removeAll();
    this.initialized = false;
  }
}

export const searchService = new SearchService();
