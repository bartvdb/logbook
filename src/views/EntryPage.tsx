import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntry, useEntries } from '@/hooks';
import { MentorChat } from '@/components/mentor';
import { formatTime } from '@/utils/date';
import { sanitizeHTML } from '@/utils/sanitize';

const EntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entry, isLoading } = useEntry(id);
  const { update, remove } = useEntries();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [isEditing, editContent]);

  // Set edit content when entry loads
  useEffect(() => {
    if (entry) {
      // Strip HTML for plain text editing
      const temp = document.createElement('div');
      temp.innerHTML = entry.content;
      setEditContent(temp.textContent || temp.innerText || '');
    }
  }, [entry]);

  const handleSave = useCallback(async () => {
    if (id && editContent.trim()) {
      await update(id, { content: editContent });
      setIsEditing(false);
    }
  }, [id, editContent, update]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (id && window.confirm('Delete this entry?')) {
      await remove(id);
      navigate('/entries');
    }
  }, [id, remove, navigate]);

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
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-neutral-900 dark:text-white text-xl leading-relaxed resize-none focus:outline-none"
              rows={5}
            />
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                className="text-base text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-base text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="prose prose-lg prose-neutral dark:prose-invert max-w-none cursor-text prose-p:text-neutral-800 dark:prose-p:text-neutral-200 prose-p:leading-relaxed prose-headings:text-neutral-900 dark:prose-headings:text-white"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(entry.content) }}
          />
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

      {/* AI Mentor */}
      <div className="border-t border-neutral-100 dark:border-neutral-900 pt-8">
        <MentorChat entry={entry} />
      </div>
    </div>
  );
};

export default EntryPage;
