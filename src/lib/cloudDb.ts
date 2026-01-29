import { supabase, isSupabaseConfigured, DbEntry, DbEntryImage, DbProfile, DbPreferences, DbSettings } from './supabase';
import { Entry, EntryImage, Profile, Preferences, Settings, AIMessage, Mood } from '@/types';

// Convert images from app to DB format
const imagesToDb = (images?: EntryImage[]): DbEntryImage[] | undefined => {
  if (!images || images.length === 0) return undefined;
  return images.map(img => ({
    id: img.id,
    dataUrl: img.dataUrl,
    createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : img.createdAt,
  }));
};

// Convert images from DB to app format
const dbToImages = (images?: DbEntryImage[]): EntryImage[] => {
  if (!images || images.length === 0) return [];
  return images.map(img => ({
    id: img.id,
    dataUrl: img.dataUrl,
    createdAt: new Date(img.createdAt),
  }));
};

// Convert from app types (camelCase) to database types (snake_case)
const entryToDb = (entry: Entry): Omit<DbEntry, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string } => ({
  id: entry.id!,
  content: entry.content,
  tags: entry.tags,
  mood: entry.mood || null,
  ai_conversation: entry.aiConversation.map(msg => ({
    ...msg,
    timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
  })),
  images: imagesToDb(entry.images),
  created_at: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : undefined,
  updated_at: entry.updatedAt instanceof Date ? entry.updatedAt.toISOString() : undefined,
});

// Convert from database types (snake_case) to app types (camelCase)
const dbToEntry = (dbEntry: DbEntry): Entry => ({
  id: dbEntry.id,
  content: dbEntry.content,
  tags: dbEntry.tags || [],
  mood: dbEntry.mood as Mood | undefined,
  aiConversation: (dbEntry.ai_conversation || []).map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
  })),
  images: dbToImages(dbEntry.images),
  createdAt: new Date(dbEntry.created_at),
  updatedAt: new Date(dbEntry.updated_at),
});

const profileToDb = (profile: Partial<Profile>): Partial<DbProfile> => ({
  id: profile.id,
  name: profile.name,
  role: profile.role,
  industry: profile.industry,
  goals: profile.goals,
  values: profile.values,
  focus_areas: profile.focusAreas,
  experience: profile.experience,
  updated_at: profile.updatedAt instanceof Date ? profile.updatedAt.toISOString() : undefined,
});

const dbToProfile = (dbProfile: DbProfile): Profile => ({
  id: dbProfile.id as 'user-profile',
  name: dbProfile.name || '',
  role: dbProfile.role || '',
  industry: dbProfile.industry || '',
  goals: dbProfile.goals || [],
  values: dbProfile.values || [],
  focusAreas: dbProfile.focus_areas || [],
  experience: dbProfile.experience || '',
  updatedAt: new Date(dbProfile.updated_at),
});

const preferencesToDb = (prefs: Partial<Preferences>): Partial<DbPreferences> => ({
  id: prefs.id,
  mentor_tone: prefs.mentorTone,
  response_length: prefs.responseLength,
  focus_areas: prefs.focusAreas,
  question_frequency: prefs.questionFrequency,
  frameworks: prefs.frameworks,
  custom_instructions: prefs.customInstructions,
  updated_at: prefs.updatedAt instanceof Date ? prefs.updatedAt.toISOString() : undefined,
});

const dbToPreferences = (dbPrefs: DbPreferences): Preferences => ({
  id: dbPrefs.id as 'user-preferences',
  mentorTone: (dbPrefs.mentor_tone || 'balanced') as Preferences['mentorTone'],
  responseLength: (dbPrefs.response_length || 'moderate') as Preferences['responseLength'],
  focusAreas: dbPrefs.focus_areas || [],
  questionFrequency: (dbPrefs.question_frequency || 'moderate') as Preferences['questionFrequency'],
  frameworks: dbPrefs.frameworks || [],
  customInstructions: dbPrefs.custom_instructions || '',
  updatedAt: new Date(dbPrefs.updated_at),
});

const settingsToDb = (settings: Partial<Settings>): Partial<DbSettings> => ({
  id: settings.id,
  theme: settings.theme,
  default_tags: settings.defaultTags,
  updated_at: settings.updatedAt instanceof Date ? settings.updatedAt.toISOString() : undefined,
});

const dbToSettings = (dbSettings: DbSettings): Settings => ({
  id: dbSettings.id as 'app-settings',
  theme: (dbSettings.theme || 'auto') as Settings['theme'],
  defaultTags: dbSettings.default_tags || [],
  updatedAt: new Date(dbSettings.updated_at),
});

// Cloud Database Operations
export const cloudDb = {
  // Entries
  async createEntry(entry: Entry): Promise<Entry | null> {
    if (!supabase || !isSupabaseConfigured()) return null;

    const dbEntry = entryToDb(entry);
    const { data, error } = await supabase
      .from('entries')
      .insert({
        id: dbEntry.id,
        content: dbEntry.content,
        tags: dbEntry.tags,
        mood: dbEntry.mood,
        ai_conversation: dbEntry.ai_conversation,
        images: dbEntry.images,
      })
      .select()
      .single();

    if (error) {
      console.error('Cloud createEntry error:', error);
      throw error;
    }

    return data ? dbToEntry(data as DbEntry) : null;
  },

  async getEntry(id: string): Promise<Entry | null> {
    if (!supabase || !isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Cloud getEntry error:', error);
      throw error;
    }

    return data ? dbToEntry(data as DbEntry) : null;
  },

  async getAllEntries(): Promise<Entry[]> {
    if (!supabase || !isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Cloud getAllEntries error:', error);
      throw error;
    }

    return (data || []).map(d => dbToEntry(d as DbEntry));
  },

  async updateEntry(id: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>): Promise<void> {
    if (!supabase || !isSupabaseConfigured()) return;

    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
    if (updates.aiConversation !== undefined) {
      dbUpdates.ai_conversation = updates.aiConversation.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
      }));
    }
    if (updates.images !== undefined) {
      dbUpdates.images = imagesToDb(updates.images);
    }

    const { error } = await supabase
      .from('entries')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Cloud updateEntry error:', error);
      throw error;
    }
  },

  async deleteEntry(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured()) return;

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Cloud deleteEntry error:', error);
      throw error;
    }
  },

  async addAIMessageToEntry(entryId: string, message: AIMessage): Promise<void> {
    if (!supabase || !isSupabaseConfigured()) return;

    // First get current conversation
    const { data: entry, error: fetchError } = await supabase
      .from('entries')
      .select('ai_conversation')
      .eq('id', entryId)
      .single();

    if (fetchError) {
      console.error('Cloud addAIMessageToEntry fetch error:', fetchError);
      throw fetchError;
    }

    const currentConversation = (entry as { ai_conversation: DbEntry['ai_conversation'] })?.ai_conversation || [];
    const newMessage = {
      ...message,
      timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : message.timestamp,
    };

    const { error } = await supabase
      .from('entries')
      .update({
        ai_conversation: [...currentConversation, newMessage],
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    if (error) {
      console.error('Cloud addAIMessageToEntry error:', error);
      throw error;
    }
  },

  // Profile
  async getProfile(): Promise<Profile | null> {
    if (!supabase || !isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', 'user-profile')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Cloud getProfile error:', error);
      throw error;
    }

    return data ? dbToProfile(data as DbProfile) : null;
  },

  async updateProfile(updates: Partial<Omit<Profile, 'id'>>): Promise<void> {
    if (!supabase || !isSupabaseConfigured()) return;

    const dbUpdates = profileToDb({ ...updates, updatedAt: new Date() });
    delete dbUpdates.id;

    const { error } = await supabase
      .from('profile')
      .upsert({
        id: 'user-profile',
        ...dbUpdates,
      });

    if (error) {
      console.error('Cloud updateProfile error:', error);
      throw error;
    }
  },

  // Preferences
  async getPreferences(): Promise<Preferences | null> {
    if (!supabase || !isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('id', 'user-preferences')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Cloud getPreferences error:', error);
      throw error;
    }

    return data ? dbToPreferences(data as DbPreferences) : null;
  },

  async updatePreferences(updates: Partial<Omit<Preferences, 'id'>>): Promise<void> {
    if (!supabase || !isSupabaseConfigured()) return;

    const dbUpdates = preferencesToDb({ ...updates, updatedAt: new Date() });
    delete dbUpdates.id;

    const { error } = await supabase
      .from('preferences')
      .upsert({
        id: 'user-preferences',
        ...dbUpdates,
      });

    if (error) {
      console.error('Cloud updatePreferences error:', error);
      throw error;
    }
  },

  // Settings
  async getSettings(): Promise<Settings | null> {
    if (!supabase || !isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'app-settings')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Cloud getSettings error:', error);
      throw error;
    }

    return data ? dbToSettings(data as DbSettings) : null;
  },

  async updateSettings(updates: Partial<Omit<Settings, 'id'>>): Promise<void> {
    if (!supabase || !isSupabaseConfigured()) return;

    const dbUpdates = settingsToDb({ ...updates, updatedAt: new Date() });
    delete dbUpdates.id;

    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 'app-settings',
        ...dbUpdates,
      });

    if (error) {
      console.error('Cloud updateSettings error:', error);
      throw error;
    }
  },
};
