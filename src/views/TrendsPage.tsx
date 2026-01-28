import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEntries } from '@/hooks';
import { Entry } from '@/types';
import { stripHtml } from '@/utils/markdown';
import { formatDate } from '@/utils/date';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TrendsPage: React.FC = () => {
  const { entries, isLoading } = useEntries();
  const [summaries, setSummaries] = useState<Map<string, { text: string; isLoading: boolean }>>(new Map());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Group entries by date
  const groupedByDay = useMemo(() => {
    const groups: { [key: string]: Entry[] } = {};
    entries.forEach(entry => {
      const date = formatDate(entry.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });

    // Sort by date descending and convert to array
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, dayEntries]) => ({
        date,
        entries: dayEntries,
        count: dayEntries.length,
      }));
  }, [entries]);

  const generateSummary = useCallback(async (date: string, dayEntries: Entry[]) => {
    // Mark as loading
    setSummaries(prev => new Map(prev).set(date, { text: '', isLoading: true }));

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        setSummaries(prev => new Map(prev).set(date, {
          text: 'API key not configured. Add VITE_ANTHROPIC_API_KEY to your environment.',
          isLoading: false
        }));
        return;
      }

      const entriesText = dayEntries
        .map(e => stripHtml(e.content))
        .join('\n\n---\n\n');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `Based on these journal entries from ${date}, provide a brief summary of key learnings, insights, or themes. Be concise and focus on actionable takeaways. Write in second person ("You...").

Entries:
${entriesText}

Provide a 2-3 sentence summary focusing on the main insights or learnings from this day.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      const summaryText = data.content[0]?.text || 'Unable to generate summary.';

      setSummaries(prev => new Map(prev).set(date, { text: summaryText, isLoading: false }));
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummaries(prev => new Map(prev).set(date, {
        text: 'Unable to generate summary. Please try again.',
        isLoading: false
      }));
    }
  }, []);

  const toggleDay = useCallback((date: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-16 w-full bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trends</h1>
        <p className="text-muted-foreground">
          Daily insights and learnings from your journal entries.
        </p>
      </div>

      {groupedByDay.length === 0 ? (
        <p className="text-muted-foreground">
          No entries yet. Start writing to see your trends.
        </p>
      ) : (
        <div className="space-y-3">
          {groupedByDay.map(({ date, entries: dayEntries, count }) => {
            const isExpanded = expandedDays.has(date);
            const summary = summaries.get(date);
            const hasMultipleEntries = count > 1;

            return (
              <Card key={date}>
                <CardHeader
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleDay(date)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{date}</p>
                      <p className="text-sm text-muted-foreground">
                        {count} {count === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 border-t">
                    {/* Summary section */}
                    <div className="pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        {hasMultipleEntries ? 'Daily Summary' : 'Insight'}
                      </p>

                      {summary?.isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Generating summary...</span>
                        </div>
                      ) : summary?.text ? (
                        <p className="text-sm leading-relaxed">
                          {summary.text}
                        </p>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            generateSummary(date, dayEntries);
                          }}
                          className="gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generate {hasMultipleEntries ? 'summary' : 'insight'}
                        </Button>
                      )}
                    </div>

                    {/* Entry previews */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Entries
                      </p>
                      <div className="space-y-2">
                        {dayEntries.map(entry => {
                          const preview = stripHtml(entry.content).slice(0, 100);
                          return (
                            <Link
                              key={entry.id}
                              to={`/entry/${entry.id}`}
                              className="block text-sm text-muted-foreground hover:text-foreground truncate transition-colors"
                            >
                              {preview}...
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrendsPage;
