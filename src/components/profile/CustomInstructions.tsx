import React, { useState, useEffect } from 'react';
import { usePreferences } from '@/hooks';

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
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Custom Instructions
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Add any specific instructions or context for your AI mentor. This could include:
        </p>
        <ul className="text-sm text-slate-500 dark:text-slate-400 mb-4 space-y-1 list-disc list-inside">
          <li>Specific challenges you're facing</li>
          <li>Topics you want to focus on or avoid</li>
          <li>Communication style preferences</li>
          <li>Context about your current situation</li>
        </ul>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., I'm currently transitioning from engineering to management. Please help me develop leadership skills while staying technical. Avoid generic advice - I prefer actionable insights based on first principles thinking."
          rows={6}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-slate-400 mt-2">
          {instructions.length}/1000 characters
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || instructions.length > 1000}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? 'Saving...' : 'Save Instructions'}
      </button>

      {/* Examples */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Examples
        </h4>
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
  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
    <div className="flex items-start justify-between gap-2 mb-1">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {title}
      </span>
      <button
        onClick={() => onUse(text)}
        className="text-xs text-blue-500 hover:text-blue-600"
      >
        Use this
      </button>
    </div>
    <p className="text-xs text-slate-500 dark:text-slate-400">{text}</p>
  </div>
);

export default CustomInstructions;
