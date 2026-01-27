import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import {
  Entry,
  Profile,
  Preferences,
  Settings,
  AIQueueItem,
  DEFAULT_PROFILE,
  DEFAULT_PREFERENCES,
  DEFAULT_SETTINGS,
} from '@/types';

// Sync queue item for offline operations
export interface SyncQueueItem {
  id?: string;
  operation: 'create' | 'update' | 'delete';
  table: 'entries' | 'profile' | 'preferences' | 'settings';
  recordId: string;
  data?: Record<string, unknown>;
  createdAt: Date;
  attempts: number;
}

export class LogbookDatabase extends Dexie {
  entries!: Table<Entry, string>;
  profile!: Table<Profile, string>;
  preferences!: Table<Preferences, string>;
  settings!: Table<Settings, string>;
  aiQueue!: Table<AIQueueItem, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('logbook-db');
    this.version(1).stores({
      entries: 'id, createdAt, updatedAt, *tags, mood',
      profile: 'id',
      preferences: 'id',
      settings: 'id',
      aiQueue: 'id, entryId, processed, createdAt',
    });
    // Add sync queue in version 2
    this.version(2).stores({
      entries: 'id, createdAt, updatedAt, *tags, mood',
      profile: 'id',
      preferences: 'id',
      settings: 'id',
      aiQueue: 'id, entryId, processed, createdAt',
      syncQueue: 'id, operation, table, recordId, createdAt',
    });
  }
}

export const db = new LogbookDatabase();

// Sync queue operations
export const addToSyncQueue = async (
  operation: SyncQueueItem['operation'],
  table: SyncQueueItem['table'],
  recordId: string,
  data?: Record<string, unknown>
): Promise<void> => {
  const item: SyncQueueItem = {
    id: uuidv4(),
    operation,
    table,
    recordId,
    data,
    createdAt: new Date(),
    attempts: 0,
  };
  await db.syncQueue.add(item);
};

export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  return db.syncQueue.orderBy('createdAt').toArray();
};

export const removeSyncItem = async (id: string): Promise<void> => {
  await db.syncQueue.delete(id);
};

export const incrementSyncAttempts = async (id: string): Promise<void> => {
  await db.syncQueue.update(id, { attempts: (await db.syncQueue.get(id))?.attempts || 0 + 1 });
};

export const clearSyncQueue = async (): Promise<void> => {
  await db.syncQueue.clear();
};

// Entry operations
export const createEntry = async (
  content: string,
  tags: string[] = [],
  mood?: Entry['mood'],
  contentVersion?: Entry['contentVersion']
): Promise<Entry> => {
  const entry: Entry = {
    id: uuidv4(),
    content,
    contentVersion: contentVersion || 2, // Default to Yoopta format for new entries
    tags,
    mood,
    createdAt: new Date(),
    updatedAt: new Date(),
    aiConversation: [],
  };
  await db.entries.add(entry);
  return entry;
};

export const updateEntry = async (
  id: string,
  updates: Partial<Omit<Entry, 'id' | 'createdAt'>>
): Promise<void> => {
  await db.entries.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const deleteEntry = async (id: string): Promise<void> => {
  await db.entries.delete(id);
};

export const getEntry = async (id: string): Promise<Entry | undefined> => {
  return db.entries.get(id);
};

export const getAllEntries = async (): Promise<Entry[]> => {
  return db.entries.orderBy('createdAt').reverse().toArray();
};

export const getEntriesByDateRange = async (
  from: Date,
  to: Date
): Promise<Entry[]> => {
  return db.entries
    .where('createdAt')
    .between(from, to, true, true)
    .reverse()
    .toArray();
};

export const getEntriesByTag = async (tag: string): Promise<Entry[]> => {
  return db.entries.where('tags').equals(tag).reverse().toArray();
};

export const getEntriesByMood = async (mood: Entry['mood']): Promise<Entry[]> => {
  return db.entries.where('mood').equals(mood!).reverse().toArray();
};

export const getAllTags = async (): Promise<string[]> => {
  const entries = await db.entries.toArray();
  const tagSet = new Set<string>();
  entries.forEach((entry) => entry.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
};

export const getTodayEntries = async (): Promise<Entry[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getEntriesByDateRange(today, tomorrow);
};

export const getEntriesForMonth = async (year: number, month: number): Promise<Entry[]> => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return getEntriesByDateRange(start, end);
};

// Profile operations
export const getProfile = async (): Promise<Profile> => {
  const profile = await db.profile.get('user-profile');
  return profile || DEFAULT_PROFILE;
};

export const updateProfile = async (
  updates: Partial<Omit<Profile, 'id'>>
): Promise<void> => {
  const existing = await db.profile.get('user-profile');
  if (existing) {
    await db.profile.update('user-profile', {
      ...updates,
      updatedAt: new Date(),
    });
  } else {
    await db.profile.add({
      ...DEFAULT_PROFILE,
      ...updates,
      id: 'user-profile',
      updatedAt: new Date(),
    });
  }
};

// Preferences operations
export const getPreferences = async (): Promise<Preferences> => {
  const preferences = await db.preferences.get('user-preferences');
  return preferences || DEFAULT_PREFERENCES;
};

export const updatePreferences = async (
  updates: Partial<Omit<Preferences, 'id'>>
): Promise<void> => {
  const existing = await db.preferences.get('user-preferences');
  if (existing) {
    await db.preferences.update('user-preferences', {
      ...updates,
      updatedAt: new Date(),
    });
  } else {
    await db.preferences.add({
      ...DEFAULT_PREFERENCES,
      ...updates,
      id: 'user-preferences',
      updatedAt: new Date(),
    });
  }
};

// Settings operations
export const getSettings = async (): Promise<Settings> => {
  const settings = await db.settings.get('app-settings');
  return settings || DEFAULT_SETTINGS;
};

export const updateSettings = async (
  updates: Partial<Omit<Settings, 'id'>>
): Promise<void> => {
  const existing = await db.settings.get('app-settings');
  if (existing) {
    await db.settings.update('app-settings', {
      ...updates,
      updatedAt: new Date(),
    });
  } else {
    await db.settings.add({
      ...DEFAULT_SETTINGS,
      ...updates,
      id: 'app-settings',
      updatedAt: new Date(),
    });
  }
};

// AI Queue operations
export const addToAIQueue = async (
  entryId: string,
  prompt: string,
  context: string
): Promise<AIQueueItem> => {
  const item: AIQueueItem = {
    id: uuidv4(),
    entryId,
    prompt,
    context,
    createdAt: new Date(),
    processed: false,
  };
  await db.aiQueue.add(item);
  return item;
};

export const getPendingAIRequests = async (): Promise<AIQueueItem[]> => {
  return db.aiQueue.where('processed').equals(0).toArray();
};

export const markAIRequestProcessed = async (id: string): Promise<void> => {
  await db.aiQueue.update(id, { processed: true });
};

export const deleteAIRequest = async (id: string): Promise<void> => {
  await db.aiQueue.delete(id);
};

// Add AI message to entry conversation
export const addAIMessageToEntry = async (
  entryId: string,
  message: Entry['aiConversation'][0]
): Promise<void> => {
  const entry = await db.entries.get(entryId);
  if (entry) {
    const conversation = [...entry.aiConversation, message];
    await db.entries.update(entryId, {
      aiConversation: conversation,
      updatedAt: new Date(),
    });
  }
};

// Export all data
export const exportAllData = async () => {
  const [entries, profile, preferences, settings] = await Promise.all([
    db.entries.toArray(),
    db.profile.get('user-profile'),
    db.preferences.get('user-preferences'),
    db.settings.get('app-settings'),
  ]);

  return {
    entries,
    profile,
    preferences,
    settings,
    exportedAt: new Date(),
  };
};

// Import data (for restore)
export const importData = async (data: {
  entries?: Entry[];
  profile?: Profile;
  preferences?: Preferences;
  settings?: Settings;
}): Promise<void> => {
  await db.transaction('rw', [db.entries, db.profile, db.preferences, db.settings], async () => {
    if (data.entries) {
      await db.entries.clear();
      await db.entries.bulkAdd(data.entries);
    }
    if (data.profile) {
      await db.profile.put(data.profile);
    }
    if (data.preferences) {
      await db.preferences.put(data.preferences);
    }
    if (data.settings) {
      await db.settings.put(data.settings);
    }
  });
};
