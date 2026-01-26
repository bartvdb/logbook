import React, { useState, useEffect } from 'react';
import { usePreferences } from '@/hooks';
import {
  Preferences,
  MENTOR_TONE_OPTIONS,
  RESPONSE_LENGTH_OPTIONS,
  QUESTION_FREQUENCY_OPTIONS,
  FOCUS_AREA_OPTIONS,
  FRAMEWORK_OPTIONS,
} from '@/types';

interface PreferencesFormProps {
  onSaved?: () => void;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSaved }) => {
  const { preferences, update, isLoading } = usePreferences();
  const [formData, setFormData] = useState<Omit<Preferences, 'id' | 'updatedAt'>>({
    mentorTone: 'balanced',
    responseLength: 'moderate',
    focusAreas: [],
    questionFrequency: 'moderate',
    frameworks: [],
    customInstructions: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        mentorTone: preferences.mentorTone || 'balanced',
        responseLength: preferences.responseLength || 'moderate',
        focusAreas: preferences.focusAreas || [],
        questionFrequency: preferences.questionFrequency || 'moderate',
        frameworks: preferences.frameworks || [],
        customInstructions: preferences.customInstructions || '',
      });
    }
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await update(formData);
      onSaved?.();
    } finally {
      setIsSaving(false);
    }
  };

  const toggleArrayItem = (field: 'focusAreas' | 'frameworks', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mentor Tone */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Mentor Tone
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          How should your AI mentor communicate with you?
        </p>
        <div className="space-y-2">
          {MENTOR_TONE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                formData.mentorTone === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="mentorTone"
                value={option.value}
                checked={formData.mentorTone === option.value}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mentorTone: e.target.value as Preferences['mentorTone'],
                  }))
                }
                className="mt-0.5"
              />
              <div>
                <span className="font-medium text-slate-900 dark:text-white">
                  {option.label}
                </span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Response Length */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Response Length
        </label>
        <div className="flex gap-2">
          {RESPONSE_LENGTH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, responseLength: option.value }))
              }
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.responseLength === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Frequency */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Question Frequency
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          How often should the mentor ask you questions?
        </p>
        <div className="flex gap-2">
          {QUESTION_FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, questionFrequency: option.value }))
              }
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.questionFrequency === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Areas */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Focus Areas
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Select areas you want the mentor to emphasize
        </p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREA_OPTIONS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleArrayItem('focusAreas', area)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                formData.focusAreas.includes(area)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {area.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Frameworks */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Preferred Frameworks
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Mental models the mentor can reference
        </p>
        <div className="flex flex-wrap gap-2">
          {FRAMEWORK_OPTIONS.map((framework) => (
            <button
              key={framework}
              type="button"
              onClick={() => toggleArrayItem('frameworks', framework)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                formData.frameworks.includes(framework)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {framework}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
};

export default PreferencesForm;
