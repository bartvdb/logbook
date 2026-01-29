import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWA } from '@/hooks';
import { exportAllData } from '@/lib/db';
import JSZip from 'jszip';
import { Entry } from '@/types';
import { formatDate } from '@/utils/date';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SettingsPage: React.FC = () => {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      {/* Install PWA */}
      {!isInstalled && canBeInstalled && (
        <Card>
          <CardHeader>
            <CardTitle>Install App</CardTitle>
            <CardDescription>
              Install Logbook on your device for a better experience with offline
              access and quick launch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstall} className="gap-2">
              <Download className="w-4 h-4" />
              Install App
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download all your entries and settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {exportMessage && (
            <div
              className={`px-4 py-2 rounded-lg text-sm ${
                exportMessage.includes('failed')
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              }`}
            >
              {exportMessage}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export as JSON
            </Button>
            <Button
              variant="outline"
              onClick={handleExportMarkdown}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export as Markdown
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Personal Logbook</span> v1.0.0
          </p>
          <p>A journaling app with AI-powered mentorship.</p>
          <p>
            All data is stored locally on your device. Your entries never leave
            your browser unless you explicitly export them.
          </p>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ShortcutItem keys={['Cmd/Ctrl', 'K']} description="Open search" />
            <ShortcutItem keys={['Cmd/Ctrl', 'N']} description="New entry" />
            <ShortcutItem keys={['Cmd/Ctrl', 'Enter']} description="Save entry" />
            <ShortcutItem keys={['Esc']} description="Cancel editing" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ShortcutItemProps {
  keys: string[];
  description: string;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ keys, description }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{description}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <React.Fragment key={key}>
          {i > 0 && <span className="text-muted-foreground">+</span>}
          <kbd className="px-2 py-1 text-xs bg-muted border rounded font-mono">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default SettingsPage;
