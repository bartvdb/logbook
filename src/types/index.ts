// Entry types
export type Mood = 'great' | 'good' | 'neutral' | 'low' | 'tough';

// Yoopta content format version for migration support
export type ContentVersion = 1 | 2; // 1 = legacy plain text/HTML, 2 = Yoopta JSON

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Entry {
  id?: string;
  content: string; // For v1: plain text/HTML, For v2: JSON stringified Yoopta content
  contentVersion?: ContentVersion; // undefined or 1 = legacy, 2 = Yoopta JSON
  tags: string[];
  mood?: Mood;
  createdAt: Date;
  updatedAt: Date;
  aiConversation: AIMessage[];
}

// Profile types
export interface Profile {
  id: 'user-profile';
  name: string;
  role: string;
  industry: string;
  goals: string[];
  values: string[];
  focusAreas: string[];
  experience: string;
  updatedAt: Date;
}

// Preferences types
export type MentorTone = 'supportive' | 'challenging' | 'balanced' | 'direct' | 'gentle';
export type ResponseLength = 'concise' | 'moderate' | 'detailed';
export type QuestionFrequency = 'high' | 'moderate' | 'low';

export interface Preferences {
  id: 'user-preferences';
  mentorTone: MentorTone;
  responseLength: ResponseLength;
  focusAreas: string[];
  questionFrequency: QuestionFrequency;
  frameworks: string[];
  customInstructions: string;
  updatedAt: Date;
}

// AI Queue types
export interface AIQueueItem {
  id?: string;
  entryId: string;
  prompt: string;
  context: string;
  createdAt: Date;
  processed: boolean;
}

// Settings types
export type Theme = 'light' | 'dark' | 'auto';

export interface Settings {
  id: 'app-settings';
  theme: Theme;
  defaultTags: string[];
  updatedAt: Date;
}

// Search types
export interface SearchResult {
  id: string;
  content: string;
  tags: string[];
  createdAt: Date;
  score: number;
}

export interface SearchFilters {
  query: string;
  tags: string[];
  dateFrom?: Date;
  dateTo?: Date;
  mood?: Mood;
}

// UI types
export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Export types
export type ExportFormat = 'markdown' | 'json';

export interface ExportData {
  entries: Entry[];
  profile: Profile | undefined;
  preferences: Preferences | undefined;
  settings: Settings | undefined;
  exportedAt: Date;
}

// Default values
export const DEFAULT_PROFILE: Profile = {
  id: 'user-profile',
  name: '',
  role: '',
  industry: '',
  goals: [],
  values: [],
  focusAreas: [],
  experience: '',
  updatedAt: new Date(),
};

export const DEFAULT_PREFERENCES: Preferences = {
  id: 'user-preferences',
  mentorTone: 'balanced',
  responseLength: 'moderate',
  focusAreas: [],
  questionFrequency: 'moderate',
  frameworks: [],
  customInstructions: '',
  updatedAt: new Date(),
};

export const DEFAULT_SETTINGS: Settings = {
  id: 'app-settings',
  theme: 'auto',
  defaultTags: [],
  updatedAt: new Date(),
};

// Constants
export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'low', label: 'Low', emoji: '😕' },
  { value: 'tough', label: 'Tough', emoji: '😔' },
];

export const MENTOR_TONE_OPTIONS: { value: MentorTone; label: string; description: string }[] = [
  { value: 'supportive', label: 'Supportive', description: 'Encouraging and empathetic' },
  { value: 'challenging', label: 'Challenging', description: 'Pushes you to think deeper' },
  { value: 'balanced', label: 'Balanced', description: 'Mix of support and challenge' },
  { value: 'direct', label: 'Direct', description: 'Straightforward and to the point' },
  { value: 'gentle', label: 'Gentle', description: 'Soft and considerate approach' },
];

export const RESPONSE_LENGTH_OPTIONS: { value: ResponseLength; label: string }[] = [
  { value: 'concise', label: 'Concise' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'detailed', label: 'Detailed' },
];

export const QUESTION_FREQUENCY_OPTIONS: { value: QuestionFrequency; label: string }[] = [
  { value: 'high', label: 'High (Ask often)' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'low', label: 'Low (Rarely ask)' },
];

export const FOCUS_AREA_OPTIONS: string[] = [
  'strategy',
  'execution',
  'people',
  'personal-growth',
  'leadership',
  'creativity',
  'productivity',
  'work-life-balance',
  'communication',
  'decision-making',
];

export const FRAMEWORK_OPTIONS: string[] = [
  'Jobs-to-be-Done',
  'First Principles',
  'SWOT Analysis',
  'OKRs',
  'Eisenhower Matrix',
  'Six Thinking Hats',
  'Pareto Principle',
  'Design Thinking',
  'Stoic Philosophy',
  'Growth Mindset',
];
