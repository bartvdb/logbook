import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Entry } from '@/types';
import { getFirstLine, truncateText } from '@/utils/markdown';

interface EntryCardProps {
  entry: Entry;
  onDelete?: (id: string) => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onDelete,
}) => {
  const navigate = useNavigate();

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
  // Get second line as subtitle/preview
  const lines = entry.content.split('\n').filter(l => l.trim());
  const subtitle = lines.length > 1 ? truncateText(lines.slice(1).join(' '), 100) : '';

  return (
    <article
      onClick={handleClick}
      className="group py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all"
            title="Delete entry"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
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
          className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 animate-pulse"
        >
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-1.5" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      ))}
    </>
  );
};

export default EntryCard;
