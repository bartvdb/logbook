import React, { useState } from 'react';
import { useTheme, usePWA } from '@/hooks';
import { exportAllData } from '@/lib/db';
import JSZip from 'jszip';
import { Entry } from '@/types';
import { formatDate } from '@/utils/date';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { canBeInstalled, isInstalled, install } = usePWA();
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logbook-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportMessage('Exported successfully!');
    } catch (error) {
      setExportMessage('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const zip = new JSZip();

      // Create markdown files for each entry
      data.entries.forEach((entry: Entry) => {
        const date = new Date(entry.createdAt);
        const filename = `${date.toISOString().split('T')[0]}-${entry.id?.slice(0, 8)}.md`;

        let content = `# Entry - ${formatDate(date)}\n\n`;
        if (entry.mood) {
          content += `**Mood:** ${entry.mood}\n\n`;
        }
        if (entry.tags.length > 0) {
          content += `**Tags:** ${entry.tags.map((t) => `#${t}`).join(', ')}\n\n`;
        }
        content += '---\n\n';
        content += entry.content;

        if (entry.aiConversation && entry.aiConversation.length > 0) {
          content += '\n\n---\n\n## AI Conversation\n\n';
          entry.aiConversation.forEach((msg) => {
            content += `**${msg.role === 'user' ? 'You' : 'Mentor'}:** ${msg.content}\n\n`;
          });
        }

        zip.file(filename, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logbook-export-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setExportMessage('Exported successfully!');
    } catch (error) {
      setExportMessage('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const handleInstall = async () => {
    await install();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your app preferences
        </p>
      </div>

      {/* Theme */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Theme
          </label>
          <div className="flex gap-2">
            {(['light', 'dark', 'auto'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setTheme(option)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  theme === option
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Install PWA */}
      {!isInstalled && canBeInstalled && (
        <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Install App
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Install Logbook on your device for a better experience with offline
            access and quick launch.
          </p>
          <button
            onClick={handleInstall}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Install App
          </button>
        </section>
      )}

      {/* Export */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Export Data
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Download all your entries and settings.
        </p>
        {exportMessage && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm ${
              exportMessage.includes('failed')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            }`}
          >
            {exportMessage}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export as JSON
          </button>
          <button
            onClick={handleExportMarkdown}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export as Markdown
          </button>
        </div>
      </section>

      {/* About */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          About
        </h2>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <span className="font-medium text-slate-900 dark:text-white">
              Personal Logbook
            </span>{' '}
            v1.0.0
          </p>
          <p>A journaling app with AI-powered mentorship.</p>
          <p>
            All data is stored locally on your device. Your entries never leave
            your browser unless you explicitly export them.
          </p>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Keyboard Shortcuts
        </h2>
        <div className="space-y-2">
          <ShortcutItem keys={['Cmd/Ctrl', 'K']} description="Open search" />
          <ShortcutItem keys={['Cmd/Ctrl', 'N']} description="New entry" />
          <ShortcutItem keys={['Cmd/Ctrl', 'Enter']} description="Save entry" />
          <ShortcutItem keys={['Esc']} description="Cancel editing" />
        </div>
      </section>
    </div>
  );
};

interface ShortcutItemProps {
  keys: string[];
  description: string;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ keys, description }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-600 dark:text-slate-400">{description}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <React.Fragment key={key}>
          {i > 0 && <span className="text-slate-400">+</span>}
          <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 font-mono">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default SettingsPage;
