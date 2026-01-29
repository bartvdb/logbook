import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Cloud sync disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

// Database types matching Supabase schema
export interface DbEntryImage {
  id: string;
  dataUrl: string;
  createdAt: string;
}

export interface DbEntry {
  id: string;
  content: string;
  tags: string[];
  mood: string | null;
  ai_conversation: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  images?: DbEntryImage[];
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  name: string;
  role: string;
  industry: string;
  goals: string[];
  values: string[];
  focus_areas: string[];
  experience: string;
  updated_at: string;
}

export interface DbPreferences {
  id: string;
  mentor_tone: string;
  response_length: string;
  focus_areas: string[];
  question_frequency: string;
  frameworks: string[];
  custom_instructions: string;
  updated_at: string;
}

export interface DbSettings {
  id: string;
  theme: string;
  default_tags: string[];
  updated_at: string;
}
