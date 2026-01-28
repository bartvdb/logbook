import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProfile } from '@/hooks';
import { Profile } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProfileFormProps {
  onSaved?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSaved }) => {
  const { profile, update, isLoading } = useProfile();
  const [formData, setFormData] = useState<Omit<Profile, 'id' | 'updatedAt'>>({
    name: '',
    role: '',
    industry: '',
    goals: [],
    values: [],
    focusAreas: [],
    experience: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [focusInput, setFocusInput] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        role: profile.role || '',
        industry: profile.industry || '',
        goals: profile.goals || [],
        values: profile.values || [],
        focusAreas: profile.focusAreas || [],
        experience: profile.experience || '',
      });
    }
  }, [profile]);

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

  const addItem = (
    field: 'goals' | 'values' | 'focusAreas',
    value: string,
    setValue: (v: string) => void
  ) => {
    const trimmed = value.trim();
    if (trimmed && !formData[field].includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], trimmed],
      }));
      setValue('');
    }
  };

  const removeItem = (field: 'goals' | 'values' | 'focusAreas', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role / Title</Label>
          <Input
            id="role"
            type="text"
            value={formData.role}
            onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
            placeholder="e.g., Product Manager, Software Engineer, Founder"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
            placeholder="e.g., Technology, Healthcare, Finance"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience Level</Label>
          <Textarea
            id="experience"
            value={formData.experience}
            onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
            placeholder="Brief description of your background and experience level..."
            rows={3}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Goals</Label>
        <p className="text-sm text-muted-foreground">What are you working towards?</p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('goals', goalInput, setGoalInput);
              }
            }}
            placeholder="Add a goal..."
            className="flex-1"
          />
          <Button type="button" onClick={() => addItem('goals', goalInput, setGoalInput)}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.goals.map((goal, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {goal}
              <button type="button" onClick={() => removeItem('goals', index)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Values</Label>
        <p className="text-sm text-muted-foreground">What principles guide your decisions?</p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('values', valueInput, setValueInput);
              }
            }}
            placeholder="Add a value..."
            className="flex-1"
          />
          <Button type="button" onClick={() => addItem('values', valueInput, setValueInput)}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.values.map((value, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {value}
              <button type="button" onClick={() => removeItem('values', index)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Focus Areas</Label>
        <p className="text-sm text-muted-foreground">What areas do you want to develop?</p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={focusInput}
            onChange={(e) => setFocusInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('focusAreas', focusInput, setFocusInput);
              }
            }}
            placeholder="Add a focus area..."
            className="flex-1"
          />
          <Button type="button" onClick={() => addItem('focusAreas', focusInput, setFocusInput)}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.focusAreas.map((area, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {area}
              <button type="button" onClick={() => removeItem('focusAreas', index)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
};

export default ProfileForm;
