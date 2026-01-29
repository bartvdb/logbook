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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col lg:justify-center">
        <div className="lg:max-h-[80vh] lg:overflow-auto">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing..."
            className="w-full min-h-[120px] border-0 bg-transparent text-[18px] leading-relaxed resize-none focus-visible:ring-0 shadow-none placeholder:text-muted-foreground"
            rows={1}
          />
        </div>
      </div>

      {content.trim() && (
        <div className="flex justify-end py-4">
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
