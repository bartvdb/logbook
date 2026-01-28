import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEntries } from '@/hooks';
import { Entry } from '@/types';
import { stripHtml } from '@/utils/markdown';
import { formatDate } from '@/utils/date';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Helper to get week number and year from a date
const getWeekKey = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};

// Format week key to readable string
const formatWeekLabel = (weekKey: string): string => {
  const [year, week] = weekKey.split('-W');
  return `Week ${parseInt(week)}, ${year}`;
};

// Get the date range for a week
const getWeekDateRange = (weekKey: string): string => {
  const [year, week] = weekKey.split('-W');
  const simple = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
  const dayOfWeek = simple.getDay();
  const startDate = new Date(simple);
  startDate.setDate(simple.getDate() - dayOfWeek + 1);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const formatShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${formatShort(startDate)} - ${formatShort(endDate)}`;
};

interface DayGroup {
  date: string;
  entries: Entry[];
  count: number;
}

interface WeekGroup {
  weekKey: string;
  weekLabel: string;
  dateRange: string;
  days: DayGroup[];
  totalEntries: number;
}

const TrendsPage: React.FC = () => {
  const { entries, isLoading } = useEntries();
  const [summaries, setSummaries] = useState<Map<string, { text: string; isLoading: boolean }>>(new Map());
  const [learnings, setLearnings] = useState<Map<string, { text: string; isLoading: boolean }>>(new Map());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Group entries by week and day
  const groupedByWeek = useMemo(() => {
    const dayGroups: { [key: string]: Entry[] } = {};
    const weekGroups: { [key: string]: { [day: string]: Entry[] } } = {};

    entries.forEach(entry => {
      const date = formatDate(entry.createdAt);
      const weekKey = getWeekKey(new Date(entry.createdAt));

      if (!dayGroups[date]) dayGroups[date] = [];
      dayGroups[date].push(entry);

      if (!weekGroups[weekKey]) weekGroups[weekKey] = {};
      if (!weekGroups[weekKey][date]) weekGroups[weekKey][date] = [];
      weekGroups[weekKey][date].push(entry);
    });

    // Convert to sorted array of weeks
    return Object.entries(weekGroups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([weekKey, days]): WeekGroup => {
        const sortedDays = Object.entries(days)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([date, dayEntries]): DayGroup => ({
            date,
            entries: dayEntries,
            count: dayEntries.length,
          }));

        return {
          weekKey,
          weekLabel: formatWeekLabel(weekKey),
          dateRange: getWeekDateRange(weekKey),
          days: sortedDays,
          totalEntries: sortedDays.reduce((sum, d) => sum + d.count, 0),
        };
      });
  }, [entries]);

  const generateSummary = useCallback(async (key: string, entriesToSummarize: Entry[], label: string) => {
    setSummaries(prev => new Map(prev).set(key, { text: '', isLoading: true }));

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        setSummaries(prev => new Map(prev).set(key, {
          text: 'API key not configured. Add VITE_ANTHROPIC_API_KEY to your environment.',
          isLoading: false
        }));
        return;
      }

      const entriesText = entriesToSummarize
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
              content: `Based on these journal entries from ${label}, provide a brief summary of key themes, activities, and insights. Be concise and focus on patterns you notice. Write in second person ("You...").

Entries:
${entriesText}

Provide a 2-3 sentence summary focusing on the main themes and activities from this period.`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to generate summary');

      const data = await response.json();
      const summaryText = data.content[0]?.text || 'Unable to generate summary.';

      setSummaries(prev => new Map(prev).set(key, { text: summaryText, isLoading: false }));
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummaries(prev => new Map(prev).set(key, {
        text: 'Unable to generate summary. Please try again.',
        isLoading: false
      }));
    }
  }, []);

  const generateLearnings = useCallback(async (key: string, entriesToAnalyze: Entry[], label: string) => {
    setLearnings(prev => new Map(prev).set(key, { text: '', isLoading: true }));

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        setLearnings(prev => new Map(prev).set(key, {
          text: 'API key not configured. Add VITE_ANTHROPIC_API_KEY to your environment.',
          isLoading: false
        }));
        return;
      }

      const entriesText = entriesToAnalyze
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
          max_tokens: 600,
          messages: [
            {
              role: 'user',
              content: `Based on these journal entries from ${label}, extract key learnings and actionable insights. Focus on:
1. What worked well
2. What could be improved
3. Patterns or habits to reinforce or change

Entries:
${entriesText}

Provide 3-5 bullet points of key learnings and actionable takeaways. Be specific and practical. Write in second person ("You...").`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to generate learnings');

      const data = await response.json();
      const learningsText = data.content[0]?.text || 'Unable to generate learnings.';

      setLearnings(prev => new Map(prev).set(key, { text: learningsText, isLoading: false }));
    } catch (error) {
      console.error('Error generating learnings:', error);
      setLearnings(prev => new Map(prev).set(key, {
        text: 'Unable to generate learnings. Please try again.',
        isLoading: false
      }));
    }
  }, []);

  const toggleWeek = useCallback((weekKey: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekKey)) {
        next.delete(weekKey);
      } else {
        next.add(weekKey);
      }
      return next;
    });
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

  const getAllEntriesForWeek = (week: WeekGroup): Entry[] => {
    return week.days.flatMap(d => d.entries);
  };

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
          Weekly and daily insights from your journal entries.
        </p>
      </div>

      {groupedByWeek.length === 0 ? (
        <p className="text-muted-foreground">
          No entries yet. Start writing to see your trends.
        </p>
      ) : (
        <div className="space-y-4">
          {groupedByWeek.map((week) => {
            const isWeekExpanded = expandedWeeks.has(week.weekKey);
            const weekSummary = summaries.get(`week-${week.weekKey}`);
            const weekLearnings = learnings.get(`week-${week.weekKey}`);
            const weekEntries = getAllEntriesForWeek(week);

            return (
              <Card key={week.weekKey}>
                <CardHeader
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleWeek(week.weekKey)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{week.weekLabel}</p>
                      <p className="text-sm text-muted-foreground">
                        {week.dateRange} · {week.totalEntries} {week.totalEntries === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform",
                        isWeekExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </CardHeader>

                {isWeekExpanded && (
                  <CardContent className="pt-0 border-t">
                    {/* Week Summary & Learnings */}
                    <div className="pt-4 space-y-4">
                      {/* Summary */}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                          Weekly Summary
                        </p>
                        {weekSummary?.isLoading ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Generating summary...</span>
                          </div>
                        ) : weekSummary?.text ? (
                          <p className="text-sm leading-relaxed">{weekSummary.text}</p>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateSummary(`week-${week.weekKey}`, weekEntries, week.weekLabel);
                            }}
                            className="gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            Generate summary
                          </Button>
                        )}
                      </div>

                      {/* Learnings */}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                          Key Learnings
                        </p>
                        {weekLearnings?.isLoading ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Extracting learnings...</span>
                          </div>
                        ) : weekLearnings?.text ? (
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">{weekLearnings.text}</div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateLearnings(`week-${week.weekKey}`, weekEntries, week.weekLabel);
                            }}
                            className="gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            Extract learnings
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Days within the week */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Daily Breakdown
                      </p>
                      {week.days.map(({ date, entries: dayEntries, count }) => {
                        const isDayExpanded = expandedDays.has(date);
                        const daySummary = summaries.get(`day-${date}`);

                        return (
                          <div key={date} className="border rounded-lg">
                            <div
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/30 transition-colors"
                              onClick={() => toggleDay(date)}
                            >
                              <div>
                                <p className="text-sm font-medium">{date}</p>
                                <p className="text-xs text-muted-foreground">
                                  {count} {count === 1 ? 'entry' : 'entries'}
                                </p>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "w-4 h-4 text-muted-foreground transition-transform",
                                  isDayExpanded && "rotate-180"
                                )}
                              />
                            </div>

                            {isDayExpanded && (
                              <div className="px-3 pb-3 border-t pt-3 space-y-3">
                                {/* Day summary */}
                                <div>
                                  {daySummary?.isLoading ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span className="text-xs">Generating...</span>
                                    </div>
                                  ) : daySummary?.text ? (
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                      {daySummary.text}
                                    </p>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generateSummary(`day-${date}`, dayEntries, date);
                                      }}
                                      className="gap-1 h-7 text-xs"
                                    >
                                      <Sparkles className="w-3 h-3" />
                                      Generate insight
                                    </Button>
                                  )}
                                </div>

                                {/* Entry links */}
                                <div className="space-y-1">
                                  {dayEntries.map(entry => {
                                    const preview = stripHtml(entry.content).slice(0, 80);
                                    return (
                                      <Link
                                        key={entry.id}
                                        to={`/entry/${entry.id}`}
                                        className="block text-xs text-muted-foreground hover:text-foreground truncate transition-colors"
                                      >
                                        {preview}...
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
