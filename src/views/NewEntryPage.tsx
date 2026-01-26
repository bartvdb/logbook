import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '@/hooks';
import { EntryEditor } from '@/components/entry';
import { Mood } from '@/types';

const NewEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useEntries();

  const handleSave = useCallback(
    async (content: string, tags: string[], mood?: Mood) => {
      const entry = await create(content, tags, mood);
      navigate(`/entry/${entry.id}`);
    },
    [create, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          New Entry
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          What's on your mind?
        </p>
      </div>

      {/* Editor */}
      <EntryEditor
        onSave={handleSave}
        onCancel={handleCancel}
        autoSaveEnabled={false}
      />
    </div>
  );
};

export default NewEntryPage;
