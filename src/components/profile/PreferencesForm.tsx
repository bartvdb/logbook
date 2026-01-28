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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mentor Tone */}
      <div className="space-y-3">
        <Label>Mentor Tone</Label>
        <p className="text-sm text-muted-foreground">
          How should your AI mentor communicate with you?
        </p>
        <div className="space-y-2">
          {MENTOR_TONE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                formData.mentorTone === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-accent'
              )}
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
                <span className="font-medium">{option.label}</span>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Response Length */}
      <div className="space-y-3">
        <Label>Response Length</Label>
        <div className="flex gap-2">
          {RESPONSE_LENGTH_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.responseLength === option.value ? 'default' : 'outline'}
              className="flex-1"
              onClick={() =>
                setFormData((prev) => ({ ...prev, responseLength: option.value }))
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Question Frequency */}
      <div className="space-y-3">
        <Label>Question Frequency</Label>
        <p className="text-sm text-muted-foreground">
          How often should the mentor ask you questions?
        </p>
        <div className="flex gap-2">
          {QUESTION_FREQUENCY_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.questionFrequency === option.value ? 'default' : 'outline'}
              className="flex-1"
              onClick={() =>
                setFormData((prev) => ({ ...prev, questionFrequency: option.value }))
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Focus Areas */}
      <div className="space-y-3">
        <Label>Focus Areas</Label>
        <p className="text-sm text-muted-foreground">
          Select areas you want the mentor to emphasize
        </p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREA_OPTIONS.map((area) => (
            <Button
              key={area}
              type="button"
              variant={formData.focusAreas.includes(area) ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => toggleArrayItem('focusAreas', area)}
            >
              {area.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Frameworks */}
      <div className="space-y-3">
        <Label>Preferred Frameworks</Label>
        <p className="text-sm text-muted-foreground">
          Mental models the mentor can reference
        </p>
        <div className="flex flex-wrap gap-2">
          {FRAMEWORK_OPTIONS.map((framework) => (
            <Button
              key={framework}
              type="button"
              variant={formData.frameworks.includes(framework) ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => toggleArrayItem('frameworks', framework)}
            >
              {framework}
            </Button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </form>
  );
};

export default PreferencesForm;
