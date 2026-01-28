import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useEntries } from '@/hooks';
import { Entry } from '@/types';
import { stripHtml } from '@/utils/markdown';
import { formatDate } from '@/utils/date';
import { SwipeToDelete } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const EntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { entries, isLoading, remove } = useEntries();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = useCallback(
    async (id: string, e?: React.MouseEvent, skipConfirm = false) => {
      if (e) e.stopPropagation();
      if (skipConfirm || window.confirm('Delete this entry?')) {
        await remove(id);
      }
    },
    [remove]
  );

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(e => {
      const plainContent = stripHtml(e.content).toLowerCase();
      return plainContent.includes(query) ||
        e.tags.some(t => t.toLowerCase().includes(query));
    });
  }, [entries, searchQuery]);

  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: Entry[] } = {};
    filteredEntries.forEach(entry => {
      const date = formatDate(entry.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return Object.entries(groups);
  }, [filteredEntries]);

  const getTitle = (content: string) => {
    const plain = stripHtml(content);
    const firstLine = plain.split('\n')[0];
    return firstLine.slice(0, 60) || 'Untitled';
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-medium">Entries</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries..."
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <p className="text-muted-foreground">
          {searchQuery ? 'No entries found.' : 'No entries yet.'}
        </p>
      ) : (
        <div className="space-y-8">
          {groupedEntries.map(([date, dateEntries], groupIndex) => (
            <div key={date}>
              <p className="text-sm text-muted-foreground mb-3">{date}</p>
              <div className="space-y-1">
                {dateEntries.map(entry => (
                  <SwipeToDelete
                    key={entry.id}
                    onDelete={() => entry.id && handleDelete(entry.id, undefined, true)}
                  >
                    <div
                      onClick={() => navigate(`/entry/${entry.id}`)}
                      className="group flex items-center justify-between py-2 px-2 -mx-2 cursor-pointer hover:bg-accent rounded-md transition-colors"
                    >
                      <span className="text-sm truncate">{getTitle(entry.content)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex"
                        onClick={(e) => entry.id && handleDelete(entry.id, e)}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </SwipeToDelete>
                ))}
              </div>
              {groupIndex < groupedEntries.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntriesPage;
