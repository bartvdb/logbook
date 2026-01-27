import React, { useState, useMemo, useCallback } from 'react';
import { useEntries } from '@/hooks';
import { Entry } from '@/types';
import { stripHtml } from '@/utils/markdown';
import { formatDate } from '@/utils/date';

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

  const toggleDay = useCallback((date: string, dayEntries: Entry[]) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
        // Generate summary if not already generated
        if (!summaries.has(date)) {
          generateSummary(date, dayEntries);
        }
      }
      return next;
    });
  }, [summaries, generateSummary]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-6 w-24 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
            <div className="h-16 w-full bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-medium text-neutral-900 dark:text-white">
        Trends
      </h1>

      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Daily insights and learnings from your journal entries.
      </p>

      {groupedByDay.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-300 text-base">
          No entries yet. Start writing to see your trends.
        </p>
      ) : (
        <div className="space-y-4">
          {groupedByDay.map(({ date, entries: dayEntries, count }) => {
            const isExpanded = expandedDays.has(date);
            const summary = summaries.get(date);
            const hasMultipleEntries = count > 1;

            return (
              <div
                key={date}
                className="border border-neutral-100 dark:border-neutral-900 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleDay(date, dayEntries)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <div>
                    <p className="text-base text-neutral-800 dark:text-neutral-200">
                      {date}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {count} {count === 1 ? 'entry' : 'entries'}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-900">
                    {/* Summary section */}
                    <div className="pt-4">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        {hasMultipleEntries ? 'Daily Summary' : 'Insight'}
                      </p>

                      {summary?.isLoading ? (
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
                          <div className="h-4 w-3/4 bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
                        </div>
                      ) : summary?.text ? (
                        <p className="text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {summary.text}
                        </p>
                      ) : (
                        <button
                          onClick={() => generateSummary(date, dayEntries)}
                          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                        >
                          Generate {hasMultipleEntries ? 'summary' : 'insight'}...
                        </button>
                      )}
                    </div>

                    {/* Entry previews */}
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Entries
                      </p>
                      <div className="space-y-2">
                        {dayEntries.map(entry => {
                          const preview = stripHtml(entry.content).slice(0, 100);
                          return (
                            <a
                              key={entry.id}
                              href={`/entry/${entry.id}`}
                              className="block text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white truncate transition-colors"
                            >
                              {preview}...
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrendsPage;
