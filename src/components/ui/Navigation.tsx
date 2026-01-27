import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useOnlineStatus, useSyncStatus } from '@/hooks';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const EntriesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const navItems: NavItem[] = [
  { path: '/', label: 'Today', icon: <HomeIcon /> },
  { path: '/entries', label: 'Entries', icon: <EntriesIcon /> },
  { path: '/profile', label: 'Profile', icon: <ProfileIcon /> },
];

const SyncDot: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { status } = useSyncStatus();

  if (!isOnline) {
    return <span className="w-1.5 h-1.5 rounded-full bg-gray-400" title="Offline" />;
  }

  switch (status) {
    case 'syncing':
      return <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" title="Syncing" />;
    case 'pending':
      return <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pending sync" />;
    case 'error':
      return <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Sync error" />;
    default:
      return <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Synced" />;
  }
};

export const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar - minimal */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-white dark:bg-neutral-950 border-r border-neutral-100 dark:border-neutral-900">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 h-14 px-5">
            <h1 className="text-base font-medium text-neutral-900 dark:text-white">
              Logbook
            </h1>
            <SyncDot />
          </div>
          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="px-3 py-3 border-t border-neutral-100 dark:border-neutral-900">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              <SettingsIcon />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Mobile Header - minimal */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-100 dark:border-neutral-900">
        <div className="flex items-center justify-center h-12 px-4 relative">
          <h1 className="text-sm font-medium text-neutral-900 dark:text-white">
            {navItems.find((item) => item.path === location.pathname)?.label || 'Logbook'}
          </h1>
          <div className="absolute right-4">
            <SyncDot />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - minimal */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-t border-neutral-100 dark:border-neutral-900 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
