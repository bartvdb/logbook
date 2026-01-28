import React, { useState, useEffect } from 'react';
import { usePreferences } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface CustomInstructionsProps {
  onSaved?: () => void;
}

export const CustomInstructions: React.FC<CustomInstructionsProps> = ({ onSaved }) => {
  const { preferences, update, isLoading } = usePreferences();
  const [instructions, setInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences?.customInstructions) {
      setInstructions(preferences.customInstructions);
    }
  }, [preferences?.customInstructions]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await update({ customInstructions: instructions });
      onSaved?.();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Custom Instructions</Label>
        <p className="text-sm text-muted-foreground">
          Add any specific instructions or context for your AI mentor. This could include:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Specific challenges you're facing</li>
          <li>Topics you want to focus on or avoid</li>
          <li>Communication style preferences</li>
          <li>Context about your current situation</li>
        </ul>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., I'm currently transitioning from engineering to management. Please help me develop leadership skills while staying technical. Avoid generic advice - I prefer actionable insights based on first principles thinking."
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {instructions.length}/1000 characters
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving || instructions.length > 1000}
        className="w-full"
      >
        {isSaving ? 'Saving...' : 'Save Instructions'}
      </Button>

      {/* Examples */}
      <Separator />
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Examples</h4>
        <div className="space-y-3">
          <ExampleInstruction
            title="For a Product Manager"
            text="I'm a PM at a Series B startup. Help me balance strategic thinking with execution. When reviewing my entries, look for opportunities to improve stakeholder communication and data-driven decision making."
            onUse={setInstructions}
          />
          <ExampleInstruction
            title="For a Founder"
            text="I'm building a company and often feel overwhelmed. Please be direct with feedback and help me prioritize ruthlessly. Use first principles thinking when suggesting solutions."
            onUse={setInstructions}
          />
          <ExampleInstruction
            title="For Personal Growth"
            text="I want to develop better emotional intelligence and self-awareness. Ask me questions that help me understand my patterns and reactions. Be gentle but insightful."
            onUse={setInstructions}
          />
        </div>
      </div>
    </div>
  );
};

interface ExampleInstructionProps {
  title: string;
  text: string;
  onUse: (text: string) => void;
}

const ExampleInstruction: React.FC<ExampleInstructionProps> = ({
  title,
  text,
  onUse,
}) => (
  <div className="p-3 bg-muted/50 rounded-lg">
    <div className="flex items-start justify-between gap-2 mb-1">
      <span className="text-sm font-medium">{title}</span>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs"
        onClick={() => onUse(text)}
      >
        Use this
      </Button>
    </div>
    <p className="text-xs text-muted-foreground">{text}</p>
  </div>
);

export default CustomInstructions;
