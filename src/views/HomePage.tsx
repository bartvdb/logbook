import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '@/hooks';
import { EntryImage } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/entry/ImageUpload';
import { EntryContent } from '@/components/entry/EntryContent';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useEntries();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<EntryImage[]>([]);
  const [isPreview, setIsPreview] = useState(false);
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
    if (!content.trim() && images.length === 0) return;
    const entry = await create(content, [], undefined, images);
    setContent('');
    setImages([]);
    navigate(`/entry/${entry.id}`);
  }, [content, images, create, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleImageAdd = (image: EntryImage, placeholder: string) => {
    setImages(prev => [...prev, image]);
    // Insert placeholder at cursor position or end
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.slice(0, start) + placeholder + content.slice(end);
      setContent(newContent);
      // Move cursor after placeholder
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = start + placeholder.length;
          textareaRef.current.selectionStart = newPos;
          textareaRef.current.selectionEnd = newPos;
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      setContent(prev => prev + placeholder);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const hasContent = content.trim() || images.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col lg:justify-center">
        <div className="lg:max-h-[80vh] lg:overflow-auto">
          {isPreview ? (
            <div className="min-h-[120px] text-[20px] leading-relaxed">
              <EntryContent content={content} images={images} />
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start writing..."
              className="w-full min-h-[120px] border-0 bg-transparent text-[20px] leading-relaxed resize-none focus-visible:ring-0 shadow-none placeholder:text-muted-foreground"
              rows={1}
            />
          )}
        </div>

        <Separator className="mt-4" />
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <ImageUpload onImageAdd={handleImageAdd} />
            {images.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                className="text-xs"
              >
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
            )}
            <p className="text-sm text-muted-foreground">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
              {images.length > 0 && ` · ${images.length} ${images.length === 1 ? 'photo' : 'photos'}`}
            </p>
          </div>
          {hasContent && (
            <Button variant="ghost" onClick={handleSave}>
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
