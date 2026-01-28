import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '@/hooks';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useEntries();
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

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    const entry = await create(content, [], undefined);
    setContent('');
    navigate(`/entry/${entry.id}`);
  }, [content, create, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

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
            className="w-full min-h-[120px] border-0 bg-transparent text-[20px] leading-relaxed resize-none focus-visible:ring-0 shadow-none placeholder:text-muted-foreground"
            rows={1}
          />
        </div>
        {content.trim() && (
          <>
            <Separator className="mt-4" />
            <div className="flex items-center justify-between py-4">
              <p className="text-sm text-muted-foreground">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </p>
              <Button variant="ghost" onClick={handleSave}>
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
