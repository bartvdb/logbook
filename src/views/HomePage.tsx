import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTodayEntries, useEntries } from '@/hooks';
import { stripHtml } from '@/utils/markdown';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { entries: todayEntries, isLoading, refresh } = useTodayEntries();
  const { create, remove } = useEntries();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    const entry = await create(content, [], undefined);
    setContent('');
    refresh();
    navigate(`/entry/${entry.id}`);
  }, [content, create, refresh, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Delete this entry?')) {
        await remove(id);
        refresh();
      }
    },
    [remove, refresh]
  );

  const getTitle = (text: string) => {
    const plain = stripHtml(text);
    const firstLine = plain.split('\n')[0];
    return firstLine.slice(0, 50) || 'Untitled';
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-12">
      {/* Date header */}
      <div className="text-center">
        <p className="text-xs text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">
          {formattedDate}
        </p>
      </div>

      {/* Distraction-free editor */}
      <div className="min-h-[200px]">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start writing..."
          className="w-full bg-transparent text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 text-lg leading-relaxed resize-none focus:outline-none"
          rows={1}
        />
        {content.trim() && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900">
            <p className="text-xs text-neutral-400 dark:text-neutral-600">
              {content.trim().split(/\s+/).length} words
            </p>
            <button
              onClick={handleSave}
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <div className="border-t border-neutral-100 dark:border-neutral-900 pt-8">
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-4">
            Today
          </p>
          <div className="space-y-1">
            {todayEntries.map(entry => (
              <div
                key={entry.id}
                onClick={() => navigate(`/entry/${entry.id}`)}
                className="group flex items-center justify-between py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 -mx-2 px-2 rounded transition-colors"
              >
                <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                  {getTitle(entry.content)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    entry.id && handleDelete(entry.id);
                  }}
                  className="text-neutral-300 dark:text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          <div className="h-4 w-16 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
          <div className="h-5 w-48 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default HomePage;
