import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '@/hooks';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useEntries();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea and keep it vertically centered on desktop
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    const entry = await create(content, [], undefined);
    setContent('');
    navigate(`/entry/${entry.id}`);
  }, [content, create, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Desktop: centered layout, Mobile: top-aligned */}
      <div className="flex-1 flex flex-col lg:justify-center">
        <div className="lg:max-h-[80vh] lg:overflow-auto">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing..."
            className="w-full bg-transparent text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 text-xl leading-relaxed resize-none focus:outline-none"
            rows={1}
          />
        </div>
        {content.trim() && (
          <div className="flex items-center justify-between py-4 border-t border-neutral-100 dark:border-neutral-900 mt-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {content.trim().split(/\s+/).length} words
            </p>
            <button
              onClick={handleSave}
              className="text-base text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
