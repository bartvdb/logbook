import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntry, useEntries } from '@/hooks';
import { EntryEditor } from '@/components/entry';
import { MentorChat } from '@/components/mentor';
import { TagPill } from '@/components/ui';
import { Mood, MOOD_OPTIONS } from '@/types';
import { formatDate, formatTime } from '@/utils/date';

const EntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entry, isLoading } = useEntry(id);
  const { update, remove } = useEntries();
  const [isEditing, setIsEditing] = useState(false);
  const [showMentor, setShowMentor] = useState(false);

  const handleSave = useCallback(
    async (content: string, tags: string[], mood?: Mood) => {
      if (id) {
        await update(id, { content, tags, mood });
        setIsEditing(false);
      }
    },
    [id, update]
  );

  const handleDelete = useCallback(async () => {
    if (id && window.confirm('Are you sure you want to delete this entry?')) {
      await remove(id);
      navigate('/timeline');
    }
  }, [id, remove, navigate]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Entry not found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          This entry may have been deleted.
        </p>
        <button
          onClick={() => navigate('/timeline')}
          className="text-blue-500 hover:text-blue-600"
        >
          Go to Timeline
        </button>
      </div>
    );
  }

  const moodOption = entry.mood
    ? MOOD_OPTIONS.find((m) => m.value === entry.mood)
    : undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {formatDate(entry.createdAt)}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {formatTime(entry.createdAt)}
            {moodOption && ` · ${moodOption.emoji} ${moodOption.label}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMentor(!showMentor)}
            className={`p-2 rounded-lg transition-colors ${
              showMentor
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="AI Mentor"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={showMentor ? '' : 'lg:col-span-2'}>
          {isEditing ? (
            <EntryEditor
              entry={entry}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
              autoSaveEnabled={true}
            />
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Tags */}
              {entry.tags.length > 0 && (
                <div className="px-4 pt-4 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} size="sm" />
                  ))}
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-slate dark:prose-invert max-w-none p-4"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            </div>
          )}
        </div>

        {/* Mentor Chat */}
        {showMentor && (
          <div>
            <MentorChat entry={entry} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryPage;
