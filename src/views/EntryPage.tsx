import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { YooptaContentValue } from '@yoopta/editor';
import { useEntry, useEntries, useProfile, usePreferences } from '@/hooks';
import { LogbookEditor, textToYooptaContent, yooptaContentToText, isYooptaContent } from '@/components/editor';
import { formatTime } from '@/utils/date';
import { getMentorResponse, isAPIConfigured } from '@/lib/ai';
import { stripHtml } from '@/utils/markdown';

const EntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entry, isLoading, refresh } = useEntry(id);
  const { update, remove } = useEntries();
  const { profile } = useProfile();
  const { preferences } = usePreferences();
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState<YooptaContentValue>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Parse entry content based on version
  const parsedContent = useMemo((): YooptaContentValue => {
    if (!entry) return {};

    // Check if content is Yoopta JSON (version 2)
    if (entry.contentVersion === 2) {
      try {
        const parsed = JSON.parse(entry.content);
        if (isYooptaContent(parsed)) {
          return parsed;
        }
      } catch {
        // Fall through to legacy handling
      }
    }

    // Legacy content (version 1 or plain text/HTML)
    const plainText = stripHtml(entry.content);
    return textToYooptaContent(plainText);
  }, [entry]);

  // Set editor content when entry loads
  useEffect(() => {
    if (entry) {
      setEditorContent(parsedContent);
    }
  }, [entry, parsedContent]);

  const handleSave = useCallback(async () => {
    if (id && Object.keys(editorContent).length > 0) {
      await update(id, {
        content: JSON.stringify(editorContent),
        contentVersion: 2,
      });
      setIsEditing(false);
      refresh();
    }
  }, [id, editorContent, update, refresh]);

  const handleDelete = useCallback(async () => {
    if (id && window.confirm('Delete this entry?')) {
      await remove(id);
      navigate('/entries');
    }
  }, [id, remove, navigate]);

  const handleSummarize = useCallback(async () => {
    if (!entry || !profile || !preferences || isSummarizing) return;

    setIsSummarizing(true);
    setSummaryError(null);

    try {
      // Get plain text from content for AI
      const plainText = entry.contentVersion === 2
        ? yooptaContentToText(parsedContent)
        : stripHtml(entry.content);

      // Create a modified entry with plain text for AI
      const entryForAI = {
        ...entry,
        content: plainText,
      };

      // Build a custom prompt for summarization with learnings
      const response = await getMentorResponse(entryForAI, profile, {
        ...preferences,
        customInstructions: `${preferences.customInstructions || ''}\n\nProvide a concise summary of this entry focusing on key learnings, insights, and actionable takeaways. Format as bullet points.`,
      });

      setSummary(response.content);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummaryError(error instanceof Error ? error.message : 'Failed to generate summary');
    } finally {
      setIsSummarizing(false);
    }
  }, [entry, profile, preferences, parsedContent, isSummarizing]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-900 rounded" />
        <div className="h-6 w-3/4 bg-neutral-100 dark:bg-neutral-900 rounded" />
        <div className="h-6 w-1/2 bg-neutral-100 dark:bg-neutral-900 rounded" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
          Entry not found
        </p>
        <button
          onClick={() => navigate('/entries')}
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          Go to Entries
        </button>
      </div>
    );
  }

  const entryDate = new Date(entry.createdAt);
  const formattedDate = entryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>

      {/* Entry content */}
      <div className="space-y-4">
        {/* Date and time */}
        <div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {formattedDate} · {formatTime(entry.createdAt)}
          </p>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-4">
            <LogbookEditor
              value={editorContent}
              onChange={setEditorContent}
              autoFocus
            />
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditorContent(parsedContent);
                }}
                className="text-base text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-base text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-text min-h-[100px]"
          >
            <LogbookEditor
              value={parsedContent}
              onChange={() => {}}
              readOnly
            />
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => setIsEditing(true)}
              className="text-base text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-base text-neutral-600 hover:text-red-500 dark:text-neutral-300 dark:hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* AI Summary Section */}
      <div className="border-t border-neutral-100 dark:border-neutral-900 pt-8">
        <div className="space-y-4">
          {!summary && !isSummarizing && isAPIConfigured() && (
            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="text-base text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Summarize with learnings
            </button>
          )}

          {!isAPIConfigured() && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              API key not configured. Add VITE_ANTHROPIC_API_KEY to enable AI summaries.
            </p>
          )}

          {isSummarizing && (
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Generating summary...</span>
            </div>
          )}

          {summaryError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{summaryError}</p>
              <button
                onClick={handleSummarize}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline mt-2"
              >
                Try again
              </button>
            </div>
          )}

          {summary && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                  Summary & Learnings
                </h3>
                <button
                  onClick={() => setSummary(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  Clear
                </button>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <p className="text-base text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {summary}
                </p>
              </div>
              <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
