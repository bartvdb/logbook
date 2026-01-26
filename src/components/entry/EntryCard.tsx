import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Entry, MOOD_OPTIONS } from '@/types';
import { formatRelative, formatDateTime } from '@/utils/date';
import { truncateText, getFirstLine } from '@/utils/markdown';
import { sanitizeHTML } from '@/utils/sanitize';
import { TagPill } from '@/components/ui/TagPill';

interface EntryCardProps {
  entry: Entry;
  onDelete?: (id: string) => void;
  showFullContent?: boolean;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onDelete,
  showFullContent = false,
}) => {
  const navigate = useNavigate();
  const moodOption = entry.mood
    ? MOOD_OPTIONS.find((m) => m.value === entry.mood)
    : undefined;

  const handleClick = () => {
    navigate(`/entry/${entry.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && entry.id) {
      if (window.confirm('Are you sure you want to delete this entry?')) {
        onDelete(entry.id);
      }
    }
  };

  const title = getFirstLine(entry.content);
  const preview = truncateText(entry.content, 200);

  return (
    <article
      onClick={handleClick}
      className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <time dateTime={entry.createdAt.toISOString()} title={formatDateTime(entry.createdAt)}>
              {formatRelative(entry.createdAt)}
            </time>
            {moodOption && (
              <>
                <span>·</span>
                <span>{moodOption.emoji} {moodOption.label}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {entry.aiConversation && entry.aiConversation.length > 0 && (
            <span className="p-1.5 text-blue-500" title="Has AI conversation">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors"
              title="Delete entry"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {showFullContent ? (
        <div
          className="prose prose-slate dark:prose-invert prose-sm max-w-none mb-3"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(entry.content) }}
        />
      ) : (
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-3">
          {preview}
        </p>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <TagPill key={tag} tag={tag} size="sm" />
          ))}
        </div>
      )}
    </article>
  );
};

interface EntryCardSkeletonProps {
  count?: number;
}

export const EntryCardSkeleton: React.FC<EntryCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
          </div>
        </div>
      ))}
    </>
  );
};

export default EntryCard;
