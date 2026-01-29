import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useEntry, useEntries } from '@/hooks';
import { MentorChat } from '@/components/mentor';
import { formatTime } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const EntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entry, isLoading } = useEntry(id);
  const { update, remove } = useEntries();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [isEditing, editContent]);

  useEffect(() => {
    if (entry) {
      // If content has HTML, extract text; otherwise use as-is
      if (entry.content.includes('<')) {
        const temp = document.createElement('div');
        temp.innerHTML = entry.content;
        setEditContent(temp.textContent || temp.innerText || '');
      } else {
        setEditContent(entry.content);
      }
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
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-6 w-3/4 bg-muted rounded" />
        <div className="h-6 w-1/2 bg-muted rounded" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Entry not found</p>
        <Button variant="link" onClick={() => navigate('/entries')}>
          Go to Entries
        </Button>
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
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {formattedDate} · {formatTime(entry.createdAt)}
        </p>

        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[200px] border-0 bg-transparent text-foreground text-[20px] leading-relaxed resize-none focus-visible:ring-0 shadow-none p-0"
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-text text-foreground text-[20px] leading-relaxed whitespace-pre-wrap"
          >
            {entry.content}
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-2 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Separator />

      <MentorChat entry={entry} />
    </div>
  );
};

export default EntryPage;
