import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/ui';
import { useTheme, useBackgroundSync } from '@/hooks';

// Views
import HomePage from '@/views/HomePage';
import TimelinePage from '@/views/TimelinePage';
import ProfilePage from '@/views/ProfilePage';
import SettingsPage from '@/views/SettingsPage';
import EntryPage from '@/views/EntryPage';
import NewEntryPage from '@/views/NewEntryPage';
import DesignSystemPage from '@/views/DesignSystemPage';

const App: React.FC = () => {
  // Apply theme
  useTheme();

  // Start background sync for AI queue
  useBackgroundSync();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for timeline (search is integrated there)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.location.href = '/timeline';
      }
      // Cmd/Ctrl + N for new entry
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        window.location.href = '/new';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />

      {/* Main content */}
      <main className="lg:ml-64 pt-14 pb-20 lg:pt-0 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/entry/:id" element={<EntryPage />} />
            <Route path="/new" element={<NewEntryPage />} />
            <Route path="/design-system" element={<DesignSystemPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
