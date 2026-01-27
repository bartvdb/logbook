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

  const handleSave = useCallback(async () => {
    // Get content directly from editor instance
    const editorContent = editorRef.current?.getContent();

    if (!editorContent) {
      return;
    }

    const text = yooptaContentToText(editorContent);
    if (!text.trim()) {
      return;
    }

    // Save as Yoopta JSON with version 2
    const entry = await create(JSON.stringify(editorContent), [], undefined, 2);
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

  return (
    <div className="relative flex flex-col h-full min-h-[calc(100vh-6rem)]" onKeyDown={handleKeyDown}>
      {/* Editor container - starts centered, grows to fill */}
      <div className={`flex-1 flex flex-col ${hasContent ? 'justify-start' : 'justify-center'} transition-all duration-200`}>
        <div className="home-editor">
          <LogbookEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="Start writing..."
            autoFocus
          />
        </div>
      </div>

      {/* Fixed save button - bottom right */}
      <button
        onClick={handleSave}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 text-base text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
      >
        Save
      </button>
    </div>
  );
};

export default HomePage;
