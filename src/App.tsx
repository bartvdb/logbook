import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/ui';
import { useTheme, useBackgroundSync } from '@/hooks';

// Views
import HomePage from '@/views/HomePage';
import EntriesPage from '@/views/EntriesPage';
import ProfilePage from '@/views/ProfilePage';
import SettingsPage from '@/views/SettingsPage';
import EntryPage from '@/views/EntryPage';
import NewEntryPage from '@/views/NewEntryPage';
import TrendsPage from '@/views/TrendsPage';
import DesignSystemPage from '@/views/DesignSystemPage';

const App: React.FC = () => {
  // Apply theme
  useTheme();

  // Start background sync for AI queue
  useBackgroundSync();

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebar-collapsed', String(newValue));
      return newValue;
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for entries
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.location.href = '/entries';
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
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navigation isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />

      {/* Main content */}
      <main className={`pt-12 pb-16 lg:pt-0 lg:pb-0 transition-all duration-200 ${
        isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-56'
      }`}>
        <div className="max-w-2xl mx-auto px-4 py-8 lg:py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/entries" element={<EntriesPage />} />
            <Route path="/trends" element={<TrendsPage />} />
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
