import { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { YooptaContentValue } from '@yoopta/editor';
import { useEntries } from '@/hooks';
import { LogbookEditor, createEmptyDocument, yooptaContentToText, YooptaEditorRef } from '@/components/editor';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useEntries();
  const editorRef = useRef<YooptaEditorRef>(null);
  const [content, setContent] = useState<YooptaContentValue>(createEmptyDocument());

  // Check if content has any actual text
  const hasContent = useMemo(() => {
    const text = yooptaContentToText(content);
    return text.trim().length > 0;
  }, [content]);

  // Word count from state
  const wordCountFromState = useMemo(() => {
    const text = yooptaContentToText(content);
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }, [content]);

  // Get word count from editor ref for display
  const getWordCount = useCallback(() => {
    const editorContent = editorRef.current?.getContent();
    if (editorContent) {
      const text = yooptaContentToText(editorContent);
      if (text.trim()) {
        return text.trim().split(/\s+/).length;
      }
    }
    return wordCountFromState;
  }, [wordCountFromState]);

  const handleSave = useCallback(async () => {
    // Get content directly from editor instance
    const editorContent = editorRef.current?.getContent();

    if (!editorContent) {
      console.error('No editor content available');
      return;
    }

    const text = yooptaContentToText(editorContent);
    if (!text.trim()) {
      console.log('Content is empty, not saving');
      return;
    }

    console.log('Saving content:', editorContent);

    // Save as Yoopta JSON with version 2
    const entry = await create(JSON.stringify(editorContent), [], undefined, 2);
    console.log('Entry created:', entry);
    setContent(createEmptyDocument());
    navigate(`/entry/${entry.id}`);
  }, [create, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  // Display word count - use state if hasContent, otherwise show 0
  const displayWordCount = hasContent ? wordCountFromState : getWordCount();

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown}>
      {/* Desktop: centered layout, Mobile: top-aligned */}
      <div className="flex-1 flex flex-col lg:justify-center">
        <div className="lg:max-h-[80vh] lg:overflow-auto">
          <LogbookEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="Start writing..."
            autoFocus
          />
        </div>
        {/* Always show footer when there's content */}
        <div className="flex items-center justify-between py-4 border-t border-neutral-100 dark:border-neutral-900 mt-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {displayWordCount} word{displayWordCount !== 1 ? 's' : ''}
          </p>
          <button
            onClick={handleSave}
            className="text-base text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
