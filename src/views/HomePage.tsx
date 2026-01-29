import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '@/hooks';
import { useFocusMode } from '@/contexts';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useEntries();
  const { setFocusMode } = useFocusMode();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Enter focus mode when user starts typing
  useEffect(() => {
    if (content.trim()) {
      setFocusMode(true);
    }
  }, [content, setFocusMode]);

  // Exit focus mode when leaving the page
  useEffect(() => {
    return () => {
      setFocusMode(false);
    };
  }, [setFocusMode]);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    const entry = await create(content, [], undefined);
    setContent('');
    setFocusMode(false);
    navigate(`/entry/${entry.id}`);
  }, [content, create, navigate, setFocusMode]);

  const handleCancel = useCallback(() => {
    setContent('');
    setFocusMode(false);
    textareaRef.current?.focus();
  }, [setFocusMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed buttons in top-right corner - desktop only */}
      {content.trim() && (
        <div className="hidden lg:flex fixed top-4 right-4 z-50 gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:justify-center">
        <div className="lg:max-h-[80vh] lg:overflow-auto">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Start writing..."
            className="w-full min-h-[120px] border-0 bg-transparent text-foreground !text-[20px] !leading-[33px] resize-none focus-visible:ring-0 shadow-none p-0 placeholder:text-muted-foreground"
            rows={1}
          />
        </div>
      </div>

      {/* Buttons below form - mobile only */}
      {content.trim() && (
        <div className="flex lg:hidden justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
