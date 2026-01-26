import { v4 as uuidv4 } from 'uuid';
import {
  Entry,
  Profile,
  Preferences,
  Settings,
  AIMessage,
  DEFAULT_PROFILE,
  DEFAULT_PREFERENCES,
  DEFAULT_SETTINGS,
} from '@/types';
import { cloudDb } from './cloudDb';
import { isSupabaseConfigured } from './supabase';
import {
  db,
  addToSyncQueue,
  getPendingSyncItems,
  removeSyncItem,
  SyncQueueItem,
} from './db';

// Check if we're online and Supabase is configured
const canUseCloud = (): boolean => {
  return navigator.onLine && isSupabaseConfigured();
};

// Sync status tracking
type SyncStatus = 'synced' | 'syncing' | 'pending' | 'offline' | 'error';
let currentSyncStatus: SyncStatus = 'synced';
const syncStatusListeners: ((status: SyncStatus) => void)[] = [];

export const getSyncStatus = (): SyncStatus => currentSyncStatus;

export const onSyncStatusChange = (callback: (status: SyncStatus) => void): (() => void) => {
  syncStatusListeners.push(callback);
  return () => {
    const index = syncStatusListeners.indexOf(callback);
    if (index > -1) syncStatusListeners.splice(index, 1);
  };
};

const setSyncStatus = (status: SyncStatus): void => {
  currentSyncStatus = status;
  syncStatusListeners.forEach(cb => cb(status));
};

// Process pending sync queue
export const processSyncQueue = async (): Promise<number> => {
  if (!canUseCloud()) return 0;

  const pendingItems = await getPendingSyncItems();
  if (pendingItems.length === 0) return 0;

  setSyncStatus('syncing');
  let processed = 0;

  for (const item of pendingItems) {
    try {
      await processSyncItem(item);
      await removeSyncItem(item.id!);
      processed++;
    } catch (error) {
      console.error('Failed to sync item:', item, error);
      // Keep in queue for retry
    }
  }

  const remaining = await getPendingSyncItems();
  setSyncStatus(remaining.length > 0 ? 'pending' : 'synced');

  return processed;
};

const processSyncItem = async (item: SyncQueueItem): Promise<void> => {
  switch (item.table) {
    case 'entries':
      await syncEntryOperation(item);
      break;
    case 'profile':
      await syncProfileOperation(item);
      break;
    case 'preferences':
      await syncPreferencesOperation(item);
      break;
    case 'settings':
      await syncSettingsOperation(item);
      break;
  }
};

const syncEntryOperation = async (item: SyncQueueItem): Promise<void> => {
  switch (item.operation) {
    case 'create': {
      const entry = await db.entries.get(item.recordId);
      if (entry) {
        await cloudDb.createEntry(entry);
      }
      break;
    }
    case 'update': {
      if (item.data) {
        await cloudDb.updateEntry(item.recordId, item.data as Partial<Entry>);
      }
      break;
    }
    case 'delete':
      await cloudDb.deleteEntry(item.recordId);
      break;
  }
};

const syncProfileOperation = async (item: SyncQueueItem): Promise<void> => {
  if (item.operation === 'update' && item.data) {
    await cloudDb.updateProfile(item.data as Partial<Profile>);
  }
};

const syncPreferencesOperation = async (item: SyncQueueItem): Promise<void> => {
  if (item.operation === 'update' && item.data) {
    await cloudDb.updatePreferences(item.data as Partial<Preferences>);
  }
};

const syncSettingsOperation = async (item: SyncQueueItem): Promise<void> => {
  if (item.operation === 'update' && item.data) {
    await cloudDb.updateSettings(item.data as Partial<Settings>);
  }
};

// Sync local cache from cloud
export const syncFromCloud = async (): Promise<void> => {
  if (!canUseCloud()) return;

  setSyncStatus('syncing');

  try {
    // Fetch all data from cloud
    const [cloudEntries, cloudProfile, cloudPrefs, cloudSettings] = await Promise.all([
      cloudDb.getAllEntries(),
      cloudDb.getProfile(),
      cloudDb.getPreferences(),
      cloudDb.getSettings(),
    ]);

    // Update local cache
    await db.transaction('rw', [db.entries, db.profile, db.preferences, db.settings], async () => {
      // Clear and replace entries
      await db.entries.clear();
      if (cloudEntries.length > 0) {
        await db.entries.bulkAdd(cloudEntries);
      }

      // Update profile
      if (cloudProfile) {
        await db.profile.put(cloudProfile);
      }

      // Update preferences
      if (cloudPrefs) {
        await db.preferences.put(cloudPrefs);
      }

      // Update settings
      if (cloudSettings) {
        await db.settings.put(cloudSettings);
      }
    });

    setSyncStatus('synced');
  } catch (error) {
    console.error('Failed to sync from cloud:', error);
    setSyncStatus('error');
    throw error;
  }
};

// Data Service - unified interface for all data operations
export const dataService = {
  // Entry operations
  async createEntry(content: string, tags: string[] = [], mood?: Entry['mood']): Promise<Entry> {
    const entry: Entry = {
      id: uuidv4(),
      content,
      tags,
      mood,
      createdAt: new Date(),
      updatedAt: new Date(),
      aiConversation: [],
    };

    // Always save to local first
    await db.entries.add(entry);

    if (canUseCloud()) {
      try {
        await cloudDb.createEntry(entry);
      } catch (error) {
        console.error('Failed to create in cloud, queued for sync:', error);
        await addToSyncQueue('create', 'entries', entry.id!);
        setSyncStatus('pending');
      }
    } else {
      await addToSyncQueue('create', 'entries', entry.id!);
      setSyncStatus('pending');
    }

    return entry;
  },

  async updateEntry(id: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>): Promise<void> {
    const updateData = { ...updates, updatedAt: new Date() };

    // Update local
    await db.entries.update(id, updateData);

    if (canUseCloud()) {
      try {
        await cloudDb.updateEntry(id, updateData);
      } catch (error) {
        console.error('Failed to update in cloud, queued for sync:', error);
        await addToSyncQueue('update', 'entries', id, updateData as Record<string, unknown>);
        setSyncStatus('pending');
      }
    } else {
      await addToSyncQueue('update', 'entries', id, updateData as Record<string, unknown>);
      setSyncStatus('pending');
    }
  },

  async deleteEntry(id: string): Promise<void> {
    // Delete from local
    await db.entries.delete(id);

    if (canUseCloud()) {
      try {
        await cloudDb.deleteEntry(id);
      } catch (error) {
        console.error('Failed to delete from cloud, queued for sync:', error);
        await addToSyncQueue('delete', 'entries', id);
        setSyncStatus('pending');
      }
    } else {
      await addToSyncQueue('delete', 'entries', id);
      setSyncStatus('pending');
    }
  },

  async getEntry(id: string): Promise<Entry | undefined> {
    // Try cloud first if online
    if (canUseCloud()) {
      try {
        const cloudEntry = await cloudDb.getEntry(id);
        if (cloudEntry) {
          // Update local cache
          await db.entries.put(cloudEntry);
          return cloudEntry;
        }
      } catch (error) {
        console.error('Failed to get from cloud, using local:', error);
      }
    }

    // Fallback to local
    return db.entries.get(id);
  },

  async getAllEntries(): Promise<Entry[]> {
    // Try cloud first if online
    if (canUseCloud()) {
      try {
        const cloudEntries = await cloudDb.getAllEntries();
        // Update local cache
        await db.transaction('rw', db.entries, async () => {
          await db.entries.clear();
          if (cloudEntries.length > 0) {
            await db.entries.bulkAdd(cloudEntries);
          }
        });
        return cloudEntries;
      } catch (error) {
        console.error('Failed to get from cloud, using local:', error);
      }
    }

    // Fallback to local
    return db.entries.orderBy('createdAt').reverse().toArray();
  },

  async addAIMessageToEntry(entryId: string, message: AIMessage): Promise<void> {
    // Get current entry
    const entry = await db.entries.get(entryId);
    if (!entry) return;

    const conversation = [...entry.aiConversation, message];
    const updates = { aiConversation: conversation, updatedAt: new Date() };

    // Update local
    await db.entries.update(entryId, updates);

    if (canUseCloud()) {
      try {
        await cloudDb.addAIMessageToEntry(entryId, message);
      } catch (error) {
        console.error('Failed to add AI message in cloud, queued for sync:', error);
        await addToSyncQueue('update', 'entries', entryId, updates as Record<string, unknown>);
        setSyncStatus('pending');
      }
    } else {
      await addToSyncQueue('update', 'entries', entryId, updates as Record<string, unknown>);
      setSyncStatus('pending');
    }
  },

  // Profile operations
  async getProfile(): Promise<Profile> {
    if (canUseCloud()) {
      try {
        const cloudProfile = await cloudDb.getProfile();
        if (cloudProfile) {
          await db.profile.put(cloudProfile);
          return cloudProfile;
        }
      } catch (error) {
        console.error('Failed to get profile from cloud, using local:', error);
      }
    }

    const profile = await db.profile.get('user-profile');
    return profile || DEFAULT_PROFILE;
  },

  async updateProfile(updates: Partial<Omit<Profile, 'id'>>): Promise<void> {
    const updateData = { ...updates, updatedAt: new Date() };

    // Update local
    const existing = await db.profile.get('user-profile');
    if (existing) {
      await db.profile.update('user-profile', updateData);
    } else {
      await db.profile.add({
        ...DEFAULT_PROFILE,
        ...updateData,
        id: 'user-profile',
      });
    }

    if (canUseCloud()) {
      try {
        await cloudDb.updateProfile(updateData);
      } catch (error) {
        console.error('Failed to update profile in cloud, queued for sync:', error);
        await addToSyncQueue('update', 'profile', 'user-profile', updateData as Record<string, unknown>);
        setSyncStatus('pending');
      }
    } else {
      await addToSyncQueue('update', 'profile', 'user-profile', updateData as Record<string, unknown>);
      setSyncStatus('pending');
    }
  },

  // Preferences operations
  async getPreferences(): Promise<Preferences> {
    if (canUseCloud()) {
      try {
        const cloudPrefs = await cloudDb.getPreferences();
        if (cloudPrefs) {
          await db.preferences.put(cloudPrefs);
          return cloudPrefs;
        }
      } catch (error) {
        console.error('Failed to get preferences from cloud, using local:', error);
      }
    }

    const preferences = await db.preferences.get('user-preferences');
    return preferences || DEFAULT_PREFERENCES;
  },

  async updatePreferences(updates: Partial<Omit<Preferences, 'id'>>): Promise<void> {
    const updateData = { ...updates, updatedAt: new Date() };

    // Update local
    const existing = await db.preferences.get('user-preferences');
    if (existing) {
      await db.preferences.update('user-preferences', updateData);
    } else {
      await db.preferences.add({
        ...DEFAULT_PREFERENCES,
        ...updateData,
        id: 'user-preferences',
      });
    }

    if (canUseCloud()) {
      try {
        await cloudDb.updatePreferences(updateData);
      } catch (error) {
        console.error('Failed to update preferences in cloud, queued for sync:', error);
        await addToSyncQueue('update', 'preferences', 'user-preferences', updateData as Record<string, unknown>);
        setSyncStatus('pending');
      }
    } else {
      await addToSyncQueue('update', 'preferences', 'user-preferences', updateData as Record<string, unknown>);
      setSyncStatus('pending');
    }
  },

  // Settings operations
  async getSettings(): Promise<Settings> {
    if (canUseCloud()) {
      try {
        const cloudSettings = await cloudDb.getSettings();
        if (cloudSettings) {
          await db.settings.put(cloudSettings);
          return cloudSettings;
        }
      } catch (error) {
        console.error('Failed to get settings from cloud, using local:', error);
      }
    }

    const settings = await db.settings.get('app-settings');
    return settings || DEFAULT_SETTINGS;
  },

  async updateSettings(updates: Partial<Omit<Settings, 'id'>>): Promise<void> {
    const updateData = { ...updates, updatedAt: new Date() };

    // Update local
    const existing = await db.settings.get('app-settings');
    if (existing) {
      await db.settings.update('app-settings', updateData);
    } else {
      await db.settings.add({
        ...DEFAULT_SETTINGS,
        ...updateData,
        id: 'app-settings',
      });
    }

    if (canUseCloud()) {
      try {
        await cloudDb.updateSettings(updateData);
      } catch (error) {
        console.error('Failed to update settings in cloud, queued for sync:', error);
        await addToSyncQueue('update', 'settings', 'app-settings', updateData as Record<string, unknown>);
        setSyncStatus('pending');
      }
    } else {
      await addToSyncQueue('update', 'settings', 'app-settings', updateData as Record<string, unknown>);
      setSyncStatus('pending');
    }
  },
};
